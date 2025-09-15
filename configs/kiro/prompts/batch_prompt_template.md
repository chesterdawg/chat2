# Batch Build Prompt (Paste into a new chat)

## Project
NDIS Support Chatbot — educational, high-school-friendly instructional docs. **No placeholders** allowed anywhere.

## Batch Info (fill these in)
- Sprint: <e.g., S1 — Vertical Slice RAG>
- Batch: <e.g., Batch A>
- Files to produce (3–5):
  - docs/<file-1>.md (+ any paired JSONs)
  - docs/<file-2>.md (+ any paired JSONs)
  - docs/<file-3>.md (+ any paired JSONs)
- Goal of this batch (one sentence):
  - <e.g., Get the vertical slice working: ingest → embed → answer with citations>

## Rules (do not change)
- Audience: **high school student**; Tone: **educational, friendly, plain English**.
- Doc structure for every file: Title + Sprint/Task + Audience + Estimated time + Outcome; then **What / Why / How / Verify / Troubleshoot / Acceptance Criteria**.
- **No placeholders** (no “TBD/PLACEHOLDER/Lorem/Sample/Test only/???/xxx”). If something isn’t known, leave lists empty (e.g., `[]`) or omit the key.
- Commands must be **copy–paste ready** and show **expected outputs** where helpful.
- Use the exact repo paths and filenames.
- JSONs must contain **concrete values**. Avoid dummy strings; empty arrays are fine for unknown lists.

## Deliverables
- Completed instructional docs for this batch in the required style and depth.
- Paired JSONs with concrete, valid values.
- A short note listing what changed and any assumptions made.

## Validation
- Run: `python ci/doc_completeness_check.py` → must pass.
- Run: `npm run lint` and `npm run typecheck` → must pass.
- If any UI is involved, run a quick a11y check (eslint-a11y; axe when applicable).

## PR format
Title: `docs(<sprint-lc>-<batch>): complete <N> files`  
Body checklist:
- [ ] Docs meet style/structure; **no scaffolding text remains**  
- [ ] JSONs are concrete; **no placeholders**  
- [ ] Doc guard passed  
- [ ] Lint & typecheck passed  
- [ ] No secrets; no PII in logs
