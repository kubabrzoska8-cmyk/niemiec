/**
 * Middleware Vite: przekazuje publiczne kanały RSS z krótkiej, zamkniętej listy.
 *
 *   GET /kanaly/dw-lgn   → XML kanału „Langsam gesprochene Nachrichten” (DW)
 *
 * Dlaczego przez serwer: przeglądarka nie może sama pobrać cudzego RSS (CORS). Serwer Vite
 * i tak działa lokalnie, więc pobiera kanał za nią. Bez kluczy, bez zapisu — tylko odczyt,
 * tylko adresy z listy KANALY, odpowiedź trzymana godzinę w pamięci.
 * Bez internetu albo przy zmianie adresu kanału strona pokazuje zwykły link do źródła.
 */
import type { Connect, Plugin } from "vite";

export const PREFIKS_KANALOW = "/kanaly/";

/** Jedyne adresy, które serwer pobierze. Klucz = id używane w `src/content/codziennie.ts`. */
export const KANALY = {
  "dw-lgn": "https://rss.dw.com/xml/DKpodcast_lgn_de",
  "dw-top-thema": "https://rss.dw.com/xml/DKpodcast_topthemamitvokabeln_de",
  tagesschau: "https://www.tagesschau.de/xml/rss2/",
  "easy-german": "https://www.youtube.com/feeds/videos.xml?channel_id=UCbxb2fqe9oNgglAoYqsYOtQ",
} as const;

export type IdKanalu = keyof typeof KANALY;

const GODZINA = 60 * 60 * 1000;
const LIMIT_CZASU = 10_000;

/** „/kanaly/dw-lgn?x” → "dw-lgn" — albo null, jeśli kanału nie ma na liście. */
export function idKanalu(url: string): IdKanalu | null {
  if (!url.startsWith(PREFIKS_KANALOW)) return null;
  const id = url.slice(PREFIKS_KANALOW.length).split(/[?#/]/)[0];
  return Object.hasOwn(KANALY, id) ? (id as IdKanalu) : null;
}

export function middlewareKanaly(pobierz: typeof fetch = fetch, teraz: () => number = Date.now): Connect.NextHandleFunction {
  const pamiec = new Map<IdKanalu, { czas: number; xml: string }>();
  return (req, res, next) => {
    if (!req.url?.startsWith(PREFIKS_KANALOW)) return next();
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.setHeader("Allow", "GET");
      return res.end("Tylko odczyt.");
    }
    const id = idKanalu(req.url);
    if (!id) {
      res.statusCode = 404;
      return res.end("Nie ma takiego kanału na liście.");
    }
    const wyslij = (xml: string) => {
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.end(xml);
    };
    const zapamietany = pamiec.get(id);
    if (zapamietany && teraz() - zapamietany.czas < GODZINA) return wyslij(zapamietany.xml);

    pobierz(KANALY[id], { signal: AbortSignal.timeout(LIMIT_CZASU), headers: { "User-Agent": "niemiec-pulpit (lokalny pulpit kursu)" } })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((xml) => {
        pamiec.set(id, { czas: teraz(), xml });
        wyslij(xml);
      })
      .catch((e: unknown) => {
        // Stara kopia jest lepsza niż nic — newsy sprzed godziny dalej da się przeczytać.
        if (zapamietany) return wyslij(zapamietany.xml);
        res.statusCode = 502;
        res.end(`Nie udało się pobrać kanału: ${e instanceof Error ? e.message : String(e)}`);
      });
  };
}

/** Plugin: ten sam middleware w `vite` (dev) i `vite preview`. */
export function kanalyPlugin(): Plugin {
  return {
    name: "niemiec-kanaly-rss",
    configureServer(server) {
      server.middlewares.use(middlewareKanaly());
    },
    configurePreviewServer(server) {
      server.middlewares.use(middlewareKanaly());
    },
  };
}
