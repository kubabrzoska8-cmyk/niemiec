import { useState } from "react";
import type { Kurs, ModulId } from "../../lib/schema";
import { Dymek, Legenda, useSzerokosc } from "./wspolne";

const H = 260;
const PAD = { top: 22, right: 12, bottom: 34, left: 40 };
const KOLORY = ["var(--accent)", "var(--seria-2)"];
const SLUPEK = 22;

/** Wyniki mocków (0–100) dla czterech modułów na tle progu 60 i celu 70. Brak wyniku = podpis „brak”, nie zero. */
export function MockWykres({ egzamin }: { egzamin: Kurs["egzamin"] }) {
  const [ref, W] = useSzerokosc<HTMLDivElement>();
  const [aktywny, setAktywny] = useState<{ m: number; k: number } | null>(null);
  const moduly = egzamin.moduly;
  const mocki = egzamin.mocki.slice(0, KOLORY.length);
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const grupa = innerW / moduly.length;
  const y = (v: number) => PAD.top + innerH - (v / 100) * innerH;
  const xs = (m: number, k: number) => PAD.left + grupa * m + grupa / 2 + (k - (mocki.length - 1) / 2) * (SLUPEK + 4);
  const r = 4;
  const a = aktywny ? { modul: moduly[aktywny.m], mock: mocki[aktywny.k] } : null;

  return (
    <div ref={ref} className="relative">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Wyniki mocków Goethe B2 na tle progu 60 i celu 70" className="block">
        {[0, 20, 40, 60, 80, 100].map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke={t === 0 ? "var(--baseline)" : "var(--hairline)"} />
            <text x={PAD.left - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill="var(--muted)" className="tabular">
              {t}
            </text>
          </g>
        ))}
        <line x1={PAD.left} x2={W - PAD.right} y1={y(egzamin.prog)} y2={y(egzamin.prog)} stroke="var(--critical)" strokeWidth={1.5} />
        <text x={W - PAD.right} y={y(egzamin.prog) + 13} textAnchor="end" fontSize={11} fill="var(--critical-ink)">
          próg {egzamin.prog}
        </text>
        <line x1={PAD.left} x2={W - PAD.right} y1={y(egzamin.cel)} y2={y(egzamin.cel)} stroke="var(--good)" strokeWidth={1.5} />
        <text x={W - PAD.right} y={y(egzamin.cel) - 5} textAnchor="end" fontSize={11} fill="var(--good-ink)">
          cel {egzamin.cel}
        </text>
        {moduly.map((m, mi) => (
          <g key={m.id}>
            <text x={PAD.left + grupa * mi + grupa / 2} y={H - 10} textAnchor="middle" fontSize={12} fill="var(--ink-2)">
              {m.nazwa}
            </text>
            {mocki.every((mock) => mock.wyniki[m.id as ModulId] === null) && (
              <text x={PAD.left + grupa * mi + grupa / 2} y={y(0) - 8} textAnchor="middle" fontSize={11} fill="var(--muted)">
                {grupa < 120 ? "brak" : "brak pomiaru"}
              </text>
            )}
            {mocki.map((mock, k) => {
              const v = mock.wyniki[m.id as ModulId];
              const cx = xs(mi, k);
              if (v === null && mocki.every((x) => x.wyniki[m.id as ModulId] === null)) return null;
              if (v === null)
                return (
                  <text key={mock.nr} x={cx} y={y(0) - 6} textAnchor="middle" fontSize={10} fill="var(--muted)">
                    brak
                  </text>
                );
              const h = y(0) - y(v);
              const x0 = cx - SLUPEK / 2;
              const d = h < r ? `M${x0},${y(0)}h${SLUPEK}v${-h}h${-SLUPEK}z` : `M${x0},${y(0)}v${-(h - r)}q0,${-r} ${r},${-r}h${SLUPEK - 2 * r}q${r},0 ${r},${r}v${h - r}z`;
              return (
                <g key={mock.nr} onPointerEnter={() => setAktywny({ m: mi, k })} onPointerLeave={() => setAktywny(null)}>
                  <path d={d} fill={KOLORY[k]} />
                  <text x={cx} y={y(v) - 5} textAnchor="middle" fontSize={11} fill="var(--ink-2)" className="tabular">
                    {v}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
      {a && aktywny && (
        <Dymek x={xs(aktywny.m, aktywny.k)} szer={W}>
          <div className="font-semibold">
            {a.modul.nazwa}: {a.mock.wyniki[a.modul.id as ModulId]}/100
          </div>
          <div className="text-ink-2">Mock {a.mock.nazwa}</div>
        </Dymek>
      )}
      <Legenda
        pozycje={[
          ...mocki.map((m, k) => ({ kolor: KOLORY[k], nazwa: `Mock ${m.nazwa} (${m.planowana_sesja})` })),
          { kolor: "var(--critical)", nazwa: `próg zaliczenia ${egzamin.prog}`, linia: true },
          { kolor: "var(--good)", nazwa: `cel kursu ${egzamin.cel}`, linia: true },
        ]}
      />
    </div>
  );
}
