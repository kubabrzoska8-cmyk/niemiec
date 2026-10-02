import { Fragment, type ReactNode } from "react";
import { AnkiWykres } from "../components/wykresy/AnkiWykres";
import { KrzywaProdukcji } from "../components/wykresy/KrzywaProdukcji";
import { BrakPomiaru, Karta, Link, Md, Notka, Pasek, Plakietka, Tytul } from "../components/ui";
import { dataKrotka } from "../lib/daty";
import { useKurs } from "../lib/kontekst";
import { GITHUB } from "../lib/markdown";
import { lekcjaOdkryta } from "../lib/pochodne";
import type { SesjaT } from "../lib/schema";
import { procent, type Suma, sumaDwochOstatnich, sumaDwochOstatnichPorownywalnych } from "../lib/statystyka";
import type { WidokProps } from "./typy";

function Odczyt({ etykieta, suma, glowny }: { etykieta: string; suma: Suma; glowny?: boolean }) {
  return (
    <div className={glowny ? "" : "border-t border-hairline pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5"}>
      <div className="text-sm text-ink-2">{etykieta}</div>
      <div className={`mt-1 font-semibold tabular ${glowny ? "text-5xl" : "text-3xl"}`}>{procent(suma.poprawne / suma.n)}</div>
      <div className="mt-1 text-sm text-ink-2 tabular">
        s{suma.sesje.join(" + s")}: {suma.poprawne}/{suma.n} grup · przedział 95 %: {procent(suma.przedzial.dol)}–{procent(suma.przedzial.gora)}
      </div>
      {suma.zNieporownywalna && (
        <div className="mt-1.5">
          <Plakietka ton="uwaga">⚠ zawiera sesję nieporównywalną</Plakietka>
        </div>
      )}
    </div>
  );
}

function x(p: { poprawne: number; n: number }) {
  return `${String(p.poprawne).replace(".", ",")}/${p.n}`;
}

/** Panel pomiaru pomocniczego: wiersz na sesję, pasek x/n, bez porównywania z niczym. */
function Panel({ tytul, podpis, wiersze }: { tytul: string; podpis: string; wiersze: { nr: number; wynik: { poprawne: number; n: number } | null; opis?: ReactNode; brak?: string }[] }) {
  return (
    <Karta>
      <Tytul poziom={3} podpis={podpis}>
        {tytul}
      </Tytul>
      <ul className="divide-y divide-hairline">
        {wiersze.map((w, i) => (
          <li key={i} className="grid grid-cols-[2.5rem_1fr] gap-x-2 py-2 text-sm">
            <span className="font-medium text-ink-2">s{w.nr}</span>
            <div className="min-w-0">
              {w.wynik ? (
                <div className="flex items-center gap-2">
                  <span className="w-12 shrink-0 font-semibold tabular">{x(w.wynik)}</span>
                  <span className="w-12 shrink-0 text-right whitespace-nowrap text-ink-2 tabular">{Math.round((w.wynik.poprawne / w.wynik.n) * 100)} %</span>
                  <div className="min-w-8 flex-1">
                    <Pasek wartosc={w.wynik.poprawne} max={w.wynik.n} etykieta={`Sesja ${w.nr}: ${x(w.wynik)}`} />
                  </div>
                </div>
              ) : (
                <BrakPomiaru powod={w.brak} />
              )}
              {w.opis && <div className="mt-0.5 text-xs text-muted">{w.opis}</div>}
            </div>
          </li>
        ))}
      </ul>
    </Karta>
  );
}

function Pomocnicze({ sesje }: { sesje: SesjaT[] }) {
  const zPomiarami = sesje.filter((s) => s.tryb !== "przed-struktura" || s.pomocnicze.inne.length);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Panel
        tytul="Drill — zdania PL → DE"
        podpis="Reguła w zdaniu budowanym od zera. Format zmieniał się co sesję (4–5 celów → 1 cel → 1 cel + sonda) — nie porównuj sesji ze sobą."
        wiersze={zPomiarami.filter((s) => s.tryb !== "przed-struktura").map((s) => ({ nr: s.nr, wynik: s.pomocnicze.drill, opis: s.pomocnicze.drill?.format ?? undefined }))}
      />
      <Karta>
        <Tytul poziom={3} podpis="Reguła przy gotowej składni, x/10. Blok istnieje od sesji 9.">
          🧩 Lückensätze
        </Tytul>
        <ul className="divide-y divide-hairline">
          {sesje
            .filter((s) => s.pomocnicze.luki)
            .map((s) => {
              const l = s.pomocnicze.luki!;
              const r = l.rozbicie;
              return (
                <li key={s.nr} className="py-2 text-sm">
                  <div className="grid grid-cols-[2.5rem_3rem_1fr] items-center gap-x-2">
                    <span className="font-medium text-ink-2">s{s.nr}</span>
                    <span className="font-semibold tabular">{x(l)}</span>
                    <Pasek wartosc={l.poprawne} max={l.n} etykieta={`Sesja ${s.nr}: ${x(l)}`} />
                  </div>
                  {r && (
                    <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 pl-[2.9rem] text-xs sm:grid-cols-4">
                      {(
                        [
                          ["reguła dnia", r.regula_dnia],
                          ["Active", r.active],
                          ["przeplatanie", r.przeplatanie],
                          ["sonda", r.sonda],
                        ] as const
                      ).map(([n, v]) => (
                        <div key={n}>
                          <dt className="text-muted">{n}</dt>
                          <dd className="font-medium tabular">{v ? x(v) : "—"}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {l.uwaga && <p className="mt-1 pl-[2.9rem] text-xs text-muted">{l.uwaga}</p>}
                </li>
              );
            })}
        </ul>
      </Karta>
      <Panel
        tytul="📖 Leseverstehen"
        podpis="Rozumienie tekstu (D2 + D4). Blok od sesji 7; nieprzeczytany tekst = brak pomiaru."
        wiersze={sesje
          .filter((s) => s.nr >= 7)
          .map((s) => ({
            nr: s.nr,
            wynik: s.pomocnicze.lesen,
            opis: s.pomocnicze.lesen ? [s.pomocnicze.lesen.format, s.pomocnicze.lesen.uwaga].filter(Boolean).join(" · ") : undefined,
            brak: s.pomocnicze.lesen ? undefined : "tekst nieprzeczytany",
          }))}
      />
      <Panel
        tytul="Inne pomiary jednorazowe"
        podpis="Pytania celowane, post-testy, sondy — każdy mierzy co innego."
        wiersze={sesje.flatMap((s) => s.pomocnicze.inne.map((p) => ({ nr: s.nr, wynik: p, opis: <Md>{p.nazwa + (p.uwaga ? ` — ${p.uwaga}` : "")}</Md> })))}
      />
    </div>
  );
}

export function Postep(_: WidokProps) {
  const { kurs: k } = useKurs();
  const glowna = sumaDwochOstatnich(k.sesje);
  const porown = sumaDwochOstatnichPorownywalnych(k.sesje);
  const bezPomiaru = k.sesje.filter((s) => !s.wolna_produkcja).map((s) => s.nr);
  const cykl = k.cel_cyklu.aktualny;
  const celProcent = Number(/≥\s*(\d+)\s*%/.exec(cykl.cel)?.[1] ?? NaN);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Postęp</h1>
        <p className="mt-1 max-w-3xl text-sm text-ink-2">
          Jedna liczba główna — <strong>🟢 wolna produkcja</strong>: ile grup rzeczownikowych w swobodnej rozmowie ma poprawny rodzaj, przypadek i
          końcówki. Pomiary pomocnicze są niżej, w osobnych panelach — to inne instrumenty, nigdy nie uśredniamy ich z liczbą główną ani ze sobą.
        </p>
      </div>

      <Karta>
        <Tytul podpis="Decyzje w kursie zapadają na sumie dwóch ostatnich sesji (n ≈ 30). Pojedyncza sesja przy 15 grupach ma przedział ok. ±20 pkt — skok o 10 pkt to szum.">
          Odczyt główny — suma dwóch ostatnich sesji
        </Tytul>
        {glowna ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Odczyt glowny etykieta="Dwie ostatnie sesje" suma={glowna} />
            {glowna.zNieporownywalna && porown && <Odczyt etykieta="Dwie ostatnie porównywalne — do decyzji" suma={porown} />}
          </div>
        ) : (
          <BrakPomiaru powod="potrzebne są dwie sesje z pomiarem" />
        )}
      </Karta>

      <Karta>
        <Tytul podpis="Każdy punkt: wynik sesji, pod osią n (liczba grup), pionowy wąs — przedział 95 %. Linia łączy tylko sąsiednie sesje mierzone tak samo.">
          🟢 Wolna produkcja — sesja po sesji
        </Tytul>
        <KrzywaProdukcji
          sesje={k.sesje}
          przerwy={k.przerwy}
          cel={Number.isFinite(celProcent) ? { procent: celProcent, etykieta: `cel cyklu ${cykl.sesje[0]}–${cykl.sesje[2]}: ≥ ${celProcent} %` } : null}
        />
        <div className="mt-3 space-y-1 text-xs text-muted">
          {bezPomiaru.length > 0 && <p>Sesje {bezPomiaru.join(", ")}: brak pomiaru (przed strukturą kursu).</p>}
          <p>Do sesji 9 liczono wszystkie grupy z rozmowy (stąd różne n); od sesji 10 — pierwsze 15 grup z bloku 5.</p>
        </div>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-accent-ink">Tabela — wszystkie sesje</summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left">
              <thead className="text-xs text-muted">
                <tr>
                  <th className="py-1 pr-2 font-normal">Sesja</th>
                  <th className="py-1 pr-2 font-normal">Data</th>
                  <th className="py-1 pr-2 text-right font-normal">Wynik</th>
                  <th className="py-1 pr-2 text-right font-normal">%</th>
                  <th className="py-1 pr-2 font-normal">Porównywalna</th>
                  <th className="py-1 font-normal">Uwaga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline tabular">
                {k.sesje.map((s) => (
                  <tr key={s.nr} className="align-top">
                    <td className="py-1.5 pr-2">{s.nr}</td>
                    <td className="py-1.5 pr-2 whitespace-nowrap">{dataKrotka(s.data)}</td>
                    <td className="py-1.5 pr-2 text-right">{s.wolna_produkcja ? x(s.wolna_produkcja) : "—"}</td>
                    <td className="py-1.5 pr-2 text-right">{s.wolna_produkcja ? procent(s.wolna_produkcja.poprawne / s.wolna_produkcja.n) : "—"}</td>
                    <td className="py-1.5 pr-2">{s.wolna_produkcja ? (s.wolna_produkcja.porownywalne ? "tak" : "⚠ nie") : "—"}</td>
                    <td className="py-1.5 text-xs text-ink-2">{s.wolna_produkcja ? <Md>{s.wolna_produkcja.uwaga ?? ""}</Md> : "brak pomiaru"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </Karta>

      <div>
        <h2 className="text-lg font-semibold">Pomiary pomocnicze — diagnostyka</h2>
        <p className="mt-0.5 mb-3 max-w-3xl text-sm text-ink-2">Każdy panel to osobny instrument. Nie porównuj ich między sobą ani z liczbą główną.</p>
        <Pomocnicze sesje={k.sesje} />
      </div>

      <Karta>
        <Tytul podpis={`Kafelek „Naprawdę zapamiętane” — nie prognoza FSRS. Pytanie co ${k.anki.pytanie_co_sesji}. sesję${k.anki.nastepne_pytanie_sesja ? ` (najbliżej: s${k.anki.nastepne_pytanie_sesja})` : ""}.`}>
          📦 Anki
        </Tytul>
        <div className="grid gap-4 md:grid-cols-[3fr_2fr]">
          <AnkiWykres anki={k.anki} />
          <div className="text-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-ink-2">Limit nowych kart / dzień</span>
              <span className="text-2xl font-semibold tabular">{k.anki.limit_nowych_dziennie}</span>
            </div>
            {k.anki.limit_uwaga && <p className="mt-1 text-xs text-muted">{k.anki.limit_uwaga}</p>}
            <h3 className="mt-3 text-xs font-medium text-muted">Historia limitu</h3>
            <ul className="mt-1 space-y-1 text-xs">
              {k.anki.historia_limitu.map((h) => (
                <li key={h.od_sesji}>
                  od s{h.od_sesji}: <strong className="tabular">{h.limit}</strong>
                  {h.powod && <span className="text-muted"> — {h.powod}</span>}
                </li>
              ))}
            </ul>
            <h3 className="mt-3 text-xs font-medium text-muted">Słowa w talii po sesji</h3>
            <p className="mt-1 text-xs tabular text-ink-2">
              {k.sesje
                .filter((s) => s.anki)
                .map((s) => `s${s.nr}: ${s.anki!.slowa}`)
                .join(" · ")}
            </p>
          </div>
        </div>
      </Karta>

      <Karta>
        <Tytul podpis="Najnowsze na górze. Decyzje — dokładnie tak, jak zapisano w PROGRESS.md.">Log sesji</Tytul>
        <ol className="divide-y divide-hairline">
          {[...k.sesje].reverse().map((s) => (
            <Fragment key={s.nr}>
              <li className="py-3">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-semibold">Sesja {s.nr}</span>
                  <span className="text-sm text-muted">{dataKrotka(s.data)} {s.data.slice(0, 4)}</span>
                  <Md className="text-sm">{s.temat}</Md>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                  {s.wolna_produkcja ? (
                    <Plakietka ton={s.wolna_produkcja.porownywalne ? "akcent" : "uwaga"}>
                      🟢 {x(s.wolna_produkcja)} = {procent(s.wolna_produkcja.poprawne / s.wolna_produkcja.n)}
                      {!s.wolna_produkcja.porownywalne && " ⚠"}
                    </Plakietka>
                  ) : (
                    <Plakietka>🟢 brak pomiaru</Plakietka>
                  )}
                  {s.pomocnicze.drill && <Plakietka>drill {x(s.pomocnicze.drill)}</Plakietka>}
                  {s.pomocnicze.luki && <Plakietka>🧩 {x(s.pomocnicze.luki)}</Plakietka>}
                  {s.pomocnicze.lesen && <Plakietka>📖 {x(s.pomocnicze.lesen)}</Plakietka>}
                  {s.anki && <Plakietka>📦 {s.anki.slowa} słów{s.anki.karty ? ` / ${s.anki.karty} kart` : ""}</Plakietka>}
                </div>
                {s.decyzja && (
                  <p className="mt-1.5 text-sm">
                    <span className="text-ink-2">Decyzja: </span>
                    <Md>{s.decyzja}</Md>
                  </p>
                )}
                {s.uwaga && (
                  <p className="mt-1 text-xs text-muted">
                    <Md>{s.uwaga}</Md>
                  </p>
                )}
                <div className="mt-1.5 flex flex-wrap gap-x-4 text-xs">
                  {s.lekcja && lekcjaOdkryta(k, s.nr) && <Link href={`#/materialy/lekcja/${s.nr}`}>plan lekcji</Link>}
                  {s.draft && <Link href={GITHUB + s.draft}>zapis sesji (draft)</Link>}
                </div>
              </li>
              {k.przerwy
                .filter((p) => p.po_sesji === s.nr - 1)
                .map((p) => (
                  <li key={`p${p.po_sesji}`} className="py-2 text-sm text-muted">
                    ⏸️ {p.opis}
                  </li>
                ))}
            </Fragment>
          ))}
        </ol>
      </Karta>

      <Notka>
        Liczby pochodzą z <code>data/kurs.json</code>, uzupełnianego po każdej sesji razem z <code>PROGRESS.md</code>; zgodność obu pilnuje{" "}
        <code>python3 data/sprawdz_dane.py</code>.
      </Notka>
    </div>
  );
}
