/**
 * Niemiecki na co dzień — od 1.10.2026 Jakub nie ma rozmówcy poza sesjami *(PROFILE.md → Kontekst)*.
 * Research i źródła: `resources/immersja.md`. Treść jest stała; nowe co dzień są same źródła
 * (DW, Tagesschau, Easy German) — a trzy z nich strona pobiera na żywo przez `serwer-kanaly.ts`.
 */
import type { IdKanalu } from "../../serwer-kanaly";

export interface Zrodlo {
  nazwa: string;
  poziom: string;
  /** Ile czasu — realnie, przy jego tygodniu. */
  czas: string;
  opis: string;
  /** Brak = coś, co robisz sam, bez strony w sieci. */
  link?: string;
  /** Kanał RSS pobierany na żywo — najnowsze odcinki pokazują się pod opisem. */
  kanal?: IdKanalu;
}

export interface Grupa {
  id: string;
  tytul: string;
  podpis: string;
  zrodla: Zrodlo[];
}

export const GRUPY: Grupa[] = [
  {
    id: "rano",
    tytul: "☀️ Rano — przeczytaj newsy",
    podpis: "5–10 minut przy kawie. Najpierw przeczytaj, potem posłuchaj tego samego — tekst + nagranie uczy słów lepiej niż samo słuchanie.",
    zrodla: [
      {
        nazwa: "DW — Langsam gesprochene Nachrichten",
        poziom: "B2",
        czas: "5–7 min",
        opis: "Codzienne wiadomości (pon.–sob.), czytane wolno, **z pełnym tekstem**. Najlepszy start dnia: przeczytaj, potem posłuchaj z tekstem przed oczami.",
        link: "https://learngerman.dw.com/de/langsam-gesprochene-nachrichten/s-60040332",
        kanal: "dw-lgn",
      },
      {
        nazwa: "nachrichtenleicht — Deutschlandfunk",
        poziom: "B1",
        czas: "5 min",
        opis: "Wiadomości w prostym niemieckim, codziennie od poniedziałku do piątku. Na dni zmęczenia albo jako rozgrzewka przed DW.",
        link: "https://www.nachrichtenleicht.de/",
      },
      {
        nazwa: "tagesschau — nagłówki dnia",
        poziom: "B2–C1",
        czas: "3 min",
        opis: "Prawdziwe niemieckie wiadomości, bez upraszczania. Przeczytaj 2–3 nagłówki z zajawką. Wystarczy, że zrozumiesz, o czym jest tekst.",
        link: "https://www.tagesschau.de/",
        kanal: "tagesschau",
      },
    ],
  },
  {
    id: "egzamin",
    tytul: "🎧 Słuchanie jak na egzaminie",
    podpis: "Raz w tygodniu jedna część Hören na czas. Cały mock robisz jako misję, tutaj ćwiczysz po kawałku.",
    zrodla: [
      {
        nazwa: "Goethe-Zertifikat B2 — Modellsatz (oficjalny)",
        poziom: "B2",
        czas: "1 część ≈ 10 min",
        opis: "Oficjalny zestaw: PDF z zadaniami i kluczem + nagrania do Hören. **To jest mock #1** — nie zużyj go na rozgrzewkę, zanim zrobisz go na czas.",
        link: "https://www.goethe.de/ins/ie/en/spr/prf/gzb2/ue9.html",
      },
      {
        nazwa: "Hueber — Hörtraining Goethe-Zertifikat B2 (audio)",
        poziom: "B2",
        czas: "10 min",
        opis: "Darmowe MP3 do książki z testami ze słuchania. Same nagrania też się przydadzą — słuchaj i streszczaj w dwóch zdaniach.",
        link: "https://www.hueber.de/audioservice",
      },
      {
        nazwa: "YouTube — „Goethe B2 Hören” (nagrania egzaminacyjne)",
        poziom: "B2",
        czas: "10–40 min",
        opis: "Wyszukiwanie, nie konkretny film — kanały z nagraniami pojawiają się i znikają. Bierz te z kluczem w opisie.",
        link: "https://www.youtube.com/results?search_query=Goethe+Zertifikat+B2+H%C3%B6ren+Modelltest",
      },
      {
        nazwa: "YouTube — „Goethe B1 Hören” (rozgrzewka)",
        poziom: "B1",
        czas: "10 min",
        opis: "O poziom łatwiej. Na dni, kiedy B2 to za dużo, albo żeby sprawdzić, czy format egzaminu nie jest dla Ciebie problemem.",
        link: "https://www.youtube.com/results?search_query=Goethe+Zertifikat+B1+H%C3%B6ren+Modelltest",
      },
    ],
  },
  {
    id: "mowa",
    tytul: "🎙️ Niemiecki, jakim ludzie mówią",
    podpis: "To zastępuje Ci kuchnię z Rzymu. Włączaj niemieckie napisy, nie polskie i nie angielskie: napisy w tym samym języku co dźwięk to najsilniej udokumentowany sposób uczenia się słów z wideo.",
    zrodla: [
      {
        nazwa: "Easy German",
        poziom: "B1–B2",
        czas: "10–15 min",
        opis: "Rozmowy z ludźmi na ulicy i podcast o codzienności w Niemczech. Najbliżej tego, jak niemiecki brzmi naprawdę.",
        link: "https://www.youtube.com/@EasyGerman",
        kanal: "easy-german",
      },
      {
        nazwa: "DW — Top-Thema mit Vokabeln",
        poziom: "B1+",
        czas: "5 min",
        opis: "Raz w tygodniu jeden reportaż z tekstem i słowniczkiem.",
        link: "https://podcasts.apple.com/us/podcast/top-thema-mit-vokabeln-audios-dw-deutsch-lernen/id282932005",
        kanal: "dw-top-thema",
      },
      {
        nazwa: "Fachsprache im Fokus — podcast pod FSP",
        poziom: "B2–C1, medyczny",
        czas: "15 min",
        opis: "Komunikacja w szpitalu, rozmowa z pacjentem, Arztbrief. Twój Etap 2 — na dni, kiedy chcesz czegoś z medycyny.",
        link: "https://open.spotify.com/show/4wuuSY9lNvnJWVM25DhX8C",
      },
    ],
  },
  {
    id: "mowienie",
    tytul: "🗣️ Mówienie bez rozmówcy",
    podpis: "Samo słuchanie i czytanie nie naprawi końcówek. Dzieci w kanadyjskiej immersji po latach rozumiały jak native, a mówiły z tymi samymi błędami. Musisz mówić — także wtedy, kiedy nikt nie słucha.",
    zrodla: [
      {
        nazwa: "Dziennik na głos (misja)",
        poziom: "Twoja mowa",
        czas: "60 s dziennie",
        opis: "Dyktujesz do notatek w telefonie, co robiłeś w ciągu dnia — tak jak na sesji 11. Bez poprawiania. Wklejasz na sesji, tam szukamy wzorców.",
      },
      {
        nazwa: "Shadowing z DW",
        poziom: "B2",
        czas: "5 min",
        opis: "Jeden akapit z *Langsam gesprochene Nachrichten*: słuchasz i mówisz razem z lektorem, z tekstem przed oczami. Ćwiczy płynność, melodię zdania i szyk — czasownik ląduje tam, gdzie u lektora.",
        link: "https://learngerman.dw.com/de/langsam-gesprochene-nachrichten/s-60040332",
      },
      {
        nazwa: "Tandem — prawdziwy rozmówca",
        poziom: "każdy",
        czas: "30 min / tydz.",
        opis: "Aplikacja Tandem albo HelloTalk, albo studenci z Niemiec na Erasmusie w Gdańsku (ESN). Jedna rozmowa w tygodniu przywraca to, co dawała kuchnia w Rzymie.",
        link: "https://www.tandem.net/",
      },
    ],
  },
];

/** Tydzień w 10–15 minut dziennie. Indeks = `Date.getUTCDay()` (0 = niedziela). */
export const RYTM: { dzien: string; co: string }[] = [
  { dzien: "Niedziela", co: "Wolne albo dla przyjemności: odcinek serialu z **niemieckimi** napisami." },
  { dzien: "Poniedziałek", co: "**DW Langsam gesprochene Nachrichten** — przeczytaj, potem posłuchaj z tekstem. + 60 s dziennika." },
  { dzien: "Wtorek", co: "**Easy German** — jeden odcinek z niemieckimi napisami. Zapisz 3 zdania, które zrozumiałeś, i 1, którego nie. + dziennik." },
  { dzien: "Środa", co: "**Shadowing** — jeden akapit z DW, mówisz razem z lektorem, 5 min. + dziennik." },
  { dzien: "Czwartek", co: "**Hören na czas** — jedna część egzaminu B2 (YouTube albo Hueber), bez pauzy. + dziennik." },
  { dzien: "Piątek", co: "**nachrichtenleicht** albo **tagesschau** — 2–3 teksty. + dziennik." },
  { dzien: "Sobota", co: "**DW Langsam gesprochene Nachrichten** + jeśli możesz: rozmowa w tandemie." },
];

export const RESEARCH = "resources/immersja.md";
