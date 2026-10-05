import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { DOZWOLONE_KATALOGI, rozwiaz } from "../serwer-repo";
import { walidujKurs, wczytajKurs, wczytajSlowa } from "../src/lib/dane";
import { schematJson } from "../src/lib/schemat-json";
import { czytaj, fetchZRepo, KORZEN, kursSurowy } from "./pomoc";

describe("data/kurs.json", () => {
  it("wczytuje się i przechodzi walidację", async () => {
    const w = await wczytajKurs(fetchZRepo);
    expect(w.ok).toBe(true);
    if (!w.ok) return;
    expect(w.dane.sesje.at(-1)!.nr).toBe(11);
    expect(w.dane.nastepna_sesja.nr).toBe(12);
  });

  it("liczby po sesji 11 są jak w PROGRESS.md", async () => {
    const w = await wczytajKurs(fetchZRepo);
    if (!w.ok) throw new Error(w.bledy.join("\n"));
    const s11 = w.dane.sesje.at(-1)!;
    expect(s11.wolna_produkcja).toMatchObject({ poprawne: 7, n: 15, porownywalne: true });
    expect(s11.pomocnicze.luki).toMatchObject({ poprawne: 3, n: 10 });
    expect(s11.anki).toMatchObject({ slowa: 136, karty: 260 });
    expect(w.dane.cel_cyklu.aktualny.sesje).toEqual([10, 11, 12]);
    expect(w.dane.luki.active).toHaveLength(3);
  });

  it("brak pomiaru to null, nie zero (sesje 1–4)", () => {
    const k = kursSurowy();
    expect(k.sesje.slice(0, 4).map((s: { wolna_produkcja: unknown }) => s.wolna_produkcja)).toEqual([null, null, null, null]);
  });

  it("zły JSON → czytelny błąd zamiast białej strony", async () => {
    const w = await wczytajKurs(async () => new Response("{ to nie json"));
    expect(w.ok).toBe(false);
  });

  it("brak pliku → błąd z nazwą pliku", async () => {
    const w = await wczytajKurs(async () => new Response("", { status: 404 }));
    expect(w).toEqual({ ok: false, bledy: [expect.stringContaining("data/kurs.json")] });
  });

  it("naruszenie schematu → ścieżka do pola", () => {
    const k = kursSurowy();
    k.sesje[9].wolna_produkcja.poprawne = 20;
    k.luki.active.push(k.luki.active[0]);
    const w = walidujKurs(k);
    expect(w.ok).toBe(false);
    if (w.ok) return;
    expect(w.bledy.some((b) => b.startsWith("luki.active"))).toBe(true);
  });

  it("reguły spoza JSON Schema: następna sesja = ostatnia + 1", () => {
    const k = kursSurowy();
    k.nastepna_sesja.nr = 14;
    const w = walidujKurs(k);
    expect(w.ok).toBe(false);
    if (!w.ok) expect(w.bledy.join()).toContain("następna sesja to 12");
  });

  it("data/kurs.schema.json jest aktualny względem schematu zod (npm run schemat)", () => {
    expect(JSON.parse(czytaj("data/kurs.schema.json"))).toEqual(JSON.parse(JSON.stringify(schematJson())));
  });
});

describe("słowa z anki/wordlists przez middleware", () => {
  it("wczytuje wszystkie pliki TSV", async () => {
    expect(await wczytajSlowa(fetchZRepo)).toHaveLength(136);
  });
});

describe("middleware /repo/ — tylko do odczytu, tylko lista dozwolonych", () => {
  it.each([
    "/repo/data/kurs.json",
    "/repo/anki/wordlists/block-1.tsv",
    "/repo/lessons/session-10.md",
    "/repo/grammar/05-genus.md",
    "/repo/plan/lesestueck.md",
  ])("wpuszcza %s", (url) => {
    expect(rozwiaz(KORZEN, url)?.typ).toBe("plik");
  });
  it.each([
    "/repo/../../etc/passwd",
    "/repo/%2e%2e/%2e%2e/etc/passwd",
    "/repo/PROGRESS.md",
    "/repo/plan/bank-tekstow.md",
    "/repo/.git/config",
    "/repo/lessons/sprawdz_powtorki.py",
    "/repo/anki/build_deck.py",
    "/repo/app/package.json",
    "/inne/data/kurs.json",
  ])("odrzuca %s", (url) => {
    expect(rozwiaz(KORZEN, url)).toBeNull();
  });
  it("listuje tylko dozwolone katalogi", () => {
    expect(rozwiaz(KORZEN, "/repo/anki/wordlists/")?.typ).toBe("katalog");
    expect(rozwiaz(KORZEN, "/repo/plan/")).toBeNull();
    expect(rozwiaz(KORZEN, "/repo/")).toBeNull();
  });
  it("każdy dozwolony katalog istnieje w repo", () => {
    for (const k of DOZWOLONE_KATALOGI) expect(fs.existsSync(KORZEN + k)).toBe(true);
  });
});
