import { useEffect, useState } from "react";

/** Jeden wpis z kanału RSS albo Atom — tylko to, co strona pokazuje. */
export interface Wpis {
  tytul: string;
  link: string | null;
  /** RRRR-MM-DD albo null, jeśli kanał nie podał daty. */
  data: string | null;
  opis: string | null;
}

const ENCJE: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function dekoduj(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (calosc, e: string) => {
    if (e.startsWith("#")) {
      const kod = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(kod) && kod > 0 && kod <= 0x10ffff ? String.fromCodePoint(kod) : calosc;
    }
    return ENCJE[e.toLowerCase()] ?? calosc;
  });
}

/** Zawartość pola jako czysty tekst: bez CDATA, bez HTML, z rozwiniętymi encjami. */
function czystyTekst(surowy: string): string {
  const bezCdata = surowy.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  // Opis bywa HTML-em zakodowanym encjami (&lt;p&gt;) — najpierw encje, potem tagi, potem encje z wnętrza HTML.
  const bezTagow = dekoduj(bezCdata).replace(/<[^>]*>/g, " ");
  return dekoduj(bezTagow).replace(/\s+/g, " ").trim();
}

function pole(blok: string, ...nazwy: string[]): string | null {
  for (const n of nazwy) {
    const m = blok.match(new RegExp(`<${n}(?:\\s[^>]*)?>([\\s\\S]*?)</${n}>`, "i"));
    if (m) {
      const t = czystyTekst(m[1]);
      if (t) return t;
    }
  }
  return null;
}

function link(blok: string): string | null {
  const atom = blok.match(/<link\b[^>]*\bhref="([^"]+)"[^>]*\/?>/i);
  if (atom) return dekoduj(atom[1]);
  const rss = pole(blok, "link");
  return rss && /^https?:\/\//.test(rss) ? rss : null;
}

function data(blok: string): string | null {
  const surowa = pole(blok, "pubDate", "published", "updated", "dc:date");
  if (!surowa) return null;
  const d = new Date(surowa);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function skroc(tekst: string | null, max: number): string | null {
  if (!tekst || tekst.length <= max) return tekst;
  const ciecie = tekst.lastIndexOf(" ", max);
  return tekst.slice(0, ciecie > max * 0.6 ? ciecie : max) + " …";
}

/**
 * Najnowsze wpisy z kanału RSS 2.0 (`<item>`) albo Atom (`<entry>`, np. YouTube).
 * Bez DOMParsera, żeby dało się to sprawdzić testem w Node. Śmieci na wejściu → pusta lista.
 */
export function parsujKanal(xml: string, limit = 3, dlugoscOpisu = 360): Wpis[] {
  const bloki = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
  const wpisy: Wpis[] = [];
  for (const b of bloki) {
    const tytul = pole(b, "title");
    if (!tytul) continue;
    wpisy.push({ tytul, link: link(b), data: data(b), opis: skroc(pole(b, "description", "media:description", "summary", "content"), dlugoscOpisu) });
    if (wpisy.length >= limit) break;
  }
  return wpisy;
}

export type StanKanalu = { faza: "wczytuje" } | { faza: "ok"; wpisy: Wpis[] } | { faza: "blad" };

/** Pobiera kanał przez lokalny serwer (`serwer-kanaly.ts`). Błąd → strona pokazuje zwykły link. */
export function useKanal(id: string, limit = 3): StanKanalu {
  const [stan, setStan] = useState<StanKanalu>({ faza: "wczytuje" });
  useEffect(() => {
    let aktywny = true;
    setStan({ faza: "wczytuje" });
    fetch(`/kanaly/${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((xml) => {
        const wpisy = parsujKanal(xml, limit);
        if (aktywny) setStan(wpisy.length ? { faza: "ok", wpisy } : { faza: "blad" });
      })
      .catch(() => {
        if (aktywny) setStan({ faza: "blad" });
      });
    return () => {
      aktywny = false;
    };
  }, [id, limit]);
  return stan;
}
