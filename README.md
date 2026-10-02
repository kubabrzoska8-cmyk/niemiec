# Niemiec

Kurs niemieckiego dla Jakuba — **B1 → Goethe-Zertifikat B2 (do końca 2026) → Fachsprachprüfung**,
z wątkiem medycznym. Plan: [`PLAN.md`](PLAN.md) · egzamin B2: [`plan/goethe-b2.md`](plan/goethe-b2.md).
Claude prowadzi lekcję jako korepetytor, śledzi luki w `GAPS.md` i zapisuje postęp w `PROGRESS.md`.

> 🗣️ **Kontekst:** Jakub rozmawia po niemiecku codziennie z mamą swojej dziewczyny — to daje
> płynność, ale nie naprawia fleksji (native rozumie mimo złej końcówki i nie poprawia).
> Kurs robi to, czego rozmowa nie zrobi: **forma pod obciążeniem, tekst pisany, język medyczny**.
> Szczegóły: [`PROFILE.md`](PROFILE.md).

## Jak prowadzone są sesje

**Głównym silnikiem kursu jest Claude Code** *(sesje 5–9 szły właśnie tak)*: Claude czyta
`CLAUDE.md`, prowadzi lekcję na czacie i po sesji sam zapisuje draft, `GAPS.md`, `PROGRESS.md`,
plan następnej lekcji i słówka, a potem pushuje na `main`.

**Stan kursu pokazuje pulpit [`app/`](#pulpit-kursu-app)** — lokalna strona bez API i bez modelu.

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

## Pulpit kursu (`app/`)

Lokalna strona, która **pokazuje stan kursu**: pulpit z tempem i celem cyklu, krzywą wolnej produkcji
(z przedziałem niepewności), luki, poziom i mocki, harmonogram Etapu 1, fiszki z TSV, archiwum lekcji
i teksty Lesestück. **Nie używa API Anthropic ani żadnego modelu** — lekcje nadal idą w czacie
Claude Code. Strona czyta pliki z lokalnego checkoutu, tylko do odczytu (`data/`, `anki/wordlists/`,
`lessons/`, `grammar/`, `drafts/`), więc **po `git pull` wystarczy odświeżyć przeglądarkę**.

Liczby pochodzą wyłącznie z [`data/kurs.json`](data/kurs.json), który Claude uzupełnia po każdej
sesji (`CLAUDE.md` → C). Strona nie parsuje tabel z `PROGRESS.md` ani `GAPS.md`.

Wymagania: Node.js ≥ 22.12.

### Na komputerze

```bash
git pull               # najnowszy stan kursu z main
cd app
npm install            # tylko za pierwszym razem
npm run dev            # → http://localhost:3200
```

Porty 3000 i 3100 zajmuje Kurs-Yale, więc pulpit stoi na **3200**.

### Na telefonie i iPadzie — w sieci domowej

Serwer działa na komputerze, a telefon łączy się z nim przez domowe Wi-Fi.

```bash
cd app
npm run siec           # to samo co dev, ale widoczne w sieci lokalnej
```

1. Telefon i komputer muszą być w tej samej sieci Wi-Fi.
2. W telefonie otwórz adres z linii `Network:`, np. `http://192.168.1.23:3200`.
3. Jeśli strona się nie otwiera, zapora blokuje połączenia przychodzące: na macOS zezwól programowi
   `node` (Ustawienia → Sieć → Zapora), na Windows zaakceptuj okno zapory przy pierwszym
   uruchomieniu (sieć prywatna).

Strona nie ma logowania: w trybie `siec` każdy w tej samej sieci może ją czytać (bez zapisu i bez
kluczy — tylko pliki kursu z listy wyżej). Uruchamiaj to w domu, nie w publicznym Wi-Fi.

### W Codespaces — z iPada, bez komputera

1. Repo na GitHubie → **Code → Codespaces → Create codespace on main**.
2. Konfiguracja z [`.devcontainer/`](.devcontainer/devcontainer.json) instaluje zależności
   i uruchamia pulpit na porcie 3200; podgląd otwiera się sam (albo: zakładka **Ports** → 3200 → 🌐).
3. Nowy stan kursu po sesji: w terminalu Codespace `git pull`, potem odśwież stronę.

Codespace usypia się po bezczynności i liczy się do miesięcznego limitu godzin na GitHubie.

### Sprawdzanie

```bash
python3 data/sprawdz_dane.py   # kurs.json ↔ schemat, PROGRESS.md, GAPS.md, TSV — musi dać ✅
cd app
npm test                       # vitest: dzień/tydzień/sesja i tempo, kurs.json, parser TSV, markdown
npm run typecheck
npm run schemat                # po zmianie app/src/lib/schema.ts → data/kurs.schema.json
```

`?dzis=2026-10-02` w adresie strony podstawia dzisiejszą datę — do sprawdzania liczb.

## Struktura repo

```
/
├── app/              ← pulpit kursu (Vite + React) — tylko pokazuje stan, bez API
├── data/             ← kurs.json (liczby dla pulpitu) + schemat + sprawdz_dane.py
├── .devcontainer/    ← Codespaces: pulpit na porcie 3200
├── README.md         ← ten plik
├── CLAUDE.md         ← protokół sesji — Claude czyta go jako pierwszy
├── CONTEXT.md        ← zasady sesji: co jest dobre, czego unikać
├── PROFILE.md        ← profil ucznia: poziom, cele, profil błędów, kalibracja
├── PLAN.md           ← przegląd 30 sesji w jednej tabeli
├── PROGRESS.md       ← ŻYWY dziennik: krzywa uczenia, log sesji
├── GAPS.md           ← ŻYWY tracker luk
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
