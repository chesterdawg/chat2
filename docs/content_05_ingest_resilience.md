# Ingest Resilience and Cleaning Rules
> Sprint: **S3 — Content Pipeline & Refresh**  
> Task: **S3-B — Ingest resilience & cleaning rules**  
> Audience: High school student (plain English, copy–paste steps)  
> Estimated time: **25–35 minutes**  
> Outcome: The pipeline keeps running even when some pages fail, and all text is cleaned before embedding.

---

## What
We’re making the pipeline tough (resilient) so it doesn’t break if one page fails. We’ll also clean text to remove junk like scripts, styles, and navigation bars before we embed it into the database.

---

## Why
- **Real world messiness**: Some government pages might fail to load or have weird formatting.  
- **Resilience**: Instead of crashing, we retry or skip bad pages.  
- **Cleaner data**: Removing `<script>` or menu text keeps embeddings focused on actual NDIS content.  
- **Better answers**: A clean knowledge base means better chatbot responses.

---

## How

### 1) Add retry & skip logic
Open the scraper code (`src/scraper/index.ts`) and add:

```ts
import pRetry from "p-retry";

async function fetchWithRetry(url: string) {
  return await pRetry(
    async () => {
      const res = await fetch(url, { timeout: 10000 });
      if (!res.ok) throw new Error(`Bad response ${res.status}`);
      return await res.text();
    },
    { retries: 3 }
  );
}

// Usage:
for (const url of urls) {
  try {
    const html = await fetchWithRetry(url);
    processPage(html);
  } catch (err) {
    console.error("Skipping failed page:", url, err.message);
    continue; // skip but keep pipeline alive
  }
}
```

**Expected output (in logs when a page fails):**
```
Skipping failed page: https://www.ndis.gov.au/broken-page  Request failed
```

---

### 2) Apply cleaning rules before embedding
We use `configs/pipeline/cleaning.rules.json`. Add a small utility in `src/processing/clean.ts`:

```ts
import { JSDOM } from "jsdom";
import rules from "../../configs/pipeline/cleaning.rules.json";

export function cleanHtml(html: string): string {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // remove selectors
  rules.remove_selectors.forEach((sel) => {
    doc.querySelectorAll(sel).forEach((el) => el.remove());
  });

  let text = doc.body.textContent || "";

  // strip patterns
  rules.strip_patterns.forEach((pattern) => {
    const regex = new RegExp(pattern, "gi");
    text = text.replace(regex, "");
  });

  // normalize whitespace
  if (rules.normalize_whitespace) {
    text = text.replace(/\s+/g, " ").trim();
  }

  return text;
}
```

---

### 3) Run end-to-end
```bash
npm run scrape
```

**Expected output:**
```
[ok] Scraped 25 pages, 2 skipped
[ok] Cleaned and embedded 23 documents
```

---

## Verify
- Run `python ci/doc_completeness_check.py` → must pass.  
- Run `npm run lint && npm run typecheck` → both succeed.  
- Check logs: some pages skipped but pipeline continues.  
- Spot check a cleaned document: no `<script>` or menu text remains.

---

## Troubleshoot
1. **Script fails on first bad page** → Ensure `try/catch` wraps each URL.  
2. **Still see `<script>` tags** → Check `cleaning.rules.json` has `<script>` in `remove_selectors`.  
3. **Whitespace messy** → Ensure `"normalize_whitespace": true`.  
4. **Regex not working** → Make sure pattern uses valid syntax.  
5. **No text output** → Confirm you’re grabbing `doc.body.textContent`.

---

## Acceptance Criteria
- [ ] Failed pages don’t crash pipeline (skipped with log).  
- [ ] Retry logic works (3 attempts before skip).  
- [ ] Cleaning rules applied: scripts, styles, nav stripped.  
- [ ] Whitespace normalized in outputs.  
- [ ] `doc_completeness_check.py`, `lint`, `typecheck` all pass.  
