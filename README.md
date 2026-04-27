# Niemiec

Prywatny tutor niemieckiego dla Jakuba. Sesje rozmowy po niemiecku w UI à la ChatGPT, automatyczne śledzenie luk wiedzy w `GAPS.md`, planowanie kolejnych lekcji.

## Co robi

- **Rozmowa po niemiecku** z modelem Claude — recasting zamiast lecturing, krótkie odpowiedzi, follow-up questions.
- **Wykrywanie luk** — po każdej sesji aktualizuje `GAPS.md` (Active / Watching / Closed + Session Log).
- **Plan na następną sesję** — Claude proponuje temat i 3-5 punktów wycelowanych w aktualne luki.
- **Mowa** — mikrofon (de-DE → tekst) i czytanie odpowiedzi na głos (Web Speech API w przeglądarce).
- **Wszystko w GitHub** — drafty rozmów lądują w `drafts/`, zmiany `GAPS.md` to commity.

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
├── CLAUDE.md         ← instrukcje projektu (czytane przez aplikację)
├── CONTEXT.md        ← zasady sesji
├── GAPS.md           ← live tracker luk (aplikacja tu pisze)
└── drafts/           ← pełne transkrypty sesji (aplikacja tu pisze)
    └── YYYY-MM-DD_topic-slug.md
```

## Jak działa cykl sesji

1. Otwierasz appkę → fetchuje `CLAUDE.md`, `CONTEXT.md`, `GAPS.md` + 3 ostatnie drafty z repo.
2. Buduje system prompt → Claude rozpoczyna rozmowę po niemiecku, celując w top active gaps.
3. Rozmawiasz (tekst lub mowa).
4. Klikasz **Zakończ sesję** → Claude generuje:
   - Draft sesji (transkrypt + 2-3 pattern notes + słownictwo)
   - Nową treść `GAPS.md` (przesunięcia Active/Watching/Closed + Session Log)
   - Plan na następną sesję (zapisywany lokalnie, użyty przy następnym otwarciu)
   - Krótki raport postępów
5. Sprawdzasz, edytujesz jeśli trzeba, klikasz **Zatwierdź** → commit do GitHuba.

## Bezpieczeństwo

- Tokeny w `localStorage` przeglądarki. Jeśli używasz wspólnego komputera — kliknij ⚙️ → wyloguj.
- `index.html` używa nagłówka `anthropic-dangerous-direct-browser-access: true` — to oficjalny sposób Anthropic na bezpośrednie wołanie API z przeglądarki. Świadomie akceptujesz, że klucz jest w przeglądarce.
- Nie commituj tokenu/klucza do repo. Aplikacja tego nie robi, ale uważaj.

## Lokalny dev

```bash
cd /Users/jakubbrzoska/Niemiec
python3 -m http.server 8000
# otwórz http://localhost:8000
```

## Limit rate / koszty

- Claude Sonnet 4.5: ~$0.003 / 1k input + $0.015 / 1k output. Sesja ~5-15 groszy.
- GitHub API: 5000 req/h dla zalogowanego użytkownika — nie do wyczerpania.
