import { GRUPY, RESEARCH, RYTM, type Zrodlo } from "../content/codziennie";
import { dataDluga } from "../lib/daty";
import { useKanal } from "../lib/kanaly";
import { useKurs } from "../lib/kontekst";
import { GITHUB } from "../lib/markdown";
import { Karta, Link, Md, Plakietka, Tytul } from "./ui";

function NajnowszeOdcinki({ kanal, link }: { kanal: NonNullable<Zrodlo["kanal"]>; link: string }) {
  const stan = useKanal(kanal);
  if (stan.faza === "wczytuje") return <p className="mt-2 text-xs text-muted">Pobieram najnowsze…</p>;
  if (stan.faza === "blad")
    return (
      <p className="mt-2 text-xs text-muted">
        Nie udało się pobrać najnowszych odcinków (brak internetu albo kanał zmienił adres) — <Link href={link}>otwórz stronę</Link>.
      </p>
    );
  return (
    <ul className="mt-2 space-y-2 border-l-2 border-accent/40 pl-3">
      {stan.wpisy.map((w) => (
        <li key={(w.link ?? "") + w.tytul} lang="de">
          <div className="text-sm">
            {w.link ? <Link href={w.link}>{w.tytul}</Link> : <span className="font-medium">{w.tytul}</span>}
            {w.data && <span className="text-xs text-muted"> · {dataDluga(w.data)}</span>}
          </div>
          {w.opis && <p className="mt-0.5 text-xs leading-relaxed text-ink-2">{w.opis}</p>}
        </li>
      ))}
    </ul>
  );
}

function KartaZrodla({ z }: { z: Zrodlo }) {
  return (
    <li className="py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        {z.link ? (
          <Link href={z.link} className="font-medium">
            {z.nazwa}
          </Link>
        ) : (
          <span className="font-medium">{z.nazwa}</span>
        )}
        <span className="flex items-center gap-1.5">
          <Plakietka>{z.poziom}</Plakietka>
          <Plakietka>{z.czas}</Plakietka>
        </span>
      </div>
      <p className="mt-1 text-sm text-ink-2">
        <Md>{z.opis}</Md>
      </p>
      {z.kanal && z.link && <NajnowszeOdcinki kanal={z.kanal} link={z.link} />}
    </li>
  );
}

/** Niemiecki na co dzień — plan na dziś + źródła, z których trzy odświeżają się same. */
export function Codziennie() {
  const { dzis } = useKurs();
  const dzisiaj = RYTM[new Date(dzis + "T12:00:00Z").getUTCDay()];
  return (
    <div className="space-y-4">
      <Karta>
        <Tytul podpis={`Plan tygodnia w 10–15 minut dziennie — dziś ${dzisiaj.dzien.toLowerCase()}. Dlaczego tak: research w ${RESEARCH}.`}>
          🗓️ Na dziś
        </Tytul>
        <p className="text-base">
          <Md>{dzisiaj.co}</Md>
        </p>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-ink-2">Cały tydzień</summary>
          <ul className="mt-2 space-y-1">
            {[...RYTM.slice(1), RYTM[0]].map((d) => (
              <li key={d.dzien} className={d === dzisiaj ? "font-medium" : "text-ink-2"}>
                <span className="inline-block w-28">{d.dzien}</span>
                <Md>{d.co}</Md>
              </li>
            ))}
          </ul>
        </details>
        <p className="mt-3 text-xs text-muted">
          <Link href={GITHUB + RESEARCH}>Co mówią badania o nauce bez rozmówcy</Link> · niemiecki masz teraz tylko tutaj, więc te 10 minut
          dziennie to Twoja „kuchnia z Rzymu”.
        </p>
      </Karta>
      {GRUPY.map((g) => (
        <Karta key={g.id}>
          <Tytul podpis={g.podpis}>{g.tytul}</Tytul>
          <ul className="divide-y divide-hairline">
            {g.zrodla.map((z) => (
              <KartaZrodla key={z.nazwa} z={z} />
            ))}
          </ul>
        </Karta>
      ))}
    </div>
  );
}
