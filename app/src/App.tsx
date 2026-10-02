import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Notka } from "./components/ui";
import { wczytajKurs } from "./lib/dane";
import { dataDluga, dzisLokalnie } from "./lib/daty";
import { KursKontekst, type Stan } from "./lib/kontekst";
import { GITHUB } from "./lib/markdown";
import { useMotyw } from "./lib/motyw";
import { useTrasa } from "./lib/trasa";
import { Fiszki } from "./tabs/Fiszki";
import { Luki } from "./tabs/Luki";
import { Materialy } from "./tabs/Materialy";
import { Postep } from "./tabs/Postep";
import { Poziom } from "./tabs/Poziom";
import { Pulpit } from "./tabs/Pulpit";
import { Tematy } from "./tabs/Tematy";

const ZAKLADKI = [
  { id: "pulpit", nazwa: "Pulpit", Widok: Pulpit },
  { id: "postep", nazwa: "Postęp", Widok: Postep },
  { id: "luki", nazwa: "Luki", Widok: Luki },
  { id: "poziom", nazwa: "Poziom", Widok: Poziom },
  { id: "tematy", nazwa: "Tematy", Widok: Tematy },
  { id: "fiszki", nazwa: "Fiszki", Widok: Fiszki },
  { id: "materialy", nazwa: "Materiały", Widok: Materialy },
] as const;

/** `?dzis=2026-10-02` w adresie podmienia dzisiejszą datę — do sprawdzania liczb i zrzutów ekranu. */
function dzisZAdresu(): string {
  const p = new URLSearchParams(window.location.search).get("dzis");
  return p && /^\d{4}-\d{2}-\d{2}$/.test(p) ? p : dzisLokalnie();
}

type Ladowanie = { faza: "wczytuje" } | { faza: "blad"; bledy: string[] } | { faza: "ok"; stan: Stan };

export function App() {
  const [ladowanie, setLadowanie] = useState<Ladowanie>({ faza: "wczytuje" });
  const [motyw, nastepnyMotyw] = useMotyw();
  const trasa = useTrasa();
  const [zakladka, ...argumenty] = trasa;
  const aktywna = ZAKLADKI.find((z) => z.id === zakladka) ?? ZAKLADKI[0];

  const wczytaj = useCallback(async () => {
    const w = await wczytajKurs();
    setLadowanie(w.ok ? { faza: "ok", stan: { kurs: w.dane, dzis: dzisZAdresu() } } : { faza: "blad", bledy: w.bledy });
  }, []);
  useEffect(() => {
    void wczytaj();
  }, [wczytaj]);
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${aktywna.nazwa} — kurs niemieckiego`;
  }, [aktywna]);

  const motywEtykieta = useMemo(() => ({ system: "◐ Motyw: systemowy", light: "☀ Motyw: jasny", dark: "☾ Motyw: ciemny" })[motyw], [motyw]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-hairline bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 pt-2">
          <a href="#/pulpit" className="mr-auto font-semibold tracking-tight">
            Kurs niemieckiego <span className="font-normal text-muted">· Jakub</span>
          </a>
          <button onClick={() => void wczytaj()} className="rounded-md px-2 py-1 text-sm text-ink-2 hover:bg-surface-2" title="Wczytaj pliki jeszcze raz (np. po git pull)">
            ↻ <span className="hidden sm:inline">Odśwież dane</span>
          </button>
          <button onClick={nastepnyMotyw} className="rounded-md px-2 py-1 text-sm text-ink-2 hover:bg-surface-2" aria-label={motywEtykieta} title={motywEtykieta}>
            {motywEtykieta.slice(0, 1)} <span className="hidden sm:inline">{motywEtykieta.slice(2)}</span>
          </button>
        </div>
        <nav className="zakladki mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-1.5 pt-1" aria-label="Zakładki">
          {ZAKLADKI.map((z) => (
            <a
              key={z.id}
              href={`#/${z.id}`}
              aria-current={z.id === aktywna.id ? "page" : undefined}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm ${z.id === aktywna.id ? "bg-accent-wash font-medium text-accent-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"}`}
            >
              {z.nazwa}
            </a>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:py-7">
        {ladowanie.faza === "wczytuje" && <p className="text-muted">Wczytuję data/kurs.json…</p>}
        {ladowanie.faza === "blad" && (
          <div className="space-y-3">
            <h1 className="text-xl font-semibold">Nie mogę pokazać danych kursu</h1>
            <Notka ton="blad">
              <p className="mb-2">
                <code>data/kurs.json</code> nie przeszedł walidacji albo nie dało się go wczytać. Strona nie pokazuje danych, których nie
                umie sprawdzić. Uruchom <code>python3 data/sprawdz_dane.py</code> w katalogu repo.
              </p>
              <ul className="list-disc space-y-0.5 pl-5 font-mono text-xs">
                {ladowanie.bledy.slice(0, 20).map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </Notka>
          </div>
        )}
        {ladowanie.faza === "ok" && (
          <KursKontekst.Provider value={ladowanie.stan}>
            <aktywna.Widok argumenty={argumenty} />
          </KursKontekst.Provider>
        )}
      </main>

      {ladowanie.faza === "ok" && (
        <footer className="border-t border-hairline px-4 py-4 text-center text-xs text-muted">
          Dane: <code>data/kurs.json</code> — stan po sesji {ladowanie.stan.kurs.stan_na.po_sesji} ({dataDluga(ladowanie.stan.kurs.stan_na.data)}). Strona
          tylko pokazuje stan kursu; lekcje odbywają się w Claude Code. ·{" "}
          <Link href={GITHUB + "CLAUDE.md"}>protokół kursu</Link>
        </footer>
      )}
    </div>
  );
}
