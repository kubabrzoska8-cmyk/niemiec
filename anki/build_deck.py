#!/usr/bin/env python3
"""
Generator talii Anki dla kursu niemieckiego.

Czyta wszystkie pliki anki/wordlists/block-*.tsv i buduje jeden plik
niemiec-master.apkg z podtaliami per blok programu.

Użycie:
    pip3 install genanki
    python3 anki/build_deck.py

Po dopisaniu nowych słówek do TSV wystarczy uruchomić ponownie i
zaimportować .apkg jeszcze raz — Anki rozpozna istniejące notatki po
GUID (zbudowanym ze słowa niemieckiego + znaczenia) i **zaktualizuje je
zamiast duplikować**, zachowując całą historię powtórek.

Dlaczego rzeczownik ma być wpisany razem z rodzajnikiem
-------------------------------------------------------
W kolumnie `deutsch` rzeczowniki zapisujemy jako `die Prüfung, -en`,
nie `Prüfung`. To nie jest kosmetyka: luka nr 1 tego kursu to deklinacja
grupy rzeczownikowej, a bez rodzaju nie da się wybrać ani końcówki
rodzajnika, ani końcówki przymiotnika. Fiszka bez rodzajnika uczy słowa,
którego i tak nie da się użyć w zdaniu.
"""

import csv
import pathlib
import sys

try:
    import genanki
except ImportError:
    sys.exit("Brak genanki. Zainstaluj:  pip3 install genanki")

HERE = pathlib.Path(__file__).parent
WORDLISTS = HERE / "wordlists"
OUTPUT = HERE / "niemiec-master.apkg"

# Stałe ID — nie zmieniaj po pierwszym imporcie, inaczej Anki zrobi nowe talie.
MODEL_ID = 1712550431
DECK_IDS = {
    1: 2081330210,
    2: 2081330211,
    3: 2081330212,
    4: 2081330213,
}
BLOCK_TITLES = {
    1: "Blok 1 — Kasus i grupa rzeczownikowa",
    2: "Blok 2 — Satzbau",
    3: "Blok 3 — Czasy i tryby",
    4: "Blok 4 — Fachsprache",
}

# Typy słów, dla których chcemy też kartę produkcyjną (PL → DE).
# Czasowniki, rzeczowniki i zwroty musisz umieć POWIEDZIEĆ, nie tylko rozpoznać.
# Rzeczownik jest tu celowo — bez odtworzenia rodzajnika z pamięci fiszka
# nic nie mierzy, a to właśnie rodzajnik jest wąskim gardłem.
PRODUCTION_TYPES = {"czasownik", "rzeczownik", "zwrot", "regula"}

CSS = """
.card {
    font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 22px;
    text-align: center;
    color: #1a1a1a;
    background: #fdfdfd;
    padding: 20px;
}
.deutsch { font-size: 34px; font-weight: 600; color: #1d4ed8; }
.polski  { font-size: 28px; color: #1a1a1a; }
.typ {
    font-size: 13px; color: #888; text-transform: uppercase;
    letter-spacing: .08em; margin-top: 6px;
}
.beispiel    { font-size: 19px; color: #333; margin-top: 16px; font-style: italic; }
.beispiel-pl { font-size: 16px; color: #777; margin-top: 4px; }
.nota {
    font-size: 15px; color: #a34b00; background: #fff6e5;
    border-left: 3px solid #f0a500; padding: 8px 12px;
    margin-top: 16px; text-align: left; border-radius: 4px;
}
hr { border: none; border-top: 1px solid #ddd; margin: 18px 0; }
.hint { font-size: 14px; color: #999; margin-top: 10px; }
@media (prefers-color-scheme: dark) {
    .card { color: #eee; background: #1e1e1e; }
    .deutsch { color: #7aa2ff; }
    .polski { color: #eee; }
    .beispiel { color: #ccc; }
    .nota { color: #ffd591; background: #3a2f1a; border-left-color: #f0a500; }
}
"""

# Karta 1: rozpoznawanie DE → PL
RECOGNITION_FRONT = """
<div class="deutsch">{{Deutsch}}</div>
<div class="typ">{{Typ}}</div>
"""

RECOGNITION_BACK = """
<div class="deutsch">{{Deutsch}}</div>
<div class="typ">{{Typ}}</div>
<hr>
<div class="polski">{{Polski}}</div>
{{#BeispielDE}}<div class="beispiel">{{BeispielDE}}</div>{{/BeispielDE}}
{{#BeispielPL}}<div class="beispiel-pl">{{BeispielPL}}</div>{{/BeispielPL}}
{{#Nota}}<div class="nota">{{Nota}}</div>{{/Nota}}
{{#Deutsch}}<div class="hint">{{tts de_DE:Deutsch}}</div>{{/Deutsch}}
"""

# Karta 2: produkcja PL → DE — to jest karta, która realnie mierzy poziom
PRODUCTION_FRONT = """
{{#Produkcja}}
<div class="polski">{{Polski}}</div>
<div class="typ">{{Typ}} &middot; powiedz po niemiecku</div>
{{/Produkcja}}
"""

PRODUCTION_BACK = """
<div class="polski">{{Polski}}</div>
<hr>
<div class="deutsch">{{Deutsch}}</div>
{{#BeispielDE}}<div class="beispiel">{{BeispielDE}}</div>{{/BeispielDE}}
{{#Nota}}<div class="nota">{{Nota}}</div>{{/Nota}}
{{#Deutsch}}<div class="hint">{{tts de_DE:Deutsch}}</div>{{/Deutsch}}
"""

MODEL = genanki.Model(
    MODEL_ID,
    "Deutsch PL (kurs B1→B2)",
    fields=[
        {"name": "Deutsch"},
        {"name": "Polski"},
        {"name": "Typ"},
        {"name": "BeispielDE"},
        {"name": "BeispielPL"},
        {"name": "Nota"},
        {"name": "Produkcja"},
    ],
    templates=[
        {"name": "DE → PL", "qfmt": RECOGNITION_FRONT, "afmt": RECOGNITION_BACK},
        {"name": "PL → DE", "qfmt": PRODUCTION_FRONT, "afmt": PRODUCTION_BACK},
    ],
    css=CSS,
)


class StableNote(genanki.Note):
    """GUID liczony ze słowa niemieckiego + znaczenia.

    Samo słowo nie wystarcza: `die Bank` to raz „ławka", raz „bank",
    a `sein` to raz „być", raz zaimek dzierżawczy. To są osobne notatki,
    nie duplikaty — dlatego do klucza wchodzi również tłumaczenie.
    """

    @property
    def guid(self):
        return genanki.guid_for(f"{self.fields[0]}|{self.fields[1]}")


def read_rows(path):
    with path.open(encoding="utf-8", newline="") as fh:
        for row in csv.DictReader(fh, delimiter="\t"):
            if not row.get("deutsch"):
                continue
            yield {k: (v or "").strip() for k, v in row.items() if k}


def build():
    if not WORDLISTS.exists():
        sys.exit(f"Brak katalogu {WORDLISTS}")

    decks, stats, seen = [], {}, set()
    total_notes = total_cards = 0

    for path in sorted(WORDLISTS.glob("block-*.tsv")):
        block = int(path.stem.split("-")[1])
        deck = genanki.Deck(DECK_IDS[block], f"Deutsch::{BLOCK_TITLES[block]}")
        count = 0

        for row in read_rows(path):
            word = row["deutsch"]
            meaning = row.get("polski", "")
            key = (word, meaning)
            if key in seen:
                print(f"  ⚠ duplikat pominięty: {word} = {meaning}  ({path.name})")
                continue
            seen.add(key)

            typ = row.get("typ", "")
            produkcja = "1" if typ in PRODUCTION_TYPES else ""
            session = row.get("sesja", "")

            deck.add_note(
                StableNote(
                    model=MODEL,
                    fields=[
                        word,
                        meaning,
                        typ,
                        row.get("beispiel_de", ""),
                        row.get("przyklad_pl", ""),
                        row.get("uwaga", ""),
                        produkcja,
                    ],
                    tags=[
                        f"blok-{block}",
                        f"sesja-{int(session):02d}" if session else "sesja-0",
                        typ or "inne",
                    ],
                )
            )
            count += 1
            total_cards += 2 if produkcja else 1

        decks.append(deck)
        stats[block] = count
        total_notes += count

    genanki.Package(decks).write_to_file(OUTPUT)

    print(f"\n✅ Zbudowano: {OUTPUT.name}")
    for block, count in sorted(stats.items()):
        print(f"   {BLOCK_TITLES[block]:<40} {count:>4} słów")
    print(f"   {'RAZEM':<40} {total_notes:>4} słów / {total_cards} kart")
    NEW_PER_DAY = 10
    print(
        f"\n   Przy {NEW_PER_DAY} nowych kartach dziennie (tryb Erhaltungsmodus) "
        f"wprowadzisz całość w ~{-(-total_cards // NEW_PER_DAY)} dni."
    )


if __name__ == "__main__":
    build()
