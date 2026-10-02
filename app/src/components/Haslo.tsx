import { czesciRzeczownika, type Slowo } from "../lib/tsv";

const KLASA = { der: "rodzaj-der", die: "rodzaj-die", das: "rodzaj-das", pl: "rodzaj-pl" } as const;

/** Hasło niemieckie; rzeczownik z kolorem rodzaju (rodzajnik zostaje tekstem — kolor to kanał dodatkowy). */
export function Haslo({ s, duze }: { s: Pick<Slowo, "typ" | "deutsch">; duze?: boolean }) {
  const rozmiar = duze ? "text-xl" : "text-base";
  if (s.typ !== "rzeczownik") return <span lang="de" className={`${rozmiar} font-semibold`}>{s.deutsch}</span>;
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      {czesciRzeczownika(s.deutsch).map((c) => (
        <span
          key={c.tekst}
          lang="de"
          className={`pastylka-rodzaju ${c.rodzaj ? KLASA[c.rodzaj] : "rodzaj-brak"} rounded-md py-0.5 pr-2 pl-2.5 font-semibold ${rozmiar}`}
          title={c.rodzaj === "pl" ? "tylko liczba mnoga" : c.rodzaj ? `rodzaj: ${c.rodzaj}` : "bez rodzajnika"}
        >
          {c.tekst}
        </span>
      ))}
    </span>
  );
}

export function LegendaRodzajow() {
  return (
    <ul className="flex flex-wrap gap-2 text-xs text-ink-2" aria-label="Kolory rodzaju">
      {(
        [
          ["der", "męski"],
          ["die", "żeński"],
          ["das", "nijaki"],
          ["pl", "tylko l.mn."],
        ] as const
      ).map(([r, n]) => (
        <li key={r} className={`pastylka-rodzaju ${KLASA[r]} rounded-md py-0.5 pr-2 pl-2.5`}>
          <span lang="de" className="font-semibold">
            {r === "pl" ? "die (Pl.)" : r}
          </span>{" "}
          {n}
        </li>
      ))}
    </ul>
  );
}
