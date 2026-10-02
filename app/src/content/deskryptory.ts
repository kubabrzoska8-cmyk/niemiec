/**
 * B1 vs B2 w praktyce — krótka parafraza deskryptorów ESOKJ (Rada Europy: skala samooceny
 * i „poprawność gramatyczna”) oraz opisu Goethe-Zertifikat B2. To tekst stały, nie dane kursu.
 */
export interface Deskryptor {
  umiejetnosc: string;
  b1: string;
  b2: string;
  /** Który moduł Goethe B2 to sprawdza. */
  goethe: string | null;
}

export const DESKRYPTORY: Deskryptor[] = [
  {
    umiejetnosc: "Słuchanie",
    b1: "Rozumiesz główne punkty jasnej, standardowej wypowiedzi o znanych sprawach — studia, praca, czas wolny. Radio i TV, jeśli mówią wolno i wyraźnie.",
    b2: "Rozumiesz dłuższe wypowiedzi i wykłady, nadążasz za złożoną argumentacją na znany temat. Większość wiadomości i programów w normalnym tempie.",
    goethe: "Hören",
  },
  {
    umiejetnosc: "Czytanie",
    b1: "Rozumiesz teksty z codziennym językiem albo związane z pracą; opisy wydarzeń, uczuć i życzeń w prywatnych wiadomościach.",
    b2: "Czytasz artykuły i reportaże o współczesnych sprawach, w których autor zajmuje stanowisko. Regulaminy i teksty urzędowe — bez słownika przy każdym zdaniu.",
    goethe: "Lesen",
  },
  {
    umiejetnosc: "Rozmowa",
    b1: "Bez przygotowania wchodzisz w rozmowę o znanych tematach — rodzina, hobby, praca, podróże. Radzisz sobie w większości sytuacji w podróży.",
    b2: "Rozmawiasz na tyle płynnie i spontanicznie, że rozmowa z native speakerem nie męczy żadnej ze stron. Bronisz swojego zdania w dyskusji.",
    goethe: "Sprechen — Teil 2 (Diskussion)",
  },
  {
    umiejetnosc: "Mówienie dłużej",
    b1: "Łączysz proste zdania, opowiadasz doświadczenia, plany i wydarzenia; krótko uzasadniasz swoje zdanie.",
    b2: "Jasno i szczegółowo mówisz o wielu tematach; wyjaśniasz stanowisko, podając zalety i wady różnych możliwości.",
    goethe: "Sprechen — Teil 1 (Vortrag)",
  },
  {
    umiejetnosc: "Pisanie",
    b1: "Piszesz prosty, spójny tekst na znany temat; prywatne wiadomości o tym, co przeżyłeś.",
    b2: "Piszesz jasne, szczegółowe teksty z argumentami za i przeciw; formalne wiadomości, w których prosisz, proponujesz, reklamujesz.",
    goethe: "Schreiben — Forumsbeitrag + formelle Nachricht",
  },
  {
    umiejetnosc: "Poprawność gramatyczna",
    b1: "W znanych sytuacjach mówisz dość poprawnie; widać wpływ języka ojczystego, ale wiadomo, o co chodzi.",
    b2: "Dobra kontrola gramatyczna: zdarzają się pomyłki, ale nie systematyczne i nie prowadzą do nieporozumień. Błędy często poprawiasz sam.",
    goethe: "kryterium „struktury” w Sprechen i Schreiben",
  },
];

export const ZRODLO_DESKRYPTOROW =
  "Parafraza deskryptorów ESOKJ (Rada Europy — skala samooceny i poprawność gramatyczna) oraz opisu egzaminu Goethe-Zertifikat B2. Skrót, nie cytat.";
