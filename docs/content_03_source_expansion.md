# Expanding Government Sources
> Sprint: **S3 — Content Pipeline & Refresh**
> Task: **S3-A — Expand source list**
> Audience: High school student (plain English, copy–paste steps)
> Estimated time: **20–30 minutes**
> Outcome: You’ll be able to add more trusted .gov.au sites into the chatbot so answers stay official.

---

## What
We will expand the list of official government websites that the chatbot can read from. This means it can answer questions with more detail while still only using trusted, safe sources.

## Why
- **Trust**: Using only .gov.au sites keeps answers accurate and safe.  
- **Coverage**: The NDIS has info spread across many official domains (NDIS, DSS, Services Australia).  
- **Up to date**: If we expand sources, the chatbot can explain more programs and policies correctly.

## How

### 1) Open the expansion rules
The rules live in:
```
configs/sources/expansion.rules.json
```

### 2) Add a new government domain
Each source entry looks like this:
```json
{
  "domain": "www.ndis.gov.au",
  "description": "National Disability Insurance Scheme official site",
  "include_paths": ["/participants", "/providers"],
  "exclude_paths": ["/news-events"]
}
```

### 3) Real examples you can add
- `www.ndis.gov.au` → Main NDIS site  
- `www.dss.gov.au` → Department of Social Services  
- `www.servicesaustralia.gov.au` → Services Australia (payments and supports)  
- `www.health.gov.au` → Department of Health and Aged Care

Add each one with clear descriptions. Use `include_paths` to focus on useful sections, and `exclude_paths` to skip pages like news or job ads.

### 4) Save and commit
```bash
git add configs/sources/expansion.rules.json
git commit -m "docs(s3-a): expand gov sources"
```

---

## Verify
- File `configs/sources/expansion.rules.json` has only `.gov.au` domains.  
- Run JSON validation:
```bash
node -e "JSON.parse(require('fs').readFileSync('configs/sources/expansion.rules.json','utf8')); console.log('OK')"
```
Should print: `OK`

---

## Troubleshoot
- **JSON parse error** → check commas and quotes.  
- **Added wrong domain** → only allow `.gov.au`, remove others.  
- **Too broad include** → narrow down with paths like `/participants`.  
- **Scraper fails** → site may block bots; check `robots.txt`.  
- **No new answers** → wait for refresh job to re‑embed content.

---

## Acceptance Criteria
- [ ] File `configs/sources/expansion.rules.json` updated with at least 3 valid `.gov.au` domains  
- [ ] No placeholders; all descriptions filled  
- [ ] JSON validates without errors  
- [ ] Commit message clear and specific  
