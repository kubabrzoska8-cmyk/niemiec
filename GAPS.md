# GAP TRACKER — żywy rejestr luk

**Jak to działa:** aktualizowany na końcu **każdej** sesji.
Luki z sekcji *Active* są celem następnej sesji. Luka trafia do *Closed* dopiero, gdy przestaje
się pojawiać przez **3 sesje z rzędu mimo okazji**.

**Cykl życia luki:**
```
Przewidywana  →  Active  →  Watching  →  Closed
   (hipoteza)     (błąd       (już rzadko,   (opanowane,
                  powtarzalny) monitoruję)    nie drążę)
```

> 🔴 **„Brak okazji" nie jest pomiarem.** Trzy luki poniżej mają przy sesji 2026-04-29 adnotację
> „brak danych" — to znaczy, że sesja ich nie sprawdziła, a nie że się poprawiły. **Jeśli luka
> jest Active, obowiązkiem prowadzącego jest stworzyć jej okazję**, a nie czekać, aż sama
> wypłynie w rozmowie. Luka, która trzy razy z rzędu dostaje „brak danych", jest w praktyce
> porzucona, tylko wygląda na monitorowaną.

---

## ❄️ Kontekst: brak immersji

Jakub uczy się niemieckiego **bez kontaktu z językiem poza sesją** — sierpień spędza w Rzymie
na praktykach, potem wraca na studia do Polski. To zmienia charakter luk:

- **Luki nie zamykają się same.** W kursie włoskim część błędów rozpuszcza ulica. Tutaj każda
  luka zostaje otwarta dokładnie do momentu, w którym sesja się nią zajmie.
- **Zapominanie działa na luki już zamknięte.** Po dłuższej przerwie *Closed* trzeba
  weryfikować, a nie ufać. Patrz przerwa 2026-04-29 → 2026-08-21 (~16 tygodni).
- **Najlepsze źródło danych to blok `Gespräch` i meldunek z misji** — czyli wolna produkcja.
  Drill mierzy pamięć reguły sprzed czterech minut, nie poziom.
- **Interferencja z włoskim jest przewidziana i liczona osobno** — Jakub prowadzi równolegle
  kurs włoskiego. Patrz Watching → 🇮🇹.

---

## Active

> **Priorytet na sesję 5 (rediagnostyka): #1, #2, #4.**
> #1 bo jest najgęstsza i najlepiej udokumentowana. #2 bo trzy sesje z rzędu bez pomiaru.
> #4 bo w ogóle nie została sprawdzona.

### 1. Kasus po przyimku — przede wszystkim Dativ 🔴 *(najgęstsza luka kursu)*
Systematyczne błędy przy przyimkach rządzących celownikiem (`zu, in, mit, nach, bei, von, seit`).
- ❌ `zu mich` · `in letztes Semester` · `mit Freunde`
- ✅ `zu mir` · `im letzten Semester` · `mit Freunden`
- *Sesja 3 (2026-04-28): `bei Rhein` zamiast `beim Rhein`.*
- *Sesja 4 (2026-04-29): **trzy wystąpienia w jednej sesji** — `in die nächsten Zukunft` ·
  `mit einen kalten bier` · `nach ganzen tag am uni`. Wzorzec potwierdzony po raz kolejny.*
- **Diagnoza:** to nie jest luka „przyimków". Jakub **wie**, że po `mit` idzie Dativ — przewraca
  się na **odmianie grupy rzeczownikowej**: rodzajnik + przymiotnik + rzeczownik naraz.
  `mit einen kalten bier` ma poprawnie wybrany przyimek i trzy błędne końcówki za nim.
- **Plan:** sesje 7–9 (przyimki), sesja 11 (`Adjektivendungen`). Referencja:
  [`grammar/01-kasus-praepositionen.md`](grammar/01-kasus-praepositionen.md)

### 2. Perfekt — `haben` czy `sein` 🔴 *(3 sesje bez pomiaru)*
Czasowniki ruchu i zmiany stanu wymagają `sein`; Jakub domyślnie bierze `haben`.
- ❌ `ich habe reist` · `wir haben geblieben`
- ✅ `ich **bin** gereist` · `wir **sind** geblieben`
- *Sesja 3 (2026-04-28): dwa wystąpienia — wzorzec przeniesiony z Watching do Active.*
- *Sesja 4 (2026-04-29): mało okazji, brak nowych błędów ani potwierdzeń. **To nie jest postęp,
  to pusty pomiar.***
- **Do zrobienia na sesji 5:** wymuś opowiadanie o przeszłości z czasownikami ruchu
  (`fahren, gehen, kommen, bleiben, aufstehen, einschlafen`). Bez wymuszenia znowu będzie „brak danych".
- **Plan:** sesja 18. Referencja: [`grammar/03-perfekt-haben-sein.md`](grammar/03-perfekt-haben-sein.md)

### 3. Rodzaj i końcówki przymiotnika ⬆️ *(awansowana z Watching 2026-08-21)*
Rodzaj gramatyczny kopiowany z polskiego + brak deklinacji przymiotnika po rodzajniku.
- ❌ `meine Gehirn` *(pol. „mózg" męski → niem. **das** Gehirn)*
- ❌ `das letztes mal` → ✅ `das letzt**e** Mal`
- ❌ `sehr interessante Fächer` → ✅ `ein sehr interessant**es** Fach`
- ❌ `die Männliche Körper` → ✅ `der menschlich**e** Körper`
- *Sesja 3 (2026-04-28): trzy wystąpienia. Sesja 4 (2026-04-29): kolejne (`das letztes mal`).*
- **Powód awansu:** cztery sesje z rzędu z wystąpieniami i bezpośredni związek z luką #1 —
  to jest ta sama luka widziana z drugiej strony. Bez końcówek przymiotnika `mit einem kalten
  Bier` nie da się poskładać.
- **Plan:** sesje 10–11.

### 4. Konjunktiv II — zdanie główne ⚠️ *(nigdy nie zmierzona)*
Zna `hätte` w członie warunkowym, ale nie dokłada `würde` w następniku.
- ❌ `wenn ich mehr Freizeit hätte, **werde** ich…`
- ✅ `wenn ich mehr Freizeit hätte, **würde** ich…`
- *Sesja 4 (2026-04-29): temat nie pojawił się — brak danych.*
- 🔴 **Ta luka nie została sprawdzona ani razu od czasu jej wpisania.** Na sesji 5 zadaj wprost
  pytanie `Was würdest du machen, wenn…?` — inaczej zostanie na liście jako ozdoba.

### 5. Czasowniki zwrotne ✅ *(sygnał pozytywny — kandydat do degradacji)*
- ❌ `fühlt mich fremd an` · `wir haben aufgehalten` *(brak `uns`)*
- ✅ `fühlt **sich** fremd an` · `wir haben **uns** aufgehalten`
- *Sesja 3 (2026-04-28): `wir haben ganzen tag draußen aufgehalten` — brak `uns`.*
- *Sesja 4 (2026-04-29): `ich erhole **mich**` i `unsere Beine **uns** tragen` — **oba poprawnie**.*
- **Status:** jedna sesja czysta. Przy drugiej czystej sesji → Watching.

### 6. `studieren` vs. `lernen`
`studieren` = być na studiach. Uczenie się do egzaminu to `lernen`.
- ❌ `ich studiere viel` *(przed egzaminem)*
- ✅ `ich **lerne** viel` · `ich lerne für die Prüfung`
- *Sesja 4 (2026-04-29): brak okazji — `prüfungsfreie Zeit`. Nadal Active.*
- **Uwaga:** to jedyna luka czysto leksykalna na tej liście i najtańsza do zamknięcia.
  Wystarczy jedno pytanie o egzaminy w bloku `Gespräch`.

---

## Watching

### Partizip II czasowników mocnych ⚠️ *(kandydat do Active)*
- ❌ `Gesprächen` zamiast `gesprochen` *(sesja 4)* · ❌ `geschläft` zamiast `geschlafen` *(sesja 3)*
- **Mechanizm:** tworzy Partizip II regularnie od tematu, zamiast sięgnąć po formę mocną.
  To nie jest przypadkowa pomyłka, tylko nadgeneralizacja reguły — czyli **wzorzec**.
- Dwa wystąpienia w dwóch kolejnych sesjach. Trzecie → awans do Active. Plan: sesja 19.

### 🇮🇹 Interferencja z włoskim 🆕 *(wpisana profilaktycznie 2026-08-21)*
Jakub prowadzi równolegle kurs włoskiego w Rzymie. Objawy do wyłapania:
- pominięty zaimek osobowy — ❌ `bin müde` → ✅ `**ich** bin müde` *(po włosku podmiot się pomija)*
- czasownik na drugim miejscu w zdaniu podrzędnym *(włoski nie przesuwa czasownika)*
- włoskie słowo wstawione w niemieckie zdanie
- ❌ `ich habe 24 Jahre` *(kalka `ho 24 anni`)* → ✅ `ich **bin** 24 Jahre alt`
- **Jeszcze nie zaobserwowane.** Jeśli nie pojawi się przez 3 sesje mimo okazji — usuwamy
  i odnotowujemy jako mocną stronę.

### 🇵🇱 Interferencja z polskiego — wtrącenia
Przechodzi na polski, gdy brakuje niemieckiego słowa.
- **Reakcja przewidziana w `CLAUDE.md`:** podaj niemiecki odpowiednik i **od razu każ użyć go
  w zdaniu**. Samo podanie tłumaczenia nie zostawia śladu.

### Przyimek przy instytucjach
- ❌ `am uni` → ✅ `an der Uni` *(sesja 4)*
- Podzbiór luki #1, ale wart osobnej uwagi, bo dotyczy słów, których używa codziennie:
  `an der Uni`, `in der Vorlesung`, `im Krankenhaus`, `auf Station`.

### Ortografia czatu — **nie jest luką**
Rzeczowniki z małej litery, brak Umlautów (`prufüngen`, `bier`, `uni`). To wygoda klawiatury,
nie brak wiedzy. **Nie poprawiaj tego jako wzorca** i nie licz do wskaźnika trafności.
Wyjątek: gdy Umlaut zmienia formę gramatyczną (`fahre` / `fährt`) — wtedy to już fleksja.

### Rozwijanie wypowiedzi
- *Sesja 2 (2026-04-27):* odpowiedź `ich studiere viel` — trzy słowa, zero prób zdania złożonego.
- Rozwiązane w sesji 3 przy wsparciu, ale bez wsparcia wraca. Kontrola: blok `Gespräch`.

---

## Closed

*(opanowane — nie drążymy)*

⚠️ **Po przerwie 2026-04-29 → 2026-08-21 (~16 tygodni) ta sekcja wymaga weryfikacji, nie zaufania.**
Sesja 5 sprawdza po jednym zdaniu z każdej pozycji. Cokolwiek nie odtworzy się za pierwszym
razem — wraca do Active z adnotacją „regres po przerwie".

- ✅ **Szyk zdania podrzędnego** — *sesja 3 (2026-04-28): sześć poprawnych zdań z rzędu
  z `weil` i `obwohl`, bez podpowiedzi.* Największy udokumentowany sukces kursu.
- ✅ **Budowa Perfekt — samo Partizip II** *(wybór czasownika posiłkowego → Active #2;
  formy mocne → Watching)*
- ✅ **`hätte` w członie warunkowym Konjunktiv II** *(następnik → Active #4)*
- ✅ **Podstawowy szyk zdania głównego (V2)**
- ✅ **Słownictwo medyczne** — interna, radiologia, ortopedia, układ ruchu

---

## Mocne strony *(potwierdzone atuty — nie marnujemy na nie czasu)*

| Atut | Dowód |
|------|-------|
| **Zdanie podrzędne** | Sesja 3: `weil`, `obwohl` — sześć poprawnych z rzędu |
| **Zakres słownictwa** | Sam sięga po `erforschen`, `der Bewegungsapparat`, `faszinierend`, `sich konzentrieren auf` |
| **Rozumienie** | Nie prosi o powtórzenie zdań — dopytuje o pojedyncze słowa (`erholen meinst quasi entspannen oder?`) |
| **Nawyk powtórek** | Używa Anki i robi **własne** karty: *„ich nutze meine eigenen Karten"* |
| **Mówi, gdy jest za łatwo** | *„es ist ein bisschen langweilig gleiche Sätze wiederholen"* — sam kalibruje trudność w górę |

---

> **Log sesji przeniesiony do [`PROGRESS.md`](PROGRESS.md).** Ten plik trzyma stan luk,
> tamten — przebieg kursu i metryki. Nie duplikuj tabeli w obu miejscach.
