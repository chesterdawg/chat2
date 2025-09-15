# setup_07_ci_baseline.md
> Sprint: **S0 — Foundation & Quality Rails**  
> Task: **S0-07 — CI baseline (GitHub Actions jobs & wiring plan)**  
> Audience: High school student (plain English, copy–paste steps)  
> Estimated time: **15–25 minutes**  
> Outcome: A clear plan for our **CI jobs** and a local check that we can run **right now**.

---

## What
You will define which **checks** must run on every Pull Request and show where they live in the repo. We store a logical spec in `configs/ci/pipeline.json`. In the next sprint we’ll add the YAML files that make GitHub run them automatically.

## Why
- **Fewer broken PRs**: every change is tested before merging.  
- **Clear expectations**: reviewers can see at a glance what’s required.  
- **Easy to maintain**: one JSON file describes the pipeline, then YAML mirrors it.

---

## How

### 1) Open the CI pipeline spec
File: `configs/ci/pipeline.json`  
It should look like this (you may already have it from earlier):

```json
{
  "version": "1.0",
  "updated_at": "2025-09-15",
  "env_flags": { "RUN_A11Y": "false", "RUN_LIGHTHOUSE": "false" },
  "jobs": [
    { "name": "doc-guard", "runs": ["python","ci/doc_completeness_check.py"], "artifacts": [] },
    { "name": "lint-type-unit", "steps": ["npm ci","npm run lint","npm run typecheck","npm run test"], "artifacts": ["coverage/"] },
    { "name": "a11y", "when": "env.RUN_A11Y == 'true'", "steps": ["npm run a11y:ci"], "artifacts": [] },
    { "name": "lighthouse", "when": "env.RUN_LIGHTHOUSE == 'true'", "steps": ["npm run lh:ci"], "artifacts": ["lighthouse/"] }
  ]
}
```

> **Why flags?** We don’t have a UI yet, so `a11y` and `lighthouse` are off for now. We’ll flip them on when the app exists.

---

### 2) Run the **doc guard** locally
This checks that every instructional doc has all sections and **no banned placeholder words**.

```bash
python ci/doc_completeness_check.py
```
**Expected:** “Doc completeness check passed.”  
If it fails, the script tells you which doc is missing a section.

---

### 3) (Preview) What the GitHub Actions YAML will look like
In the next sprint, we’ll create YAML files under `.github/workflows/` that mirror these jobs, for example:

- `ci-doc-guard.yml` → runs the doc guard  
- `ci-lint-type-unit.yml` → runs lint, type, unit tests  
- `ci-a11y.yml` → runs a11y checks when `RUN_A11Y=true`  
- `ci-lighthouse.yml` → runs Lighthouse when `RUN_LIGHTHOUSE=true`

For now, the JSON spec is enough to set **branch protection** to expect these names.

---

## Verify
- `python ci/doc_completeness_check.py` succeeds.  
- `configs/ci/pipeline.json` exists with the fields above.  
- In GitHub repo **Settings → Branches**, the required checks include:  
  `doc-guard`, `lint-type-unit`, `a11y` (flagged), `lighthouse` (flagged).

---

## Troubleshoot
- **Doc guard fails**: open the listed doc and complete the missing section.  
- **Too many checks**: you can temporarily remove a required check from branch protection (admin only), but add it back before merging to main.  
- **YAML missing**: that’s expected; we create YAML in the next sprint.

---

## Acceptance Criteria
- [ ] `configs/ci/pipeline.json` present with jobs and env flags  
- [ ] Doc guard passes locally  
- [ ] Branch protection lists the four checks (even if they don’t run yet)
