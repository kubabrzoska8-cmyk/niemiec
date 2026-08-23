# Niemiec

Kurs niemieckiego dla Jakuba — **30 sesji, B1 → B2**, z wątkiem medycznym.
Claude prowadzi lekcję jako korepetytor, śledzi luki w `GAPS.md` i zapisuje postęp w `PROGRESS.md`.

> ❄️ **Ten kurs jest zbudowany na jednym założeniu: brak immersji.**
> Jakub nie ma kontaktu z niemieckim poza sesją — sierpień spędza w Rzymie na praktykach,
> potem wraca na studia do Polski. Dlatego lekcja musi zrobić dwie rzeczy, których nie zrobi
> otoczenie: **dostarczyć input** (przez misje) i **wymusić produkcję** (przez blok `Gespräch`).
> To odwrotność bliźniaczego repo z włoskim, gdzie input jest za darmo, bo Rzym jest za oknem.

## Co robi

- **Prowadzi lekcję według stałego szkieletu** — Meldunek → Lesestück → Regel → Drill →
  Gespräch → Karteikarten + misja. Nie jest to swobodna rozmowa, tylko zajęcia.
- **Czytanie ze zrozumieniem w każdej sesji** — tekst przychodzi z misją, na sesji cztery
  pytania z odpowiedzią po niemiecku *(`plan/lesestueck.md`)*.
- **Rozmowa po niemiecku** — recasting zamiast wykładu, maks. 3 wzorce błędów na sesję.
- **Wykrywanie luk** — po każdej sesji aktualizuje `GAPS.md` (Active / Watching / Closed).
- **Mierzy krzywą uczenia** — `PROGRESS.md` trzyma trafność (osobno drill i wolna produkcja),
  log sesji i metryki Anki. Wskaźnik decyduje o tempie następnej lekcji.
- **Numeruje sesje, nie dni** — kurs nie jest codzienny, więc pominięta sesja nic nie psuje.
- **Generuje fiszki do dwóch narzędzi** — Quizlet do wbicia słowa, Anki do utrzymania go.
- **Przydziela misję** — podcast, tekst medyczny, nagranie własnego głosu. To jest cały
  input tego kursu.
- **Mowa** — mikrofon (de-DE → tekst) i czytanie odpowiedzi na głos (Web Speech API).
- **Wszystko w GitHub** — drafty, `GAPS.md`, `PROGRESS.md` i listy słówek to commity.

## Pierwsze uruchomienie

### 1. Włącz GitHub Pages dla repo
Repo → Settings → Pages → Source: **Deploy from a branch** → Branch: **main** → Folder: **/ (root)** → Save.

Po minucie strona będzie pod `https://kubabrzoska8-cmyk.github.io/niemiec/`.

### 2. Przygotuj klucze
- **GitHub Personal Access Token** (classic) z uprawnieniem `repo`. [Tutaj](https://github.com/settings/tokens/new).
- **Anthropic API Key** z [console.anthropic.com](https://console.anthropic.com/settings/keys).

### 3. Otwórz aplikację
Wejdź na `https://kubabrzoska8-cmyk.github.io/niemiec/` → wklej token, klucz i nazwę repo (`kubabrzoska8-cmyk/niemiec`) → "Zacznij sesję".

Tokeny są zapisywane TYLKO w `localStorage` Twojej przeglądarki — nigdy nie wychodzą poza Twoją maszynę.

## Struktura repo

```
/
├── index.html        ← aplikacja (GitHub Pages serwuje to)
├── .nojekyll         ← wyłącza Jekyll na Pages
├── README.md         ← ten plik
├── CLAUDE.md         ← plan pięter + protokół sesji (czytany przez aplikację)
├── CONTEXT.md        ← zasady sesji: co jest dobre, czego unikać
├── PROFILE.md        ← profil ucznia: poziom, cele, profil błędów, kalibracja
├── PLAN.md           ← przegląd 30 sesji w jednej tabeli
├── PROGRESS.md       ← ŻYWY dziennik: krzywa uczenia, log sesji (aplikacja tu pisze)
├── GAPS.md           ← ŻYWY tracker luk (aplikacja tu pisze)
├── plan/
│   ├── missions.md   ← misje asynchroniczne — jedna na każdą sesję
│   └── block-1..4.md ← program: Kasus → Satzbau → czasy i tryby → Fachsprache
├── lessons/          ← materiał sesji: session-05.md, session-06.md, …
├── grammar/          ← referencje gramatyczne pisane pod Polaka
├── resources/        ← wyselekcjonowane źródła — TU MIESZKA INPUT
├── anki/             ← źródło prawdy słówek (wordlists/*.tsv) + generatory
├── quizlet/          ← talie quizowe generowane z tych samych TSV
└── drafts/           ← transkrypty sesji (aplikacja tu pisze)
    └── YYYY-MM-DD_sesja-NN_topic-slug.md
```

*(Cztery pierwsze drafty pochodzą sprzed wprowadzenia struktury i mają starą nazwę
`YYYY-MM-DD_topic.md`. Zostają jako zapis historyczny.)*

## Program kursu

| Blok | Sesje | Temat |
|------|-------|-------|
| — | 1–4 | *(przed strukturą — swobodne rozmowy)* |
| **1** | 5–11 | Kasus i grupa rzeczownikowa |
| **2** | 12–17 | Satzbau — zdanie złożone i szyk |
| **3** | 18–24 | Czasy i tryby |
| **4** | 25–30 | Fachsprache, płynność i test B2 |

Kolejność jest **odwrócona względem typowego kursu B1** — przypadki idą przed szykiem zdania.
Powód jest w danych: Jakub buduje poprawne zdania podrzędne, a przewraca się na końcówkach.
Szczegóły w [`PLAN.md`](PLAN.md).

## Fiszki

Jedno źródło prawdy — `anki/wordlists/block-*.tsv` — dwa narzędzia:

```bash
pip3 install genanki
python3 anki/build_deck.py     # → anki/niemiec-master.apkg   (Anki: utrzymanie)
python3 anki/build_quizlet.py  # → quizlet/talia-*.txt        (Quizlet: wbicie)
```

Szczegóły: [`anki/README.md`](anki/README.md).

## Jak działa cykl sesji

1. Otwierasz appkę → fetchuje `CLAUDE.md`, `CONTEXT.md`, `PROFILE.md`, `GAPS.md`,
   `PROGRESS.md`, `PLAN.md`, `plan/missions.md` + 3 ostatnie drafty.
2. **Liczy numer dzisiejszej sesji** z tabeli „Log sesji" w `PROGRESS.md` i dociąga
   `lessons/session-NN.md`, jeśli taki plik istnieje.
3. Buduje system prompt → Claude prowadzi lekcję według szkieletu, zaczynając od meldunku z misji.
4. Rozmawiasz (tekst lub mowa).
5. Klikasz **Zakończ sesję** → Claude generuje:
   - Draft sesji (transkrypt + pattern notes + słownictwo)
   - Nową treść `GAPS.md` (przesunięcia Active / Watching / Closed, datowane dopiski)
   - Nową treść `PROGRESS.md` (wiersz w logu + trafność drill / wolna produkcja)
   - Nowe słówka w formacie TSV (dopisywane do właściwego `anki/wordlists/block-N.tsv`)
   - Plan na następną sesję (zapisywany lokalnie, użyty przy następnym otwarciu)
6. Sprawdzasz, edytujesz jeśli trzeba, klikasz **Zatwierdź** → commit do GitHuba.
7. Lokalnie przebudowujesz fiszki: `python3 anki/build_deck.py && python3 anki/build_quizlet.py`.

> ⚠️ **Aplikacja czyta i zapisuje domyślną gałąź (`main`).** Postęp zostawiony na gałęzi
> bocznej jest dla niej niewidoczny — następna sesja wystartuje na starym `GAPS.md`
> i zaproponuje sesję, która już była.

## Bezpieczeństwo

- Tokeny w `localStorage` przeglądarki. Jeśli używasz wspólnego komputera — kliknij ⚙️ → wyloguj.
- `index.html` używa nagłówka `anthropic-dangerous-direct-browser-access: true` — to oficjalny sposób Anthropic na bezpośrednie wołanie API z przeglądarki. Świadomie akceptujesz, że klucz jest w przeglądarce.
- Nie commituj tokenu/klucza do repo. Aplikacja tego nie robi, ale uważaj.

## Lokalny dev

```bash
cd <katalog repo>
python3 -m http.server 8000
# otwórz http://localhost:8000
```

## Limit rate / koszty

- Claude Sonnet: ~$0.003 / 1k input + $0.015 / 1k output. Sesja ~10-25 groszy
  (prompt jest większy niż wcześniej — dochodzi profil, plan i materiał lekcji).
- GitHub API: 5000 req/h dla zalogowanego użytkownika — nie do wyczerpania.
