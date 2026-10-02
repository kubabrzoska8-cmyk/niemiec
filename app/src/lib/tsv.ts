/**
 * Parser `anki/wordlists/block-N.tsv` — siedem kolumn rozdzielonych tabulatorem:
 * sesja · deutsch · polski · typ · beispiel_de · przyklad_pl · uwaga  (anki/README.md).
 */

export const KOLUMNY = ["sesja", "deutsch", "polski", "typ", "beispiel_de", "przyklad_pl", "uwaga"] as const;
export type Typ = "rzeczownik" | "czasownik" | "przymiotnik" | "przyslowek" | "zwrot" | "regula";
export type Rodzaj = "der" | "die" | "das" | "pl";

export interface Slowo {
  sesja: number | null;
  deutsch: string;
  polski: string;
  typ: string;
  beispiel_de: string;
  przyklad_pl: string;
  uwaga: string;
  /** Blok z nazwy pliku: block-1.tsv → 1. */
  blok: number | null;
}

export function blokZNazwy(nazwa: string): number | null {
  const m = /block-(\d+)\.tsv$/.exec(nazwa);
  return m ? Number(m[1]) : null;
}

export function parsujTsv(tekst: string, nazwaPliku = ""): Slowo[] {
  const linie = tekst.replace(/^﻿/, "").split(/\r?\n/);
  const naglowek = linie[0]?.split("\t").map((k) => k.trim()) ?? [];
  const indeks = (k: string) => {
    const i = naglowek.indexOf(k);
    return i >= 0 ? i : KOLUMNY.indexOf(k as (typeof KOLUMNY)[number]);
  };
  const ma = naglowek.includes("deutsch");
  const blok = blokZNazwy(nazwaPliku);
  return linie
    .slice(ma ? 1 : 0)
    .filter((l) => l.trim() !== "")
    .map((l) => {
      const k = l.split("\t");
      const pole = (nazwa: string) => (k[indeks(nazwa)] ?? "").trim();
      const nr = Number.parseInt(pole("sesja"), 10);
      return {
        sesja: Number.isFinite(nr) ? nr : null,
        deutsch: pole("deutsch"),
        polski: pole("polski"),
        typ: pole("typ"),
        beispiel_de: pole("beispiel_de"),
        przyklad_pl: pole("przyklad_pl"),
        uwaga: pole("uwaga"),
        blok,
      };
    })
    .filter((s) => s.deutsch !== "");
}

/** Części hasła rzeczownikowego: „der Leiter, - / die Leiterin, -nen” → dwie części, każda z rodzajem. */
export function czesciRzeczownika(deutsch: string): { tekst: string; rodzaj: Rodzaj | null }[] {
  return deutsch.split(/\s+\/\s+/).map((tekst) => {
    if (/\(nur Pl\.?\)/.test(tekst)) return { tekst, rodzaj: "pl" };
    const m = /^(der|die|das)\s/.exec(tekst);
    return { tekst, rodzaj: m ? (m[1] as Rodzaj) : null };
  });
}

export function rodzajSlowa(s: Pick<Slowo, "typ" | "deutsch">): Rodzaj | null {
  return s.typ === "rzeczownik" ? (czesciRzeczownika(s.deutsch)[0]?.rodzaj ?? null) : null;
}

/** Do porównań: bez wielkości liter, Umlautów zapisanych jako ae/oe/ue, interpunkcji i zbędnych spacji. */
export function normalizuj(s: string): string {
  return s
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/ß/g, "ss")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ae/g, "a")
    .replace(/oe/g, "o")
    .replace(/ue/g, "u")
    .replace(/[.,;:!?„“”"'()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bezNawiasow(s: string): string {
  return s.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
}

export type Werdykt = "dokladnie" | "prawie" | "rdzen" | "inaczej" | "puste";

export interface Porownanie {
  werdykt: Werdykt;
  /** Dla rzeczownika: czy rodzajnik się zgadza (null, gdy nie dotyczy). */
  rodzajnikOk: boolean | null;
}

/**
 * Porównanie odpowiedzi w sprawdzianie PL→DE. To NIE jest pomiar kursu — tylko podpowiedź dla Jakuba.
 * - dokladnie: identycznie (albo identycznie bez dopisków w nawiasie, np. „(mit + D)”)
 * - prawie: różnica tylko w wielkości liter, Umlautach albo interpunkcji (ortografia czatu)
 * - rdzen: zgadza się pierwsza część hasła (np. bez l.mn. albo bez trzech form czasownika)
 */
export function porownaj(wpisane: string, s: Pick<Slowo, "typ" | "deutsch">): Porownanie {
  const w = wpisane.trim().replace(/\s+/g, " ");
  const wzor = s.deutsch;
  const rodzaj = rodzajSlowa(s);
  const rodzajnikOk =
    rodzaj && rodzaj !== "pl" && w !== "" ? new RegExp(`^${rodzaj}\\b`, "i").test(w) : null;
  if (w === "") return { werdykt: "puste", rodzajnikOk: null };
  if (w === wzor || w === bezNawiasow(wzor)) return { werdykt: "dokladnie", rodzajnikOk };
  const nw = normalizuj(w);
  if (nw === normalizuj(wzor) || nw === normalizuj(bezNawiasow(wzor))) return { werdykt: "prawie", rodzajnikOk };
  const rdzen = normalizuj(bezNawiasow(wzor).split(/,|\s[–-]\s|\s\/\s/)[0]);
  if (rdzen && nw === rdzen) return { werdykt: "rdzen", rodzajnikOk };
  return { werdykt: "inaczej", rodzajnikOk };
}
