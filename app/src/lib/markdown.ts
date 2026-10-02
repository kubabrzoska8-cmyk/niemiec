/**
 * Markdown z repo → HTML na stronie. Pliki są lokalne, ale i tak przechodzą przez DOMPurify.
 * Linki do innych plików kursu prowadzą do zakładek strony albo do GitHuba.
 */
import DOMPurify from "dompurify";
import { marked } from "marked";

export const GITHUB = "https://github.com/kubabrzoska8-cmyk/niemiec/blob/main/";

const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapuj = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c]);

/**
 * Formatowanie w jednej linijce — tylko `kod`, **pogrubienie** i *kursywa*.
 * Do krótkich tekstów z kurs.json (przepisanych z markdownu kursu). Wejście jest escapowane.
 */
export function inline(tekst: string): string {
  const kody: string[] = [];
  let s = escapuj(tekst).replace(/`([^`]+)`/g, (_, k: string) => {
    kody.push(`<code>${k}</code>`);
    return `\u0000${kody.length - 1}\u0000`;
  });
  s = s.replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, "$1<em>$2</em>");
  return s.replace(/\u0000(\d+)\u0000/g, (_, i: string) => kody[Number(i)]);
}

/** Usuwa formatowanie — do atrybutów `title`, `aria-label`. */
export function bezFormatowania(tekst: string): string {
  return tekst.replace(/[`*]/g, "");
}

/** Rozwiązuje ścieżkę względną linku wobec pliku, w którym stoi („lessons/session-11.md” + „../grammar/x.md”). */
export function rozwiazSciezke(plikBazowy: string, href: string): string {
  const czesci = plikBazowy.split("/").slice(0, -1);
  for (const c of href.split("/")) {
    if (c === "..") czesci.pop();
    else if (c !== "." && c !== "") czesci.push(c);
  }
  return czesci.join("/");
}

/**
 * Dokąd prowadzi link z markdownu kursu:
 * grammar/*.md → zakładka Tematy · lessons/session-NN.md → Materiały · reszta repo → GitHub · zewnętrzne bez zmian.
 */
export function przepiszLink(href: string, plikBazowy: string): { href: string; zewnetrzny: boolean } {
  if (/^(https?:|mailto:)/i.test(href)) return { href, zewnetrzny: true };
  if (href.startsWith("#")) return { href, zewnetrzny: false };
  const [sciezkaSurowa, kotwica] = href.split("#");
  const sciezka = rozwiazSciezke(plikBazowy, decodeURI(sciezkaSurowa));
  const g = /^grammar\/([\w.-]+\.md)$/.exec(sciezka);
  if (g) return { href: `#/tematy/${g[1]}`, zewnetrzny: false };
  const l = /^lessons\/session-(\d+)\.md$/.exec(sciezka);
  if (l) return { href: `#/materialy/lekcja/${Number(l[1])}`, zewnetrzny: false };
  return { href: GITHUB + sciezka + (kotwica ? `#${kotwica}` : ""), zewnetrzny: true };
}

/** Pełny markdown → bezpieczny HTML z przepisanymi linkami. */
export function renderujMarkdown(md: string, plikBazowy: string): string {
  const html = marked.parse(md, { async: false, gfm: true }) as string;
  const czyste = DOMPurify.sanitize(html, { ADD_TAGS: ["details", "summary"] });
  const szablon = document.createElement("template");
  szablon.innerHTML = czyste;
  szablon.content.querySelectorAll("a[href]").forEach((a) => {
    const { href, zewnetrzny } = przepiszLink(a.getAttribute("href")!, plikBazowy);
    a.setAttribute("href", href);
    if (zewnetrzny) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
  });
  szablon.content.querySelectorAll("table").forEach((t) => {
    const owijka = document.createElement("div");
    owijka.className = "tabela-przewijana";
    t.replaceWith(owijka);
    owijka.appendChild(t);
  });
  return szablon.innerHTML;
}

/**
 * Wyciąga tekst Lesestück z pliku: pierwszy blok cytatu (`> …`) po linii zawierającej `naglowek`.
 * Jeśli sama linia nagłówka jest w cytacie (`> ### Tytuł`), cytat zaczyna się od następnej linii.
 * Zwraca markdown bez znaczników `>` albo null, gdy nie znalazł.
 */
export function wyciagnijTekst(md: string, naglowek: string): string | null {
  const linie = md.split(/\r?\n/);
  const start = linie.findIndex((l) => l.includes(naglowek));
  if (start < 0) return null;
  let i = start + 1;
  while (i < linie.length && linie[i].trim() === "") i++;
  const wynik: string[] = [];
  for (; i < linie.length && /^\s*>/.test(linie[i]); i++) wynik.push(linie[i].replace(/^\s*> ?/, ""));
  while (wynik.length && wynik[wynik.length - 1].trim() === "") wynik.pop();
  return wynik.length ? wynik.join("\n") : null;
}
