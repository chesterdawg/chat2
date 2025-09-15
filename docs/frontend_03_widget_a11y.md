# Widget Accessibility Enhancements
> Sprint: **S2 — Widget & UX**  
> Task: **S2-B — Accessibility refinements**  
> Audience: High school student (plain English, copy–paste steps)  
> Estimated time: **20–30 minutes**  
> Outcome: The chatbot widget is fully accessible: keyboard‑friendly, screen‑reader‑friendly, and tested with automated + manual tools.

---

## What
We’re making sure the chatbot widget is accessible to everyone, including people who use screen readers or only a keyboard.

## Why
- **Fairness**: Everyone deserves equal access to information.  
- **Legal**: NDIS tools must meet **WCAG 2.1 AA** accessibility standards.  
- **Usability**: Good accessibility means clearer navigation for everyone.  
- **Trust**: Users will feel safer when the widget works well with assistive tech.

---

## How

### 1) Ensure keyboard navigation
In every React component inside the widget:
```tsx
// Example: making a button focusable and visible on focus
<button
  onClick={handleSubmit}
  className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  Submit Question
</button>
```
- `focus:outline-none focus:ring-2 ...` gives a clear visible indicator.  
- Use `<button>` instead of clickable `<div>`.

### 2) Add ARIA labels
```tsx
// Example: chat input box
<input
  type="text"
  aria-label="Type your NDIS question"
  placeholder="Ask me something about the NDIS"
  className="border p-2 w-full"
/>
```

### 3) Live region for answers
```tsx
// Example: announce new answers
<div role="status" aria-live="polite">
  {answerText}
</div>
```

### 4) Check focus order
Use **Tab** and **Shift+Tab** to move around the widget. The order must match the visual layout.

### 5) Run automated tests
- **eslint-plugin-jsx-a11y**
```bash
npm install eslint-plugin-jsx-a11y --save-dev
```
Add to `.eslintrc.json`:
```json
{ "extends": ["next/core-web-vitals","plugin:jsx-a11y/recommended"] }
```
- **axe**
```bash
npm install @axe-core/react --save-dev
```
In `pages/_app.tsx`:
```tsx
if (process.env.NODE_ENV !== "production") {
  const React = require("react");
  const ReactDOM = require("react-dom");
  const axe = require("@axe-core/react");
  axe(React, ReactDOM, 1000);
}
```

### 6) Manual testing with screen readers
- **Windows**: NVDA (free). Press `NVDA+TAB` to hear focused elements.  
- **Mac**: VoiceOver (`Cmd+F5`). Use arrow keys to read through the widget.

---

## Verify
- Every button/input can be reached with `Tab`.  
- Focus ring is visible on each interactive element.  
- Screen reader reads meaningful labels (not “button 1”).  
- `npm run lint` passes with jsx-a11y enabled.  
- axe reports **no critical violations** in the console.

---

## Troubleshoot
- **Focus disappears**: Add `tabIndex={0}` or use semantic elements (`<button>`, `<a>`).  
- **Screen reader says “unlabeled”**: Add `aria-label` or `<label for=>`.  
- **axe shows errors**: Follow the fix suggestions printed in the console.  
- **Focus order wrong**: Reorder elements in the DOM, not just with CSS.  
- **No focus ring**: Check Tailwind classes `focus:outline-none focus:ring-2`.

---

## Acceptance Criteria
- [ ] All interactive elements are keyboard navigable  
- [ ] Focus indicators are visible and clear  
- [ ] ARIA labels and live regions used correctly  
- [ ] `eslint-plugin-jsx-a11y` integrated and passing  
- [ ] axe detects no major violations  
- [ ] Manual NVDA/VoiceOver test confirms usable flow
