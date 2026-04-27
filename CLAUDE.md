# CLAUDE.md — Project Floor Plan

## What This Project Is

German learning workspace for Jakub — a medical student targeting conversational fluency and German medical exams. Every session is a natural conversation in German, calibrated to active gaps tracked in GAPS.md.

---

## Folder & File Structure

```
/Niemiec
├── CLAUDE.md       ← you are here — read first, every time
├── CONTEXT.md      ← session rules: what good looks like, what to avoid
├── GAPS.md         ← live gap tracker: active errors, watching list, closed
└── /drafts/        ← conversation drafts (one file per session)
```

### Naming convention for /drafts files

```
YYYY-MM-DD_topic-slug.md
```

Examples:
- `2026-04-27_arztbesuch.md`
- `2026-04-28_wochenende-plaene.md`

---

## Task Routing Table

| Task | Read | Update | Skip |
|------|------|--------|------|
| Start a new session | GAPS.md, CONTEXT.md | /drafts (new file) | — |
| Mid-session correction | GAPS.md | — | CONTEXT.md |
| End-of-session debrief | GAPS.md | GAPS.md (session log + gaps) | /drafts |
| Review progress | GAPS.md | — | CONTEXT.md, /drafts |
| Adjust session rules | CONTEXT.md | CONTEXT.md | GAPS.md |

---

## Rules

- Read this file first on every new task
- Always read GAPS.md before starting a session — never skip it
- Draft files go in /drafts only; ask before creating files elsewhere
- Update GAPS.md at the end of every session (session log row + gap status)
- When unsure, ask
