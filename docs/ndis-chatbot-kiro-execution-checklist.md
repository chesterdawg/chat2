# NDIS Chatbot — Kiro-First Execution Checklist (Master Tasks)

A single, ordered list of everything we need to execute from the latest review — optimized for **Kiro-first** development on our **Next.js + TypeScript + Postgres + pgvector** stack, deploying to **AWS**. Each task includes **Why → Steps → Commands → Acceptance Criteria**. Tick them off one by one.

> Legend: ✅ done · ☐ todo · 🔁 repeatable

---

## 0) How to use this checklist
- Work top-to-bottom — tasks unlock later ones.
- Keep branch `setup/kiro-integration` until Section 5 passes, then merge to `main`.
- After each section, run CI locally: `npm run lint && npm run typecheck && npm test` (once scaffolds exist).

---

## Section A — Repository Restructure & Hygiene

### REPO-1 — Flatten repo to canonical paths
**Why**: All docs, configs, and scripts must live in stable locations so Kiro and CI can target them.

**Steps**
1) Create folders:
   - `docs/` (all markdown guides)
   - `configs/` with subfolders: `a11y/ analytics/ ai/ compliance/ deploy/ pipeline/ rag/ security/ sources/ tenants/ kiro/ legal/`
   - `scripts/` and `ci/`
2) Move files from per-sprint folders into these canonical paths. Keep meaningful filenames (optionally prefix with `S#_` for traceability).
3) Remove zipped duplicates and platform cruft.

**Commands** (example – adjust patterns to your tree)
```bash
# create canonical folders
mkdir -p docs configs/{a11y,analytics,ai,compliance,deploy,pipeline,rag,security,sources,tenants,kiro,legal} scripts ci

# example moves (repeat for all)
git mv path/to/sprint*/**/*.md docs/ 2>/dev/null || true
# move JSON configs by topic (do in batches)
# e.g., allowlist / sources rules
find . -type f -path "*/sources/*" -name "*.json" -exec git mv -f {} configs/sources/ \;

# repeat for each config topic → configs/<topic>/

# delete archives & junk
git rm -r --cached --ignore-unmatch **/*.zip **/.DS_Store 2>/dev/null || true
```

**Acceptance Criteria**
- ☐ All `.md` live under `docs/` only
- ☐ All `.json` live under `configs/<topic>/` only
- ☐ No `*.zip` or `.DS_Store` tracked in git

---

### REPO-2 — Add .gitignore, README, LICENSE, SECURITY, CONTRIBUTING, CODEOWNERS
**Why**: Baseline hygiene + clarity for collaborators and CI.

**Steps**
1) Create `.gitignore`:
```
node_modules/
.next/
coverage/
*.log
*.zip
.DS_Store
.env*
```
2) Create `README.md` (purpose, stack, quickstart, folder map, CI badges later).
3) Add `LICENSE` (MIT or your choice).
4) Add `SECURITY.md` (how to report vulnerabilities; no PII policy).
5) Add `CONTRIBUTING.md` (branching, commit style, PR checks).
6) Add `CODEOWNERS` (optional) mapping areas to you for now.

**Acceptance Criteria**
- ☐ `.gitignore` prevents accidental secrets/junk
- ☐ `README.md` explains how to run dev and tests
- ☐ License & Security docs present

---

## Section B — Root App & Tooling Scaffold

### APP-1 — Root Node/Next.js scaffold
**Why**: CI, Kiro, and tests need a runnable project.

**Steps**
1) Create `package.json`:
```json
{
  "name": "ndis-chatbot",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "doc-guard": "node ci/doc-completeness.mjs",
    "a11y": "node scripts/a11y-check.mjs"
  },
  "devDependencies": {
    "@types/node": "^20",
    "eslint": "^9",
    "typescript": "^5",
    "vitest": "^1",
    "next": "^14"
  }
}
```
2) Add `tsconfig.json` (strict), `app/page.tsx` minimal page, and `app/api/health/route.ts` returning 200.
3) Add `eslint.config.mjs` and `prettier.config.cjs` with your baseline rules.
4) Add `env.example` with non-secret keys (e.g., `DATABASE_URL`, `VECTOR_BACKEND=pgvector`).

**Acceptance Criteria**
- ☐ `npm run dev` serves a page at `/`
- ☐ `npm run typecheck` passes
- ☐ `npm run lint` passes

---

### APP-2 — Minimal Widget placeholder (for a11y later)
**Why**: To enable a11y/Lighthouse once ready.

**Steps**
1) Add `app/widget/page.tsx` with basic chat container and ARIA-friendly controls (no functionality yet).
2) Export a tiny script `public/widget.js` that will later render the widget; include data-attrs for theme tokens.

**Acceptance Criteria**
- ☐ Route `/widget` renders without console errors

---

## Section C — CI Pipeline

### CI-1 — GitHub Actions workflow
**Why**: Enforce quality gates and enable Kiro’s guardrails.

**Steps**
Create `.github/workflows/ci.yml`:
```yaml
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run doc-guard
      - name: Accessibility (gated)
        if: ${{ env.RUN_A11Y == 'true' }}
        run: npm run a11y
```

**Acceptance Criteria**
- ☐ CI runs on PR and push to `main`
- ☐ Fails on lint/type/test/doc-guard violations

---

### CI-2 — Doc completeness guard (Node version)
**Why**: Keep docs consistent with our required sections and banned placeholders.

**Steps**
1) Create `ci/doc-completeness.mjs`:
```js
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DOCS = 'docs';
const REQUIRED = ["What","Why","How","Verify","Troubleshoot","Acceptance Criteria"];
const BANNED = ["TBD","PLACEHOLDER","Lorem","???","xxx"]; 

let failures = 0;

for (const f of readdirSync(DOCS)) {
  if (!f.endsWith('.md')) continue;
  const p = join(DOCS, f);
  const text = readFileSync(p, 'utf8');
  for (const h of REQUIRED) if (!text.includes(`\n## ${h}`) && !text.includes(`\n### ${h}`)) {
    console.error(`Missing section ${h} in ${f}`); failures++; }
  for (const word of BANNED) if (text.includes(word)) {
    console.error(`Banned placeholder "${word}" in ${f}`); failures++; }
}

if (failures) process.exit(1);
console.log('Doc guard passed');
```

**Acceptance Criteria**
- ☐ CI fails if any doc is missing required sections or includes banned placeholders

---

## Section D — Kiro Integration

### KIRO-1 — Steering rules
**Why**: Tell Kiro our style, structure, and paths so it can generate consistently.

**Steps**
Create `configs/kiro/steering-rules.json`:
```json
{
  "doc_style": {
    "required_sections": ["What","Why","How","Verify","Troubleshoot","Acceptance Criteria"],
    "banned_placeholders": ["TBD","PLACEHOLDER","Lorem","???","xxx"],
    "audience": "high school",
    "tone": "plain English"
  },
  "paths": { "docs": "docs", "configs": "configs" },
  "globs": { "all_docs": "docs/**/*.md", "all_configs": "configs/**/*.json" },
  "ci_expectations": ["doc-guard","lint","typecheck","test","a11y (gated)"]
}
```

**Acceptance Criteria**
- ☐ File exists and matches repo structure

---

### KIRO-2 — Docs registry
**Why**: A machine-readable map of what should exist vs. what exists.

**Steps**
Create `configs/kiro/docs.registry.json` (partial example; extend to all sprints):
```json
{
  "S1": {
    "BatchA": [
      {"path":"docs/content_01_sources_pilot.md"},
      {"path":"configs/sources/allowlist.json"},
      {"path":"docs/ai_01_embeddings_pgvector.md"},
      {"path":"configs/rag/embedding.config.json"}
    ],
    "BatchB": [
      {"path":"docs/api_01_minimal_rag.md"},
      {"path":"docs/ui_01_minimal_chat.md"},
      {"path":"configs/security/domain.guard.json"}
    ]
  }
}
```

**Acceptance Criteria**
- ☐ All expected files per sprint are enumerated

---

### KIRO-3 — Centralize prompts
**Why**: Let Kiro load prompts by path.

**Steps**
- Create `configs/kiro/prompts/`
- Move batch templates (e.g., `batch_prompt_template.md`, `sprint1_batchA_prompt.md`) into this folder.
- Update `project.json` (or Kiro UI settings) to reference these paths.

**Acceptance Criteria**
- ☐ Prompts are file-based and discoverable by Kiro

---

## Section E — Accessibility & Analytics

### A11Y-1 — Keep a11y gating off until UI exists, then enable
**Why**: Avoid false failures pre-UI; enforce once `/widget` is ready.

**Steps**
1) Implement basic controls and landmarks on `/widget`.
2) Add `scripts/a11y-check.mjs` (Playwright + axe-core or equivalent) that visits `/widget` and fails on critical violations.
3) Set CI env `RUN_A11Y=true` once the route works.

**Acceptance Criteria**
- ☐ `npm run a11y` passes locally
- ☐ CI job runs when `RUN_A11Y=true`

---

### ANA-1 — Minimal analytics (Plausible, no PII)
**Why**: Observe usage without storing personal data.

**Steps**
- Add `configs/analytics/events.json` (already authored — ensure path).
- Add a tiny analytics wrapper that forwards only event names/anonymous counts.

**Acceptance Criteria**
- ☐ No PII collected
- ☐ Events fire on key widget actions

---

## Section F — Security Application (Headers, CORS, Rate-limit, Redaction)

### SEC-1 — Apply security headers from JSON via Next middleware
**Why**: Keep policy in `configs/security/baseline.json` and apply consistently.

**Steps**
1) Ensure `configs/security/baseline.json` contains `csp`, `referrerPolicy`, `frameOptions`, `hsts`, `cors`, `rateLimit`, `redactPII`.
2) Create `middleware.ts` at repo root:
```ts
import { NextResponse, NextRequest } from 'next/server';
import cfg from './configs/security/baseline.json';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // Headers
  res.headers.set('Content-Security-Policy', cfg.csp);
  res.headers.set('Referrer-Policy', cfg.referrerPolicy);
  res.headers.set('X-Frame-Options', cfg.frameOptions);
  res.headers.set('Strict-Transport-Security', cfg.hsts);
  return res;
}
```
3) Add CORS handling inside API routes using `cfg.cors.allowlist`.

**Acceptance Criteria**
- ☐ Headers present on all routes
- ☐ CORS rejects origins not on allowlist

---

### SEC-2 — Domain allowlist (runtime gate)
**Why**: Restrict widget/API usage to approved domains.

**Steps**
- Create `configs/security/domain.allowlist.json` with allowed origins.
- In `middleware.ts`, block requests with `Origin` not in allowlist (except same-origin GET pages).

**Acceptance Criteria**
- ☐ Requests from disallowed origins return 403

---

### SEC-3 — Basic rate-limit (dev) & note prod store
**Why**: Prevent abuse.

**Steps**
- Implement a simple in-memory token bucket for dev.
- Add TODO to replace with Redis/WAF in prod.

**Acceptance Criteria**
- ☐ Repeated calls above threshold return 429 locally

---

### SEC-4 — PII redaction toggle
**Why**: Strip PII at the edge before logs/model.

**Steps**
- Add a small utility that masks emails/phones/addresses when `cfg.redactPII === true`.
- Use it in request logging + RAG query building.

**Acceptance Criteria**
- ☐ Sensitive strings masked in logs and prompts when enabled

---

## Section G — RAG Slice & Content Pipeline

### RAG-1 — pgvector embeddings config
**Why**: Standardize vectorization settings.

**Steps**
- Ensure `configs/rag/embedding.config.json` exists with `model`, `dim`, `chunk`, `overlap`, `normalize`.
- Add `scripts/embed.mjs` that reads markdown/text from `content/` (or scraped cache) and writes to Postgres with `pgvector`.

**Acceptance Criteria**
- ☐ Script runs and inserts vectors

---

### RAG-2 — Sources allowlist & scraper rules
**Why**: Only AU gov domains; respect robots.txt.

**Steps**
- Confirm `configs/sources/allowlist.json` and `configs/sources/expansion.rules.json` paths.
- Add `scripts/scrape.mjs` (Playwright or fetch) honoring robots and allowlist.

**Acceptance Criteria**
- ☐ Scraper skips non-allowlisted domains and disallowed paths

---

### PIPE-1 — Refresh job schedule
**Why**: Keep content fresh.

**Steps**
- Place `configs/pipeline/refresh.schedule.json` (cron-like fields).
- In CI or a separate scheduler, run `scripts/refresh.mjs` to fetch → clean → re-embed.

**Acceptance Criteria**
- ☐ Refresh pipeline runs without errors and updates vectors

---

### PIPE-2 — Ingest resilience & cleaning rules
**Why**: Robustness to failures and noisy text.

**Steps**
- Ensure `docs/content_05_ingest_resilience.md` and `configs/pipeline/cleaning.rules.json` exist.
- Add retry/backoff, skip lists, and structured logging to `scrape.mjs`.

**Acceptance Criteria**
- ☐ Failed pages are retried and then skipped gracefully; logs show counts

---

## Section H — Multitenancy & Keys

### TEN-1 — Tenant schema & provisioning
**Why**: Isolate settings and quotas per tenant.

**Steps**
- Create `configs/tenants/schema.json` (id, name, key policy, quotas).
- Create `configs/tenants/provisioning.json` (bootstrap tenants for dev).
- API: `/api/tenant/issue-key` (dev only) to mint a key.

**Acceptance Criteria**
- ☐ Requests with valid tenant key pass; others 401/403

---

### TEN-2 — Key rotation policy
**Why**: Safety and revocation.

**Steps**
- Create `configs/tenants/keys.rotation.json` (rotation interval, grace period).
- Implement dual-key validation during rotation window.

**Acceptance Criteria**
- ☐ Old key works until grace end; then rejected

---

## Section I — QA, Guardrails, Legal & Compliance

### QA-1 — Test plan & guardrails
**Why**: Prevent regressions and unsafe outputs.

**Steps**
- Ensure `docs/qa_01_test_plan_and_setup.md`, `docs/qa_02_ai_guardrails.md` and `configs/ai/guardrails.json` are present.
- Add unit tests for: domain filter, PII redaction, source citation presence.

**Acceptance Criteria**
- ☐ Tests verify guardrails before shipping

---

### LEG-1 — Privacy & Terms; WCAG checklist
**Why**: Legal clarity and accessibility compliance.

**Steps**
- Place `docs/legal_01_privacy_terms.md`, `configs/legal/privacy.json`, `configs/legal/terms.json`.
- Place `docs/compliance_01_ndis_wcag_checklist.md`, `configs/compliance/ndis_wcag.checklist.json`.
- Link these from the widget and the marketing site.

**Acceptance Criteria**
- ☐ Links visible and content matches current behavior

---

## Section J — AWS Deploy & Ops

### AWS-1 — Infrastructure definition
**Why**: Reproducible beta stack.

**Steps**
- Ensure `configs/deploy/infrastructure.json` describes: VPC, public/private subnets, RDS Postgres 16 + pgvector, ECS Fargate (or Lambda) for API, CloudFront for widget, WAF, Secrets Manager, CloudWatch, S3 logs.
- Validate with your chosen tool (CFN/Terraform) or document the CLI sequence.

**Acceptance Criteria**
- ☐ `infrastructure.json` deploys or maps 1:1 to real IaC

---

### AWS-2 — Prod env + secrets
**Why**: Safe configuration and key storage.

**Steps**
- Create `configs/deploy/env.prod.json` (non-secret values only).
- Store secrets in AWS Secrets Manager; inject at runtime/build via CI variables.

**Acceptance Criteria**
- ☐ No secrets in repo; app reads from Secrets Manager/CI

---

### AWS-3 — Backups
**Why**: Disaster recovery.

**Steps**
- Ensure `configs/backup/backup.rules.json` defines RDS snapshots, retention, and restore testing cadence.
- Add a quarterly restore drill runbook in `docs/`.

**Acceptance Criteria**
- ☐ Backups visible in AWS; restore drill instructions exist

---

## Section K — Final Switches & Cleanups

### FIN-1 — Enable a11y/Lighthouse once `/widget` is live
**Steps**
- Set CI env `RUN_A11Y=true`; add Lighthouse job (optional) to CI.
- Fix violations until green.

**Acceptance Criteria**
- ☐ a11y job green on PRs

---

### FIN-2 — Normalize stack references
**Why**: Remove confusion (pgvector vs Pinecone).

**Steps**
- Edit any planning docs that mention Pinecone and standardize on pgvector (keep adapter note if desired).

**Acceptance Criteria**
- ☐ No conflicting store guidance in docs

---

### FIN-3 — Release archival zips via GitHub Releases (optional)
**Why**: Keep repo clean while preserving history.

**Steps**
- Attach any historical ZIPs to a Release and remove from the repo tree.

**Acceptance Criteria**
- ☐ Repo contains only source, configs, docs — no archives

---

## Roll-Up: Quick Execution Order
1) REPO-1, REPO-2
2) APP-1, APP-2
3) CI-1, CI-2
4) KIRO-1, KIRO-2, KIRO-3
5) A11Y-1, ANA-1
6) SEC-1..SEC-4
7) RAG-1..PIPE-2
8) TEN-1..TEN-2
9) QA-1, LEG-1
10) AWS-1..AWS-3
11) FIN-1..FIN-3

---

### Notes
- Keep tasks atomic; commit after each acceptance criterion turns ✅.
- If something is unknown, leave arrays empty rather than using placeholders — our guard will catch banned words.
