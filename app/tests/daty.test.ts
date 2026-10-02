import { describe, expect, it } from "vitest";
import { dataDluga, dniMiedzy, dodajDni, dzienNauki, dzisLokalnie, odmien, tydzienNauki } from "../src/lib/daty";

const START = "2026-04-20"; // sesja 1

describe("dzień i tydzień nauki od startu kursu", () => {
  it("dzień startu to dzień 1 i tydzień 1", () => {
    expect(dzienNauki(START, START)).toBe(1);
    expect(tydzienNauki(START, START)).toBe(1);
  });
  it("tydzień zmienia się co 7 dni", () => {
    expect(tydzienNauki(START, "2026-04-26")).toBe(1);
    expect(tydzienNauki(START, "2026-04-27")).toBe(2);
  });
  it("2 października 2026 = dzień 166, tydzień 24", () => {
    expect(dzienNauki(START, "2026-10-02")).toBe(166);
    expect(tydzienNauki(START, "2026-10-02")).toBe(24);
  });
  it("przed startem — 0, nie liczba ujemna", () => {
    expect(dzienNauki(START, "2026-04-01")).toBe(0);
    expect(tydzienNauki(START, "2026-04-01")).toBe(0);
  });
  it("zmiana czasu nie przesuwa dni", () => {
    expect(dniMiedzy("2026-03-28", "2026-03-30")).toBe(2);
    expect(dniMiedzy("2026-10-24", "2026-10-26")).toBe(2);
  });
  it("dni do końca 2026 od 2 października", () => {
    expect(dniMiedzy("2026-10-02", "2026-12-31")).toBe(90);
  });
  it("dodawanie dni przez przełom roku", () => {
    expect(dodajDni("2026-12-30", 3)).toBe("2027-01-02");
  });
});

describe("formaty", () => {
  it("lokalna data dziś", () => {
    expect(dzisLokalnie(new Date(2026, 9, 2, 23, 59))).toBe("2026-10-02");
  });
  it("data po polsku", () => {
    expect(dataDluga("2026-09-28")).toBe("28 września 2026");
  });
  it("odmiana liczebnika", () => {
    const sesji = (n: number) => odmien(n, "sesja", "sesje", "sesji");
    expect([1, 2, 4, 5, 12, 22, 25].map(sesji)).toEqual(["sesja", "sesje", "sesje", "sesji", "sesji", "sesje", "sesji"]);
  });
});
