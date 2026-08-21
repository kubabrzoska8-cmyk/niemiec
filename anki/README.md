# Anki + Quizlet — jak to działa

**Jedno źródło prawdy: `anki/wordlists/block-*.tsv`.**
Z tych samych plików generują się oba komplety fiszek. Nie ma drugiej listy do pilnowania.

```
anki/wordlists/block-N.tsv
        │
        ├── build_deck.py     →  anki/niemiec-master.apkg   (Anki — utrzymanie)
        └── build_quizlet.py  →  quizlet/talia-NN_*.txt     (Quizlet — wbicie)
```

---

## Dwa narzędzia, dwie różne roboty

| | Do czego służy | Kiedy |
|---|---|---|
| **Quizlet** | **wbicie** nowego słowa — quiz, tryb Ucz się, dopasowywanie | zaraz po sesji, świeża porcja |
| **Anki** | **utrzymanie** go przez miesiące — powtórki rozłożone w czasie | codziennie, cała talia |

> **Przy braku immersji Anki nie jest dodatkiem, tylko jedynym mechanizmem, który utrzymuje
> materiał między sesjami.** W kursie włoskim część słów odświeża miasto. Tutaj nic ich
> nie odświeża — poza tą talią.

---

## Format TSV

Siedem kolumn, rozdzielone **tabulatorem**:

```
sesja	deutsch	polski	typ	beispiel_de	przyklad_pl	uwaga
```

| Kolumna | Co wpisać |
|---------|-----------|
| `sesja` | numer sesji — trafia do tagu `sesja-05`, po nim filtruje się w Anki |
| `deutsch` | słowo. **Rzeczownik zawsze z rodzajnikiem i liczbą mnogą**: `die Prüfung, -en` |
| `polski` | tłumaczenie |
| `typ` | `rzeczownik` · `czasownik` · `przymiotnik` · `przyslowek` · `zwrot` · `regula` |
| `beispiel_de` | całe zdanie po niemiecku — **z tego widać rząd czasownika i przypadek** |
| `przyklad_pl` | tłumaczenie zdania |
| `uwaga` | pułapka, kontrast z polskim, numer luki z `GAPS.md` |

### Dwie zasady zapisu, które nie są kosmetyką

**1. Rzeczownik zawsze z rodzajnikiem i liczbą mnogą.**
`die Prüfung, -en` — nigdy samo `Prüfung`. Luka nr 1 tego kursu to deklinacja grupy
rzeczownikowej; bez rodzaju nie da się wybrać ani końcówki rodzajnika, ani przymiotnika.
Fiszka bez rodzajnika uczy słowa, którego i tak nie da się użyć w zdaniu.

**2. Czasownik mocny w trzech formach, `sein`-Verben oznaczone.**
`sprechen – sprach – hat gesprochen` · `fahren – fuhr – **ist** gefahren`.
Wybór posiłkowego to osobna luka (Active #2) i musi być widoczny na karcie.

---

## Budowanie

```bash
pip3 install genanki          # jednorazowo
python3 anki/build_deck.py     # → anki/niemiec-master.apkg
python3 anki/build_quizlet.py  # → quizlet/talia-*.txt
```

**Ponowny import `.apkg` jest bezpieczny.** GUID notatki liczy się ze słowa niemieckiego
i tłumaczenia, więc Anki rozpoznaje istniejące karty i **aktualizuje je zamiast duplikować** —
cała historia powtórek zostaje.

---

## Jakie karty powstają

| Typ słowa | DE → PL | PL → DE |
|-----------|---------|---------|
| rzeczownik, czasownik, zwrot, regula | ✅ | ✅ |
| przymiotnik, przysłówek | ✅ | — |

**Rzeczownik ma kartę produkcyjną celowo** — inaczej nigdy nie odtwarzasz rodzajnika z pamięci,
a to on jest wąskim gardłem. Karta PL → DE każe powiedzieć `die Prüfung`, nie rozpoznać.

Karty mają `{{tts de_DE:Deutsch}}` — na telefonie AnkiDroid / AnkiMobile odczytają słowo na głos.
Przy braku immersji to jedyny regularny kontakt ze słuchową stroną tych słów.

---

## Opcje generatora Quizletu

```bash
python3 anki/build_quizlet.py                                  # czasowniki + rzeczowniki
python3 anki/build_quizlet.py --typy czasownik,rzeczownik,zwrot
python3 anki/build_quizlet.py --limit 30                        # mniejsze talie
python3 anki/build_quizlet.py --sesje 5-8                       # tylko wybrane sesje
```

Trzy ograniczenia wbudowane na stałe:
- **≤ 50 słów na talię** — większa porcja przestaje być quizem
- **bez liczebników i prostych zwrotów** (`hallo`, `danke`, `gut`)
- **sesja nigdy nie jest rozrywana między dwie talie** — quiz ma odpowiadać temu,
  co realnie było na lekcji
