import { useState } from "react";
import { dataDluga } from "../../lib/daty";
import { bezFormatowania } from "../../lib/markdown";
import type { SesjaT } from "../../lib/schema";
import { procent, wilson } from "../../lib/statystyka";
import { Dymek, Legenda, useSzerokosc } from "./wspolne";

const H = 300;
const PAD = { top: 30, right: 16, bottom: 62, left: 46 };

interface Props {
  sesje: SesjaT[];
  przerwy: { po_sesji: number; opis: string }[];
  cel: { procent: number; etykieta: string } | null;
}

/**
 * Krzywa wolnej produkcji. Jedna seria → bez legendy serii; legenda tylko dla znaczników
 * (porównywalna / nieporównywalna / przedział). Przy każdym punkcie: n pod osią i przedział 95 % jako wąs.
 */
export function KrzywaProdukcji({ sesje, przerwy, cel }: Props) {
  const [ref, W] = useSzerokosc<HTMLDivElement>();
  const [aktywny, setAktywny] = useState<number | null>(null);
  const punkty = sesje.filter((s) => s.wolna_produkcja).map((s) => ({ s, wp: s.wolna_produkcja!, ci: wilson(s.wolna_produkcja!.poprawne, s.wolna_produkcja!.n) }));
  if (punkty.length === 0) return <p className="text-sm text-muted">Brak pomiarów wolnej produkcji.</p>;

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const slot = innerW / punkty.length;
  const x = (i: number) => PAD.left + slot * (i + 0.5);
  const y = (v: number) => PAD.top + innerH - v * innerH;
  const ticki = [0, 0.25, 0.5, 0.75, 1];

  // Linia łączy tylko sąsiednie punkty porównywalne, mierzone tą samą metodą.
  const odcinki: string[] = [];
  punkty.forEach((p, i) => {
    const q = punkty[i - 1];
    if (q && p.wp.porownywalne && q.wp.porownywalne && p.wp.metoda === q.wp.metoda && p.s.nr === q.s.nr + 1)
      odcinki.push(`M${x(i - 1)},${y(q.wp.poprawne / q.wp.n)}L${x(i)},${y(p.wp.poprawne / p.wp.n)}`);
  });
  const zmianaMetody = punkty.findIndex((p, i) => i > 0 && p.wp.metoda !== punkty[i - 1].wp.metoda);
  const przerwyNaWykresie = przerwy
    .map((pr) => ({ pr, i: punkty.findIndex((p) => p.s.nr === pr.po_sesji + 1) }))
    .filter(({ i }) => i > 0);
  const waski = W < 480;
  const a = aktywny !== null ? punkty[aktywny] : null;

  return (
    <div ref={ref} className="relative">
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Wolna produkcja, sesje ${punkty[0].s.nr}–${punkty.at(-1)!.s.nr}: ${punkty.map((p) => `s${p.s.nr} ${p.wp.poprawne}/${p.wp.n}`).join(", ")}`}
        tabIndex={0}
        className="block touch-pan-y select-none"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const i = Math.floor((e.clientX - r.left - PAD.left) / slot);
          setAktywny(i >= 0 && i < punkty.length ? i : null);
        }}
        onPointerLeave={() => setAktywny(null)}
        onFocus={() => setAktywny(punkty.length - 1)}
        onBlur={() => setAktywny(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setAktywny((i) => Math.max(0, (i ?? punkty.length) - 1));
          if (e.key === "ArrowRight") setAktywny((i) => Math.min(punkty.length - 1, (i ?? -1) + 1));
        }}
      >
        {ticki.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke={t === 0 ? "var(--baseline)" : "var(--hairline)"} />
            <text x={PAD.left - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill="var(--muted)" className="tabular">
              {t * 100} %
            </text>
          </g>
        ))}
        <text x={PAD.left} y={14} fontSize={11} fill="var(--muted)">
          % poprawnych grup rzeczownikowych
        </text>

        {cel && (
          <g>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(cel.procent / 100)} y2={y(cel.procent / 100)} stroke="var(--good)" strokeWidth={1.5} />
            <text x={PAD.left + 4} y={y(cel.procent / 100) - 5} fontSize={11} fill="var(--good-ink)" stroke="var(--surface)" strokeWidth={3} paintOrder="stroke">
              {cel.etykieta}
            </text>
          </g>
        )}

        {zmianaMetody > 0 && (
          <g>
            <line x1={x(zmianaMetody) - slot / 2} x2={x(zmianaMetody) - slot / 2} y1={PAD.top - 4} y2={PAD.top + innerH} stroke="var(--baseline)" />
            {(() => {
              const granica = x(zmianaMetody) - slot / 2;
              const tekst = waski ? "od tu: 15 grup" : "od tu: pierwsze 15 grup";
              const zmiesci = granica + 4 + tekst.length * 6 < W - PAD.right;
              return (
                <text x={zmiesci ? granica + 4 : granica - 4} y={PAD.top + 8} textAnchor={zmiesci ? "start" : "end"} fontSize={10.5} fill="var(--muted)" stroke="var(--surface)" strokeWidth={3} paintOrder="stroke">
                  {tekst} {zmiesci ? "" : "→"}
                </text>
              );
            })()}
          </g>
        )}

        {przerwyNaWykresie.map(({ pr, i }) => (
          <g key={pr.po_sesji}>
            <title>{pr.opis}</title>
            <line x1={x(i) - slot / 2} x2={x(i) - slot / 2} y1={PAD.top + innerH} y2={PAD.top + innerH + 8} stroke="var(--baseline)" />
            <text x={x(i) - slot / 2} y={H - 6} textAnchor="middle" fontSize={10.5} fill="var(--muted)">
              ⏸ przerwa
            </text>
          </g>
        ))}

        {odcinki.map((d) => (
          <path key={d} d={d} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" />
        ))}

        {punkty.map((p, i) => {
          const v = p.wp.poprawne / p.wp.n;
          const kres = Math.min(8, slot / 4);
          return (
            <g key={p.s.nr} opacity={aktywny === null || aktywny === i ? 1 : 0.55}>
              <line x1={x(i)} x2={x(i)} y1={y(p.ci.dol)} y2={y(p.ci.gora)} stroke="var(--accent)" strokeOpacity={0.45} strokeWidth={2} />
              <line x1={x(i) - kres / 2} x2={x(i) + kres / 2} y1={y(p.ci.dol)} y2={y(p.ci.dol)} stroke="var(--accent)" strokeOpacity={0.45} strokeWidth={2} />
              <line x1={x(i) - kres / 2} x2={x(i) + kres / 2} y1={y(p.ci.gora)} y2={y(p.ci.gora)} stroke="var(--accent)" strokeOpacity={0.45} strokeWidth={2} />
              {p.wp.porownywalne ? (
                <circle cx={x(i)} cy={y(v)} r={aktywny === i ? 6 : 5} fill="var(--accent)" stroke="var(--surface)" strokeWidth={2} />
              ) : (
                <>
                  <circle cx={x(i)} cy={y(v)} r={aktywny === i ? 6 : 5} fill="var(--surface)" stroke="var(--accent)" strokeWidth={2} />
                  <text x={x(i)} y={y(p.ci.dol) + 15} textAnchor="middle" fontSize={11} fill="var(--warning-ink)" stroke="var(--surface)" strokeWidth={3} paintOrder="stroke">
                    ⚠ {waski ? "" : "nieporówn."}
                  </text>
                </>
              )}
              {(i === punkty.length - 1 || aktywny === i) && (
                <text
                  x={x(i) + 9 + 40 > W ? x(i) - 9 : x(i) + 9}
                  textAnchor={x(i) + 9 + 40 > W ? "end" : "start"}
                  y={y(v)}
                  dy="0.32em"
                  fontSize={12}
                  fontWeight={600}
                  fill="var(--ink)"
                  stroke="var(--surface)"
                  strokeWidth={3}
                  paintOrder="stroke"
                  className="tabular"
                >
                  {Math.round(v * 100)} %
                </text>
              )}
              <text x={x(i)} y={PAD.top + innerH + 18} textAnchor="middle" fontSize={12} fill="var(--ink-2)" fontWeight={500}>
                s{p.s.nr}
              </text>
              <text x={x(i)} y={PAD.top + innerH + 33} textAnchor="middle" fontSize={11} fill="var(--muted)" className="tabular">
                n={p.wp.n}
              </text>
            </g>
          );
        })}
      </svg>
      {a && aktywny !== null && (
        <Dymek x={x(aktywny)} szer={W}>
          <div className="text-sm font-semibold tabular">
            {a.wp.poprawne}/{a.wp.n} = {procent(a.wp.poprawne / a.wp.n)}
          </div>
          <div className="text-ink-2">
            Sesja {a.s.nr} · {dataDluga(a.s.data)}
          </div>
          <div className="text-ink-2">{bezFormatowania(a.s.temat)}</div>
          <div className="text-muted tabular">
            przedział 95 %: {procent(a.ci.dol)}–{procent(a.ci.gora)}
          </div>
          {!a.wp.porownywalne && <div className="text-warning-ink">⚠ nieporównywalna z innymi sesjami</div>}
        </Dymek>
      )}
      <Legenda
        pozycje={[
          { kolor: "var(--accent)", nazwa: "sesja porównywalna" },
          { kolor: "var(--accent)", nazwa: "nieporównywalna (inny protokół)", pusty: true },
          { kolor: "color-mix(in oklab, var(--accent) 45%, transparent)", nazwa: "przedział 95 % (Wilson)", linia: true },
          ...(cel ? [{ kolor: "var(--good)", nazwa: "cel cyklu", linia: true }] : []),
        ]}
      />
    </div>
  );
}
