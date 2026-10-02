import { useEffect, useMemo, useRef, useState } from "react";
import { Haslo, LegendaRodzajow } from "../components/Haslo";
import { Karta, Notka, Plakietka, Przelacznik } from "../components/ui";
import { wczytajSlowa } from "../lib/dane";
import { porownaj, type Porownanie, rodzajSlowa, type Slowo } from "../lib/tsv";
import type { WidokProps } from "./typy";

const TYPY: Record<string, string> = {
  rzeczownik: "rzeczownik",
  czasownik: "czasownik",
  przymiotnik: "przymiotnik",
  przyslowek: "przysłówek",
  zwrot: "zwrot",
  regula: "reguła",
};
const PODPOWIEDZ: Record<string, string> = {
  rzeczownik: "z rodzajnikiem i liczbą mnogą: die Prüfung, -en",
  czasownik: "mocny — w trzech formach: fahren – fuhr – ist gefahren",
};

const KLUCZ_WYNIKOW = "niemiec-fiszki-wyniki";
type Wyniki = Record<string, { werdykt: Porownanie["werdykt"]; kiedy: string }>;
const klucz = (s: Slowo) => `${s.sesja}|${s.deutsch}`;
const trafione = (w: Porownanie["werdykt"]) => w === "dokladnie" || w === "prawie";

function czytajWyniki(): Wyniki {
  try {
    return JSON.parse(localStorage.getItem(KLUCZ_WYNIKOW) ?? "{}") as Wyniki;
  } catch {
    return {};
  }
}
function zapiszWyniki(w: Wyniki) {
  try {
    localStorage.setItem(KLUCZ_WYNIKOW, JSON.stringify(w));
  } catch {
    /* tryb prywatny — wynik tylko do odświeżenia */
  }
}

function tasuj<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const WERDYKT: Record<Porownanie["werdykt"], { tekst: string; klasa: string }> = {
  dokladnie: { tekst: "✅ Dokładnie tak", klasa: "text-good-ink" },
  prawie: { tekst: "✅ Dobrze — różnica tylko w wielkich literach, Umlautach albo interpunkcji", klasa: "text-good-ink" },
  rdzen: { tekst: "◐ Rdzeń dobry — brakuje części hasła (liczby mnogiej albo form czasownika)", klasa: "text-warning-ink" },
  inaczej: { tekst: "❌ Inaczej", klasa: "text-critical-ink" },
  puste: { tekst: "— bez odpowiedzi", klasa: "text-muted" },
};

function Sprawdzian({ slowa, wyniki, setWyniki }: { slowa: Slowo[]; wyniki: Wyniki; setWyniki: (w: Wyniki) => void }) {
  // Kolejka powstaje raz, przy wejściu w sprawdzian albo zmianie filtrów (komponent dostaje wtedy nowy `key`).
  // Zapis wyniku nie może jej przetasować — dlatego nie zależy od `slowa` po starcie.
  const [kolejka, setKolejka] = useState(() => tasuj(slowa));
  const [i, setI] = useState(0);
  const [wpis, setWpis] = useState("");
  const [wynik, setWynik] = useState<Porownanie | null>(null);
  const [licznik, setLicznik] = useState({ trafione: 0, razem: 0 });
  const pole = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!wynik) pole.current?.focus({ preventScroll: true });
  }, [i, wynik]);

  if (kolejka.length === 0) return <p className="text-sm text-muted">Brak słów dla tych filtrów.</p>;
  if (i >= kolejka.length)
    return (
      <Karta>
        <p className="text-lg font-semibold">
          Koniec: {licznik.trafione}/{licznik.razem} trafionych
        </p>
        <button className="mt-3 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white" onClick={() => {
            setKolejka(tasuj(slowa));
            setI(0);
            setLicznik({ trafione: 0, razem: 0 });
          }}
        >
          Jeszcze raz, w innej kolejności
        </button>
      </Karta>
    );

  const s = kolejka[i];
  const sprawdz = () => {
    const p = porownaj(wpis, s);
    setWynik(p);
    setLicznik((l) => ({ trafione: l.trafione + (trafione(p.werdykt) ? 1 : 0), razem: l.razem + 1 }));
    const nowe = { ...wyniki, [klucz(s)]: { werdykt: p.werdykt, kiedy: new Date().toISOString().slice(0, 10) } };
    setWyniki(nowe);
    zapiszWyniki(nowe);
  };
  const dalej = () => {
    setWynik(null);
    setWpis("");
    setI((x) => x + 1);
  };
  const rodzaj = rodzajSlowa(s);

  return (
    <Karta>
      <div className="flex items-center justify-between text-xs text-muted tabular">
        <span>
          Fiszka {i + 1}/{kolejka.length} · s{s.sesja} · {TYPY[s.typ] ?? s.typ}
        </span>
        <span>
          trafione {licznik.trafione}/{licznik.razem}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold">{s.polski}</p>
      {PODPOWIEDZ[s.typ] && <p className="mt-1 text-xs text-muted">Wpisz {PODPOWIEDZ[s.typ]}</p>}
      <form
        className="mt-3 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (wynik) dalej();
          else sprawdz();
        }}
      >
        <input
          ref={pole}
          value={wpis}
          onChange={(e) => setWpis(e.target.value)}
          readOnly={wynik !== null}
          lang="de"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Twoja odpowiedź po niemiecku"
          placeholder="po niemiecku…"
          className="min-w-0 flex-1 rounded-lg border border-hairline bg-surface-2 px-3 py-2.5 text-base focus:border-accent focus:outline-none"
        />
        <button type="submit" className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90">
          {wynik ? "Dalej →" : "Sprawdź"}
        </button>
      </form>
      {wynik && (
        <div className="mt-4 space-y-2 rounded-lg bg-surface-2 p-3">
          <p className={`text-sm font-medium ${WERDYKT[wynik.werdykt].klasa}`}>{WERDYKT[wynik.werdykt].tekst}</p>
          {wynik.rodzajnikOk !== null && rodzaj && rodzaj !== "pl" && (
            <p className={`text-sm ${wynik.rodzajnikOk ? "text-good-ink" : "text-critical-ink"}`}>
              {wynik.rodzajnikOk ? "✅ rodzajnik dobry" : `❌ rodzajnik — to jest „${rodzaj}”`}
            </p>
          )}
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <div className="text-xs text-muted">Twoja odpowiedź</div>
              <div lang="de" className="font-medium">
                {wpis || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted">W talii</div>
              <Haslo s={s} />
            </div>
          </div>
          {s.beispiel_de && (
            <p className="text-sm">
              <span lang="de" className="italic">
                {s.beispiel_de}
              </span>
              <span className="text-ink-2"> — {s.przyklad_pl}</span>
            </p>
          )}
          {s.uwaga && <p className="text-xs text-ink-2">💡 {s.uwaga}</p>}
        </div>
      )}
    </Karta>
  );
}

export function Fiszki(_: WidokProps) {
  const [slowa, setSlowa] = useState<Slowo[] | null>(null);
  const [blad, setBlad] = useState<string | null>(null);
  const [tryb, setTryb] = useState<"przegladanie" | "sprawdzian">("przegladanie");
  const [q, setQ] = useState("");
  const [sesja, setSesja] = useState("");
  const [blok, setBlok] = useState("");
  const [typ, setTyp] = useState("");
  const [tylkoNietrafione, setTylkoNietrafione] = useState(false);
  const [wyniki, setWyniki] = useState<Wyniki>(czytajWyniki);

  useEffect(() => {
    wczytajSlowa()
      .then(setSlowa)
      .catch((e: Error) => setBlad(e.message));
  }, []);

  const opcje = useMemo(() => {
    const l = slowa ?? [];
    const uniq = <T,>(xs: T[]) => [...new Set(xs)].sort((a, b) => (a as number) - (b as number));
    return {
      sesje: uniq(l.map((s) => s.sesja).filter((x): x is number => x !== null)),
      bloki: uniq(l.map((s) => s.blok).filter((x): x is number => x !== null)),
      typy: [...new Set(l.map((s) => s.typ))],
    };
  }, [slowa]);

  const filtr = useMemo(() => {
    const fraza = q.trim().toLowerCase();
    return (slowa ?? []).filter(
      (s) =>
        (!sesja || String(s.sesja) === sesja) &&
        (!blok || String(s.blok) === blok) &&
        (!typ || s.typ === typ) &&
        (!tylkoNietrafione || (wyniki[klucz(s)] && !trafione(wyniki[klucz(s)].werdykt))) &&
        (!fraza || [s.deutsch, s.polski, s.beispiel_de, s.przyklad_pl, s.uwaga].some((p) => p.toLowerCase().includes(fraza))),
    );
  }, [slowa, q, sesja, blok, typ, tylkoNietrafione, wyniki]);

  const sprawdzone = Object.keys(wyniki).length;
  const trafioneOstatnio = Object.values(wyniki).filter((w) => trafione(w.werdykt)).length;
  const wybierz = "rounded-lg border border-hairline bg-surface px-2.5 py-2 text-sm";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Fiszki</h1>
        <p className="mt-1 max-w-3xl text-sm text-ink-2">
          Słowa z <code>anki/wordlists/*.tsv</code> — tych samych, z których powstaje talia Anki. Tu: przeglądanie i szybki sprawdzian PL → DE.
        </p>
      </div>
      <Notka>
        Sprawdzian na stronie <strong>nie jest pomiarem kursu</strong> i nie ma własnego harmonogramu powtórek — powtórki prowadzi Anki (10 minut
        dziennie). Wyniki zostają tylko w tej przeglądarce.
      </Notka>

      <div className="flex flex-wrap items-center gap-2">
        <Przelacznik
          etykieta="Tryb"
          wartosc={tryb}
          onZmiana={setTryb}
          opcje={[
            { id: "przegladanie", nazwa: "Przeglądanie" },
            { id: "sprawdzian", nazwa: "Sprawdzian PL → DE" },
          ]}
        />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj (DE lub PL)…" aria-label="Szukaj" className={`${wybierz} min-w-0 flex-1 sm:max-w-xs`} />
        <select value={sesja} onChange={(e) => setSesja(e.target.value)} aria-label="Sesja" className={wybierz}>
          <option value="">Wszystkie sesje</option>
          {opcje.sesje.map((s) => (
            <option key={s} value={s}>
              Sesja {s}
            </option>
          ))}
        </select>
        <select value={blok} onChange={(e) => setBlok(e.target.value)} aria-label="Blok" className={wybierz}>
          <option value="">Wszystkie bloki</option>
          {opcje.bloki.map((b) => (
            <option key={b} value={b}>
              Blok {b}
            </option>
          ))}
        </select>
        <select value={typ} onChange={(e) => setTyp(e.target.value)} aria-label="Typ" className={wybierz}>
          <option value="">Wszystkie typy</option>
          {opcje.typy.map((t) => (
            <option key={t} value={t}>
              {TYPY[t] ?? t}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-2">
        <span>
          {slowa ? `${filtr.length} z ${slowa.length} słów` : "Wczytuję…"} · w tej przeglądarce sprawdzone {sprawdzone}, ostatnio trafione {trafioneOstatnio}
        </span>
        <span className="flex items-center gap-3">
          <label className="inline-flex items-center gap-1.5">
            <input type="checkbox" checked={tylkoNietrafione} onChange={(e) => setTylkoNietrafione(e.target.checked)} />
            tylko ostatnio nietrafione
          </label>
          {sprawdzone > 0 && (
            <button
              className="text-accent-ink hover:underline"
              onClick={() => {
                if (window.confirm("Wyczyścić wyniki sprawdzianu w tej przeglądarce?")) {
                  setWyniki({});
                  zapiszWyniki({});
                }
              }}
            >
              wyczyść wyniki
            </button>
          )}
        </span>
      </div>
      <LegendaRodzajow />

      {blad && <Notka ton="blad">Nie udało się wczytać słów: {blad}</Notka>}
      {slowa && tryb === "sprawdzian" && (
        <Sprawdzian key={[q, sesja, blok, typ, tylkoNietrafione].join("|")} slowa={filtr} wyniki={wyniki} setWyniki={setWyniki} />
      )}
      {slowa && tryb === "przegladanie" && (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtr.map((s) => {
            const w = wyniki[klucz(s)];
            return (
              <li key={klucz(s)} className="min-w-0 rounded-xl border border-hairline bg-surface p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <Haslo s={s} />
                  <span className="flex shrink-0 gap-1">
                    {w && <Plakietka ton={trafione(w.werdykt) ? "dobry" : "zly"}>{trafione(w.werdykt) ? "✓" : "✗"}</Plakietka>}
                    <Plakietka>s{s.sesja}</Plakietka>
                  </span>
                </div>
                <p className="mt-1 text-sm">
                  {s.polski} <span className="text-xs text-muted">· {TYPY[s.typ] ?? s.typ}</span>
                </p>
                {s.beispiel_de && (
                  <p className="mt-2 text-sm">
                    <span lang="de" className="italic">
                      {s.beispiel_de}
                    </span>
                    <br />
                    <span className="text-ink-2">{s.przyklad_pl}</span>
                  </p>
                )}
                {s.uwaga && <p className="mt-1.5 text-xs text-ink-2">💡 {s.uwaga}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
