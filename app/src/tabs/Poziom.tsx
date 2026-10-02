import { MockWykres } from "../components/wykresy/MockWykres";
import { Karta, Link, Md, Notka, Plakietka, Tytul } from "../components/ui";
import { DESKRYPTORY, ZRODLO_DESKRYPTOROW } from "../content/deskryptory";
import { dataDluga } from "../lib/daty";
import { useKurs } from "../lib/kontekst";
import { GITHUB } from "../lib/markdown";
import type { Kurs, ModulId } from "../lib/schema";
import type { WidokProps } from "./typy";

const ZRODLO = { "decyzja-profile": "ocena prowadzącego zapisana w PROFILE.md", mock: "wynik mocka Goethe" } as const;

function Ocena({ tytul, o }: { tytul: string; o: Kurs["poziom"]["rozumienie"] }) {
  return (
    <Karta>
      <div className="text-sm text-ink-2">{tytul}</div>
      <div className="mt-1 text-5xl font-semibold">{o.poziom}</div>
      <p className="mt-2 text-sm">
        <Md>{o.opis}</Md>
      </p>
      <h3 className="mt-4 text-xs font-medium text-muted">Co to określa</h3>
      <div className="mt-1 flex flex-wrap gap-1.5">
        <Plakietka ton={o.zrodlo === "mock" ? "akcent" : "neutral"}>{ZRODLO[o.zrodlo]}</Plakietka>
        <Plakietka>od {dataDluga(o.data)}</Plakietka>
        <Link href={GITHUB + o.plik} className="text-xs">
          {o.plik}
        </Link>
      </div>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-2">
        {o.podstawa.map((p) => (
          <li key={p}>
            <Md>{p}</Md>
          </li>
        ))}
      </ul>
    </Karta>
  );
}

export function Poziom(_: WidokProps) {
  const { kurs: k } = useKurs();
  const egz = k.egzamin;
  const zWynikami = egz.mocki.filter((m) => Object.values(m.wyniki).some((v) => v !== null));
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Poziom</h1>
        <p className="mt-1 max-w-3xl text-sm text-ink-2">
          <Md>{k.poziom.zasada}</Md>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Ocena tytul="Rozumienie" o={k.poziom.rozumienie} />
        <Ocena tytul="Produkcja — mówienie i pisanie" o={k.poziom.produkcja} />
      </div>
      <Notka>
        🎯 Cel: <Md>{k.poziom.docelowy}</Md>
      </Notka>

      <Karta>
        <Tytul podpis={`Skala 0–100 na moduł. Zalicza ${egz.prog}, cel kursu ≥ ${egz.cel} — margines na stres i gorszy dzień. Sprechen i Schreiben ocenia Claude wg kryteriów Goethe (orientacyjnie — liczy się trend).`}>
          🎓 Mocki Goethe B2
        </Tytul>
        {zWynikami.length === 0 && (
          <p className="mb-2 text-sm text-ink-2">
            Żaden mock jeszcze się nie odbył — wszystkie moduły: <span className="text-muted italic">brak pomiaru</span>. Pierwszy: {egz.mocki[0]?.planowana_sesja}.
          </p>
        )}
        <MockWykres egzamin={egz} />
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[30rem] text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th className="py-1 pr-2 font-normal">Mock</th>
                <th className="py-1 pr-2 font-normal">Kiedy</th>
                {egz.moduly.map((m) => (
                  <th key={m.id} className="py-1 pr-2 text-right font-normal">
                    {m.nazwa}
                  </th>
                ))}
                <th className="py-1 font-normal">Decyzja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline tabular">
              {egz.mocki.map((m) => (
                <tr key={m.nr}>
                  <td className="py-1.5 pr-2">{m.nazwa}</td>
                  <td className="py-1.5 pr-2 text-ink-2">{m.data ? dataDluga(m.data) : `plan: ${m.planowana_sesja}`}</td>
                  {egz.moduly.map((mod) => {
                    const v = m.wyniki[mod.id as ModulId];
                    return (
                      <td key={mod.id} className="py-1.5 pr-2 text-right">
                        {v === null ? <span className="text-muted">—</span> : <span className={v < egz.prog ? "text-critical-ink" : v >= egz.cel ? "text-good-ink" : ""}>{v}</span>}
                      </td>
                    );
                  })}
                  <td className="py-1.5 text-ink-2">{m.decyzja ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {egz.moduly.map((m) => (
            <li key={m.id} className="rounded-lg bg-surface-2 px-3 py-2">
              <span className="font-medium">{m.nazwa}</span> <span className="text-muted">· {m.czas}</span>
              <div className="text-xs text-ink-2">
                <Md>{m.opis}</Md>
              </div>
            </li>
          ))}
        </ul>
      </Karta>

      <Karta>
        <Tytul podpis={ZRODLO_DESKRYPTOROW}>B1 a B2 — co to znaczy w praktyce</Tytul>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th className="w-[16%] py-1.5 pr-3 font-normal">Umiejętność</th>
                <th className="w-[36%] py-1.5 pr-3 font-normal">B1 — umiesz</th>
                <th className="w-[36%] py-1.5 pr-3 font-normal">B2 — umiesz</th>
                <th className="py-1.5 font-normal">Goethe B2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline align-top">
              {DESKRYPTORY.map((d) => (
                <tr key={d.umiejetnosc}>
                  <td className="py-2 pr-3 font-medium">{d.umiejetnosc}</td>
                  <td className="py-2 pr-3 text-ink-2">{d.b1}</td>
                  <td className="py-2 pr-3">{d.b2}</td>
                  <td className="py-2 text-xs text-muted">{d.goethe ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Karta>

      <Karta>
        <Tytul podpis="Testy can-do z PROGRESS.md — sprawdzane w rozmowie, nie zadaniem z kluczem.">Checkpointy can-do</Tytul>
        <div className="grid gap-4 md:grid-cols-2">
          {k.checkpointy.map((c) => (
            <div key={c.po_sesji}>
              <h3 className="text-sm font-semibold">
                Po sesji {c.po_sesji} — {c.nazwa}
              </h3>
              <ul className="mt-1.5 space-y-1.5 text-sm">
                {c.punkty.map((p) => (
                  <li key={p.opis} className="flex gap-2">
                    <span aria-label={p.zaliczone === null ? "niesprawdzony" : p.zaliczone ? "zaliczony" : "niezaliczony"}>
                      {p.zaliczone === null ? "☐" : p.zaliczone ? "✅" : "❌"}
                    </span>
                    <Md className={p.zaliczone === null ? "text-ink-2" : ""}>{p.opis}</Md>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Karta>
    </div>
  );
}
