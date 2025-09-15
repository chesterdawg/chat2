# setup_06_security_baseline.md
> Sprint: **S0 — Foundation & Quality Rails**  
> Task: **S0-06 — Security baseline (Zod, headers, CORS, rate‑limit)**  
> Audience: High school student (plain English, copy–paste steps)  
> Estimated time: **25–40 minutes**  
> Outcome: A clear pattern for **validating inputs**, **safe security headers**, **CORS rules**, and **basic rate‑limit** defaults. These protect the app as we start building.

---

## What
You’ll add a **security baseline** so the API is harder to break and safer to use:

- **Input validation** with **Zod** (reject bad or unexpected data)  
- **Security headers** using safe defaults  
- **CORS policy** (which websites may call our API)  
- **Rate‑limit** rules (slow down abusive callers)

We’ll store the shared settings in `configs/security/baseline.json` so code and docs stay in sync.

## Why
- **Protect users** and the service from common issues like bad inputs or noisy scripts.  
- **Consistent rules** in one JSON file are easier to review than code spread across files.  
- **Fewer surprises** later—these rules are the same in local, test and prod.

## Before you start
- Node Part 1 & 2 and Code Quality (setup_04) are done.  
- You have a Git repo and can commit changes.

---

## How

### 1) Install Zod (input validation)
```bash
npm i zod
```
**Example pattern** (keep this for later API routes):
```ts
// file: docs/samples/zod-example.ts (example only)
import { z } from "zod";

export const AskSchema = z.object({
  question: z.string().min(5).max(800),
  tenantKey: z.string().uuid().optional()
});

// Example of using the schema
export function validateAsk(body: unknown) {
  const result = AskSchema.safeParse(body);
  if (!result.success) {
    // Return a friendly 400 with details for the caller
    return { ok: false, status: 400, errors: result.error.flatten().fieldErrors };
  }
  return { ok: true, status: 200, data: result.data };
}
```

---

### 2) Add security settings to JSON (headers, CORS, rate‑limit)
Create or edit:
```
configs/security/baseline.json
```
Paste this (you can change values later, but these are safe defaults):

```json
{
  "version": "1.0",
  "updated_at": "2025-09-15",
  "cors": {
    "allowlist": [],
    "allow_methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "allow_credentials": false,
    "max_age_seconds": 600
  },
  "headers": {
    "contentSecurityPolicy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'",
    "referrerPolicy": "no-referrer",
    "frameAncestors": "'none'",
    "xContentTypeOptions": "nosniff",
    "xFrameOptions": "DENY",
    "strictTransportSecurity": "max-age=31536000; includeSubDomains; preload",
    "permissionsPolicy": "geolocation=(), microphone=(), camera=(), usb=()"
  },
  "rate_limit": {
    "window_ms": 60000,
    "max_per_ip": 60,
    "burst": 20,
    "per_tenant_defaults": { "window_ms": 60000, "max": 120 }
  },
  "logging": {
    "redact_pii": true
  }
}
```

> **Notes**  
> - `allowlist` is empty now. In Sprint 4 we’ll add your real domains.  
> - The CSP above is safe and simple; we’ll adjust once we know the exact assets and endpoints.  
> - Rate limits are gentle for development; we can tighten later.

---

### 3) (For later) Apply headers and CORS in your app
When the Next.js app exists, you will:
- Read `configs/security/baseline.json`
- Apply headers with a middleware
- Enforce CORS and rate‑limits on API routes

You’ll implement that in a later sprint. For now, keeping the JSON centralized means we can review and agree before wiring code.

---

## Verify (now)
- File `configs/security/baseline.json` exists and contains the fields above.  
- The `allowlist` is an **empty array** (that’s expected today).  
- The JSON is valid: run `node -e "JSON.parse(require('fs').readFileSync('configs/security/baseline.json','utf8')); console.log('OK')"`

## Verify (later, once an `/api/health` route exists)
- **CORS test:** this will **not** include `Access-Control-Allow-Origin` for unknown origins:
```bash
curl -i -H "Origin: https://unknown-site.example" http://localhost:3000/api/health
```
Look for **no** `Access-Control-Allow-Origin` header in the response. Browsers will block such calls.

- **Headers test:** check that the response includes `x-frame-options: DENY`, `x-content-type-options: nosniff`, etc.

- **Rate‑limit test:** make 100 quick calls and expect some to be throttled once limits are active.

---

## Troubleshoot
- **JSON parse error**: check for trailing commas or missing quotes.  
- **CORS too strict**: in Sprint 4, add your real site to `allowlist` and redeploy.  
- **CSP blocking scripts**: we’ll tweak `script-src` once we know the CDN and widget host.

---

## Acceptance Criteria
- [ ] `configs/security/baseline.json` exists with the fields shown above  
- [ ] `allowlist` is `[]` for now (we’ll fill it later)  
- [ ] Zod installed and example pattern saved for later use  
- [ ] JSON validated locally without errors
