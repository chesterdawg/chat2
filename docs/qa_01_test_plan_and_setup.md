
# QA Test Plan & Setup
> Sprint: **S5 — QA, Compliance & Legal**  
> Task: **S5-A — Test plan, tools & CI wiring**  
> Audience: High school student (plain English, copy–paste steps)  
> Estimated time: **30–45 minutes**  
> Outcome: A working test foundation with **unit**, **API integration**, **minimal E2E stub**, **a11y checks**, and **JSON schema checks**. Commands run locally and are ready for CI.

---

## What
You will install testing tools and add a clear **multi‑layer test plan**:  
- **Unit tests** with **Vitest** (fast, TypeScript‑friendly)  
- **API integration tests** with **supertest**  
- **E2E (stub)** with **Playwright** (kept tiny until we have a full UI)  
- **Accessibility checks** using **eslint‑plugin‑jsx-a11y** (and optional axe later)  
- **JSON schema checks** using **AJV** (make sure config files are shaped correctly)

## Why
- **Fewer bugs**: each layer catches a different class of issues.  
- **Confidence for refactors**: fast unit tests + API checks = safe changes.  
- **Compliance**: a11y and config validation are required for WCAG and safe ops.  
- **CI‑ready**: the same commands run locally and in GitHub Actions later.

---

## How

### 1) Install test & a11y tooling
```bash
npm i -D typescript @types/node   vitest @vitest/coverage-v8 tsx   supertest @types/supertest   playwright @axe-core/cli   ajv ajv-cli   eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-jsx-a11y
```

> If Playwright asks to install browsers, you can defer until we have a UI:  
> `npx playwright install --with-deps` (optional for now).

### 2) Add minimal folder layout
```bash
mkdir -p tests/unit tests/api tests/e2e tests/a11y tests/schemas tests/fixtures
```

```
tests/
  unit/               # pure functions and components
  api/                # HTTP handlers or route logic (supertest)
  e2e/                # Playwright (stub now)
  a11y/               # rules and sample HTML checks
  schemas/            # permissive schemas used by AJV
  fixtures/           # mocked data only (no PII)
```

### 3) Create example tests (TypeScript)

**Unit example** — `tests/unit/math.sum.test.ts`
```ts
import { describe, it, expect } from "vitest";

function sum(a: number, b: number) { return a + b; }

describe("sum()", () => {
  it("adds two numbers", () => {
    expect(sum(2, 3)).toBe(5);
  });
});
```

**API example (supertest)** — `tests/api/health.test.ts`
```ts
import request from "supertest";
import { describe, it, expect } from "vitest";
import http from "http";

// Minimal handler; replace with your real route later
const app = http.createServer((req, res) => {
  if (req.url === "/api/health") {
    const body = JSON.stringify({ ok: true, redaction: "no PII in logs" });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(body);
  } else {
    res.writeHead(404); res.end();
  }
});

describe("GET /api/health", () => {
  it("returns ok", async () => {
    const server = app.listen(0);
    const address = server.address();
    const port = typeof address === "object" && address ? (address as any).port : 0;
    const url = `http://127.0.0.1:${port}`;
    const res = await request(url).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    server.close();
  });
});
```

**E2E stub (skipped)** — `tests/e2e/smoke.spec.ts`
```ts
import { test, expect } from "@playwright/test";

test.skip("widget loads (stub)", async ({ page }) => {
  // This is a placeholder for later once the UI exists.
  // Keep the file so CI shows the stage is wired.
  expect(true).toBe(true);
});
```

**Permissive schema for AJV** — `tests/schemas/lenient.schema.json`
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "additionalProperties": true
}
```

### 4) Add npm scripts (keep names consistent with the project)
```bash
npm pkg set scripts.test="vitest run --coverage"
npm pkg set scripts.test:api="vitest run tests/api --coverage=false"
npm pkg set scripts.test:e2e="playwright test -c tests/e2e"
npm pkg set scripts.a11y:ci="eslint \"src/**/*.{ts,tsx}\" --max-warnings=0"
npm pkg set scripts.schemas:ci="ajv validate -c ajv-formats -s tests/schemas/lenient.schema.json -d \"configs/**/*.json\""
```

> Your repo already expects `test`, `a11y:ci` and other standard scripts; we’re adding concrete bodies now.

### 5) Log redaction & fixtures (no PII)
- **Never** place names, emails, phone numbers, DOBs, addresses or claim IDs in tests.  
- Use neutral fixtures: `tests/fixtures/ask.json`:
```json
{ "question": "What is a support coordinator?", "tenantKey": "00000000-0000-0000-0000-000000000000" }
```

---

## Verify

### Run all layers locally
```bash
npm run test
# expected (example)
# ✓ sum() adds two numbers
# ✓ GET /api/health returns ok
# Test Files  2 passed
# Tests       2 passed
```

```bash
npm run test:api
# expected: vitest runs only API tests and reports success
```

```bash
npm run test:e2e
# expected: 1 skipped (no UI yet)
```

```bash
npm run a11y:ci
# expected: ESLint completes with 0 errors, 0 warnings
```

```bash
npm run schemas:ci
# expected: AJV validates JSON files without error
```

### Ready for CI
- These scripts map cleanly into the CI jobs you defined earlier.  
- Add them to your GitHub Actions YAML later; for now the JSON pipeline spec is enough.

---

## Troubleshoot
1) **Vitest not found** → run the install command in step 1.  
2) **Type errors** → ensure `typescript` and `@types/node` are installed.  
3) **Playwright browser missing** → run `npx playwright install`.  
4) **ESLint fails** → add `eslint-plugin-jsx-a11y` to your ESLint config and re-run.  
5) **AJV errors** → check that `tests/schemas/lenient.schema.json` exists and paths are correct.

---

## Acceptance Criteria
- [ ] Folders under `tests/` created and example files added  
- [ ] NPM scripts added and runnable locally  
- [ ] Unit + API tests pass; E2E stub is skipped (tracked)  
- [ ] `a11y:ci` and `schemas:ci` complete with no errors  
- [ ] No PII in tests or logs
