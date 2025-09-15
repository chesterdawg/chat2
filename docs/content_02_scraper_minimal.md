# docs/content_02_scraper_minimal.md

> Sprint/Task: **S1 — Vertical Slice RAG / S1-A-02 — Minimal scraper to Markdown**  
> Audience: **High-school student**  
> Estimated time: **35–50 minutes**  
> Outcome: Minimal Playwright fetcher that (a) **dry-runs** if the allowlist is empty, or (b) fetches a **single URL**, cleans it, and outputs Markdown with front-matter.

## What
We’ll set up a tiny, polite scraper that turns one allowed page into **clean Markdown**. It follows a few rules: **respect robots**, **throttle requests**, **strip nav/footers**, **keep headings**, and store the **canonical URL** in the file header.

## Why
- **Consistency:** Markdown is simple to index and embed.  
- **Safety:** Throttling + robots compliance avoids overloading sites.  
- **Traceability:** Front-matter keeps the source URL and canonical link.

## How

1) **Create scraper rules JSON**
```bash
mkdir -p configs/scraper configs/processing
cat > configs/scraper/rules.min.json << 'JSON'
{
  "version": "1.0",
  "updated_at": "2025-08-15T14:00:00+09:30",
  "respectRobots": true,
  "userAgent": "ndis-support-chatbot-scraper/1.0 (+https://example.com/bot-info)",
  "rateLimit": { "requestsPerMinute": 6, "maxConcurrent": 1,
    "retry": { "retries": 3, "minTimeoutMs": 1000, "maxTimeoutMs": 5000 } },
  "allowedFiletypes": ["text/html", "application/pdf"],
  "startUrls": [],
  "pruneSelectors": ["header", "nav", "footer", ".site-footer", ".global-footer", ".cookie-banner", ".breadcrumb"],
  "denyPatterns": [],
  "allowPatterns": []
}
JSON
```

2) **Create Markdown processing JSON**
```bash
cat > configs/processing/markdown.json << 'JSON'
{
  "keepHeadingLevels": [1,2,3,4],
  "frontMatterFields": ["source_url", "canonical_url", "fetched_at", "content_hash"],
  "normalizeWhitespace": true,
  "preserveLists": true,
  "preserveTables": true
}
JSON
```

3) **Install Playwright (minimal)**
```bash
npm i -D playwright@1
npx playwright install chromium
```

4) **Add the single-URL fetcher (dry-run aware)**  
Create `scripts/scrape-one.ts`:
```ts
// scripts/scrape-one.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { chromium } from "playwright";

type Rules = {
  respectRobots: boolean;
  userAgent: string;
  rateLimit: { requestsPerMinute: number; maxConcurrent: number; retry: { retries: number; minTimeoutMs: number; maxTimeoutMs: number } };
  pruneSelectors: string[];
  allowedFiletypes: string[];
};
const rules: Rules = JSON.parse(fs.readFileSync("configs/scraper/rules.min.json","utf8"));
const allowlist: string[] = JSON.parse(fs.readFileSync("configs/sources/allowlist.json","utf8"));
const mdCfg = JSON.parse(fs.readFileSync("configs/processing/markdown.json","utf8"));

// Robots fetch is planned for Sprint 3; today we enforce allowlist-only and low rate.

function domainFrom(url: string) { try { return new URL(url).hostname; } catch { return ""; } }
function canonicalFrom(html: string) {
  const m = html.match(/<link[^>]+rel=[\"']canonical[\"'][^>]+href=[\"']([^\\"']+)[\"']/i);
  return m ? m[1] : "";
}
function toFrontMatter(fields: Record<string,string>) {
  const lines = Object.entries(fields).map(([k,v]) => f"{k}: \"{v.replace(/\\"/g,'\\\"')}\"");
  return `---\n${lines.join("\n")}\n---\n\n`;
}

(async () => {
  const url = process.argv[2];
  if (!url) { console.error("Usage: ts-node scripts/scrape-one.ts <URL>"); process.exit(1); }
  const host = domainFrom(url);
  const allowed = allowlist.some(d => host == d or host.endswith(`.${d}`));
  if (allowlist.length === 0) {
    console.log("DRY-RUN: allowlist is empty. No fetch will occur.");
    process.exit(0);
  }
  if (!allowed) {
    console.error(`Blocked: ${host} is not in allowlist.`); process.exit(1);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ userAgent: rules.userAgent });
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Strip common chrome
  for (const sel of rules.pruneSelectors) {
    await page.evaluate((s) => { document.querySelectorAll(s).forEach(n => n.remove()); }, sel);
  }

  const html = await page.content();
  const canonical = canonicalFrom(html) || url;
  const text = await page.evaluate(() => document.body.innerText);
  const norm = text.replace(/\s+\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  const h = crypto.createHash("sha256").update(norm).digest("hex");

  const md = `---\nsource_url: \"${url}\"\ncanonical_url: \"${canonical}\"\nfetched_at: \"${new Date().toISOString()}\"\ncontent_hash: \"${h}\"\n---\n\n` + norm + "\n";

  const outDir = "data/md";
  fs.mkdirSync(outDir, { recursive: true });
  const fname = path.join(outDir, `${host.replace(/\W+/g,"_")}.md`);
  fs.writeFileSync(fname, md, "utf8");
  console.log(`Saved ${fname}`);
  await browser.close();
})();
```

5) **Add a script to run it**
```bash
npm pkg set scripts.scrape-one="ts-node --transpile-only scripts/scrape-one.ts"
```

> **Tip:** For **PDF** pages, upgrade later to extract text via a PDF parser in Sprint 3. For now, stick to HTML to prove the flow.

## Verify

- **Dry-run when allowlist is empty**
```bash
npm run scrape-one -- https://www.ndis.gov.au/
```
**Expected:** `DRY-RUN: allowlist is empty. No fetch will occur.`

- **Trial run after allowlist has a gov domain (later)**  
  1) Add a domain to `configs/sources/allowlist.json`, e.g.:
  ```json
  ["www.ndis.gov.au"]
  ```
  2) Run:
  ```bash
  npm run scrape-one -- https://www.ndis.gov.au/
  ```
  **Expected:** `Saved data/md/www_ndis_gov_au.md` and the file begins with:
  ```md
  ---
  source_url: "https://www.ndis.gov.au/"
  canonical_url: "https://www.ndis.gov.au/"
  fetched_at: "YYYY-MM-DDTHH:MM:SS.sssZ"
  content_hash: "..."
  ---
  ```

## Troubleshoot
- **“Blocked: host is not in allowlist.”** → Add the exact domain to `allowlist.json`.  
- **403 or blank content** → Try a different public page or run again later; keep rate low.  
- **Output looks messy** → Add more `pruneSelectors` for banners/menus in the JSON.  
- **TypeScript not found** → `npm i -D typescript ts-node @types/node`.

## Acceptance Criteria
- [ ] `configs/scraper/rules.min.json` and `configs/processing/markdown.json` exist with concrete values.  
- [ ] `npm run scrape-one` **dry-runs** when allowlist is empty.  
- [ ] When a gov domain is added later, one Markdown file saves with front-matter.  
- [ ] No scraping occurs outside allowlisted gov domains.
