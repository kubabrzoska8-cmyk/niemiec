import { type ReactNode, useEffect, useRef, useState } from "react";

/** Szerokość kontenera w pikselach — wykres rysuje się w prawdziwych pikselach, więc tekst ma zawsze 11–12 px. */
export function useSzerokosc<T extends HTMLElement>(start = 640) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(start);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** Dymek nad wykresem — pozycja w procentach szerokości, odbija się od prawej krawędzi. */
export function Dymek({ x, szer, children }: { x: number; szer: number; children: ReactNode }) {
  const prawa = x > szer * 0.6;
  return (
    <div
      role="status"
      className="pointer-events-none absolute top-1 z-10 max-w-[16rem] rounded-md border border-hairline bg-surface px-2.5 py-1.5 text-xs shadow-md"
      style={{ left: x, transform: `translateX(${prawa ? "calc(-100% - 10px)" : "10px"})` }}
    >
      {children}
    </div>
  );
}

/** Legenda: kolorowy znacznik obok tekstu w kolorze tekstu. */
export function Legenda({ pozycje }: { pozycje: { kolor: string; nazwa: string; pusty?: boolean; linia?: boolean }[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2" aria-label="Legenda">
      {pozycje.map((p) => (
        <li key={p.nazwa} className="inline-flex items-center gap-1.5">
          {p.linia ? (
            <span className="inline-block h-0.5 w-4" style={{ background: p.kolor }} />
          ) : (
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={p.pusty ? { boxShadow: `inset 0 0 0 2px ${p.kolor}` } : { background: p.kolor }}
            />
          )}
          {p.nazwa}
        </li>
      ))}
    </ul>
  );
}
