import type { Kurs } from "../../lib/schema";
import { useSzerokosc } from "./wspolne";

const H = 190;
const PAD = { top: 18, right: 12, bottom: 30, left: 40 };
const MIN = 60;

/** „Naprawdę zapamiętane” po sesjach, na tle progów decyzji o limicie (80 / 92). Brak pomiaru = podpis, nie punkt. */
export function AnkiWykres({ anki }: { anki: Kurs["anki"] }) {
  const [ref, W] = useSzerokosc<HTMLDivElement>();
  const p = anki.pomiary;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const slot = innerW / Math.max(1, p.length);
  const x = (i: number) => PAD.left + slot * (i + 0.5);
  const y = (v: number) => PAD.top + innerH - ((Math.max(MIN, v) - MIN) / (100 - MIN)) * innerH;
  return (
    <div ref={ref}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Anki, naprawdę zapamiętane: ${p.map((m) => `s${m.sesja} ${m.naprawde_zapamietane ?? "brak"}`).join(", ")}`} className="block">
        {[60, 70, 80, 90, 100].map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke={t === MIN ? "var(--baseline)" : "var(--hairline)"} />
            <text x={PAD.left - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill="var(--muted)" className="tabular">
              {t} %
            </text>
          </g>
        ))}
        <line x1={PAD.left} x2={W - PAD.right} y1={y(anki.progi.podwyzka_powyzej)} y2={y(anki.progi.podwyzka_powyzej)} stroke="var(--good)" strokeWidth={1.5} />
        <text x={W - PAD.right} y={y(anki.progi.podwyzka_powyzej) - 4} textAnchor="end" fontSize={10.5} fill="var(--good-ink)">
          &gt; {anki.progi.podwyzka_powyzej} % → limit 20
        </text>
        <line x1={PAD.left} x2={W - PAD.right} y1={y(anki.progi.obnizka_ponizej)} y2={y(anki.progi.obnizka_ponizej)} stroke="var(--critical)" strokeWidth={1.5} />
        <text x={W - PAD.right} y={y(anki.progi.obnizka_ponizej) + 13} textAnchor="end" fontSize={10.5} fill="var(--critical-ink)">
          &lt; {anki.progi.obnizka_ponizej} % → limit 10
        </text>
        {p.map((m, i) => (
          <g key={m.sesja}>
            <title>{`Sesja ${m.sesja}: ${m.naprawde_zapamietane === null ? "brak pomiaru" : `${m.naprawde_zapamietane} %`}${m.uwaga ? ` — ${m.uwaga.replace(/[*`]/g, "")}` : ""}`}</title>
            {m.naprawde_zapamietane === null ? (
              <text x={x(i)} y={y(MIN) - 6} textAnchor="middle" fontSize={10} fill="var(--muted)">
                brak
              </text>
            ) : (
              <>
                <circle cx={x(i)} cy={y(m.naprawde_zapamietane)} r={5} fill="var(--accent)" stroke="var(--surface)" strokeWidth={2} />
                <text x={x(i) + 9} y={y(m.naprawde_zapamietane)} dy="0.32em" fontSize={11.5} fontWeight={600} fill="var(--ink)" className="tabular">
                  {String(m.naprawde_zapamietane).replace(".", ",")} %
                </text>
              </>
            )}
            <text x={x(i)} y={H - 10} textAnchor="middle" fontSize={12} fill="var(--ink-2)">
              s{m.sesja}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
