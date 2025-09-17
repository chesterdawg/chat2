


## Instructional Writing Style (Locked)

## Small-batch Build Flow (Locked)

**Goal:** Produce files in **very small batches** so each set is correct, reviewable, and free of placeholders.

**Batch size:** 3–5 files per batch (docs + paired JSONs).  
**Order:** Follow the batch breakdown below (top to bottom).  
**Style:** High-school-friendly, plain English. **No placeholders** (no “to-be-decided/PLACEHOLDER/Lorem/Sample/Test only/???/xxx”).  
**Required doc structure:** Title + Sprint/Task + Audience + Estimated time + Outcome; then **What / Why / How / Verify / Troubleshoot / Acceptance Criteria**.

### Per-batch Checklist (run every time)
- Draft all docs in the required style and depth (no scaffolding text).  
- Fill JSONs with **concrete values**; leave unknown lists empty (e.g., `[]`) rather than inventing text.  
- Run: `python ci/doc_completeness_check.py` → must pass.  
- Run: `npm run lint` and `npm run typecheck` → must pass.  
- If UI changes exist, confirm a11y rules catch/fix issues.  
- Open PR with the batch title and the batch acceptance checklist.

### Batch Breakdown (by sprint)

**Sprint 0 — Foundation & Quality Rails**  
- **Batch A:** `setup_03_git_repo_part1.md`, `setup_04_code_quality_part1_eslint_prettier.md`, `setup_05_accessibility_baseline.md` + `configs/quality/*.json`, `configs/ci/pipeline.json`  
- **Batch B:** `setup_01_nodejs_part2.md`, `setup_02_kiro_install_part1.md`  
- **Batch C:** `setup_06_security_baseline.md`, `setup_07_ci_baseline.md` + `configs/security/baseline.json`, `configs/kiro/project.json`, `configs/kiro/steering-rules.json`

**Sprint 1 — Vertical Slice RAG**  
- **Batch A:** `content_01_sources_pilot.md`, `content_02_scraper_minimal.md`, `ai_01_embeddings_pgvector.md` + `configs/sources/allowlist.json`, `configs/scraper/rules.min.json`, `configs/processing/markdown.json`, `configs/rag/embedding.config.json`  
- **Batch B:** `ai_02_rag_api_minimal.md`, `frontend_01_chat_minimal.md` + `configs/rag/pipeline.min.json`, `configs/security/domain-guard.json`

**Sprint 2 — Widget & UX**  
- **Batch A:** `design_01_tokens_and_theme.md`, `frontend_02_widget_embed.md` + `configs/widget/theme.tokens.json`, `configs/widget/embed.config.json`  
- **Batch B:** `frontend_03_widget_a11y.md`, `ops_01_analytics_minimal.md` + `configs/a11y/checks.json`, `configs/analytics/events.json`

**Sprint 3 — Content Pipeline & Refresh**  
- **Batch A:** `content_03_source_expansion.md`, `content_04_refresh_job.md` + `configs/sources/expansion.rules.json`, `configs/pipeline/refresh.schedule.json`  
- **Batch B:** `content_05_ingest_resilience.md` + `configs/pipeline/cleaning.rules.json`

**Sprint 4 — Multi-Tenant & Security Hardening**  
- **Batch A:** `platform_01_multitenancy.md`, `platform_02_domain_allowlist.md` + `configs/tenants/schema.json`, `configs/tenants/provisioning.json`  
- **Batch B:** `platform_03_rate_limit.md`, `ops_02_monitoring_and_perf.md`, `ops_03_secrets_and_envs.md` + `configs/security/rate-limit.json`, `configs/security/headers.json`, `configs/observability/monitoring.config.json`, `configs/perf/budgets.json`

**Sprint 5 — QA, Compliance & Legal**  
- **Batch A:** `qa_01_test_plan_and_setup.md`, `qa_02_ai_guardrails.md` + `configs/qa/test.plan.json`, `configs/qa/a11y.matrix.json`, `configs/ai/guardrails.json`  
- **Batch B:** `legal_01_privacy_terms.md`, `compliance_01_ndis_wcag_checklist.md` + `configs/legal/*.json`, `configs/compliance/ndis_wcag.checklist.json`

**Sprint 6 — Beta Deploy & Internal Pilot**  
- **Batch A:** `deploy_01_aws_kiro.md`, `deploy_02_database_ops.md` + `configs/deploy/env.prod.json`, `configs/deploy/infrastructure.json`, `configs/backup/*.json`  
- **Batch B:** `ops_04_runbooks.md`, `biz_01_onboarding_checklist.md` + `configs/ops/runbooks.json`, `configs/onboarding/checklist.json`

**Sprint 7 — Optimisation & Scale (Optional)**  
- **Batch A:** `opt_01_performance_and_caching.md` + `configs/perf/caching.json`, `configs/perf/budgets.scale.json`  
- **Batch B:** `opt_02_content_growth_playbook.md`, `opt_03_ai_enhancements.md` + `configs/content/quality.sampling.json`, `configs/roadmap/vector_adapters.json`

**Audience:** High school student (non-technical).  
**Tone:** Educational, friendly, plain English. Avoid jargon.  
**Structure for every instructional doc:**  
- Title + Sprint/Task + Audience + Estimated time + Outcome  
- **What** (one short paragraph)  
- **Why** (business + technical reasons)  
- **How** (numbered, copy‑paste steps; exact file paths; expected outputs)  
- **Verify** (simple commands or checks anyone can run)  
- **Troubleshoot** (top 5 failure cases + quick fixes)  
- **Acceptance Criteria** (objective tick‑box list)

**Musts:**  
- No placeholders (“to-be-decided/PLACEHOLDER/Lorem/Sample/Test only/???/xxx”).  
- Keep commands copy‑paste safe; show what “good” output looks like.  
- Name files and folders exactly as in the repo.  
- No secrets or PII in docs, examples, or logs.

