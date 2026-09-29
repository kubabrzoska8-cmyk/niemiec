#!/usr/bin/env python3
"""
Strażnik powtórek: czy lekcja nie daje Jakubowi czegoś, co już dostał.

Użycie:
    python3 lessons/sprawdz_powtorki.py            # sprawdza najnowszą lekcję
    python3 lessons/sprawdz_powtorki.py 11         # sprawdza lessons/session-11.md
    python3 lessons/sprawdz_powtorki.py plan/bank-tekstow.md
                                                   # dowolny plik względem WSZYSTKICH lekcji

Porównuje każde niemieckie zdanie z lekcji (tekst Lesemission, pytania, drill,
luki, fiszki, pytania do rozmowy) ze zdaniami ze WSZYSTKICH wcześniejszych
lekcji i draftów sesji. Zwraca kod 1, jeśli znajdzie powtórkę — lekcji wtedy nie wysyłamy.

Drugi test — WEWNĄTRZ lekcji: zdania z bloków pomiarowych (Lückensätze, Karteikarten)
nie mogą powtarzać zdania z innego bloku tej samej lekcji. Luka z przykładem z `Regel`
albo fiszka z luką sprzed dziesięciu minut mierzą pamięć zdania, nie regułę
(sesja 11: fiszka 8 = luka 7, luka 9 = przykład z `Regel`).

Dlaczego to istnieje
--------------------
Tekst o ibuprofenie Jakub dostał trzy razy (misja 8, misja 9, „reset” 27.09),
a sonda z sesji 8 wróciła w sesji 9 dosłownie — i Jakub ją rozpoznał.
Zasada „ta sama struktura, nowe zdanie” była w protokole; nic jej nie pilnowało.

Co liczy się jako powtórka
--------------------------
- zdanie identyczne po normalizacji, albo
- zdanie o podobieństwie słów (Jaccard) >= PROG_POWTORKA.
Między PROG_OSTRZEZENIE a PROG_POWTORKA — ostrzeżenie, bez błędu.
Ta sama STRUKTURA w nowym zdaniu (inne słowa) jest w porządku — o to chodzi.
"""

import pathlib
import re
import sys

HERE = pathlib.Path(__file__).parent
PROG_POWTORKA = 0.6
PROG_OSTRZEZENIE = 0.45
MIN_SLOW = 5

POLSKIE = set("ąćęłńóśźżĄĆĘŁŃÓŚŹŻ")
NIEMIECKIE_SLOWA = {
    "der", "die", "das", "den", "dem", "des", "ein", "eine", "einen", "einem",
    "ich", "du", "sie", "er", "wir", "ihr", "und", "mit", "nach", "ist", "bin",
    "nicht", "zu", "zum", "zur", "im", "ins", "auf", "an", "am", "in", "für",
    "ohne", "habe", "hast", "hat", "mich", "dich", "sich", "mein", "meine",
    "meinen", "meinem", "dein", "deine", "was", "wie", "wo", "wohin", "noch",
}


# Stałe formuły poleceń (format bloków) — mają się powtarzać, to nie jest treść.
FORMULY = (
    "rate zuerst", "antworte in", "dann bau", "welche wörter waren neu",
    "sag bei jedem nur den artikel",
)


def zdania(tekst):
    """Wyciąga kandydatów na niemieckie zdania z markdownu lekcji."""
    wynik = []
    for linia in tekst.splitlines():
        for kom in linia.split("|"):
            kom = re.sub(r"\([^)]*\)", " ", kom)          # nawiasy z formą podstawową
            kom = re.sub(r"[`*>#_]+", " ", kom)
            kom = re.sub(r"^\s*\d+\.\s*", " ", kom)
            for zd in re.split(r"(?<=[.!?…])\s+|[→↔„”“\"]", kom):
                zd = zd.strip(" -–—:;,.·")
                slowa = re.findall(r"[A-Za-zÄÖÜäöüßąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+", zd.lower())
                if len(slowa) < MIN_SLOW:
                    continue
                if POLSKIE & set(zd):
                    continue
                if len(NIEMIECKIE_SLOWA & set(slowa)) < 2:
                    continue
                if " ".join(slowa).startswith(FORMULY):
                    continue
                wynik.append((zd, frozenset(slowa), " ".join(slowa)))
    return wynik


BLOKI_POMIAROWE = re.compile(r"Lückensätze|Karteikarten")


def wewnatrz_lekcji(tekst):
    """Zdania z bloków pomiarowych, które powtarzają zdanie z innego bloku tej samej lekcji."""
    sekcje = [s for s in re.split(r"(?m)^(?=## )", tekst) if s.strip()]
    sekcje = [(s.splitlines()[0].strip("# ").strip(), zdania(s)) for s in sekcje]
    wynik, widziane = [], set()
    for i, (naglowek, lista) in enumerate(sekcje):
        if not BLOKI_POMIAROWE.search(naglowek):
            continue
        for zd, zbior, norm in lista:
            wsp, naglowek2, zd2, n2 = max(
                ((jaccard(zbior, z2), naglowek2, zd2, n2)
                 for j, (naglowek2, lista2) in enumerate(sekcje) if j != i
                 for zd2, z2, n2 in lista2),
                default=(0, "", "", ""),
            )
            para = frozenset((norm, n2))          # para luka↔fiszka tylko raz
            if wsp >= PROG_OSTRZEZENIE and para not in widziane:
                widziane.add(para)
                wynik.append((zd, wsp, naglowek2, zd2))
    return wynik


def jaccard(a, b):
    return len(a & b) / len(a | b)


def numer(p):
    m = re.search(r"session-(\d+)\.md$", p.name)
    return int(m.group(1)) if m else None


def main():
    lekcje = sorted((p for p in HERE.glob("session-*.md") if numer(p)), key=numer)
    if not lekcje:
        sys.exit("Brak plików lessons/session-*.md")
    arg = sys.argv[1] if len(sys.argv) > 1 else str(numer(lekcje[-1]))
    if arg.isdigit():
        cel_nr = int(arg)
        cel = HERE / f"session-{cel_nr:02d}.md"
    else:                                   # dowolny plik — porównaj ze wszystkim
        cel, cel_nr = pathlib.Path(arg), 10**6
    if not cel.exists():
        sys.exit(f"Brak pliku {cel}")

    wczesniejsze = []
    for p in lekcje:
        if numer(p) < cel_nr:
            wczesniejsze += [(p.name, *z) for z in zdania(p.read_text(encoding="utf-8"))]
    # Drafty — tam jest to, co faktycznie padło na sesji (np. pytania w rozmowie,
    # których nie było w pliku lekcji). Sonda z s8 wróciła w s9 właśnie tą drogą.
    for p in sorted((HERE.parent / "drafts").glob("*.md")):
        m = re.search(r"_sesja-(\d+)_", p.name)
        if m and int(m.group(1)) >= cel_nr:
            continue
        wczesniejsze += [(f"drafts/{p.name}", *z) for z in zdania(p.read_text(encoding="utf-8"))]

    powtorki, ostrzezenia, widziane = [], [], set()
    for zd, zbior, norm in zdania(cel.read_text(encoding="utf-8")):
        if norm in widziane:
            continue
        widziane.add(norm)
        najlepsze = max(
            ((jaccard(zbior, z2), plik, zd2) for plik, zd2, z2, n2 in wczesniejsze),
            default=(0, "", ""),
        )
        if najlepsze[0] >= PROG_POWTORKA:
            powtorki.append((zd, *najlepsze))
        elif najlepsze[0] >= PROG_OSTRZEZENIE:
            ostrzezenia.append((zd, *najlepsze))

    wewn = wewnatrz_lekcji(cel.read_text(encoding="utf-8")) if numer(cel) else []
    for zd, wsp, blok, zd2 in wewn:
        (powtorki if wsp >= PROG_POWTORKA else ostrzezenia).append(
            (zd, wsp, f"ta sama lekcja, blok „{blok[:40]}”", zd2))

    print(f"Sprawdzam {cel.name} względem wcześniejszych lekcji, draftów sesji "
          f"i — w blokach pomiarowych — względem samej siebie.")
    for tytul, lista in (("❌ POWTÓRKI", powtorki), ("⚠️  podobne", ostrzezenia)):
        if lista:
            print(f"\n{tytul}:")
            for zd, wsp, plik, zd2 in lista:
                print(f"  {wsp:.2f}  „{zd}”\n        ≈ {plik}: „{zd2}”")
    if powtorki:
        print(f"\n❌ {len(powtorki)} powtórek — zmień zdania (ta sama struktura, nowe słowa).")
        sys.exit(1)
    print("\n✅ Bez powtórek.")


if __name__ == "__main__":
    main()
