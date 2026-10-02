import { describe, expect, it } from "vitest";
import { aktualnaSesja, prognozaSesji, sesjeWOknie } from "../src/lib/tempo";
import { kursSurowy } from "./pomoc";

const sesje = kursSurowy().sesje as { nr: number; data: string }[];

describe("numer sesji", () => {
  it("aktualna = najwyższy numer w logu + 1 (po sesji 10 → 11)", () => {
    expect(aktualnaSesja(sesje)).toBe(11);
  });
  it("pusty log → sesja 1", () => {
    expect(aktualnaSesja([])).toBe(1);
  });
});

describe("sesje w ostatnich 7 dniach", () => {
  it("2.10: tylko sesja 10 (28.09)", () => {
    expect(sesjeWOknie(sesje, "2026-10-02").map((s) => s.nr)).toEqual([10]);
  });
  it("okno = dziś i 6 dni wstecz", () => {
    expect(sesjeWOknie(sesje, "2026-10-04").map((s) => s.nr)).toEqual([10]);
    expect(sesjeWOknie(sesje, "2026-10-05")).toEqual([]);
  });
  it("sesja z przyszłości się nie liczy", () => {
    expect(sesjeWOknie([{ nr: 1, data: "2026-10-03" }], "2026-10-02")).toEqual([]);
  });
});

describe("prognoza sesji 29", () => {
  const baza = { ostatnia: 10, cel: 29, dzis: "2026-10-02", termin: "2026-12-31" };
  it("przy 3/tydz. 19 sesji zajmie 45 dni → 16 listopada, przed końcem roku", () => {
    expect(prognozaSesji({ ...baza, naTydzien: 3 })).toEqual({ pozostalo: 19, data: "2026-11-16", przedTerminem: true });
  });
  it("przy 1/tydz. → luty 2027, po terminie", () => {
    expect(prognozaSesji({ ...baza, naTydzien: 1 })).toEqual({ pozostalo: 19, data: "2027-02-12", przedTerminem: false });
  });
  it("przy tempie 0 nie ma daty", () => {
    expect(prognozaSesji({ ...baza, naTydzien: 0 })).toEqual({ pozostalo: 19, data: null, przedTerminem: null });
  });
  it("bez terminu — data jest, ocena „przed terminem” nie", () => {
    expect(prognozaSesji({ ...baza, termin: null, naTydzien: 3 }).przedTerminem).toBeNull();
  });
  it("cel osiągnięty → nic nie zostało", () => {
    expect(prognozaSesji({ ...baza, ostatnia: 29, naTydzien: 3 }).pozostalo).toBe(0);
  });
});
