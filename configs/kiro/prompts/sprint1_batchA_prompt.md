# Sprint 1 — Batch A Prompt (Paste into a new chat)

## Project
NDIS Support Chatbot — educational, high-school-friendly docs. **No placeholders** allowed.

## Batch Info
- Sprint: **S1 — Vertical Slice RAG**
- Batch: **Batch A**
- Files to produce (3):
  - `docs/content_01_sources_pilot.md` + `configs/sources/allowlist.json`
  - `docs/content_02_scraper_minimal.md` + `configs/scraper/rules.min.json`, `configs/processing/markdown.json`
  - `docs/ai_01_embeddings_pgvector.md` + `configs/rag/embedding.config.json`
- Goal: **Ingest a small set of official NDIS pages, clean to Markdown, embed with pgvector.**

## Rules (do not change)
(see Batch Build Prompt — same rules apply: high-school-friendly; no placeholders; exact structure; copy–paste commands; concrete JSON values)

## Validation
- `python ci/doc_completeness_check.py` → pass
- `npm run lint` and `npm run typecheck` → pass
- Ask → Answer smoke test (once Batch B is done)

## PR format
Title: `docs(s1-a): vertical slice — ingest & embed (3 files)`  
Checklist:
- [ ] 3 docs completed; no scaffolding text
- [ ] JSONs concrete; no placeholders
- [ ] Doc guard passed
- [ ] Lint & typecheck passed
- [ ] No secrets; no PII
