# docs/compliance_01_ndis_wcag_checklist.md
> Sprint: **S5 — QA, Compliance & Legal**  
> Task: **S5-B2 — NDIS WCAG Checklist**  
> Audience: High school student (plain English, easy to follow)  
> Estimated time: **25–40 minutes**  
> Outcome: A checklist for testing accessibility against WCAG 2.1 AA.

---

## What  
This file lists the **accessibility rules** we must follow (WCAG 2.1 AA). It’s a checklist for testing the chatbot widget.

---

## Why  
- **Fair access:** People with disability must be able to use the chatbot.  
- **Legal requirement:** The NDIS and Australian government demand WCAG compliance.  
- **Quality:** Accessibility helps everyone, not just people with disability.

---

## How  

Checklist (WCAG 2.1 AA):  

1. **Text & contrast**  
   - Minimum contrast ratio 4.5:1.  
   - Text resizes up to 200% without breaking.  

2. **Keyboard access**  
   - All controls usable by keyboard only (no mouse required).  
   - Tab order makes sense.  

3. **Screen readers**  
   - Labels on all inputs and buttons.  
   - ARIA roles for components.  

4. **Timing**  
   - No forced timeouts without warning.  

5. **Error handling**  
   - Clear error messages in plain text.  

---

## Verify  
Run accessibility test:  
```bash
npm run a11y:ci
```
Expected: no critical violations.  

---

## Troubleshoot  
- **Low contrast warning:** adjust theme tokens in `configs/widget/theme.tokens.json`.  
- **Keyboard trap:** fix focus handling in React.  
- **Screen reader missing labels:** add `aria-label` to components.  

---

## Acceptance Criteria  
- [ ] All WCAG 2.1 AA points listed and tested  
- [ ] a11y CI passes with no critical issues  
- [ ] Checklist easy to follow  
