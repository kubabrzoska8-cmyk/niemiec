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
| **Anki** | **utrzymanie** go przez miesiące — powtórki rozłożone w czasie | **codziennie ~10 minut** |

> ⚠️ **Codziennie po trochu, nie cała talia jednym ciągiem przed sesją.** Ciąg zawyża wynik
> („Naprawdę zapamiętane” 94 % w sesji 9) i marnuje odstępy, na których Anki w ogóle działa.
> Rozmowy ze Schwiegermutter odświeżają słownictwo codzienne — medycznego i słów z luk nie
> odświeża nic poza talią.

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
| `beispiel_de` | całe zdanie po niemiecku — **z niego powstaje karta zdaniowa**; zdanie z jego życia, cel nienazwany |
| `przyklad_pl` | tłumaczenie zdania |
| `uwaga` | pułapka, kontrast z polskim, numer luki z `GAPS.md` |

### Dwie zasady zapisu, które nie są kosmetyką

**1. Rzeczownik zawsze z rodzajnikiem i liczbą mnogą.**
`die Prüfung, -en` — nigdy samo `Prüfung`. Luka nr 1 tego kursu to deklinacja grupy
rzeczownikowej; bez rodzaju nie da się wybrać ani końcówki rodzajnika, ani przymiotnika.
Fiszka bez rodzajnika uczy słowa, którego i tak nie da się użyć w zdaniu.

**2. Czasownik mocny w trzech formach, `sein`-Verben oznaczone.**
`sprechen – sprach – hat gesprochen` · `fahren – fuhr – **ist** gefahren`.
Wybór posiłkowego musi być widoczny na karcie.

---

## Budowanie

```bash
pip3 install genanki          # jednorazowo
python3 anki/build_deck.py     # → anki/niemiec-master.apkg
python3 anki/build_quizlet.py  # → quizlet/talia-*.txt
```

**Ponowny import `.apkg` jest bezpieczny.** GUID notatki liczy się ze słowa niemieckiego
i tłumaczenia (karta zdaniowa — ze zdania niemieckiego), więc Anki rozpoznaje istniejące karty i **aktualizuje je zamiast duplikować** —
cała historia powtórek zostaje.

---

## Jakie karty powstają

| Karta | Dla kogo | Status |
|-------|----------|--------|
| **PL → DE, słowo** | rzeczownik, czasownik, zwrot, regula | ✅ główna karta słówkowa — każe odtworzyć rodzajnik |
| **PL → DE, całe zdanie** 🆕 | każdy wiersz z przykładem PL i DE | ✅ osobny typ notatki `Deutsch PL — zdanie (PL→DE)`, tag `zdanie` |
| DE → PL | rzeczownik, czasownik, zwrot, regula | ⏸️ **zawieszona** — nowe przychodzą zawieszone |
| DE → PL | przymiotnik, przysłówek | ✅ jedyna karta tych słów |

**Po co karta zdaniowa.** Sesja 9: talia 94 %, te same słowa w zdaniu 58 %. Karta słówkowa
mówi, o co pyta — zdanie nie mówi, więc trzeba samemu zauważyć, że po `mit` idzie Dativ, a szafa
jest rodzaju męskiego. Tego wymaga rozmowa i tego karta zdaniowa uczy.

**Po co zawieszać DE → PL.** Rozumienie Jakuba jest na B1+/B2−; kurs mierzy produkcję.
Karta DE → PL zajmowała połowę powtórek i nie ćwiczyła niczego, czego brakuje.
Zawieszenie jest odwracalne (Unsuspend).

### Jednorazowo po imporcie — zawieś stare karty DE → PL

Import nie zmienia statusu kart, które już masz. Raz, ręcznie:

1. Anki → **Przeglądaj** (Browse).
2. Wklej w wyszukiwarkę:
   ```
   "note:Deutsch PL (kurs B1→B2)" card:1 (tag:rzeczownik OR tag:czasownik OR tag:zwrot OR tag:regula)
   ```
3. Zaznacz wszystko (Ctrl/Cmd+A) → **Zawieś** (Ctrl/Cmd+J).

Karty zdaniowe są nowe, więc wchodzą w limicie nowych kart dziennie (obecnie 15).

Karty mają `{{tts de_DE:…}}` — AnkiDroid / AnkiMobile odczytają słowo i zdanie na głos.

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
