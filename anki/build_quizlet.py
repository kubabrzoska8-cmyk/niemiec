#!/usr/bin/env python3
"""
Generator talii Quizlet dla kursu niemieckiego.

Po co to jest, skoro jest już Anki
-----------------------------------
Anki i Quizlet robią dwie różne rzeczy i nie zastępują się nawzajem:

    Quizlet  →  WBICIE nowego słowa (quiz, tryb Ucz się, dopasowywanie)
    Anki     →  UTRZYMANIE go na miesiące (powtórki rozłożone w czasie)

Jakub uczy się skuteczniej, gdy najpierw przepędzi porcję przez quiz,
a dopiero potem wpuści ją do Anki na długą metę. Ten skrypt produkuje
porcje w formacie, który Quizlet importuje bez żadnego klikania.

Ograniczenia przeniesione z kursu włoskiego (ustalone 2026-08-19)
-----------------------------------------------------------------
1. **Maksimum 50 słów na talię.** Większa porcja robi się za długa
   i quiz przestaje być quizem.
2. **Bez liczebników i prostych zwrotów.** `hallo`, `danke`, `gut` —
   on je już zna.
3. **Tylko czasowniki i rzeczowniki** *(domyślnie)*. Wąskim gardłem
   są słowa treściowe.

Kierunek: **polski → niemiecki**. Zawsze produkcyjny, tak jak fiszki
w lekcjach — Jakub rozumie więcej, niż mówi, więc kierunek DE → PL
niczego u niego nie mierzy.

Rzeczowniki idą do quizu **z rodzajnikiem** (`die Prüfung, -en`), bo
bez rodzaju nie da się ich potem odmienić — a odmiana grupy
rzeczownikowej jest luką nr 1 tego kursu.

Użycie
------
    python3 anki/build_quizlet.py                       # czasowniki + rzeczowniki
    python3 anki/build_quizlet.py --typy czasownik,rzeczownik,przymiotnik,zwrot
    python3 anki/build_quizlet.py --limit 30            # mniejsze talie
    python3 anki/build_quizlet.py --sesje 5-8           # tylko wybrane sesje

Import do Quizlet
-----------------
    Utwórz zestaw → Importuj → wklej zawartość pliku
    Między terminem a definicją: **Tabulator**
    Między kartami: **Nowa linia**
"""

import argparse
import csv
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
WORDLISTS = HERE / "wordlists"
OUTPUT_DIR = HERE.parent / "quizlet"

BLOCK_TITLES = {
    1: "Kasus i grupa rzeczownikowa",
    2: "Satzbau",
    3: "Czasy i tryby",
    4: "Fachsprache",
}

DEFAULT_TYPES = ["czasownik", "rzeczownik"]
DEFAULT_LIMIT = 50


def parse_sessions(spec):
    """'5-8' albo '3,5,7' albo '1-4,9' → zbiór numerów sesji."""
    if not spec:
        return None
    sessions = set()
    for part in spec.split(","):
        part = part.strip()
        if "-" in part:
            lo, hi = part.split("-")
            sessions.update(range(int(lo), int(hi) + 1))
        else:
            sessions.add(int(part))
    return sessions


def read_entries(types, sessions):
    """Wczytuje wszystkie TSV, filtruje i zwraca wpisy w kolejności sesji."""
    entries, seen = [], set()
    for path in sorted(WORDLISTS.glob("block-*.tsv")):
        block = int(path.stem.split("-")[1])
        with open(path, encoding="utf-8") as fh:
            for row in csv.DictReader(fh, delimiter="\t"):
                if row.get("typ", "").strip() not in types:
                    continue
                try:
                    session = int(row["sesja"])
                except (KeyError, ValueError, TypeError):
                    continue
                if sessions and session not in sessions:
                    continue

                de = (row.get("deutsch") or "").strip()
                pl = (row.get("polski") or "").strip()
                if not de or not pl:
                    continue

                # To samo słowo może wracać w kolejnych blokach —
                # do quizu bierzemy pierwsze wystąpienie i tyle.
                if de.casefold() in seen:
                    continue
                seen.add(de.casefold())

                entries.append({"sesja": session, "block": block, "de": de, "pl": pl})

    entries.sort(key=lambda e: (e["sesja"], e["de"]))
    return entries


def chunk(entries, limit):
    """
    Tnie na talie ≤ limit, ale **nie rozrywa sesji między talie**.

    Sesja jest jednostką lekcji — gdyby jej słowa wylądowały w dwóch
    zestawach, quiz przestałby odpowiadać temu, co było na zajęciach.
    Jedyny wyjątek: sesja, która sama z siebie przekracza limit.
    """
    decks, current = [], []
    for session in sorted({e["sesja"] for e in entries}):
        block = [e for e in entries if e["sesja"] == session]
        if current and len(current) + len(block) > limit:
            decks.append(current)
            current = []
        while len(block) > limit:
            decks.append(block[:limit])
            block = block[limit:]
        current.extend(block)
    if current:
        decks.append(current)
    return decks


def main():
    ap = argparse.ArgumentParser(description="Generator talii Quizlet (PL → DE).")
    ap.add_argument("--typy", default=",".join(DEFAULT_TYPES),
                    help="typy słów po przecinku (domyślnie: czasownik,rzeczownik)")
    ap.add_argument("--limit", type=int, default=DEFAULT_LIMIT,
                    help="maksimum słów w jednej talii (domyślnie 50)")
    ap.add_argument("--sesje", default=None,
                    help="zakres sesji, np. 5-8 albo 3,5,7 (domyślnie: wszystkie)")
    args = ap.parse_args()

    types = {t.strip() for t in args.typy.split(",") if t.strip()}
    sessions = parse_sessions(args.sesje)

    entries = read_entries(types, sessions)
    if not entries:
        sys.exit("Nic nie pasuje do filtrów — sprawdź --typy i --sesje.")

    OUTPUT_DIR.mkdir(exist_ok=True)
    for stale in OUTPUT_DIR.glob("talia-*.txt"):
        stale.unlink()

    decks = chunk(entries, args.limit)
    index = ["# Talie Quizlet — kurs niemieckiego", "",
             "Import: **Utwórz zestaw → Importuj**, potem",
             "*między terminem a definicją* = **Tabulator**, "
             "*między kartami* = **Nowa linia**.", "",
             "Kierunek: **polski → niemiecki** (produkcyjny).",
             "Rzeczowniki z rodzajnikiem — bez niego nie da się ich odmienić.", "",
             "| Talia | Sesje | Słów | Plik |", "|---|---|---|---|"]

    print(f"Filtr: {', '.join(sorted(types))} · limit {args.limit}/talię\n")
    for i, deck in enumerate(decks, 1):
        s_from, s_to = deck[0]["sesja"], deck[-1]["sesja"]
        span = f"{s_from:02d}" if s_from == s_to else f"{s_from:02d}-{s_to:02d}"
        name = f"talia-{i:02d}_sesje-{span}.txt"
        (OUTPUT_DIR / name).write_text(
            "\n".join(f"{e['pl']}\t{e['de']}" for e in deck) + "\n",
            encoding="utf-8")

        block = deck[0]["block"]
        label = f"Blok {block} — {BLOCK_TITLES.get(block, '')}".strip(" —")
        print(f"  ✅ {name:30} {len(deck):3} słów   ({label})")
        index.append(f"| {i:02d} | {span} | {len(deck)} | `{name}` |")

    (OUTPUT_DIR / "README.md").write_text("\n".join(index) + "\n", encoding="utf-8")
    print(f"\n   RAZEM {len(entries)} słów w {len(decks)} taliach → {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
