/**
 * Daty jako tekst `RRRR-MM-DD`, liczone w UTC — bez stref czasowych i zmiany czasu.
 * Kurs liczy SESJE, nie dni; dni i tygodnie są tu tylko podpisem obok numeru sesji.
 */

const DZIEN_MS = 86_400_000;

export function naMs(iso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) throw new Error(`Zła data: ${iso}`);
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function zMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Lokalna data „dziś” z zegara przeglądarki. */
export function dzisLokalnie(teraz: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${teraz.getFullYear()}-${p(teraz.getMonth() + 1)}-${p(teraz.getDate())}`;
}

/** Ile dni od `a` do `b` (b − a). */
export function dniMiedzy(a: string, b: string): number {
  return Math.round((naMs(b) - naMs(a)) / DZIEN_MS);
}

export function dodajDni(iso: string, dni: number): string {
  return zMs(naMs(iso) + dni * DZIEN_MS);
}

/** Dzień nauki: dzień startu (sesja 1) = dzień 1. Przed startem — 0. */
export function dzienNauki(start: string, dzis: string): number {
  return Math.max(0, dniMiedzy(start, dzis) + 1);
}

/** Tydzień nauki: dni 1–7 = tydzień 1. */
export function tydzienNauki(start: string, dzis: string): number {
  const d = dzienNauki(start, dzis);
  return d === 0 ? 0 : Math.floor((d - 1) / 7) + 1;
}

const MIESIACE = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];
const MIESIACE_KROTKO = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];

/** „28 września 2026” */
export function dataDluga(iso: string): string {
  const [r, m, d] = iso.split("-").map(Number);
  return `${d} ${MIESIACE[m - 1]} ${r}`;
}

/** „28 wrz” */
export function dataKrotka(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MIESIACE_KROTKO[m - 1]}`;
}

/** Polska odmiana liczebnika: 1 dzień, 2 dni, 5 dni / 1 sesja, 2 sesje, 5 sesji. */
export function odmien(n: number, jeden: string, kilka: string, wiele: string): string {
  const a = Math.abs(n);
  if (a === 1) return jeden;
  const d = a % 10;
  const s = a % 100;
  return d >= 2 && d <= 4 && (s < 12 || s > 14) ? kilka : wiele;
}
