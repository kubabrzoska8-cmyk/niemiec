/**
 * Tempo kursu — ile sesji było ostatnio i czy przy takim tempie Etap 1 zmieści się przed egzaminem.
 * Kurs liczy sesje, nie dni: „aktualna sesja” = najwyższy numer w logu + 1 (CLAUDE.md → Numeracja).
 */
import { dniMiedzy, dodajDni } from "./daty";

interface SesjaZData {
  nr: number;
  data: string;
}

/** Numer sesji, która jest następna do przeprowadzenia. */
export function aktualnaSesja(sesje: SesjaZData[]): number {
  return sesje.reduce((max, s) => Math.max(max, s.nr), 0) + 1;
}

/** Sesje w ostatnich `dni` dniach, wliczając dziś: dla 7 → od dziś−6 do dziś. */
export function sesjeWOknie(sesje: SesjaZData[], dzis: string, dni = 7): SesjaZData[] {
  return sesje.filter((s) => {
    const temu = dniMiedzy(s.data, dzis);
    return temu >= 0 && temu < dni;
  });
}

export interface Prognoza {
  /** Ile sesji zostało do sesji docelowej włącznie. */
  pozostalo: number;
  /** Data, w której wypadnie sesja docelowa — null, gdy tempo = 0. */
  data: string | null;
  /** Czy zdąży przed terminem (null, gdy nie ma terminu albo tempo = 0). */
  przedTerminem: boolean | null;
}

/**
 * Kiedy wypadnie sesja `cel` przy stałym tempie `naTydzien` sesji tygodniowo, licząc od dziś.
 * Zakłada, że najbliższa sesja jest dziś lub później — to prognoza, nie plan.
 */
export function prognozaSesji(opts: {
  ostatnia: number;
  cel: number;
  dzis: string;
  naTydzien: number;
  termin: string | null;
}): Prognoza {
  const pozostalo = Math.max(0, opts.cel - opts.ostatnia);
  if (pozostalo === 0) return { pozostalo, data: opts.dzis, przedTerminem: opts.termin ? true : null };
  if (opts.naTydzien <= 0) return { pozostalo, data: null, przedTerminem: null };
  const dni = Math.ceil((pozostalo / opts.naTydzien) * 7);
  const data = dodajDni(opts.dzis, dni);
  return { pozostalo, data, przedTerminem: opts.termin ? dniMiedzy(data, opts.termin) >= 0 : null };
}
