/**
 * Schemat `data/kurs.json` — JEDYNEGO źródła danych liczbowych dla strony.
 *
 * Markdown (PROGRESS.md, GAPS.md…) zostaje dla Claude'a; strona nie parsuje jego tabel.
 * Z tego pliku generuje się `data/kurs.schema.json` (`npm run schemat`), którego używa
 * walidator `data/sprawdz_dane.py`. Test pilnuje, żeby oba były zgodne.
 *
 * Zasada: brak danych = `null`, nigdy zgadywana liczba. Strona pokazuje wtedy „brak pomiaru”.
 */
import { z } from "zod";

const Data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data w formacie RRRR-MM-DD");
const Tekst = z.string().min(1);
const Sciezka = z.string().regex(/^[A-Za-z0-9_.\-/]+$/, "ścieżka względem katalogu repo");
const Nr = z.int().min(1);

/** x poprawnych na n — wspólny kształt każdego pomiaru „x/n”. */
const Wynik = z.strictObject({
  poprawne: z.number().min(0),
  n: z.int().min(1),
});

export const WolnaProdukcja = z.strictObject({
  poprawne: z.int().min(0),
  n: z.int().min(1),
  porownywalne: z.boolean().describe("false = sesja nie nadaje się do porównań (np. inny protokół)"),
  metoda: z.enum(["wszystkie-grupy", "pierwsze-15"]).describe("do s9: wszystkie grupy z Gespräch; od s10: pierwsze 15"),
  uwaga: Tekst.nullable(),
});

const PomiarPomocniczy = Wynik.extend({
  format: Tekst.nullable().describe("co mierzył instrument — format zmieniał się między sesjami"),
  uwaga: Tekst.nullable(),
});

export const Luki10 = z.strictObject({
  poprawne: z.int().min(0),
  n: z.int().min(1),
  rozbicie: z
    .strictObject({
      regula_dnia: Wynik.nullable(),
      active: Wynik.nullable(),
      przeplatanie: Wynik.nullable(),
      sonda: Wynik.nullable(),
    })
    .nullable(),
  uwaga: Tekst.nullable(),
});

const InnyPomiar = z.strictObject({
  nazwa: Tekst,
  poprawne: z.number().min(0),
  n: z.int().min(1),
  uwaga: Tekst.nullable(),
});

export const Sesja = z.strictObject({
  nr: Nr,
  data: Data,
  temat: Tekst,
  tryb: z.enum(["przed-struktura", "erhaltungsmodus", "vollmodus"]),
  tematy_gramatyczne: z.array(z.string()).describe("id z `tematy`"),
  wolna_produkcja: WolnaProdukcja.nullable(),
  pomocnicze: z.strictObject({
    drill: PomiarPomocniczy.nullable(),
    luki: Luki10.nullable(),
    lesen: PomiarPomocniczy.nullable(),
    inne: z.array(InnyPomiar),
  }),
  decyzja: Tekst.nullable(),
  anki: z
    .strictObject({
      slowa: z.int().min(0),
      karty: z.int().min(0).nullable(),
      nowe_slowa: z.int().min(0).nullable(),
      uwaga: Tekst.nullable(),
    })
    .nullable(),
  draft: Sciezka.nullable(),
  lekcja: Sciezka.nullable(),
  uwaga: Tekst.nullable(),
});

const Przerwa = z.strictObject({
  po_sesji: Nr,
  opis: Tekst,
});

const Etap = z.strictObject({
  nr: Nr,
  nazwa: Tekst,
  cel: Tekst,
  termin: Tekst,
  koniec: Data.nullable().describe("data graniczna, od której liczymy dni (np. koniec 2026)"),
  sesje: z.strictObject({ od: Nr, do: Nr }).nullable(),
  plan: Sciezka,
  status: z.enum(["w-toku", "planowany", "zakonczony"]),
});

const TrybOpis = z.strictObject({
  nazwa: Tekst,
  kiedy: Tekst,
  sesje_tydzien: Tekst,
  min_sesji_tydzien: z.int().min(1).nullable(),
  nowe_slowa_na_sesje: z.int().min(0),
});

const Kurs = z.strictObject({
  uczen: Tekst,
  start: Data.describe("data sesji 1 — dzień 1 nauki"),
  os_kursu: Tekst,
  etapy: z.array(Etap).min(1),
  tryb: z.strictObject({
    aktualny: z.enum(["erhaltungsmodus", "vollmodus"]),
    nastepny: z.enum(["erhaltungsmodus", "vollmodus"]).nullable(),
    zmiana: Tekst.nullable(),
    opisy: z.strictObject({ erhaltungsmodus: TrybOpis, vollmodus: TrybOpis }),
  }),
  miejsce: z.strictObject({ aktualne: Tekst, uwaga: Tekst.nullable() }),
  sesja_minut: z.int().min(1),
});

const KryteriumCelu = z.strictObject({
  opis: Tekst,
  stan: z.enum(["otwarte", "spelnione", "niespelnione", "brak-pomiaru"]),
  uwaga: Tekst.nullable(),
});

const CelCyklu = z.strictObject({
  sesje: z.array(Nr).length(3),
  cel: Tekst,
  warunek: Tekst,
  kryteria: z.array(KryteriumCelu),
  stan: z.enum(["w-toku", "zaliczony", "niezaliczony", "nierozliczony"]),
  postep: Tekst.nullable().describe("odczyt po ostatniej sesji cyklu"),
});

const CelHistoryczny = z.strictObject({
  okres: Tekst,
  rodzaj: z.enum(["tydzien", "cykl"]),
  sesje: z.array(Nr),
  cel: Tekst,
  warunek: Tekst,
  wynik: z.enum(["zaliczony", "niezaliczony", "nierozliczony"]),
  uwaga: Tekst.nullable(),
});

const PomiarLuki = z.strictObject({ sesja: Nr, pomiar: Tekst, wynik: Tekst });

const LukaActive = z.strictObject({
  nr: Nr,
  nazwa: Tekst,
  regula: Tekst,
  pomiary: z.array(PomiarLuki).max(3).describe("3 ostatnie — starsze są w drafts/"),
  nastepny_krok: Tekst,
  uwaga: Tekst.nullable(),
});

const LukaWatching = z.strictObject({
  nazwa: Tekst,
  rodzaj: z.enum(["produkcja", "rozumienie", "interferencja"]),
  stan: Tekst,
  nastepny_krok: Tekst,
});

const LukaClosed = z.strictObject({ nazwa: Tekst, dowod: Tekst });

const Modul = z.enum(["lesen", "hoeren", "schreiben", "sprechen"]);
const Punkty = z.number().min(0).max(100).nullable();

const Mock = z.strictObject({
  nr: Nr,
  nazwa: Tekst,
  planowana_sesja: Tekst,
  data: Data.nullable(),
  wyniki: z.strictObject({ lesen: Punkty, hoeren: Punkty, schreiben: Punkty, sprechen: Punkty }),
  decyzja: Tekst.nullable(),
});

const Egzamin = z.strictObject({
  nazwa: Tekst,
  termin: Data.nullable(),
  termin_uwaga: Tekst.nullable(),
  miejsce: Tekst.nullable(),
  zapisy_do: Data.nullable(),
  kandydat: z
    .strictObject({ data: Data, zapisy_do: Data.nullable(), uwaga: Tekst })
    .nullable()
    .describe("termin znaleziony, ale NIEPOTWIERDZONY — nie liczy się jako termin"),
  prog: z.int().min(0).max(100),
  cel: z.int().min(0).max(100),
  moduly: z.array(
    z.strictObject({ id: Modul, nazwa: Tekst, czas: Tekst, opis: Tekst }),
  ),
  mocki: z.array(Mock),
});

const OcenaPoziomu = z.strictObject({
  poziom: Tekst,
  opis: Tekst,
  zrodlo: z.enum(["decyzja-profile", "mock"]),
  plik: Sciezka,
  data: Data,
  podstawa: z.array(Tekst).min(1),
});

const Poziom = z.strictObject({
  rozumienie: OcenaPoziomu,
  produkcja: OcenaPoziomu,
  docelowy: Tekst,
  zasada: Tekst,
});

const SesjaPlanu = z.strictObject({
  nr: Nr,
  faza: z.enum(["A", "B", "C", "D"]),
  gramatyka: Tekst.nullable(),
  w_sesji: Tekst,
  misja: Tekst.nullable(),
  mock: z.boolean(),
  tekst: Tekst.nullable(),
});

const Harmonogram = z.strictObject({
  zrodlo: Sciezka,
  warunek: Tekst,
  fazy: z.array(
    z.strictObject({ id: z.enum(["A", "B", "C", "D"]), nazwa: Tekst, od: Nr, do: Nr }),
  ),
  sesje: z.array(SesjaPlanu),
});

const Checkpoint = z.strictObject({
  po_sesji: Nr,
  nazwa: Tekst,
  punkty: z.array(z.strictObject({ opis: Tekst, zaliczone: z.boolean().nullable() })),
});

const Anki = z.strictObject({
  limit_nowych_dziennie: z.int().min(0),
  limit_uwaga: Tekst.nullable(),
  progi: z.strictObject({ obnizka_ponizej: z.number(), podwyzka_powyzej: z.number() }),
  pytanie_co_sesji: z.int().min(1),
  nastepne_pytanie_sesja: Nr.nullable(),
  historia_limitu: z.array(z.strictObject({ od_sesji: Nr, limit: z.int().min(0), powod: Tekst.nullable() })),
  pomiary: z.array(
    z.strictObject({
      sesja: Nr,
      naprawde_zapamietane: z.number().min(0).max(100).nullable(),
      okno: Tekst.nullable(),
      uwaga: Tekst.nullable(),
    }),
  ),
});

const Temat = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  nazwa: Tekst,
  sesje: z.array(Nr).describe("sesje, w których temat był przerabiany"),
  planowane: z.array(Nr).describe("sesje z harmonogramu, w których temat dopiero będzie"),
  plik: Sciezka.nullable(),
});

const TekstLesen = z.strictObject({
  sesja: Nr,
  tytul: Tekst,
  gatunek: Tekst,
  status: z.enum(["przeczytany", "czytany-na-sesji", "wyslany", "nieprzeczytany", "wycofany"]),
  plik: Sciezka,
  naglowek: Tekst.describe("fragment linii, po której w pliku zaczyna się cytat z tekstem"),
  uwaga: Tekst.nullable(),
});

export const KursJson = z.strictObject({
  $schema: z.string().optional(),
  wersja: z.literal(1),
  stan_na: z.strictObject({ data: Data, po_sesji: Nr }),
  kurs: Kurs,
  sesje: z.array(Sesja).min(1),
  przerwy: z.array(Przerwa),
  nastepna_sesja: z.strictObject({ nr: Nr, temat: Tekst, lekcja: Sciezka.nullable(), uwaga: Tekst.nullable() }),
  cel_cyklu: z.strictObject({ aktualny: CelCyklu, historia: z.array(CelHistoryczny) }),
  luki: z.strictObject({
    active: z.array(LukaActive).max(3),
    watching: z.array(LukaWatching),
    closed: z.array(LukaClosed),
  }),
  egzamin: Egzamin,
  poziom: Poziom,
  harmonogram: Harmonogram,
  checkpointy: z.array(Checkpoint),
  anki: Anki,
  tematy: z.array(Temat),
  teksty: z.array(TekstLesen),
});

export type Kurs = z.infer<typeof KursJson>;
export type SesjaT = z.infer<typeof Sesja>;
export type ModulId = z.infer<typeof Modul>;

/** Reguły, których JSON Schema nie wyraża — sprawdza je i strona, i `sprawdz_dane.py`. */
export const KursZRegulami = KursJson.superRefine((k, ctx) => {
  const nry = k.sesje.map((s) => s.nr);
  nry.forEach((nr, i) => {
    if (i > 0 && nr !== nry[i - 1] + 1)
      ctx.addIssue({ code: "custom", path: ["sesje", i, "nr"], message: `sesje mają iść po kolei: po ${nry[i - 1]} jest ${nr}` });
  });
  k.sesje.forEach((s, i) => {
    if (s.wolna_produkcja && s.wolna_produkcja.poprawne > s.wolna_produkcja.n)
      ctx.addIssue({ code: "custom", path: ["sesje", i, "wolna_produkcja"], message: "poprawne > n" });
    for (const [klucz, p] of Object.entries({ drill: s.pomocnicze.drill, luki: s.pomocnicze.luki, lesen: s.pomocnicze.lesen }))
      if (p && p.poprawne > p.n) ctx.addIssue({ code: "custom", path: ["sesje", i, "pomocnicze", klucz], message: "poprawne > n" });
  });
  const ostatnia = nry[nry.length - 1];
  if (k.stan_na.po_sesji !== ostatnia)
    ctx.addIssue({ code: "custom", path: ["stan_na", "po_sesji"], message: `ostatnia sesja w logu to ${ostatnia}` });
  if (k.nastepna_sesja.nr !== ostatnia + 1)
    ctx.addIssue({ code: "custom", path: ["nastepna_sesja", "nr"], message: `następna sesja to ${ostatnia + 1}` });
});
