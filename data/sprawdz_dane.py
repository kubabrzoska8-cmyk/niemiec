#!/usr/bin/env python3
"""
Strażnik danych pulpitu: czy `data/kurs.json` jest poprawny i zgodny z markdownem kursu.

Użycie:
    python3 data/sprawdz_dane.py

Uruchamiaj po każdej sesji, po aktualizacji `PROGRESS.md`, `GAPS.md` i `data/kurs.json`
(protokół: `CLAUDE.md` → C). Zwraca kod 1, jeśli cokolwiek jest ❌ — wtedy nie commitujemy.

Dlaczego to istnieje
--------------------
Pulpit w `app/` czyta WYŁĄCZNIE `data/kurs.json` — nie parsuje tabel z PROGRESS.md i GAPS.md,
bo ich komórki to proza z adnotacjami. Dwa zapisy tego samego stanu rozjadą się przy pierwszej
pospiesznej sesji, jeśli nic tego nie pilnuje. Ten skrypt pilnuje:

1. schematu — `data/kurs.schema.json` (generowany z `app/src/lib/schema.ts`, `npm run schemat`);
2. reguł, których schemat nie wyraża — sesje po kolei, poprawne ≤ n, maks. 3 Active…;
3. zgodności z markdownem — ostatnia sesja i liczba główna każdej sesji jak w `PROGRESS.md`
   → Log sesji, cel cyklu ten sam, liczba Active jak w `GAPS.md`, liczba słów jak w TSV;
4. plików, na które kurs.json wskazuje — muszą istnieć.

Tylko biblioteka standardowa — działa w każdym kontenerze bez instalowania czegokolwiek.
"""

import json
import pathlib
import re
import sys

REPO = pathlib.Path(__file__).resolve().parent.parent
KURS = REPO / "data" / "kurs.json"
SCHEMAT = REPO / "data" / "kurs.schema.json"

bledy = []
ok = []


def blad(msg):
    bledy.append(msg)


def sprawdzone(msg):
    ok.append(msg)


# ─── 1. Schemat: podzbiór JSON Schema, którego używa wygenerowany plik ────────────────

TYPY = {
    "object": dict,
    "array": list,
    "string": str,
    "boolean": bool,
    "null": type(None),
}


def pasuje_typ(wartosc, typ):
    if typ == "integer":
        return isinstance(wartosc, int) and not isinstance(wartosc, bool)
    if typ == "number":
        return isinstance(wartosc, (int, float)) and not isinstance(wartosc, bool)
    return isinstance(wartosc, TYPY[typ])


def waliduj(w, s, sciezka="$"):
    """Zwraca listę błędów (pustą, jeśli wartość pasuje do schematu)."""
    out = []
    if "anyOf" in s:
        warianty = [waliduj(w, sub, sciezka) for sub in s["anyOf"]]
        if all(warianty):
            out.append(f"{sciezka}: nie pasuje do żadnego wariantu ({warianty[0][0]})")
        return out
    typ = s.get("type")
    if typ is not None:
        typy = typ if isinstance(typ, list) else [typ]
        if not any(pasuje_typ(w, t) for t in typy):
            return [f"{sciezka}: oczekiwano {'/'.join(typy)}, jest {type(w).__name__}"]
    if "const" in s and w != s["const"]:
        out.append(f"{sciezka}: musi być {s['const']!r}")
    if "enum" in s and w not in s["enum"]:
        out.append(f"{sciezka}: {w!r} spoza {s['enum']}")
    if isinstance(w, str):
        if len(w) < s.get("minLength", 0):
            out.append(f"{sciezka}: pusty tekst")
        if "pattern" in s and not re.search(s["pattern"], w):
            out.append(f"{sciezka}: {w!r} nie pasuje do {s['pattern']}")
    if isinstance(w, (int, float)) and not isinstance(w, bool):
        if "minimum" in s and w < s["minimum"]:
            out.append(f"{sciezka}: {w} < {s['minimum']}")
        if "maximum" in s and w > s["maximum"]:
            out.append(f"{sciezka}: {w} > {s['maximum']}")
    if isinstance(w, list):
        if len(w) < s.get("minItems", 0):
            out.append(f"{sciezka}: za mało elementów ({len(w)} < {s['minItems']})")
        if "maxItems" in s and len(w) > s["maxItems"]:
            out.append(f"{sciezka}: za dużo elementów ({len(w)} > {s['maxItems']})")
        if "items" in s:
            for i, el in enumerate(w):
                out += waliduj(el, s["items"], f"{sciezka}[{i}]")
    if isinstance(w, dict):
        wlasciwosci = s.get("properties", {})
        for klucz in s.get("required", []):
            if klucz not in w:
                out.append(f"{sciezka}: brak pola „{klucz}”")
        for klucz, wartosc in w.items():
            if klucz in wlasciwosci:
                out += waliduj(wartosc, wlasciwosci[klucz], f"{sciezka}.{klucz}")
            elif s.get("additionalProperties") is False:
                out.append(f"{sciezka}: nieznane pole „{klucz}”")
    return out


# ─── 2. Pomocnicze: tabele markdownu (tylko w tym skrypcie — strona ich nie czyta) ────

def sekcja(tekst, naglowek):
    """Tekst od nagłówka zaczynającego się od `naglowek` do następnego nagłówka tego samego poziomu."""
    m = re.search(rf"(?m)^(#+) {re.escape(naglowek)}.*$", tekst)
    if not m:
        return None
    poziom = len(m.group(1))
    reszta = tekst[m.end():]
    koniec = re.search(rf"(?m)^#{{1,{poziom}}} ", reszta)
    return reszta[: koniec.start()] if koniec else reszta


def wiersze(tekst):
    for linia in tekst.splitlines():
        if linia.startswith("|") and not re.match(r"^\|\s*-", linia):
            yield [k.strip() for k in linia.strip().strip("|").split("|")]


def czysty(tekst):
    """Tekst bez formatowania markdownu — do porównań."""
    tekst = re.sub(r"[*`_]", "", tekst)
    return re.sub(r"\s+", " ", tekst).strip()


def ulamek(tekst):
    m = re.search(r"(\d+(?:,\d+)?)\s*/\s*(\d+)", tekst)
    return (float(m.group(1).replace(",", ".")), int(m.group(2))) if m else None


# ─── 3. Sprawdzenia ──────────────────────────────────────────────────────────────────

def sprawdz_schemat(kurs):
    if not SCHEMAT.exists():
        blad("brak data/kurs.schema.json — uruchom `npm run schemat` w app/")
        return False
    lista = waliduj(kurs, json.loads(SCHEMAT.read_text(encoding="utf-8")))
    for b in lista[:15]:
        blad(f"schemat: {b}")
    if len(lista) > 15:
        blad(f"schemat: … i {len(lista) - 15} więcej")
    if not lista:
        sprawdzone("schemat data/kurs.schema.json")
    return not lista


def sprawdz_reguly(k):
    sesje = k["sesje"]
    nry = [s["nr"] for s in sesje]
    if nry != list(range(nry[0], nry[0] + len(nry))):
        blad(f"sesje nie idą po kolei: {nry}")
    daty = [s["data"] for s in sesje]
    if daty != sorted(daty):
        blad("daty sesji nie rosną razem z numerami")
    for s in sesje:
        wp = s["wolna_produkcja"]
        pom = [("wolna_produkcja", wp)] + [(n, s["pomocnicze"][n]) for n in ("drill", "luki", "lesen")]
        for nazwa, p in pom:
            if p and p["poprawne"] > p["n"]:
                blad(f"sesja {s['nr']}: {nazwa} — poprawne ({p['poprawne']}) > n ({p['n']})")
    ostatnia = nry[-1]
    if k["stan_na"]["po_sesji"] != ostatnia:
        blad(f"stan_na.po_sesji = {k['stan_na']['po_sesji']}, a ostatnia sesja w kurs.json to {ostatnia}")
    if k["nastepna_sesja"]["nr"] != ostatnia + 1:
        blad(f"nastepna_sesja.nr = {k['nastepna_sesja']['nr']}, powinno być {ostatnia + 1}")
    cykl = k["cel_cyklu"]["aktualny"]["sesje"]
    if cykl != list(range(cykl[0], cykl[0] + 3)):
        blad(f"cel cyklu obejmuje 3 KOLEJNE sesje, jest {cykl}")
    if len(k["luki"]["active"]) > 3:
        blad(f"Active: {len(k['luki']['active'])} pozycji — maks. 3")
    ids = {t["id"] for t in k["tematy"]}
    for s in sesje:
        for t in s["tematy_gramatyczne"]:
            if t not in ids:
                blad(f"sesja {s['nr']}: temat „{t}” nie istnieje w `tematy`")
    harm = [h["nr"] for h in k["harmonogram"]["sesje"]]
    etap1 = next((e for e in k["kurs"]["etapy"] if e["nr"] == 1), None)
    if etap1 and etap1["sesje"]:
        oczek = list(range(etap1["sesje"]["od"], etap1["sesje"]["do"] + 1))
        if harm != oczek:
            blad(f"harmonogram Etapu 1 ma sesje {harm[:3]}…{harm[-3:]}, oczekiwano {oczek[0]}–{oczek[-1]} po kolei")
    if not bledy:
        sprawdzone(f"reguły: sesje 1–{ostatnia} po kolei, następna = {ostatnia + 1}, Active ≤ 3")


def sprawdz_progress(k):
    tekst = (REPO / "PROGRESS.md").read_text(encoding="utf-8")
    log = sekcja(tekst, "Log sesji")
    if log is None:
        return blad("PROGRESS.md: brak sekcji „Log sesji”")
    naglowek, *reszta = list(wiersze(log))
    kol_wp = next((i for i, n in enumerate(naglowek) if "Wolna produkcja" in n), None)
    kol_anki = next((i for i, n in enumerate(naglowek) if "Anki" in n), None)
    log_sesje = {}
    for w in reszta:
        m = re.fullmatch(r"\**(\d+)\**", w[0])
        if m:
            log_sesje[int(m.group(1))] = w
    if not log_sesje:
        return blad("PROGRESS.md: pusta tabela „Log sesji”")

    max_md, max_json = max(log_sesje), k["sesje"][-1]["nr"]
    if max_md != max_json:
        blad(f"ostatnia sesja: PROGRESS.md → Log sesji = {max_md}, data/kurs.json = {max_json}")
    else:
        sprawdzone(f"ostatnia sesja = {max_json} (PROGRESS.md → Log sesji)")

    rozne = 0
    for s in k["sesje"]:
        w = log_sesje.get(s["nr"])
        if w is None:
            blad(f"sesja {s['nr']} jest w kurs.json, a nie ma jej w PROGRESS.md → Log sesji")
            rozne += 1
            continue
        if w[1] != s["data"]:
            blad(f"sesja {s['nr']}: data {s['data']} ≠ {w[1]} w PROGRESS.md")
            rozne += 1
        if kol_wp is not None:
            md = ulamek(w[kol_wp])
            wp = s["wolna_produkcja"]
            js = (wp["poprawne"], wp["n"]) if wp else None
            if (md is None) != (js is None) or (md and js and (md[0] != js[0] or md[1] != js[1])):
                blad(f"sesja {s['nr']}: 🟢 wolna produkcja w kurs.json = {js and f'{js[0]}/{js[1]}'}, "
                     f"w PROGRESS.md = {md and f'{md[0]:g}/{md[1]}'}")
                rozne += 1
    if not rozne:
        sprawdzone(f"data i 🟢 wolna produkcja sesji 1–{max_json} jak w PROGRESS.md")

    # Słowa w Anki — log ↔ kurs.json ↔ TSV
    anki = k["sesje"][-1]["anki"]
    if kol_anki is not None and anki:
        md = re.search(r"(\d+)", log_sesje.get(max_json, [""] * 10)[kol_anki] or "")
        if md and int(md.group(1)) != anki["slowa"]:
            blad(f"słowa w Anki po sesji {max_json}: PROGRESS.md = {md.group(1)}, kurs.json = {anki['slowa']}")
    tsv = 0
    for p in sorted((REPO / "anki" / "wordlists").glob("*.tsv")):
        linie = [l for l in p.read_text(encoding="utf-8").splitlines()[1:] if l.strip()]
        tsv += len(linie)
    if anki and tsv != anki["slowa"]:
        blad(f"słowa w Anki: anki/wordlists/*.tsv = {tsv}, kurs.json (sesja {max_json}) = {anki['slowa']}")
    elif anki:
        sprawdzone(f"słowa w Anki = {tsv} (TSV, PROGRESS.md, kurs.json)")

    # Cel cyklu — ten sam w obu miejscach
    cykl_md = sekcja(tekst, "📅 Cel cyklu")
    akt = k["cel_cyklu"]["aktualny"]
    if cykl_md is None:
        blad("PROGRESS.md: brak sekcji „📅 Cel cyklu”")
    else:
        wiersz = next((w for w in wiersze(cykl_md) if re.search(r"Sesje\s+\d", w[0])), None)
        if wiersz is None:
            blad("PROGRESS.md: w „Cel cyklu” nie ma wiersza „Sesje N · N · N”")
        else:
            nry = [int(x) for x in re.findall(r"\d+", wiersz[0])]
            if nry != akt["sesje"]:
                blad(f"cel cyklu: sesje {nry} w PROGRESS.md ≠ {akt['sesje']} w kurs.json")
            elif czysty(wiersz[1]) != czysty(akt["cel"]):
                blad(f"cel cyklu: „{czysty(wiersz[1])}” w PROGRESS.md ≠ „{czysty(akt['cel'])}” w kurs.json")
            elif czysty(wiersz[2]) != czysty(akt["warunek"]):
                blad("cel cyklu: warunek zaliczenia różni się od PROGRESS.md")
            else:
                sprawdzone(f"cel cyklu {'·'.join(map(str, nry))} — ten sam cel i warunek")

    # Termin egzaminu — jeśli ustalony, musi stać w PROGRESS.md
    egz = k["egzamin"]
    wiersz = next((w for w in wiersze(sekcja(tekst, "🎓 Egzamin") or "") if w[0] == "Termin"), None)
    if wiersz and egz["termin"]:
        r, m, d = egz["termin"].split("-")
        if egz["termin"] not in wiersz[1] and f"{int(d)}.{m}.{r}" not in wiersz[1] and f"{d}.{m}.{r}" not in wiersz[1]:
            blad(f"termin egzaminu {egz['termin']} nie stoi w PROGRESS.md → Egzamin → Termin")
    elif wiersz and not egz["termin"] and re.search(r"\d{1,2}\.\d{1,2}\.\d{4}|\d{4}-\d{2}-\d{2}", wiersz[1]):
        blad("PROGRESS.md → Egzamin → Termin ma datę, a kurs.json → egzamin.termin = null")


def sprawdz_gaps(k):
    tekst = (REPO / "GAPS.md").read_text(encoding="utf-8")
    active = sekcja(tekst, "Active")
    if active is None:
        return blad("GAPS.md: brak sekcji „Active”")
    nry = [int(n) for n in re.findall(r"(?m)^### (\d+)\.", active)]
    if len(nry) > 3:
        blad(f"GAPS.md: {len(nry)} pozycji Active — maks. 3")
    js = [a["nr"] for a in k["luki"]["active"]]
    if nry != js:
        blad(f"Active: GAPS.md ma pozycje {nry}, kurs.json {js}")
    else:
        sprawdzone(f"Active: {len(js)} pozycje, te same numery co w GAPS.md")
    m = re.search(r"Stan na:\s*(\d{4}-\d{2}-\d{2}),\s*po sesji\s*(\d+)", tekst)
    if m and int(m.group(2)) != k["stan_na"]["po_sesji"]:
        blad(f"GAPS.md jest „po sesji {m.group(2)}”, kurs.json po sesji {k['stan_na']['po_sesji']}")


def sprawdz_pliki(k):
    sciezki = []
    for s in k["sesje"]:
        sciezki += [s["draft"], s["lekcja"]]
    sciezki += [k["nastepna_sesja"]["lekcja"], k["harmonogram"]["zrodlo"], k["poziom"]["rozumienie"]["plik"],
                k["poziom"]["produkcja"]["plik"]]
    sciezki += [t["plik"] for t in k["tematy"]] + [e["plan"] for e in k["kurs"]["etapy"]]
    brak = [p for p in sciezki if p and not (REPO / p).is_file()]
    for p in brak:
        blad(f"kurs.json wskazuje na plik, którego nie ma: {p}")
    for t in k["teksty"]:
        plik = REPO / t["plik"]
        if not plik.is_file():
            blad(f"tekst „{t['tytul']}”: brak pliku {t['plik']}")
        elif t["naglowek"] not in plik.read_text(encoding="utf-8"):
            blad(f"tekst „{t['tytul']}”: w {t['plik']} nie ma linii z „{t['naglowek']}”")
    if not brak:
        sprawdzone("pliki wskazane w kurs.json istnieją")


def main():
    try:
        kurs = json.loads(KURS.read_text(encoding="utf-8"))
    except FileNotFoundError:
        sys.exit("❌ Brak data/kurs.json")
    except json.JSONDecodeError as e:
        sys.exit(f"❌ data/kurs.json to niepoprawny JSON: {e}")

    print("Sprawdzam data/kurs.json — schemat, reguły i zgodność z PROGRESS.md, GAPS.md, TSV.\n")
    if sprawdz_schemat(kurs):
        sprawdz_reguly(kurs)
        sprawdz_progress(kurs)
        sprawdz_gaps(kurs)
        sprawdz_pliki(kurs)

    for m in ok:
        print(f"  ✅ {m}")
    for m in bledy:
        print(f"  ❌ {m}")
    if bledy:
        print(f"\n❌ {len(bledy)} problemów — popraw data/kurs.json albo markdown, zanim zrobisz commit.")
        sys.exit(1)
    print("\n✅ Dane pulpitu zgodne z kursem.")


if __name__ == "__main__":
    main()
