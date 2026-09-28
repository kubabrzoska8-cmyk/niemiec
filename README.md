# Niemiec

Kurs niemieckiego dla Jakuba — **30 sesji, B1 → B2**, z wątkiem medycznym.
Claude prowadzi lekcję jako korepetytor, śledzi luki w `GAPS.md` i zapisuje postęp w `PROGRESS.md`.

> 🗣️ **Kontekst:** Jakub rozmawia po niemiecku codziennie z mamą swojej dziewczyny — to daje
> płynność, ale nie naprawia fleksji (native rozumie mimo złej końcówki i nie poprawia).
> Kurs robi to, czego rozmowa nie zrobi: **forma pod obciążeniem, tekst pisany, język medyczny**.
> Szczegóły: [`PROFILE.md`](PROFILE.md).

## Jak prowadzone są sesje

**Głównym silnikiem kursu jest Claude Code** *(sesje 5–9 szły właśnie tak)*: Claude czyta
`CLAUDE.md`, prowadzi lekcję na czacie i po sesji sam zapisuje draft, `GAPS.md`, `PROGRESS.md`,
plan następnej lekcji i słówka, a potem pushuje na `main`.

**Aplikacja `index.html` (GitHub Pages) jest opcjonalna** — przydaje się, gdy chcesz mówić
przez mikrofon (rozpoznawanie mowy de-DE, czytanie odpowiedzi na głos). Czyta te same pliki
z `main`, więc oba sposoby można mieszać. Nie zapisuje planu następnej lekcji
(`lessons/session-NN.md`) — to robi Claude Code.

## Co robi kurs

- **Stały szkielet lekcji (~25 min):** Ziel → Meldunek → Lesestück → Regel + Drill →
  🧩 Lückensätze → **Gespräch (≥ 11 min: ta sama historia 3×, z korektą po pierwszej rundzie)** →
  Karteikarten → Bilans + misja. Cel zawodowy: **Fachsprachprüfung**. Podstawa badawcza:
  [`plan/metodyka.md`](plan/metodyka.md).
  Protokół: [`CLAUDE.md`](CLAUDE.md).
- **Jedna liczba główna** — trafność grupy rzeczownikowej w wolnej rozmowie (pierwsze 15 grup).
  Reszta pomiarów to diagnostyka. Stan: [`PROGRESS.md`](PROGRESS.md).
- **Luki** — maks. 3 aktywne naraz, każda z ostatnimi pomiarami i następnym krokiem: [`GAPS.md`](GAPS.md).
- **Cel cyklu** — jeden mierzalny cel na 3 kolejne sesje, niezależnie od kalendarza.
- **Misje na żywym rozmówcy** — struktura dnia wstawiona w codzienną rozmowę + jedno
  niezrozumiane zdanie. Plus krótki tekst do przeczytania przed następną sesją.
- **Fiszki do dwóch narzędzi** — Quizlet do wbicia słowa, Anki do utrzymania (z kartami zdaniowymi).
- **Historia** — pełne wersje plików sprzed resetu (2026-09-27) w [`archive/`](archive/README.md).

## Aplikacja — pierwsze uruchomienie

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
├── drafts/           ← zapis sesji: YYYY-MM-DD_sesja-NN_topic-slug.md
└── archive/          ← pełne wersje plików sprzed resetu 2026-09-27
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

## Jak działa aplikacja

1. Otwierasz appkę → fetchuje `CLAUDE.md`, `CONTEXT.md`, `PROFILE.md`, `GAPS.md`,
   `PROGRESS.md`, `plan/missions.md` + 3 ostatnie drafty.
2. **Liczy numer dzisiejszej sesji** z tabeli „Log sesji” w `PROGRESS.md` i dociąga
   `lessons/session-NN.md`, jeśli istnieje.
3. Claude prowadzi lekcję według `CLAUDE.md` — cały kontekst pochodzi z plików, aplikacja
   nie ma własnej kopii zasad.
4. Rozmawiasz (tekst lub mowa).
5. **Zakończ sesję** → Claude generuje draft, nowe `GAPS.md` i `PROGRESS.md`, słówka TSV
   i krótki plan następnej sesji. Jeśli odpowiedź zostanie ucięta na limicie, nic nie jest zapisywane.
6. Sprawdzasz, poprawiasz, **Zatwierdź** → commit do `main`.
7. Lokalnie przebudowujesz fiszki: `python3 anki/build_deck.py && python3 anki/build_quizlet.py`.

> ⚠️ **Aplikacja czyta i zapisuje domyślną gałąź (`main`).** Postęp zostawiony na gałęzi
> bocznej jest dla niej niewidoczny.

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

## Koszty

- Model: `claude-sonnet-5` (stała `CLAUDE_MODEL` w `index.html`).
- Pliki kursu idą w prompcie systemowym przy każdej wiadomości, więc aplikacja używa
  **prompt caching** (1 h) — pierwsza wiadomość płaci za cały kontekst, kolejne czytają go z cache.
- GitHub API: 5000 req/h dla zalogowanego użytkownika — nie do wyczerpania.
