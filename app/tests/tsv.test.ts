import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { czesciRzeczownika, parsujTsv, porownaj, rodzajSlowa } from "../src/lib/tsv";
import { KORZEN } from "./pomoc";

const NAGLOWEK = "sesja\tdeutsch\tpolski\ttyp\tbeispiel_de\tprzyklad_pl\tuwaga";

describe("parser TSV", () => {
  it("czyta wiersz z nagłówkiem i numerem bloku z nazwy pliku", () => {
    const [s] = parsujTsv(`${NAGLOWEK}\n1\tdie Prüfung, -en\tegzamin\trzeczownik\tIch lerne.\tUczę się.\t-ung`, "block-2.tsv");
    expect(s).toEqual({
      sesja: 1, deutsch: "die Prüfung, -en", polski: "egzamin", typ: "rzeczownik",
      beispiel_de: "Ich lerne.", przyklad_pl: "Uczę się.", uwaga: "-ung", blok: 2,
    });
  });
  it("znosi CRLF, BOM, puste linie i brakujące kolumny", () => {
    const t = `﻿${NAGLOWEK}\r\n\r\n5\tder Dienst, -e\tdyżur\trzeczownik\r\n`;
    const w = parsujTsv(t, "block-1.tsv");
    expect(w).toHaveLength(1);
    expect(w[0]).toMatchObject({ sesja: 5, deutsch: "der Dienst, -e", beispiel_de: "", uwaga: "" });
  });
  it("sam nagłówek → pusta lista", () => {
    expect(parsujTsv(NAGLOWEK + "\n", "block-3.tsv")).toEqual([]);
  });
  it("prawdziwe pliki: 136 słów, jak w PROGRESS.md po sesji 11", () => {
    const katalog = KORZEN + "anki/wordlists/";
    const slowa = fs.readdirSync(katalog).flatMap((p) => parsujTsv(fs.readFileSync(katalog + p, "utf8"), p));
    expect(slowa).toHaveLength(136);
    expect(slowa.every((s) => s.sesja !== null && s.blok === 1)).toBe(true);
  });
});

describe("rodzaj rzeczownika", () => {
  it.each([
    ["der Schrank, Schränke", "der"],
    ["die Hand, Hände", "die"],
    ["das Zimmer, –", "das"],
    ["die Eltern (nur Pl.)", "pl"],
    ["Apulien", null],
  ])("%s → %s", (deutsch, rodzaj) => {
    expect(rodzajSlowa({ typ: "rzeczownik", deutsch })).toBe(rodzaj);
  });
  it("dwa hasła w jednym: każde ze swoim rodzajem", () => {
    expect(czesciRzeczownika("der Leiter, - / die Leiterin, -nen").map((c) => c.rodzaj)).toEqual(["der", "die"]);
  });
  it("czasownik nie ma rodzaju", () => {
    expect(rodzajSlowa({ typ: "czasownik", deutsch: "die Hände waschen" })).toBeNull();
  });
});

describe("porównanie w sprawdzianie PL→DE", () => {
  const prufung = { typ: "rzeczownik", deutsch: "die Prüfung, -en" };
  it.each([
    ["die Prüfung, -en", "dokladnie", true],
    ["die prufung, -en", "prawie", true],
    ["die Pruefung -en", "prawie", true],
    ["die Prüfung", "rdzen", true],
    ["der Prüfung, -en", "inaczej", false],
    ["", "puste", null],
  ])("„%s” → %s, rodzajnik %s", (wpisane, werdykt, rodzajnikOk) => {
    expect(porownaj(wpisane, prufung)).toEqual({ werdykt, rodzajnikOk });
  });
  it("dopisek w nawiasie nie jest wymagany", () => {
    expect(porownaj("sich treffen", { typ: "czasownik", deutsch: "sich treffen (mit + D)" }).werdykt).toBe("dokladnie");
  });
  it("sama pierwsza forma czasownika mocnego → rdzeń", () => {
    expect(porownaj("aussehen", { typ: "czasownik", deutsch: "aussehen – sah aus – hat ausgesehen" }).werdykt).toBe("rdzen");
  });
});
