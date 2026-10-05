import { describe, expect, it } from "vitest";
import { idKanalu, KANALY, middlewareKanaly } from "../serwer-kanaly";
import { GRUPY } from "../src/content/codziennie";
import { parsujKanal } from "../src/lib/kanaly";

const RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Langsam gesprochene Nachrichten</title>
<item>
  <title><![CDATA[05.10.2026 – Langsam gesprochene Nachrichten]]></title>
  <link>https://learngerman.dw.com/de/05102026/a-1</link>
  <pubDate>Mon, 05 Oct 2026 06:00:00 GMT</pubDate>
  <description>&lt;p&gt;Trainieren Sie Ihr Hörverstehen &amp;amp; lesen Sie mit.&lt;/p&gt;</description>
</item>
<item><title>Zweite Folge</title><link>https://example.org/2</link></item>
<item><title>Dritte</title></item>
<item><title>Vierte</title></item>
</channel></rss>`;

const ATOM = `<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
<entry>
  <title>Was Deutsche wirklich frühstücken | Easy German 600</title>
  <link rel="alternate" href="https://www.youtube.com/watch?v=abc"/>
  <published>2026-10-03T15:00:01+00:00</published>
  <media:group><media:description>Wir fragen in Berlin…</media:description></media:group>
</entry>
</feed>`;

describe("parsujKanal", () => {
  it("RSS 2.0: tytuł z CDATA, link, data, opis bez HTML i z encjami", () => {
    const [w] = parsujKanal(RSS);
    expect(w).toEqual({
      tytul: "05.10.2026 – Langsam gesprochene Nachrichten",
      link: "https://learngerman.dw.com/de/05102026/a-1",
      data: "2026-10-05",
      opis: "Trainieren Sie Ihr Hörverstehen & lesen Sie mit.",
    });
  });
  it("limit wpisów i brakujące pola → null", () => {
    const w = parsujKanal(RSS, 3);
    expect(w).toHaveLength(3);
    expect(w[2]).toEqual({ tytul: "Dritte", link: null, data: null, opis: null });
  });
  it("Atom (YouTube): link z atrybutu href, opis z media:description", () => {
    expect(parsujKanal(ATOM)).toEqual([
      { tytul: "Was Deutsche wirklich frühstücken | Easy German 600", link: "https://www.youtube.com/watch?v=abc", data: "2026-10-03", opis: "Wir fragen in Berlin…" },
    ]);
  });
  it("długi opis skrócony na granicy słowa", () => {
    const dlugi = `<rss><item><title>T</title><description>${"Wort ".repeat(200)}</description></item></rss>`;
    const opis = parsujKanal(dlugi)[0].opis!;
    expect(opis.length).toBeLessThan(370);
    expect(opis.endsWith(" …")).toBe(true);
  });
  it("śmieci → pusta lista, nie wyjątek", () => {
    expect(parsujKanal("<html>Fehler 503</html>")).toEqual([]);
    expect(parsujKanal("")).toEqual([]);
  });
});

describe("serwer kanałów", () => {
  it("tylko kanały z listy", () => {
    expect(idKanalu("/kanaly/dw-lgn")).toBe("dw-lgn");
    expect(idKanalu("/kanaly/dw-lgn?t=1")).toBe("dw-lgn");
    expect(idKanalu("/kanaly/https%3A%2F%2Fevil.example")).toBeNull();
    expect(idKanalu("/kanaly/toString")).toBeNull();
    expect(idKanalu("/repo/data/kurs.json")).toBeNull();
  });
  it("każdy kanał użyty w treści istnieje na liście serwera", () => {
    const uzyte = GRUPY.flatMap((g) => g.zrodla.map((z) => z.kanal).filter(Boolean));
    expect(uzyte.length).toBeGreaterThan(0);
    for (const k of uzyte) expect(Object.keys(KANALY)).toContain(k);
  });

  type Odp = { statusCode: number; tresc: string; setHeader: () => void; end: (t?: string) => void };
  const zapytaj = (mw: ReturnType<typeof middlewareKanaly>, url: string, method = "GET") =>
    new Promise<Odp>((gotowe) => {
      const res: Odp = { statusCode: 200, tresc: "", setHeader: () => {}, end: (t?: string) => ((res.tresc = t ?? ""), gotowe(res)) };
      mw({ url, method } as never, res as never, () => gotowe({ ...res, statusCode: -1 }));
    });

  it("pobiera, a drugi raz w ciągu godziny bierze z pamięci", async () => {
    let pobrania = 0;
    const mw = middlewareKanaly((async () => (pobrania++, new Response(RSS))) as typeof fetch, () => 1000);
    expect((await zapytaj(mw, "/kanaly/dw-lgn")).tresc).toContain("Langsam");
    await zapytaj(mw, "/kanaly/dw-lgn");
    expect(pobrania).toBe(1);
  });
  it("błąd źródła → 502; inne ścieżki idą dalej; POST → 405", async () => {
    const mw = middlewareKanaly((async () => new Response("", { status: 500 })) as typeof fetch);
    expect((await zapytaj(mw, "/kanaly/tagesschau")).statusCode).toBe(502);
    expect((await zapytaj(mw, "/kanaly/nie-ma")).statusCode).toBe(404);
    expect((await zapytaj(mw, "/repo/data/kurs.json")).statusCode).toBe(-1);
    expect((await zapytaj(mw, "/kanaly/dw-lgn", "POST")).statusCode).toBe(405);
  });
});
