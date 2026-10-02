/**
 * Niepewność pomiaru. Przy 15 grupach pojedyncza sesja ma przedział ok. ±20 pkt —
 * dlatego decyzje w kursie zapadają na sumie dwóch sesji (CLAUDE.md → Pomiar).
 */

export interface Przedzial {
  p: number;
  dol: number;
  gora: number;
}

/** Przedział Wilsona (domyślnie 95 %) dla k sukcesów na n prób. */
export function wilson(k: number, n: number, z = 1.96): Przedzial {
  if (n <= 0) return { p: 0, dol: 0, gora: 1 };
  const p = k / n;
  const z2 = z * z;
  const mianownik = 1 + z2 / n;
  const srodek = (p + z2 / (2 * n)) / mianownik;
  const pol = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / mianownik;
  return { p, dol: Math.max(0, srodek - pol), gora: Math.min(1, srodek + pol) };
}

interface Pomiar {
  nr: number;
  wolna_produkcja: { poprawne: number; n: number; porownywalne: boolean } | null;
}

export interface Suma {
  sesje: number[];
  poprawne: number;
  n: number;
  przedzial: Przedzial;
  /** Czy w sumie jest sesja oznaczona jako nieporównywalna. */
  zNieporownywalna: boolean;
}

function zsumuj(lista: Pomiar[]): Suma | null {
  if (lista.length < 2) return null;
  const poprawne = lista.reduce((a, s) => a + s.wolna_produkcja!.poprawne, 0);
  const n = lista.reduce((a, s) => a + s.wolna_produkcja!.n, 0);
  return {
    sesje: lista.map((s) => s.nr),
    poprawne,
    n,
    przedzial: wilson(poprawne, n),
    zNieporownywalna: lista.some((s) => !s.wolna_produkcja!.porownywalne),
  };
}

/** Suma dwóch ostatnich sesji z pomiarem — główny odczyt kursu. */
export function sumaDwochOstatnich(sesje: Pomiar[]): Suma | null {
  return zsumuj(sesje.filter((s) => s.wolna_produkcja).slice(-2));
}

/** Suma dwóch ostatnich sesji porównywalnych — pokazywana, gdy główny odczyt zawiera sesję nieporównywalną. */
export function sumaDwochOstatnichPorownywalnych(sesje: Pomiar[]): Suma | null {
  return zsumuj(sesje.filter((s) => s.wolna_produkcja?.porownywalne).slice(-2));
}

export function procent(x: number, miejsca = 0): string {
  return `${(x * 100).toFixed(miejsca).replace(".", ",")} %`;
}
