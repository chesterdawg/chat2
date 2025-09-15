# docs/legal_01_privacy_terms.md
> Sprint: **S5 — QA, Compliance & Legal**  
> Task: **S5-B1 — Privacy & Terms (combined)**  
> Audience: High school student (plain English, copy–paste steps)  
> Estimated time: **20–30 minutes**  
> Outcome: A clear set of privacy + terms rules that are simple, fair, and usable.

---

## What  
This file explains **what rules apply** when people use the chatbot. It combines the **Privacy Policy** (how we protect information) and **Terms of Use** (what’s allowed and not allowed).

---

## Why  
- **Trust:** People know what happens when they use the chatbot.  
- **Compliance:** Required by law and by NDIS guidelines.  
- **Safety:** Explains what’s okay and what isn’t, in plain language.

---

## How  

1. **Privacy basics**  
   - We do **not** collect personal information (no names, emails, phone numbers).  
   - We only log anonymous usage data (like number of questions asked).  
   - All content comes from **official government websites only**.

2. **Terms basics**  
   - You may only use this chatbot to ask questions about the NDIS.  
   - No spam, offensive language, or attempts to break the system.  
   - This chatbot does **not replace professional advice**. Always check official NDIS sources.

3. **Rights & limits**  
   - We can update these rules if needed (changes are posted in this file).  
   - If someone abuses the system, their access can be blocked.  
   - We follow **Australian law** and **NDIS compliance rules**.

---

## Verify  
- File exists at `docs/legal_01_privacy_terms.md`.  
- No PII is logged in the system.  
- Commands confirm no placeholders:  
  ```bash
  python ci/doc_completeness_check.py
  ```

---

## Troubleshoot  
- **Confusion about PII:** remind users the chatbot never saves names or private details.  
- **Users misuse chatbot:** block IP via rate-limit config (`configs/security/rate-limit.json`).  
- **Legal update required:** edit this file and the paired JSONs.

---

## Acceptance Criteria  
- [ ] Privacy explained in plain English  
- [ ] Terms explained in plain English  
- [ ] No placeholders or vague text  
- [ ] Matches Australian privacy standards  
- [ ] Verified with doc guard  
