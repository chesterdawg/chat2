# Multi‑Tenancy: Design & Implementation
**Sprint/Task:** S4 — Multi‑Tenant & Security Hardening / Batch A  
**Audience:** High school student (beginner developer)  
**Estimated time:** 2–3 hours  
**Outcome:** The chatbot backend supports multiple isolated tenants with robust data separation, clear tenant resolution, and guardrails enforced at the database, API, and runtime layers.

## What
We are adding **multi‑tenancy** so the same codebase can safely serve many customers (tenants). Each tenant gets isolated data, its own security settings (like an allowlist of domains), and optional feature flags.

## Why
- To let different organisations embed the widget on their own sites.
- To **strictly separate** each tenant’s data for privacy and compliance.
- To tune features, rate limits, and origins per tenant without redeploying code.

## How
We’ll use **Postgres Row Level Security (RLS)** with a required `tenant_id` column across tenant‑scoped tables. At request time, the server resolves the tenant and sets a per‑connection variable that RLS policies rely on. We also namespace vector search by tenant.

### 1) Data model & RLS
Add a `tenant_id` column to all tenant‑scoped tables and enable RLS:
```sql
-- 1. Ensure extension and a dedicated DB role for the app
CREATE ROLE app_user NOINHERIT LOGIN PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
-- (In production, manage secrets in your secret store and avoid inline passwords.)

-- 2. Example table: embeddings
CREATE TABLE IF NOT EXISTS embeddings (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  doc_id TEXT NOT NULL,
  chunk_index INT NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. RLS: only allow rows where tenant_id matches the current connection setting
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

-- Create a Postgres setting we can safely read in policies
-- (No explicit CREATE needed; we use current_setting('app.current_tenant', true))
CREATE POLICY embeddings_tenant_isolation ON embeddings
USING (
  tenant_id::text = current_setting('app.current_tenant', true)  -- returns NULL if not set
);

-- Optional: prohibit inserts/updates that mismatch the current tenant
CREATE POLICY embeddings_write_guard ON embeddings
FOR INSERT WITH CHECK (tenant_id::text = current_setting('app.current_tenant', true))
;

-- Grant the app role access subject to RLS
GRANT SELECT, INSERT, UPDATE, DELETE ON embeddings TO app_user;
```

> **Expected check:** After creating the policies, this should return `t` (true):
```sql
SELECT relrowsecurity FROM pg_class WHERE relname = 'embeddings';
-- relrowsecurity
-- t
```

Repeat the same pattern for **all tenant‑scoped tables** (messages, conversations, logs, etc.).

### 2) Setting the current tenant per request (Node.js, `pg`)
In each request, resolve the tenant, then set the connection parameter used by RLS:
```ts
// lib/db.ts
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Prefer TLS in production; see DATABASE_SSL* envs if needed.
});

export async function withTenant<T>(tenantId: string, fn: (client: any) => Promise<T>) {
  const client = await pool.connect();
  try {
    // This attaches the tenant to the current connection only
    await client.query("SET LOCAL app.current_tenant = $1", [tenantId]);
    return await fn(client);
  } finally {
    client.release();
  }
}
```

Usage in a repository function:
```ts
// lib/repos/embeddings.ts
import { withTenant } from "../db";

export async function findNearest(tenantId: string, queryEmbedding: number[], k = 8) {
  return withTenant(tenantId, async (client) => {
    const res = await client.query(
      `SELECT id, doc_id, chunk_index, content
       FROM embeddings
       ORDER BY embedding <-> $1
       LIMIT $2`,
      [queryEmbedding, k]
    );
    return res.rows;
  });
}
```

### 3) Tenant resolution (middleware)
Resolve tenant in this order (strongest first):
1. **API key** (maps to a tenant in `configs/tenants/provisioning.json`).
2. **Subdomain** (e.g., `acme.widget.example.au` → `acme`).
3. **Header** `x-tenant-id` (development fallback).

```ts
// middleware/tenant.ts
import { NextRequest, NextResponse } from "next/server";
import { loadTenantByKey, loadTenantBySubdomain, loadTenantByHeader } from "./tenant-lookup";

export function resolveTenant(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey) return loadTenantByKey(apiKey);

  const host = req.headers.get("host") || "";
  const sub = host.split(".")[0];
  const bySub = loadTenantBySubdomain(sub);
  if (bySub) return bySub;

  const byHeader = loadTenantByHeader(req.headers.get("x-tenant-id") || "");
  if (byHeader) return byHeader;

  return null; // block request if still null
}
```

### 4) Vector namespace (pgvector)
Add a `tenant_id` filter to all vector queries or partition embeddings by tenant (recommended):
```sql
-- Example: create a partial index per tenant for speed (optional)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS embeddings_tenant_idx
--   ON embeddings (embedding)
--   WHERE tenant_id = '00000000-0000-0000-0000-000000000000'::uuid;
```
Always include `tenant_id` in WHERE clauses or rely on RLS as above.

### 5) CI guard: ensure RLS everywhere
Run this query after migrations to confirm every tenant‑scoped table has RLS:
```sql
SELECT n.nspname AS schema, c.relname AS table, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname NOT IN ('pg_catalog','information_schema')
ORDER BY 1,2;
```
All tenant tables must show `rls_enabled = t`.

### 6) Provision tenants from JSON
The file `configs/tenants/provisioning.json` declares each tenant, their allowed origins, features and limits. Load this at boot and cache it. Validate it with `configs/tenants/schema.json` (JSON Schema).

> **Command (validate):**
```bash
npx ajv-cli validate -s configs/tenants/schema.json -d configs/tenants/provisioning.json
# expected: "valid: true"
```

## Verify
1. **Doc completeness check**
   ```bash
   python ci/doc_completeness_check.py
   ```
   Expected: passes with no missing sections.

2. **Isolation test**
   - Insert a row for Tenant A, try to read it while `app.current_tenant` is set to Tenant B → **0 rows** returned.
   ```sql
   -- EXPECTED: returns 0 rows
   SET LOCAL app.current_tenant = 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
   SELECT COUNT(*) FROM embeddings WHERE tenant_id = 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
   ```

3. **Type/lint**
   ```bash
   npm run typecheck && npm run lint
   ```
   Expected: no errors.

## Troubleshoot
- **“RLS: query would be rejected”** → You tried to insert with a different `tenant_id` than the current connection setting. Ensure `SET LOCAL app.current_tenant = '<tenant-uuid>'` occurs before writes.
- **“No tenant resolved”** → Block the request with HTTP 403. Check API key, subdomain, or `x-tenant-id` in dev.
- **Slow vector queries** → Add tenant‑scoped indexes or partition by tenant; keep chunks small (e.g., 512–1024 tokens).

## Acceptance Criteria
- All tenant‑scoped tables include `tenant_id` and **RLS enabled**.
- Tenant is resolved via API key → subdomain → header, and unknown tenants are rejected.
- Vector queries are tenant‑filtered (by RLS and/or WHERE).
- `configs/tenants/provisioning.json` validates against `configs/tenants/schema.json`.
- `python ci/doc_completeness_check.py`, `npm run lint`, and `npm run typecheck` pass.
