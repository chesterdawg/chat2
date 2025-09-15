# docs/ai_01_embeddings_pgvector.md

> Sprint/Task: **S1 — Vertical Slice RAG / S1-A-03 — Embeddings + pgvector**  
> Audience: **High-school student**  
> Estimated time: **45–70 minutes**  
> Outcome: Postgres tables for `documents` and `chunks`, deterministic chunking, an ANN index, and a **top-k** query working locally. `configs/rag/embedding.config.json` is created.

## What
We’ll store cleaned Markdown in Postgres, **chunk** it into small parts, **embed** those parts into vectors, and create a fast index to search by meaning.

## Why
- **Good answers:** Searching by meaning (vectors) retrieves the most relevant chunks for the chatbot.  
- **Traceability:** Each chunk references its source URL and model version for clean citations.  
- **Speed:** An ANN index (HNSW) makes top-k queries fast.

## How

1) **Create the embedding config**
```bash
mkdir -p configs/rag
cat > configs/rag/embedding.config.json << 'JSON'
{
  "embedding_model": "text-embedding-3-small",
  "chunker": "by_headings_fallback_token",
  "max_chunk_tokens": 800,
  "overlap_tokens": 120,
  "index_params": { "type": "hnsw", "m": 16, "ef_construction": 200, "ef_search": 40 }
}
JSON
```

2) **Create schema (Postgres 16 + pgvector)**
```sql
-- Run in psql connected to your DB
CREATE EXTENSION IF NOT EXISTS vector;

-- Model 'text-embedding-3-small' uses 1536 dimensions.
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY,
  source_url TEXT UNIQUE NOT NULL,
  canonical_url TEXT,
  title TEXT,
  lang TEXT,
  fetched_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  content_hash TEXT,
  embedding_model TEXT NOT NULL,
  chunker_version TEXT NOT NULL,
  doc_bytes INTEGER
);

CREATE TABLE IF NOT EXISTS chunks (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER NOT NULL,
  embedding VECTOR(1536) NOT NULL
);

-- HNSW index on the embedding
CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw
  ON chunks USING hnsw (embedding vector_l2_ops) WITH (m = 16, ef_construction = 200);
```

3) **Minimal chunker & upsert (one Markdown file)**
Create `scripts/chunk-and-embed.ts`:
```ts
// scripts/chunk-and-embed.ts
import fs from "fs";
import crypto from "crypto";
import { randomUUID } from "crypto";
import { Client } from "pg";

const cfg = JSON.parse(fs.readFileSync("configs/rag/embedding.config.json","utf8"));

function splitByHeadings(md: string) {
  // Simple deterministic chunker: split on H1-H4 headings, then rejoin to token-ish windows.
  const parts = md.split(/\n(?=#{1,4}\s)/g);
  return parts.filter(p => p.trim().length > 0);
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  // Replace this with your real embedding call.
  // For now, create **fake deterministic** vectors so you can test pgvector end-to-end.
  // (This avoids secrets while proving the DB and index work.)
  return texts.map(t => {
    const h = crypto.createHash("sha256").update(t).digest();
    const dims = 1536;                      // align with config
    const arr = new Array<number>(dims);
    for (let i=0;i<dims;i++) arr[i] = (h[i % h.length] / 255);
    return arr;
  });
}

async function main(filePath: string) {
  const md = fs.readFileSync(filePath, "utf8");
  const chunks = splitByHeadings(md);
  const vectors = await embedBatch(chunks);

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const docId = randomUUID();
  const sourceUrl = (md.match(/source_url:\s*\"([^\"]+)\"/)?.[1]) || "file://" + filePath;
  const canonical = (md.match(/canonical_url:\s*\"([^\"]+)\"/)?.[1]) || sourceUrl;
  const contentHash = crypto.createHash("sha256").update(md).digest("hex");

  await client.query("BEGIN");
  await client.query(
    `INSERT INTO documents(id, source_url, canonical_url, fetched_at, updated_at, content_hash, embedding_model, chunker_version, doc_bytes)
     VALUES($1,$2,$3, NOW(), NOW(), $4, $5, $6, $7)
     ON CONFLICT (source_url) DO UPDATE SET updated_at = EXCLUDED.updated_at`,
    [docId, sourceUrl, canonical, contentHash, cfg.embedding_model, cfg.chunker, Buffer.byteLength(md)]
  );

  for (let i = 0; i < chunks.length; i++) {
    const emb = vectors[i];
    const id = randomUUID();
    const tokenCount = Math.ceil(chunks[i].length / 4); // rough heuristic
    await client.query(
      `INSERT INTO chunks(id, document_id, chunk_index, content, token_count, embedding)
       VALUES($1,$2,$3,$4,$5,$6)`,
      [id, docId, i, chunks[i], tokenCount, emb]
    );
  }
  await client.query("COMMIT");
  await client.end();
  console.log(`Upserted ${chunks.length} chunks for ${sourceUrl}`);
}

const file = process.argv[2];
if (!file) { console.error("Usage: ts-node --transpile-only scripts/chunk-and-embed.ts <path-to-md>"); process.exit(1); }
main(file).catch(e => { console.error(e); process.exit(1); });
```

Add a script:
```bash
npm pkg set scripts.chunk-embed="ts-node --transpile-only scripts/chunk-and-embed.ts"
```

4) **Create a tiny test Markdown file**  
If you don’t have one yet, make a simple file so we can test the DB:
```bash
mkdir -p data/md
cat > data/md/sample.md << 'MD'
---
source_url: "https://www.ndis.gov.au/example"
canonical_url: "https://www.ndis.gov.au/example"
fetched_at: "2025-08-15T14:00:00+09:30"
content_hash: "0000000000000000000000000000000000000000000000000000000000000000"
---
# Example Heading
NDIS info text here for testing the pipeline.
MD
```

5) **Run the end-to-end test**
```bash
# 1) Ensure DB is up and DATABASE_URL is set, then apply SQL (from step 2)
# 2) Ingest the sample file:
npm run chunk-embed -- data/md/sample.md

# 3) Run a quick top-k query (vector search) in psql:
psql "$DATABASE_URL" -c "
SELECT chunk_index, left(content,60) AS preview
FROM chunks
ORDER BY embedding <-> (SELECT embedding FROM chunks ORDER BY random() LIMIT 1)
LIMIT 3;
"
```
**Expected:**  
- CLI prints: `Upserted N chunks for https://www.ndis.gov.au/example`.  
- SQL prints 3 rows with short `preview` text (order varies).

> When you switch from the **fake deterministic** embedder to your **real embedding API**, keep the same 1536 dimension (or update the table + index if your model uses a different size).

## Verify
- `configs/rag/embedding.config.json` loads and prints its keys:
```bash
node -e "const c=require('./configs/rag/embedding.config.json'); console.log(Object.keys(c).join(','));"
```
**Expected:** `embedding_model,chunker,max_chunk_tokens,overlap_tokens,index_params`

- `chunks` table has rows:
```bash
psql "$DATABASE_URL" -c "SELECT count(*) FROM chunks;"
```
**Expected:** a number ≥ 1.

## Troubleshoot
- **ERROR: extension "vector" is not installed** → `CREATE EXTENSION vector;` in your DB.  
- **Dimension mismatch** → Ensure table dimension (1536) matches your embedding model.  
- **Foreign key errors** → Insert into `documents` first (the script does this).  
- **Empty results** → Check your sample `.md` existed and contained text.  
- **Real API later** → Swap `embedBatch` with your embedding SDK; keep dimensions aligned.

## Acceptance Criteria
- [ ] `documents` and `chunks` tables exist in Postgres; `vector` extension is enabled.  
- [ ] A Markdown file is chunked and upserted; rows appear in `chunks`.  
- [ ] An ANN index exists and a **top-k** query returns results.  
- [ ] `configs/rag/embedding.config.json` has concrete values and loads cleanly.
