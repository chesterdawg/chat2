# Minimal Analytics with Plausible
> Sprint: **S2 — Widget & UX**  
> Task: **S2-B — Add minimal analytics (PII-free)**  
> Audience: High school student (plain English, copy–paste steps)  
> Estimated time: **15–25 minutes**  
> Outcome: Plausible Analytics tracks widget usage events without storing personal data.

---

## What
We’re adding **Plausible Analytics** to the chatbot widget to see how people use it. This helps us know if features are working — without spying or collecting personal details.

## Why
- **Privacy**: Plausible collects no personal information (no cookies, no IP storage).  
- **Clarity**: We can measure how often the chatbot is used.  
- **Improvement**: Usage data helps us make the widget better.  
- **Trust**: High privacy means users feel safe.

---

## How

### 1) Choose Plausible hosting
- **Option A (cloud)**: Create an account at [plausible.io](https://plausible.io).  
- **Option B (self-host)**: Run Plausible on your own server (e.g., AWS Sydney) for full control.

### 2) Add tracking script
In `app/widget-frame.tsx`, add the script conditionally so it only runs on allowed domains:

```tsx
import Script from "next/script";
import domains from "../configs/security/domain-guard.json";

export default function WidgetFrame() {
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const allowed = domains.allowlist.includes(host);

  return (
    <>
      {allowed && (
        <Script
          defer
          data-domain="yourdomain.example"
          src="https://plausible.io/js/script.js"
        />
      )}
      {/* rest of widget */}
    </>
  );
}
```

### 3) Track custom events
In `utils/analytics.ts`:
```ts
export function trackEvent(name: string) {
  if (typeof window.plausible === "function") {
    window.plausible(name);
  }
}
```

Example usage when user submits a question:
```ts
import { trackEvent } from "../utils/analytics";

function handleSubmit() {
  trackEvent("question_submitted");
}
```

### 4) Events to track
- `question_submitted`  
- `answer_rendered`  
- `citation_link_clicked`

---

## Verify
- Widget loads without errors.  
- On allowed domains, network tab shows a request to `plausible.io/api/event`.  
- Events appear in your Plausible dashboard.  
- No cookies are set.  
- No IP addresses logged.

---

## Troubleshoot
- **Script not loading**: Check `domain-guard.json` includes your domain.  
- **No events in dashboard**: Ensure `trackEvent` is called.  
- **Blocked by adblockers**: This is normal; privacy tools may block analytics.  
- **Console error: plausible not defined**: Ensure Plausible script loaded before calling `trackEvent`.  
- **Self-hosting issues**: Check server logs and that HTTPS is configured.

---

## Acceptance Criteria
- [ ] Plausible script only loads on allowed domains  
- [ ] Events `question_submitted`, `answer_rendered`, `citation_link_clicked` fire correctly  
- [ ] No cookies or IP addresses collected  
- [ ] Verified in Plausible dashboard  
- [ ] No PII stored at any point
