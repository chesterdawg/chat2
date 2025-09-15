# Content Refresh Job
> Sprint: **S3 — Content Pipeline & Refresh**
> Task: **S3-A — Refresh job**
> Audience: High school student (plain English, copy–paste steps)
> Estimated time: **20–25 minutes**
> Outcome: A scheduled job that updates the chatbot’s knowledge so it never goes out of date.

---

## What
Set up an automatic refresh so the chatbot re‑downloads and re‑embeds government content regularly.

## Why
- **Fresh info**: Policies and guides change often.  
- **Trust**: People rely on current answers.  
- **Automation**: No one needs to remember to run it manually.

## How

### 1) Open the schedule file
File:
```
configs/pipeline/refresh.schedule.json
```

### 2) Example schedule
We want to refresh once a day at midnight UTC. The JSON looks like this:
```json
{
  "version": "1.0",
  "schedule": "0 0 * * *",
  "timezone": "UTC"
}
```

### 3) Add GitHub Action (preview)
Later we’ll add YAML under `.github/workflows/refresh.yml`:
```yaml
name: Refresh Content
on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch: {}
jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run scrape && npm run embed
```

### 4) Manual trigger
Run locally any time:
```bash
npm run scrape && npm run embed
```

---

## Verify
- File `configs/pipeline/refresh.schedule.json` exists and has cron + timezone.  
- Cron string is valid (`0 0 * * *`).  
- Run the manual trigger and confirm embeddings update (watch logs).

---

## Troubleshoot
- **JSON parse error** → check commas and quotes.  
- **Cron wrong** → use online cron checker (`0 0 * * *` = midnight).  
- **Job not firing** → check GitHub Actions enabled in repo.  
- **Scraper blocked** → site may have changed; update scraper rules.  
- **Embeddings stale** → confirm `npm run embed` completes.

---

## Acceptance Criteria
- [ ] `configs/pipeline/refresh.schedule.json` created with correct cron + timezone  
- [ ] Manual `npm run scrape && npm run embed` works without errors  
- [ ] Commit message documents schedule  
- [ ] No placeholders; JSON concrete  
