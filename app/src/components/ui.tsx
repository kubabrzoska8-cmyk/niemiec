import { type ReactNode, useMemo } from "react";
import { inline } from "../lib/markdown";

export function Karta({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`min-w-0 rounded-xl border border-hairline bg-surface p-4 sm:p-5 ${className}`}>
      {children}
    </section>
  );
}

export function Tytul({ children, podpis, poziom = 2 }: { children: ReactNode; podpis?: ReactNode; poziom?: 2 | 3 }) {
  const H = poziom === 2 ? "h2" : "h3";
  return (
    <div className="mb-3">
      <H className={poziom === 2 ? "text-base font-semibold" : "text-sm font-semibold"}>{children}</H>
      {podpis && <p className="mt-0.5 text-sm text-muted">{podpis}</p>}
    </div>
  );
}

/** Kafelek liczby: etykieta, wartość, przypis. */
export function Kafelek({ etykieta, wartosc, przypis, duzy }: { etykieta: ReactNode; wartosc: ReactNode; przypis?: ReactNode; duzy?: boolean }) {
  return (
    <div className="min-w-0 rounded-xl border border-hairline bg-surface p-4">
      <div className="text-sm text-ink-2">{etykieta}</div>
      <div className={`mt-1 font-semibold leading-tight ${duzy ? "text-5xl" : "text-3xl"}`}>{wartosc}</div>
      {przypis && <div className="mt-1.5 text-xs leading-snug text-muted">{przypis}</div>}
    </div>
  );
}

/** Pasek x/n: wypełnienie w kolorze akcentu na jaśniejszym stopniu tej samej rampy. */
export function Pasek({ wartosc, max, etykieta, kolor = "var(--accent)" }: { wartosc: number; max: number; etykieta: string; kolor?: string }) {
  const pct = max > 0 ? Math.min(100, (wartosc / max) * 100) : 0;
  return (
    <div role="meter" aria-label={etykieta} aria-valuemin={0} aria-valuemax={max} aria-valuenow={wartosc} className="h-2 w-full overflow-hidden rounded-full bg-accent-wash">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: kolor }} />
    </div>
  );
}

export function Notka({ children, ton = "info" }: { children: ReactNode; ton?: "info" | "uwaga" | "blad" }) {
  const styl = {
    info: "border-hairline text-ink-2",
    uwaga: "border-warning/60 text-ink-2",
    blad: "border-critical/50 text-critical-ink",
  }[ton];
  return (
    <div role={ton === "blad" ? "alert" : "note"} className={`rounded-lg border bg-surface-2 px-3.5 py-2.5 text-sm leading-relaxed ${styl}`}>
      {ton === "uwaga" && <span aria-hidden>⚠️ </span>}
      {children}
    </div>
  );
}

/** Tekst z kurs.json z formatowaniem `kod`, **pogrubienie**, *kursywa*. */
export function Md({ children, className }: { children: string; className?: string }) {
  const html = useMemo(() => inline(children), [children]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function BrakPomiaru({ powod }: { powod?: string }) {
  return (
    <span className="text-sm text-muted italic" title={powod}>
      brak pomiaru{powod ? ` — ${powod}` : ""}
    </span>
  );
}

export function Plakietka({ children, ton = "neutral" }: { children: ReactNode; ton?: "neutral" | "akcent" | "dobry" | "zly" | "uwaga" }) {
  const styl = {
    neutral: "border-hairline bg-surface-2 text-ink-2",
    akcent: "border-accent/40 bg-accent-wash text-accent-ink",
    dobry: "border-good/40 bg-surface-2 text-good-ink",
    zly: "border-critical/40 bg-surface-2 text-critical-ink",
    uwaga: "border-warning/60 bg-surface-2 text-warning-ink",
  }[ton];
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs ${styl}`}>{children}</span>;
}

export function Link({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  const zewn = /^https?:/.test(href);
  return (
    <a href={href} className={`text-accent-ink underline-offset-2 hover:underline ${className}`} {...(zewn ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
      {zewn && <span aria-hidden> ↗</span>}
    </a>
  );
}

export function Przelacznik<T extends string>({ wartosc, opcje, onZmiana, etykieta }: { wartosc: T; opcje: { id: T; nazwa: string }[]; onZmiana: (v: T) => void; etykieta: string }) {
  return (
    <div role="radiogroup" aria-label={etykieta} className="inline-flex rounded-lg border border-hairline bg-surface-2 p-0.5">
      {opcje.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={wartosc === o.id}
          onClick={() => onZmiana(o.id)}
          className={`rounded-md px-3 py-1.5 text-sm ${wartosc === o.id ? "bg-surface font-medium text-ink shadow-sm" : "text-ink-2 hover:text-ink"}`}
        >
          {o.nazwa}
        </button>
      ))}
    </div>
  );
}

/** Ikona stanu + podpis — kolor nigdy sam. */
export function Stan({ stan }: { stan: "ok" | "zle" | "otwarte" | "brak" | "uwaga" }) {
  const m = {
    ok: ["✅", "spełnione", "text-good-ink"],
    zle: ["❌", "niespełnione", "text-critical-ink"],
    otwarte: ["⏳", "otwarte", "text-ink-2"],
    brak: ["⚪", "brak pomiaru", "text-muted"],
    uwaga: ["⚠️", "uwaga", "text-warning-ink"],
  }[stan];
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${m[2]}`}>
      <span aria-hidden>{m[0]}</span>
      {m[1]}
    </span>
  );
}
