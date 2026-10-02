import { PlikMarkdown } from "../components/Markdown";
import { Karta, Link, Md, Plakietka, Tytul } from "../components/ui";
import { useKurs } from "../lib/kontekst";
import { GITHUB } from "../lib/markdown";
import type { WidokProps } from "./typy";

export function Tematy({ argumenty }: WidokProps) {
  const { kurs: k } = useKurs();
  const ostatnia = k.sesje[k.sesje.length - 1].nr;
  const nastepna = ostatnia + 1;
  const wybranyPlik = argumenty[0] ? `grammar/${argumenty[0]}` : null;
  const wybrany = k.tematy.find((t) => t.plik === wybranyPlik);
  const h = k.harmonogram;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Tematy</h1>
        <p className="mt-1 max-w-3xl text-sm text-ink-2">Gramatyka przerobiona w sesjach — z referencją pisaną pod Polaka — i harmonogram Etapu 1.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(16rem,1fr)_2fr]">
        <Karta className="self-start">
          <Tytul poziom={3} podpis="Kliknij temat z referencją, żeby ją otworzyć.">
            Tematy gramatyczne
          </Tytul>
          <ul className="space-y-1">
            {k.tematy.map((t) => {
              const plan = t.planowane.filter((s) => s > ostatnia);
              const aktywny = wybranyPlik !== null && t.plik === wybranyPlik;
              const tresc = (
                <>
                  <div className="font-medium">
                    <Md>{t.nazwa}</Md>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {t.sesje.map((s) => (
                      <Plakietka key={s}>s{s}</Plakietka>
                    ))}
                    {plan.length > 0 && <Plakietka ton="akcent">plan: s{plan.join(", s")}</Plakietka>}
                    {t.sesje.length === 0 && plan.length === 0 && <Plakietka>jeszcze nie w sesji</Plakietka>}
                    {!t.plik && <span className="text-xs text-muted">· bez referencji</span>}
                  </div>
                </>
              );
              return (
                <li key={t.id}>
                  {t.plik ? (
                    <a
                      href={`#/tematy/${t.plik.replace(/^grammar\//, "")}`}
                      aria-current={aktywny ? "page" : undefined}
                      className={`block rounded-lg px-3 py-2 text-sm ${aktywny ? "bg-accent-wash text-accent-ink" : "hover:bg-surface-2"}`}
                    >
                      {tresc}
                    </a>
                  ) : (
                    <div className="rounded-lg px-3 py-2 text-sm text-ink-2">{tresc}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </Karta>

        <Karta className="min-w-0">
          {wybranyPlik ? (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span>
                  {wybrany ? <Md>{wybrany.nazwa}</Md> : wybranyPlik} · <code>{wybranyPlik}</code>
                </span>
                <Link href={GITHUB + wybranyPlik}>GitHub</Link>
              </div>
              <PlikMarkdown sciezka={wybranyPlik} />
            </>
          ) : (
            <div className="text-sm text-ink-2">
              <p>Wybierz temat z listy, żeby przeczytać referencję.</p>
              <p className="mt-2 text-muted">Referencje to pliki z katalogu grammar/ — te same, które czyta Claude.</p>
            </div>
          )}
        </Karta>
      </div>

      <Karta>
        <Tytul podpis={<Md>{`Źródło: \`${h.zrodlo}\`. ${h.warunek}`}</Md>}>Harmonogram Etapu 1 — sesje {h.sesje[0].nr}–{h.sesje[h.sesje.length - 1].nr}</Tytul>
        <ol className="mb-4 grid grid-cols-10 gap-1 sm:grid-cols-20" aria-label="Sesje Etapu 1">
          {h.sesje.map((s) => {
            const stan = s.nr <= ostatnia ? "za nami" : s.nr === nastepna ? "następna" : "przed nami";
            return (
              <li
                key={s.nr}
                title={`Sesja ${s.nr} (faza ${s.faza}) — ${stan}${s.mock ? " · mock" : ""}`}
                className={`flex h-9 flex-col items-center justify-center rounded-md text-[11px] leading-none tabular ${
                  s.nr <= ostatnia ? "bg-accent text-white" : s.nr === nastepna ? "bg-accent-wash text-accent-ink ring-2 ring-accent" : "bg-surface-2 text-ink-2"
                }`}
              >
                <span className="font-semibold">{s.nr}</span>
                <span className="mt-0.5 opacity-80">{s.mock ? "🎯" : s.faza}</span>
              </li>
            );
          })}
        </ol>
        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-accent" /> za nami
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-accent-wash ring-2 ring-accent" /> następna (s{nastepna}) — jesteśmy tutaj
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-surface-2 ring-1 ring-hairline" /> przed nami
          </span>
          <span>🎯 mock</span>
          <span>A–D: faza</span>
        </div>
        <div className="space-y-4">
          {h.fazy.map((f) => (
            <div key={f.id}>
              <h3 className="text-sm font-semibold">
                Faza {f.id} — {f.nazwa} <span className="font-normal text-muted">(s{f.od}–{f.do})</span>
              </h3>
              <ul className="mt-1 divide-y divide-hairline text-sm">
                {h.sesje
                  .filter((s) => s.faza === f.id)
                  .map((s) => (
                    <li
                      key={s.nr}
                      className={`grid gap-x-3 gap-y-0.5 py-2 sm:grid-cols-[3rem_minmax(8rem,1fr)_2fr_2fr] ${s.nr === nastepna ? "-mx-2 rounded-lg bg-accent-wash/50 px-2" : ""}`}
                    >
                      <span className={`font-semibold ${s.nr <= ostatnia ? "text-muted" : ""}`}>
                        {s.nr <= ostatnia ? "✓ " : ""}s{s.nr}
                      </span>
                      <span className="font-medium">{s.gramatyka ? <Md>{s.gramatyka}</Md> : <span className="text-muted">—</span>}</span>
                      <span className="text-ink-2">
                        <Md>{s.w_sesji}</Md>
                      </span>
                      <span className="text-xs text-muted">{s.misja ? <Md>{`Misja: ${s.misja}`}</Md> : ""}</span>
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
