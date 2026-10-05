import { Kafelek, Karta, Link, Md, Notka, Pasek, Plakietka, Stan, Tytul } from "../components/ui";
import { dataDluga, dniMiedzy, odmien } from "../lib/daty";
import { useKurs } from "../lib/kontekst";
import { etap1, NAZWA_TRYBU, ostatniaSesja, tekstyDoCzytania } from "../lib/pochodne";
import { procent } from "../lib/statystyka";
import { aktualnaSesja, prognozaSesji, sesjeWOknie } from "../lib/tempo";
import { dzienNauki, tydzienNauki } from "../lib/daty";
import type { WidokProps } from "./typy";

const DNI_TYGODNIA = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];
const dzienTygodnia = (iso: string) => DNI_TYGODNIA[new Date(`${iso}T12:00:00Z`).getUTCDay()];

const STAN_KRYTERIUM = { otwarte: "otwarte", spelnione: "ok", niespelnione: "zle", "brak-pomiaru": "brak" } as const;

export function Pulpit(_: WidokProps) {
  const { kurs: k, dzis } = useKurs();
  const e1 = etap1(k);
  const ostatnia = ostatniaSesja(k);
  const nastepna = aktualnaSesja(k.sesje);
  const etapOd = e1.sesje!.od;
  const etapDo = e1.sesje!.do;
  const wEtapie = Math.max(0, Math.min(ostatnia.nr, etapDo) - etapOd + 1);
  const dzien = dzienNauki(k.kurs.start, dzis);
  const tydzien = tydzienNauki(k.kurs.start, dzis);
  const doKonca = e1.koniec ? dniMiedzy(dzis, e1.koniec) : null;
  const egz = k.egzamin;
  const doEgzaminu = egz.termin ? dniMiedzy(dzis, egz.termin) : null;

  const tryb = k.kurs.tryb;
  const vollmodus = tryb.opisy.vollmodus;
  const wymagane = vollmodus.min_sesji_tydzien ?? 3;
  const ostatnie7 = sesjeWOknie(k.sesje, dzis, 7);
  const termin = egz.termin ?? e1.koniec;
  const terminOpis = egz.termin
    ? `przed egzaminem (${dataDluga(egz.termin)})`
    : `przed ${e1.koniec ? dataDluga(e1.koniec) : "końcem etapu"} — termin egzaminu nieustalony`;
  const prognozy = [
    { opis: `przy tempie z ostatnich 7 dni (${ostatnie7.length}/tydz.)`, naTydzien: ostatnie7.length },
    { opis: `przy wymaganym min. ${wymagane}/tydz.`, naTydzien: wymagane },
  ].map((p) => ({ ...p, ...prognozaSesji({ ostatnia: ostatnia.nr, cel: etapDo, dzis, naTydzien: p.naTydzien, termin }) }));

  const cykl = k.cel_cyklu.aktualny;
  const czytaj = tekstyDoCzytania(k).filter((t) => t.sesja === nastepna);
  const wp = ostatnia.wolna_produkcja;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted">
          Dziś: {dzienTygodnia(dzis)}, {dataDluga(dzis)}
        </p>
        <h1 className="text-2xl font-semibold">Pulpit</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kafelek
          duzy
          etykieta={`Następna sesja · Etap ${e1.nr}`}
          wartosc={
            <>
              {nastepna}
              <span className="text-2xl font-normal text-muted"> / {etapDo}</span>
            </>
          }
          przypis={`Etap ${e1.nr} = sesje ${etapOd}–${etapDo}. Za nami ${wEtapie} z ${etapDo - etapOd + 1}. Kurs liczy sesje, nie dni.`}
        />
        <Kafelek
          etykieta="Dzień nauki"
          wartosc={
            <>
              {dzien} <span className="text-lg font-normal text-ink-2">· tydz. {tydzien}</span>
            </>
          }
          przypis={`Od sesji 1 (${dataDluga(k.kurs.start)}). Tylko podpis — przerwa nie jest zaległością.`}
        />
        <Kafelek
          etykieta={e1.koniec ? `Do ${dataDluga(e1.koniec)}` : "Do końca etapu"}
          wartosc={doKonca === null ? "—" : `${doKonca} ${odmien(doKonca, "dzień", "dni", "dni")}`}
          przypis={<Md>{`Cel Etapu ${e1.nr}: ${e1.nazwa} — ${e1.termin}.`}</Md>}
        />
        <Kafelek
          etykieta={`Egzamin — ${egz.nazwa}`}
          wartosc={doEgzaminu === null ? <span className="text-2xl">nieustalony</span> : `za ${doEgzaminu} ${odmien(doEgzaminu, "dzień", "dni", "dni")}`}
          przypis={
            egz.termin ? (
              `${dataDluga(egz.termin)}${egz.miejsce ? ` · ${egz.miejsce}` : ""}`
            ) : egz.kandydat ? (
              <>
                Możliwy termin {dataDluga(egz.kandydat.data)}
                {egz.kandydat.zapisy_do && `, zapisy do ${dataDluga(egz.kandydat.zapisy_do)} (za ${dniMiedzy(dzis, egz.kandydat.zapisy_do)} dni)`} —{" "}
                <strong>jeszcze nie wybrany</strong>.{egz.kandydat.uwaga && <> <Md>{egz.kandydat.uwaga}</Md></>}
              </>
            ) : (
              "Do ustalenia."
            )
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Karta>
          <Tytul podpis="Kurs liczy sesje. Tempo mówi, czy sesja 29 zmieści się przed egzaminem.">Tempo</Tytul>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-ink-2">Sesje w ostatnich 7 dniach</span>
            <span className="text-2xl font-semibold tabular">
              {ostatnie7.length}
              <span className="text-base font-normal text-muted"> / min. {wymagane}</span>
            </span>
          </div>
          <div className="mt-2">
            <Pasek wartosc={ostatnie7.length} max={wymagane} etykieta={`Sesje w ostatnich 7 dniach: ${ostatnie7.length} z wymaganych ${wymagane}`} kolor={ostatnie7.length >= wymagane ? "var(--good)" : "var(--accent)"} />
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {ostatnie7.length > 0 ? `Ostatnio: ${ostatnie7.map((s) => `s${s.nr} (${dataDluga(s.data)})`).join(", ")}. ` : "Brak sesji w tym oknie. "}
            Wymóg min. {wymagane}/tydz. obowiązuje w {vollmodus.nazwa}
            {tryb.aktualny === "vollmodus" ? " — teraz." : `; teraz ${tryb.opisy[tryb.aktualny].nazwa} (${tryb.opisy[tryb.aktualny].sesje_tydzien}/tydz.).`}
          </p>
          <h3 className="mt-4 text-sm font-semibold">Kiedy wypadnie sesja {etapDo}?</h3>
          <ul className="mt-1.5 divide-y divide-hairline text-sm">
            {prognozy.map((p) => (
              <li key={p.opis} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 py-2">
                <span className="text-ink-2">{p.opis}</span>
                <span className="font-medium">
                  {p.data === null ? (
                    <span className="text-critical-ink">❌ nigdy — brak sesji</span>
                  ) : (
                    <>
                      ≈ {dataDluga(p.data)}{" "}
                      {p.przedTerminem === true && <span className="text-good-ink">✅ zdąży</span>}
                      {p.przedTerminem === false && <span className="text-critical-ink">❌ nie zdąży</span>}
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-muted">
            Porównanie: {terminOpis}. Zostało {prognozy[0].pozostalo} {odmien(prognozy[0].pozostalo, "sesja", "sesje", "sesji")}. Prognoza zakłada stałe tempo od dziś — to rachunek, nie plan.
          </p>
        </Karta>

        <Karta>
          <Tytul podpis={`Obejmuje 3 kolejne sesje, niezależnie od kalendarza. Rozliczenie w bilansie sesji ${cykl.sesje[2]}.`}>
            Cel cyklu · sesje {cykl.sesje.join(" · ")}
          </Tytul>
          <p className="font-medium">
            <Md>{cykl.cel}</Md>
          </p>
          <ol className="my-3 grid grid-cols-3 gap-2" aria-label="Sesje cyklu">
            {cykl.sesje.map((nr) => {
              const zrobiona = nr <= ostatnia.nr;
              const teraz = nr === nastepna;
              return (
                <li key={nr} className={`rounded-lg border px-2 py-1.5 text-center text-sm ${zrobiona ? "border-accent/40 bg-accent-wash text-accent-ink" : teraz ? "border-accent text-ink" : "border-hairline text-muted"}`}>
                  <div className="font-semibold">s{nr}</div>
                  <div className="text-xs">{zrobiona ? "✓ za nami" : teraz ? "następna" : nr === cykl.sesje[2] ? "rozliczenie" : "potem"}</div>
                </li>
              );
            })}
          </ol>
          <p className="text-sm text-ink-2">
            <span className="font-medium text-ink">Warunek: </span>
            <Md>{cykl.warunek}</Md>
          </p>
          <ul className="mt-3 space-y-2">
            {cykl.kryteria.map((kr) => (
              <li key={kr.opis} className="rounded-lg bg-surface-2 px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Md className="font-medium">{kr.opis}</Md>
                  <Stan stan={STAN_KRYTERIUM[kr.stan]} />
                </div>
                {kr.uwaga && (
                  <p className="mt-0.5 text-xs text-ink-2">
                    <Md>{kr.uwaga}</Md>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Karta>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Karta>
          <Tytul>Następna sesja: {k.nastepna_sesja.nr}</Tytul>
          <p className="font-medium">
            <Md>{k.nastepna_sesja.temat}</Md>
          </p>
          {k.nastepna_sesja.uwaga && (
            <p className="mt-2 text-sm text-ink-2">
              <Md>{k.nastepna_sesja.uwaga}</Md>
            </p>
          )}
          {czytaj.length > 0 && (
            <div className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-sm">
              📖 Przeczytaj przed sesją:{" "}
              {czytaj.map((t) => (
                <Link key={t.tytul} href={`#/materialy/tekst/${t.sesja}`}>
                  {t.tytul}
                </Link>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-muted">🔒 Plan lekcji {k.nastepna_sesja.nr} jest ukryty do lekcji — ma pytania i klucze.</p>
        </Karta>

        <Karta>
          <Tytul>
            Ostatnia sesja: {ostatnia.nr} · {dataDluga(ostatnia.data)}
          </Tytul>
          <p className="font-medium">
            <Md>{ostatnia.temat}</Md>
          </p>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-sm text-ink-2">🟢 Wolna produkcja</span>
            {wp ? (
              <>
                <span className="text-2xl font-semibold tabular">
                  {wp.poprawne}/{wp.n}
                </span>
                <span className="text-ink-2 tabular">= {procent(wp.poprawne / wp.n)}</span>
                {!wp.porownywalne && <Plakietka ton="uwaga">⚠ nieporównywalna</Plakietka>}
              </>
            ) : (
              <span className="text-muted">brak pomiaru</span>
            )}
          </div>
          <p className="mt-2 text-xs text-muted">
            Jedna sesja przy ~15 grupach ma przedział ok. ±20 pkt — odczyt główny (suma dwóch sesji) jest w <Link href="#/postep">Postępie</Link>.
          </p>
        </Karta>

        <Karta>
          <Tytul podpis="Maks. 3 naraz — każda dostaje okazję w każdej sesji.">Luki Active</Tytul>
          <ol className="space-y-2 text-sm">
            {k.luki.active.map((l) => (
              <li key={l.nr} className="flex gap-2">
                <span className="font-semibold text-accent-ink">{l.nr}.</span>
                <Md>{l.nazwa}</Md>
              </li>
            ))}
          </ol>
          <Link href="#/luki" className="mt-3 inline-block text-sm">
            Reguły i następne kroki →
          </Link>
        </Karta>
      </div>

      <Karta>
        <Tytul>Tryb i miejsce</Tytul>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Plakietka ton="akcent">teraz: {NAZWA_TRYBU[tryb.aktualny]}</Plakietka>
          {tryb.nastepny && tryb.nastepny !== tryb.aktualny && <Plakietka>dalej: {NAZWA_TRYBU[tryb.nastepny]}</Plakietka>}
          <Plakietka>📍 {k.kurs.miejsce.aktualne}</Plakietka>
        </div>
        {tryb.zmiana && (
          <p className="mt-2 text-sm text-ink-2">
            <Md>{tryb.zmiana}</Md>
          </p>
        )}
        {k.kurs.miejsce.uwaga && <p className="mt-1 text-xs text-muted">{k.kurs.miejsce.uwaga}</p>}
        <div className="mt-3">
          <Notka>
            ⭐ <Md>{k.kurs.os_kursu}</Md>
          </Notka>
        </div>
      </Karta>
    </div>
  );
}
