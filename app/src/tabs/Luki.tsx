import { Karta, Md, Notka, Tytul } from "../components/ui";
import { dataDluga } from "../lib/daty";
import { useKurs } from "../lib/kontekst";
import type { Kurs } from "../lib/schema";
import type { WidokProps } from "./typy";

const GRUPY: { rodzaj: Kurs["luki"]["watching"][number]["rodzaj"]; nazwa: string; podpis: string }[] = [
  { rodzaj: "produkcja", nazwa: "Produkcja", podpis: "wzorce w mowie i piśmie" },
  { rodzaj: "interferencja", nazwa: "Interferencja i kalki", podpis: "🇮🇹 🇬🇧 🇵🇱 — wzorzec, nie pomyłka" },
  { rodzaj: "rozumienie", nazwa: "Luki rozumienia", podpis: "z Lesestück — bez drillu, tylko ekspozycja" },
];

export function Luki(_: WidokProps) {
  const { kurs: k } = useKurs();
  const { active, watching, closed } = k.luki;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Luki</h1>
        <p className="mt-1 max-w-3xl text-sm text-ink-2">
          Stan, nie kronika — stan po sesji {k.stan_na.po_sesji} ({dataDluga(k.stan_na.data)}). Cykl życia: <strong>Watching</strong> → wraca 3 sesje z
          rzędu → <strong>Active</strong> · brak błędu 3 sesje <em>mimo okazji</em> → <strong>Closed</strong>. „Brak okazji” to pusty pomiar.
        </p>
      </div>

      <section aria-labelledby="active">
        <h2 id="active" className="mb-3 text-lg font-semibold">
          Active <span className="text-sm font-normal text-muted">· {active.length} z maks. 3</span>
        </h2>
        <div className="grid gap-4 xl:grid-cols-3">
          {active.map((l) => (
            <Karta key={l.nr} className="flex flex-col">
              <h3 className="font-semibold">
                <span className="text-accent-ink">#{l.nr}</span> <Md>{l.nazwa}</Md>
              </h3>
              <div className="mt-3 rounded-lg border-l-3 border-accent bg-surface-2 px-3 py-2 text-sm">
                <div className="mb-0.5 text-xs font-medium text-muted">Reguła</div>
                <Md>{l.regula}</Md>
              </div>
              <h4 className="mt-3 text-xs font-medium text-muted">3 ostatnie pomiary</h4>
              <ul className="mt-1 divide-y divide-hairline text-sm">
                {l.pomiary.map((p, i) => (
                  <li key={i} className="grid grid-cols-[2.25rem_1fr] gap-2 py-2">
                    <span className="font-semibold text-ink-2">s{p.sesja}</span>
                    <div className="min-w-0">
                      <div className="text-xs text-muted">
                        <Md>{p.pomiar}</Md>
                      </div>
                      <div>
                        <Md>{p.wynik}</Md>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {l.uwaga && (
                <p className="mt-2 text-sm text-ink-2">
                  <Md>{l.uwaga}</Md>
                </p>
              )}
              <div className="mt-auto pt-3">
                <div className="rounded-lg bg-accent-wash/60 px-3 py-2 text-sm">
                  <div className="mb-0.5 text-xs font-medium text-accent-ink">➡️ Następny krok</div>
                  <Md>{l.nastepny_krok}</Md>
                </div>
              </div>
            </Karta>
          ))}
        </div>
      </section>

      <section aria-labelledby="watching" className="space-y-4">
        <h2 id="watching" className="text-lg font-semibold">
          Watching <span className="text-sm font-normal text-muted">· {watching.length}</span>
        </h2>
        {GRUPY.map((g) => {
          const lista = watching.filter((w) => w.rodzaj === g.rodzaj);
          if (!lista.length) return null;
          return (
            <Karta key={g.rodzaj}>
              <Tytul poziom={3} podpis={g.podpis}>
                {g.nazwa}
              </Tytul>
              <ul className="divide-y divide-hairline">
                {lista.map((w) => (
                  <li key={w.nazwa} className="grid gap-x-4 gap-y-1 py-2.5 text-sm md:grid-cols-[minmax(10rem,1fr)_2fr_2fr]">
                    <div className="font-medium">
                      <Md>{w.nazwa}</Md>
                    </div>
                    <div className="text-ink-2">
                      <span className="text-xs text-muted md:hidden">Stan: </span>
                      <Md>{w.stan}</Md>
                    </div>
                    <div className="text-ink-2">
                      <span className="text-xs text-muted md:hidden">Następny krok: </span>
                      <Md>{w.nastepny_krok}</Md>
                    </div>
                  </li>
                ))}
              </ul>
            </Karta>
          );
        })}
      </section>

      <section aria-labelledby="closed">
        <h2 id="closed" className="mb-3 text-lg font-semibold">
          Closed <span className="text-sm font-normal text-muted">· {closed.length}</span>
        </h2>
        <Karta>
          <ul className="divide-y divide-hairline">
            {closed.map((c) => (
              <li key={c.nazwa} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 py-2 text-sm">
                <span className="font-medium">
                  ✅ <Md>{c.nazwa}</Md>
                </span>
                <span className="text-ink-2">
                  <Md>{c.dowod}</Md>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <Notka>Pozycje z Closed sprawdza się tylko w swobodnej rozmowie (<code>Gespräch</code>), nigdy zadaniem wprost.</Notka>
          </div>
        </Karta>
      </section>
    </div>
  );
}
