/**
 * Middleware Vite: serwuje TYLKO DO ODCZYTU wybrane pliki kursu z lokalnego checkoutu repo.
 *
 *   GET /repo/data/kurs.json            → plik
 *   GET /repo/anki/wordlists/           → {"pliki": ["block-1.tsv", …]}  (lista katalogu)
 *
 * Strona czyta dane w czasie działania, więc po `git pull` wystarczy odświeżyć przeglądarkę.
 * Nic nie jest zapisywane — inne metody niż GET/HEAD dostają 405.
 */
import fs from "node:fs";
import path from "node:path";
import type { Connect, Plugin } from "vite";

export const PREFIKS = "/repo/";

/** Katalogi, które strona może czytać (bez podkatalogów spoza listy). */
export const DOZWOLONE_KATALOGI = ["data", "anki/wordlists", "lessons", "grammar", "drafts"] as const;
/** Pojedyncze pliki spoza tych katalogów — tu leży tekst Lesestück z sesji 6. */
export const DOZWOLONE_PLIKI = ["plan/lesestueck.md"] as const;
const ROZSZERZENIA: Record<string, string> = {
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".tsv": "text/tab-separated-values; charset=utf-8",
};

export type Cel =
  | { typ: "plik"; wzgledna: string; bezwzgledna: string; mime: string }
  | { typ: "katalog"; wzgledna: string; bezwzgledna: string }
  | null;

/** Zamienia URL na ścieżkę w repo — albo null, jeśli plik jest poza listą dozwolonych. */
export function rozwiaz(korzen: string, url: string): Cel {
  if (!url.startsWith(PREFIKS)) return null;
  let surowa: string;
  try {
    surowa = decodeURIComponent(url.slice(PREFIKS.length).split(/[?#]/)[0]);
  } catch {
    return null;
  }
  if (surowa.includes("\0") || surowa.includes("\\")) return null;
  const katalog = surowa.endsWith("/") || surowa === "";
  const wzgledna = path.posix.normalize(surowa).replace(/\/+$/, "");
  if (wzgledna.startsWith("..") || path.posix.isAbsolute(wzgledna) || wzgledna === ".") return null;
  const bezwzgledna = path.join(korzen, ...wzgledna.split("/"));
  if (!bezwzgledna.startsWith(path.resolve(korzen) + path.sep)) return null;

  if (katalog) {
    return (DOZWOLONE_KATALOGI as readonly string[]).includes(wzgledna)
      ? { typ: "katalog", wzgledna, bezwzgledna }
      : null;
  }
  const mime = ROZSZERZENIA[path.posix.extname(wzgledna)];
  if (!mime) return null;
  const wKatalogu = DOZWOLONE_KATALOGI.some((k) => path.posix.dirname(wzgledna) === k);
  const wprost = (DOZWOLONE_PLIKI as readonly string[]).includes(wzgledna);
  return wKatalogu || wprost ? { typ: "plik", wzgledna, bezwzgledna, mime } : null;
}

export function middlewareRepo(korzen: string): Connect.NextHandleFunction {
  return (req, res, next) => {
    if (!req.url?.startsWith(PREFIKS)) return next();
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.statusCode = 405;
      res.setHeader("Allow", "GET, HEAD");
      return res.end("Tylko odczyt.");
    }
    const cel = rozwiaz(korzen, req.url);
    if (!cel) {
      res.statusCode = 403;
      return res.end("Poza listą plików, które strona może czytać.");
    }
    res.setHeader("Cache-Control", "no-store");
    try {
      if (cel.typ === "katalog") {
        const pliki = fs
          .readdirSync(cel.bezwzgledna, { withFileTypes: true })
          .filter((w) => w.isFile() && ROZSZERZENIA[path.extname(w.name)])
          .map((w) => w.name)
          .sort();
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        return res.end(req.method === "HEAD" ? undefined : JSON.stringify({ pliki }));
      }
      const tresc = fs.readFileSync(cel.bezwzgledna);
      res.setHeader("Content-Type", cel.mime);
      return res.end(req.method === "HEAD" ? undefined : tresc);
    } catch {
      res.statusCode = 404;
      return res.end("Nie ma takiego pliku.");
    }
  };
}

/** Plugin: ten sam middleware w `vite` (dev) i `vite preview`; zmiana pliku kursu przeładowuje stronę. */
export function repoPlugin(korzen: string): Plugin {
  return {
    name: "niemiec-repo-tylko-odczyt",
    configureServer(server) {
      server.middlewares.use(middlewareRepo(korzen));
      const sciezki = [...DOZWOLONE_KATALOGI, ...DOZWOLONE_PLIKI].map((p) => path.join(korzen, p));
      server.watcher.add(sciezki);
      server.watcher.on("change", (plik) => {
        if (sciezki.some((s) => plik.startsWith(s))) server.ws.send({ type: "full-reload" });
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(middlewareRepo(korzen));
    },
  };
}
