
# AI Guardrails for an NDIS‑Only Chatbot
> Sprint: **S5 — QA, Compliance & Legal**  
> Task: **S5-A — Guardrails policy, prompts & CI dry‑run**  
> Audience: High school student (plain English, copy–paste steps)  
> Estimated time: **30–45 minutes**  
> Outcome: A **deterministic guardrails policy** with domain filtering, citation rules, refusal patterns, redaction, and tone controls — plus a simple **CI dry‑run** to prove it works.

---

## What
You will create **clear rules** that keep the chatbot focused on **official Australian government sources** for NDIS, enforce **citations**, and **refuse or redirect** anything outside scope. You will also add a tiny **policy dry‑run** that runs in CI.

## Why
- **Accuracy**: sources come from official government domains only.  
- **Safety**: no personal advice (medical/legal/financial); redirects to trusted resources.  
- **Trust**: each answer cites its sources; tone stays plain English and respectful.  
- **Repeatable**: guardrails live in a JSON file the system can read and test.

---

## How

### 1) Create the policy file
Path: `configs/ai/guardrails.json` (this repo uses the same structure in tests and CI).

**Contents (overview)** — see the full JSON in this batch; key sections:
```json
{
  "version": "1.0",
  "updated_at": "2025-08-19T06:52:37+09:30",
  "domainAllowlist": ["ndis.gov.au", "*.gov.au", "servicesaustralia.gov.au", "legislation.gov.au"],
  "disallowedTopics": ["non-Australian NDIS equivalents", "medical diagnosis", "legal advice", "adult content", "political advocacy"],
  "citationRules": {
    "minSources": 1,
    "mustUseGovDomains": true
  },
  "redactionRules": {
    "maskEmail": true,
    "maskPhoneAU": true,
    "maskDOB": true
  },
  "answerStyle": {
    "tone": "friendly, plain English",
    "readingLevel": "Year 9",
    "mustIncludeCitations": true
  }
}
```

### 2) Deterministic prompt/policy snippets (use as building blocks)

**Domain filter (JSON)**
```json
{
  "policy": "domain-filter",
  "allow": ["ndis.gov.au", "*.gov.au", "servicesaustralia.gov.au", "legislation.gov.au"],
  "denyExamples": ["*.blogspot.com", "*.wikipedia.org", "*.reddit.com"]
}
```

**Content sourcing guard (JSON)**
```json
{
  "policy": "sourcing-guard",
  "rules": [
    "Only answer using content fetched from allowlisted domains.",
    "If sources are missing or unclear, refuse with the fallback message."
  ]
}
```

**Redaction (JSON)**
```json
{
  "policy": "redaction",
  "patterns": [
    { "name": "email", "regex": "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
    { "name": "au_phone", "regex": "(?:\\+?61|0)[2-478](?:[ -]?\\d){8}" },
    { "name": "dob_iso", "regex": "(19|20)\\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])" }
  ],
  "action": "mask",
  "maskWith": "[redacted]"
}
```

**Safety fallback message (JSON)**
```json
{
  "policy": "fallback",
  "nonNDIS": "I can help with questions about the Australian NDIS only. Try asking about eligibility, budgets, or supports — and I’ll cite official government pages.",
  "insufficientCitations": "I couldn’t confirm this from official government sources. Please rephrase or ask about a specific NDIS topic.",
  "unsafe": "I can’t assist with that. For urgent help, contact a qualified professional or emergency services."
}
```

**Citation enforcement (JSON)**
```json
{
  "policy": "citation-enforcement",
  "require": [
    "At least one allowlisted government source per answer",
    "Inline citations at the end of the relevant sentence"
  ],
  "denyIfMissing": true
}
```

### 3) CI dry‑run (quick check)
Create `tests/guardrails/dryrun.ts`:
```ts
import fs from "fs";

type Outcome = "allow" | "refuse" | "deny";

const cfg = JSON.parse(fs.readFileSync("configs/ai/guardrails.json","utf8"));

function checkDomain(url: string): boolean {
  const host = new URL(url).hostname;
  return cfg.domainAllowlist.some((pat: string) => {
    if (pat.startsWith("*.")) return host.endsWith(pat.slice(1));
    return host === pat || host.endsWith("." + pat) || host === pat.replace("*.","");
  });
}

function evaluate(input: string, citations: string[]): Outcome {
  const lower = input.toLowerCase();
  if (cfg.disallowedTopics.some((t: string) => lower.includes(t.split(" ")[0]))) return "refuse";
  const hasGovCite = citations.some((c: string) => { try { return checkDomain(c); } catch { return false; } });
  if (cfg.citationRules.mustUseGovDomains && !hasGovCite) return "deny";
  return "allow";
}

const cases = cfg.evalCases;
for (const c of cases) {
  const out = evaluate(c.input, c.citations || []);
  console.log(`[dryrun] case={${'{'}c.name{'}'}} expected={${'{'}c.expect{'}'}} got={${'{'}out{'}'}}`);
  if (out !== c.expect) process.exit(1);
}
console.log("Guardrails dry‑run OK");
```

Run it:
```bash
npx tsx tests/guardrails/dryrun.ts
# expected: "Guardrails dry‑run OK"
```

---

## Verify
- `npx tsx tests/guardrails/dryrun.ts` prints **Guardrails dry‑run OK**.  
- Non‑NDIS or unsafe prompts are **refused**, missing‑citation answers are **denied**, valid NDIS Q&A **allow**.

---

## Troubleshoot
1) **JSON parse error** → open `configs/ai/guardrails.json`, fix commas/braces.  
2) **TypeScript import error** → ensure `tsx` is installed (step 1).  
3) **Unexpected allow/deny** → adjust `evalCases` to reflect policy intent, then re‑run.  
4) **Domain not matching** → add the specific host to `domainAllowlist`.  
5) **Redaction misses** → add more regex patterns in `redactionRules`.

---

## Acceptance Criteria
- [ ] `configs/ai/guardrails.json` includes allowlist, refusal, citation, redaction and style sections  
- [ ] Dry‑run script passes locally  
- [ ] Non‑NDIS queries refuse with helpful message  
- [ ] Answers include citations from allowlisted domains  
- [ ] No PII shown in outputs
