# Metodyka — na czym opiera się protokół *(research 2026-09-28)*

> `CLAUDE.md` mówi **co** robić. Ten plik mówi, **dlaczego tak**, i na jakie badania to się
> powołuje. Zmieniasz zasadę w protokole — sprawdź najpierw tutaj, czy nie łamiesz czegoś,
> co ma dowody.

---

## 1. Cel kursu: Fachsprachprüfung, nie „jakieś B2”

**Ustalenia:**
- Lekarz z **dyplomem z UE** ma kwalifikacje uznawane automatycznie, ale do **Approbation**
  w Niemczech i tak musi zdać **Fachsprachprüfung (FSP)** w izbie lekarskiej *(Landesärztekammer)*.
  Warunkiem dopuszczenia jest zwykle **ogólne B2** (certyfikat), a sam egzamin sprawdza
  **C1 w języku zawodowym**.
- **FSP = 60 minut, trzy części po 20 minut:**
  1. **Anamnesegespräch** — wywiad z aktorem-pacjentem *(dane, skargi, choroby, leki, alergie,
     wywiad socjalny i rodzinny)*;
  2. **Dokumentation** — pisemny zapis wywiadu w formularzu, pełnymi zdaniami, po niemiecku;
  3. **Arzt-Arzt-Gespräch** — przekazanie pacjenta lekarzowi z komisji, zwięźle, z terminologią.
- W dokumentacji relację pacjenta pisze się **w Konjunktiv I** *(„Der Patient berichtet, er habe
  seit drei Tagen Schmerzen”)* — mowa zależna, bez oceny prawdziwości.
- Alternatywa: **telc Deutsch B2·C1 Medizin** — część pisemna + ustna: rozmowa z pacjentem,
  pisemne opracowanie, prezentacja przypadku.

**Konsekwencje dla kursu** *(wpisane do `PLAN.md`)*:
- blok 4 odtwarza trzy części FSP; sesja 30 to **mini-FSP**, nie „15 minut rozmowy”;
- **Konjunktiv I** przestaje być „świadomie pominięty” — wchodzi w formach potrzebnych
  w dokumentacji (`habe, sei, könne, müsse, nehme, gebe`);
- ⚠️ **do potwierdzenia z Jakubem:** który egzamin i w jakim horyzoncie *(`PROFILE.md` → Cel)*.

Źródła: [Ärztekammer Nordrhein — Fachsprachprüfung](https://www.aekno.de/aerzte/fachsprachpruefung) ·
[Sächsische Landesärztekammer](https://www.slaek.de/de/arzt/auslaendische-aerzte/fachsprachenpruefung.php) ·
[Ärztekammer Berlin](https://www.aekb.de/aerzt-innen/aus-dem-ausland-ins-ausland/fachsprachpruefung) ·
[Marburger Bund — Anforderungen an Deutschkenntnisse](https://www.marburger-bund.de/bundesverband/service/auslaendische-aerzte/foreign-physicians/anforderungen-deutschkenntnisse) ·
[AMBOSS — Approbation in Deutschland](https://www.amboss.com/de/approbation-in-deutschland) ·
[telc Deutsch B2·C1 Medizin](https://www.telc.net/en/language-examinations/certificate-exams/german/telc-german-b2-c1-medical/) ·
[telc — Übungstest FSP (PDF)](https://telc.hu/wp-content/uploads/2023/01/telc_deutsch_b2-c1_medizin_fachsprachpruefung_uebungstest_1.pdf) ·
[Arztbrief in der FSP](https://fachsprachemedizin.de/arztbrief-schreiben/)

---

## 2. Rundy tej samej historii — z korektą w środku, nie tylko z coraz krótszym czasem

**Ustalenia:**
- Klasyczne **4/3/2** *(ta sama wypowiedź trzy razy, coraz krócej)* poprawia **płynność**, ale
  **nie poprawność** — uczący się powtarzają pierwszą wersję słowo w słowo, razem z błędami
  *(Boers 2014; Thai & Boers 2016)*.
- Przy **stałym czasie** płynność rośnie trochę mniej, ale pojawiają się **drobne zyski
  w poprawności** *(Thai & Boers 2016)*.
- Dodanie **korekty metajęzykowej w trakcie** 4/3/2 dało zyski **i w płynności, i w poprawności**
  *(Tran i in. 2021)*. Autorzy: okazję do poprawki trzeba dać **wcześnie w sekwencji**.

**Konsekwencja:** wąskim gardłem Jakuba jest **poprawność pod obciążeniem**, nie płynność —
więc rundy w bloku 5 mają **korektę między rundą 1 a 2**, runda 2 ma **ten sam czas**, a presja
czasu przychodzi dopiero w rundzie 3, która jest pomiarem.

Źródła: [Boers 2014 — A Reappraisal of the 4/3/2 Activity](https://consensus.app/papers/details/cc919da40d3f535cbe66528cfde64b4a/?utm_source=claude_desktop) ·
[Thai & Boers 2016 — Repeating a Monologue Under Increasing Time Pressure](https://consensus.app/papers/details/f5c5529e98f351f388e6067d6d180107/?utm_source=claude_desktop) ·
[Tran i in. 2021 — Effects of the 4/3/2 activity revisited](https://consensus.app/papers/details/0bfb025e2b07554d86fa82a7b9ee5803/?utm_source=claude_desktop) ·
[De Jong 2018 — Grammatical structures and oral fluency in immediate task repetition](https://consensus.app/papers/details/a2eeadaf13835044bbf60b42a8285209/?utm_source=claude_desktop)

---

## 3. Korekta: prompt, a gdy nie działa — krótka reguła

**Ustalenia:**
- **Rodzaj gramatyczny** *(francuski)*: nauka końcówek, które przewidują rodzaj, była
  **najskuteczniejsza w połączeniu z promptami** *(uczeń poprawia sam)* — lepiej niż z recastami
  albo bez korekty *(Lyster 2004)*.
- **Korekta jawna z wyjaśnieniem reguły** dała lepsze wyniki niż recast, także w teście wiedzy
  niejawnej *(Ellis, Loewen & Erlam 2006)*.
- U dorosłych na średnim poziomie **oba typy działały podobnie** *(Lyster & Izquierdo 2009)*;
  prompty przewyższały recasty szczególnie u słabszych w danej strukturze *(Ammar & Spada 2006)*.
- W klasie recasty to ok. 57 % wszystkich korekt *(Brown 2016)* — łatwo w nie popaść z nawyku.

**Konsekwencja:** dla struktury dnia — **prompt** (`Der, die oder das?`); jeśli nie poprawi —
**jedno zdanie reguły** (`Schrank — jednosylabowy → der`); dopiero potem poprawna forma.
Dla reszty — recast. Zgodne z danymi samego kursu: recasting 4 miesiące nie ruszył
zafosylizowanych zwrotów, rozbiór wprost — w jedną sesję.

Źródła: [Lyster 2004 — Differential effects of prompts and recasts in form-focused instruction](https://consensus.app/papers/details/0dc8c9da1fdc5387ad0d59c94b619ba7/?utm_source=claude_desktop) ·
[Ellis, Loewen & Erlam 2006 — Implicit and explicit corrective feedback](https://consensus.app/papers/details/79c518ed29a45993a72a550348cc49d0/?utm_source=claude_desktop) ·
[Lyster & Izquierdo 2009 — Prompts versus recasts in dyadic interaction](https://consensus.app/papers/details/aa6b4f98a9af5fdb9e2aa4c4ec6e5955/?utm_source=claude_desktop) ·
[Ammar & Spada 2006 — One size fits all?](https://consensus.app/papers/details/214670cd058a51b88cfc0389ca00b2f3/?utm_source=claude_desktop) ·
[Brown 2016 — meta-analiza typów korekty w klasie](https://consensus.app/papers/details/b9c4b549c1b052de98500da10872d58a/?utm_source=claude_desktop)

---

## 4. Rodzaj rzeczownika — fundament, nie szczegół

**Ustalenia:**
- U dorosłych uczących się niemieckiego **trafność przypisania rodzaju przewiduje** poprawne
  przetwarzanie zgodności w całej grupie *(Hopp 2013)*; trening rodzaju poprawia przetwarzanie,
  ale tylko w takim stopniu, w jakim rodzaj jest znany *(Hopp 2016)*.
  → **To jest dokładnie diagnoza sesji 9.**
- Uczący się **przenoszą rodzaj z odpowiednika w innym języku** i nadużywają najczęstszych form
  *(Ecke 2022)*. U Polaków z L2 niemieckim widać wzajemny wpływ rodzajów polskiego i niemieckiego
  *(Długosz 2023)*. → lista słów z niezgodnym rodzajem PL/DE w `grammar/05-genus.md`.
- Uczący się L2 **są wrażliwi na końcówki** — rzeczowniki z typową końcówką przetwarzają
  szybciej *(Bordag i in. 2006)*. Reguły końcówek mają sens.
- Nauczanie przez **przetwarzanie inputu** *(trzeba użyć rodzajnika, żeby zrozumieć zdanie)*
  dało lepsze wyniki od kolorów i zapamiętywania — ale efekt nie utrzymał się w teście
  odroczonym *(Henry 2022)*. → sama instrukcja nie wystarczy; potrzebne powtarzanie.
- Wiarygodność reguł *(Köpcke & Zubin 1996 i zestawienia słownikowe)*: przyrostki `-ung/-heit/-keit`
  ~100 % · `-e` → żeński ok. 90 % · jednosylabowe → męski ok. ⅔ · `-er` → męski > 70 %.

Źródła: [Hopp 2013](https://consensus.app/papers/details/ac41503987095314aaf3f472cd793d1d/?utm_source=claude_desktop) ·
[Hopp 2016](https://consensus.app/papers/details/5688cd78fc8d5c648836ff00cd193e24/?utm_source=claude_desktop) ·
[Ecke 2022](https://consensus.app/papers/details/cdc24674b1e95e55b5f6ce08e0585714/?utm_source=claude_desktop) ·
[Długosz 2023](https://consensus.app/papers/details/41b417c8cd8c59c291218d92d477804f/?utm_source=claude_desktop) ·
[Bordag i in. 2006](https://consensus.app/papers/details/17845712af4a529e8c0467c835623603/?utm_source=claude_desktop) ·
[Henry 2022](https://consensus.app/papers/details/91a378a8c1f3581e82a33741ae956cb2/?utm_source=claude_desktop) ·
[Köpcke & Zubin 1996 — Prinzipien für die Genuszuweisung im Deutschen (PDF)](https://ids-pub.bsz-bw.de/files/8944/Koepcke_Zubin_Prinzipien_fuer_die_Genuszuweisung_im_Deutschen_1996.pdf) ·
[Zestawienie statystyk rodzaju](https://yourdailygerman.com/german-gender-statistics/)

---

## 5. Fiszki: dlaczego karta zdaniowa

**Ustalenia:**
- Efekt wydobywania z pamięci **słabnie, gdy test ma inny format niż ćwiczenie** *(Barenberg i in. 2021)* —
  fiszka ze słowem ≠ zdanie w rozmowie. → sesja 9: Anki 94 %, produkcja 58 %.
- **Zadania produktywne** *(tłumaczenie zdań, pisanie zdań)* dają wyższą wiedzę produktywną
  niż receptywne; zyski z powtórzeń maleją po kilku pierwszych wydobyciach *(Teng i in. 2022)*.
- Ćwiczenia słówkowe mają duże straty w teście odroczonym, zwłaszcza w **przywoływaniu formy**
  *(Webb i in. 2020)*.

**Konsekwencja:** karty zdaniowe PL → DE w talii; DE → PL zawieszone; fiszki na sesji to
pary kontrastowe w zdaniach.

Źródła: [Barenberg i in. 2021 — Testing and transfer](https://consensus.app/papers/details/1d91ff48d0b75a14bd212ade5e7a6cda/?utm_source=claude_desktop) ·
[Teng i in. 2022 — From receptive to productive mastery](https://consensus.app/papers/details/285b5913dd9b5ef8b2264c0bd140fb6b/?utm_source=claude_desktop) ·
[Webb i in. 2020 — meta-analiza ćwiczeń słownictwa](https://consensus.app/papers/details/61a6bb292068583eb1db3c3e84486a8a/?utm_source=claude_desktop)

---

## Czego ten research NIE rozstrzyga

- Jak duże efekty dadzą te zmiany **u Jakuba** — badania dotyczą grup; kurs ma własny pomiar
  *(wolna produkcja, `PROGRESS.md`)* i on decyduje.
- Czy cel to FSP w Niemczech, czy coś innego *(Austria, telc Medizin, tylko B2)* — trzeba zapytać.
