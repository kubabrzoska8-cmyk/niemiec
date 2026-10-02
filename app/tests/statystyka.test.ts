import { describe, expect, it } from "vitest";
import { procent, sumaDwochOstatnich, sumaDwochOstatnichPorownywalnych, wilson } from "../src/lib/statystyka";
import { kursSurowy } from "./pomoc";

const sesje = kursSurowy().sesje;

describe("przedział Wilsona", () => {
  it("11/17 → ok. 41–83 % (jak w PROGRESS.md)", () => {
    const w = wilson(11, 17);
    expect(Math.round(w.dol * 100)).toBe(41);
    expect(Math.round(w.gora * 100)).toBe(83);
  });
  it("granice zostają w 0–1", () => {
    expect(wilson(0, 5).dol).toBe(0);
    expect(wilson(5, 5).gora).toBeLessThanOrEqual(1);
  });
  it("n = 0 nie dzieli przez zero", () => {
    expect(wilson(0, 0)).toEqual({ p: 0, dol: 0, gora: 1 });
  });
});

describe("suma dwóch ostatnich sesji — główny odczyt", () => {
  it("po sesji 10: s9 + s10 = 16/30, z sesją nieporównywalną", () => {
    const s = sumaDwochOstatnich(sesje)!;
    expect(s.sesje).toEqual([9, 10]);
    expect([s.poprawne, s.n]).toEqual([16, 30]);
    expect(s.zNieporownywalna).toBe(true);
  });
  it("dwie ostatnie porównywalne: s8 + s9 = 18/30 = 60 % (jak w PROGRESS.md)", () => {
    const s = sumaDwochOstatnichPorownywalnych(sesje)!;
    expect(s.sesje).toEqual([8, 9]);
    expect(procent(s.poprawne / s.n)).toBe("60 %");
  });
  it("jedna sesja z pomiarem to za mało na sumę", () => {
    expect(sumaDwochOstatnich(sesje.slice(0, 5))).toBeNull();
  });
});
