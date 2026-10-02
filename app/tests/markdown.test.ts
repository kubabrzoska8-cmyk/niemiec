import { describe, expect, it } from "vitest";
import { inline, przepiszLink, rozwiazSciezke, wyciagnijTekst } from "../src/lib/markdown";
import { czytaj, kursSurowy } from "./pomoc";

describe("formatowanie w linijce", () => {
  it("kod, pogrubienie, kursywa", () => {
    expect(inline("**4/8** · `der Schrank` *(s9)*")).toBe("<strong>4/8</strong> · <code>der Schrank</code> <em>(s9)</em>");
  });
  it("escapuje HTML", () => {
    expect(inline("<script>x</script>")).toBe("&lt;script&gt;x&lt;/script&gt;");
  });
  it("gwiazdki w kodzie zostają kodem", () => {
    expect(inline("`a*b*c`")).toBe("<code>a*b*c</code>");
  });
});

describe("linki w markdownie kursu", () => {
  it("ścieżka względna wobec pliku", () => {
    expect(rozwiazSciezke("lessons/session-11.md", "../grammar/02-adjektivendungen.md")).toBe("grammar/02-adjektivendungen.md");
  });
  it("grammar → zakładka Tematy, lekcja → Materiały, reszta → GitHub", () => {
    expect(przepiszLink("../grammar/05-genus.md", "lessons/session-10.md").href).toBe("#/tematy/05-genus.md");
    expect(przepiszLink("session-08.md", "lessons/session-07.md").href).toBe("#/materialy/lekcja/8");
    expect(przepiszLink("../PROGRESS.md", "lessons/session-10.md")).toEqual({
      href: "https://github.com/kubabrzoska8-cmyk/niemiec/blob/main/PROGRESS.md",
      zewnetrzny: true,
    });
    expect(przepiszLink("https://www.goethe.de/x.pdf", "plan/goethe-b2.md").zewnetrzny).toBe(true);
  });
});

describe("teksty Lesestück z rejestru kurs.json", () => {
  const teksty = kursSurowy().teksty as { tytul: string; plik: string; naglowek: string }[];
  it.each(teksty.map((t) => [t.tytul, t] as const))("%s — wyciąga sam tekst, bez pytań", (_, t) => {
    const tekst = wyciagnijTekst(czytaj(t.plik), t.naglowek);
    expect(tekst).not.toBeNull();
    expect(tekst!.split(/\s+/).length).toBeGreaterThan(60);
    expect(tekst).not.toMatch(/D[1-4][ab]?\b|Pytania|Klucz/);
  });
  it("nie ma nagłówka → null", () => {
    expect(wyciagnijTekst("> cytat", "Brak")).toBeNull();
  });
});
