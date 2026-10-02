/**
 * Ładowanie danych z lokalnego checkoutu repo przez middleware `/repo/` (serwer-repo.ts).
 * Strona nie ma własnej kopii danych — po `git pull` wystarczy odświeżyć.
 */
import { type Kurs, KursZRegulami } from "./schema";
import { parsujTsv, type Slowo } from "./tsv";

export const REPO = "/repo/";

type Pobierz = (url: string, init?: RequestInit) => Promise<Response>;

export type Wynik<T> = { ok: true; dane: T } | { ok: false; bledy: string[] };

async function tekst(sciezka: string, pobierz: Pobierz): Promise<string> {
  const r = await pobierz(REPO + sciezka, { cache: "no-store" });
  if (!r.ok) throw new Error(`${sciezka}: HTTP ${r.status}`);
  return r.text();
}

/** Czyta i waliduje data/kurs.json. Błędy walidacji wracają jako czytelna lista (ścieżka: komunikat). */
export async function wczytajKurs(pobierz: Pobierz = fetch): Promise<Wynik<Kurs>> {
  let surowy: unknown;
  try {
    surowy = JSON.parse(await tekst("data/kurs.json", pobierz));
  } catch (e) {
    return { ok: false, bledy: [`Nie udało się wczytać data/kurs.json — ${(e as Error).message}`] };
  }
  return walidujKurs(surowy);
}

export function walidujKurs(surowy: unknown): Wynik<Kurs> {
  const r = KursZRegulami.safeParse(surowy);
  if (r.success) return { ok: true, dane: r.data };
  return {
    ok: false,
    bledy: r.error.issues.map((i) => `${i.path.length ? i.path.join(".") : "(całość)"}: ${i.message}`),
  };
}

export async function wczytajPlik(sciezka: string, pobierz: Pobierz = fetch): Promise<string> {
  return tekst(sciezka, pobierz);
}

/** Wszystkie słowa z anki/wordlists/*.tsv. */
export async function wczytajSlowa(pobierz: Pobierz = fetch): Promise<Slowo[]> {
  const lista = JSON.parse(await tekst("anki/wordlists/", pobierz)) as { pliki: string[] };
  const pliki = lista.pliki.filter((p) => p.endsWith(".tsv"));
  const czesci = await Promise.all(pliki.map(async (p) => parsujTsv(await tekst(`anki/wordlists/${p}`, pobierz), p)));
  return czesci.flat();
}
