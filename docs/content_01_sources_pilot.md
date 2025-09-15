# docs/content_01_sources_pilot.md

> Sprint/Task: **S1 — Vertical Slice RAG / S1-A-01 — Sources pilot (gov.au only)**  
> Audience: **High-school student** (plain English)  
> Estimated time: **25–35 minutes**  
> Outcome: A clear, safe **“AU government only”** sourcing rule with a tiny pilot plan. `configs/sources/allowlist.json` is created (empty for now). You know how to choose 3–5 seed URLs later and how to verify robots.txt and headers.

## What
We’re locking a strict rule: the chatbot only learns from **official Australian government websites**. Today we create an **empty allowlist** and a **simple checklist** so we can safely add a few seed pages later (after review).

## Why
- **Accuracy & trust:** Government pages reduce misinformation.  
- **Compliance:** Easier to defend answers and add citations.  
- **Safety:** A small, reviewed allowlist lowers the risk of scraping the wrong sites.

## How

1) **Create the allowlist file (empty for now)**
```bash
mkdir -p configs/sources
cat > configs/sources/allowlist.json << 'JSON'
[]
JSON
```

2) **Write down the policy (short rule to remember)**  
- Only domains that end with **`.gov.au`** (including subdomains like `www.ndis.gov.au`, `www.servicesaustralia.gov.au`, `www.health.gov.au`).  
- We **must** respect each site’s **robots.txt**.  
- We only add domains after a quick review (robots, content fit, update cadence).

3) **How to pick 3–5 seed URLs later (don’t add yet)**
   - **Robots check:** Open `<domain>/robots.txt`. Look for `Disallow` lines covering `/` or `/search/` or PDFs.  
   - **Content fit:** Pages that explain **NDIS rules, policies, guides, eligibility, payments, or provider standards**.  
   - **Update cadence:** Prefer stable “guides” pages that still get periodic updates (date stamps or “last updated” lines).

4) **Keep a short candidate note (no code change yet)**  
Create a scratch note (not committed if you like) with 3–5 candidates, for example:
```
- https://www.ndis.gov.au/about-us (maps to program overviews and policy links)
- https://www.ndis.gov.au/participants (high-level participant guidance)
- https://www.servicesaustralia.gov.au/ndis (benefits & payments intersections)
```
> We will only add the related **domains** to the allowlist after review. The allowlist stores **domains**, not specific pages.

## Verify

**Robots check (example domain):**
```bash
curl -s https://www.ndis.gov.au/robots.txt | head -n 20
```
**Expected:** A readable robots file (no need to parse fully today).

**Headers check (example page):**
```bash
curl -I https://www.ndis.gov.au/
```
**Expected:** `HTTP/2 200`, `content-type: text/html` (values vary), and no obvious blocks like `403`.

**Config present:**
```bash
node -e "const fs=require('fs');JSON.parse(fs.readFileSync('configs/sources/allowlist.json','utf8'));console.log('allowlist.json OK');"
```
**Expected:** `allowlist.json OK`

## Troubleshoot
- **robots.txt is missing?** Most gov sites have it. If missing, we still crawl politely (low rate), but prefer sites with robots.  
- **403 or blocks?** We will crawl gently and identify with a clear user agent later (see scraper doc).  
- **Too many candidate pages?** Start with **3–5** only; grow in Sprint 3/4 with a review step.

## Acceptance Criteria
- [ ] `configs/sources/allowlist.json` exists and is `[]`.  
- [ ] The “gov.au only + robots.txt + review first” policy is understood.  
- [ ] You can run the curl checks without errors.  
- [ ] No non-government domains are proposed for ingestion.
