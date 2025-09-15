# Embed the Chatbot Widget on Any Site (Dev)
> Sprint: **S2 — Widget & UX**  
> Task: **S2-A — Minimal embed flow**  
> Audience: High school student (plain English)  
> Estimated time: **20–30 minutes**  
> Outcome: A small `<script>` + `<div>` snippet that loads the widget in an iframe. Config lives at `configs/widget/embed.config.json`.

---

## What
You’ll copy a small snippet into any webpage and it will **inject an iframe** that displays the chatbot widget.

## Why
- **Easy install**: Website owners paste one snippet and get the bot.  
- **Safe by default**: The bot runs in an **iframe** (isolated from the host page).  
- **Responsive**: The iframe grows/shrinks to fit phones, tablets, and desktops.

## How
1. **Create the config** at `configs/widget/embed.config.json`:
   ```json
   {
     "version": "1.0",
     "iframe_src": "http://localhost:3000/widget-frame",
     "default_height": "600px",
     "default_width": "100%",
     "allowlist": []
   }
   ```

2. **Paste this snippet** into the **host site’s HTML**, ideally **before `</body>`**:
   ```html
   <div id="ndis-chatbot-widget" data-height="600px" data-width="100%"></div>
   <script>
     (function() {
       const cfg = {
         src: "http://localhost:3000/widget-frame",
         height: (document.getElementById("ndis-chatbot-widget").dataset.height || "600px"),
         width: (document.getElementById("ndis-chatbot-widget").dataset.width || "100%")
       };
       const mount = document.getElementById("ndis-chatbot-widget");
       const iframe = document.createElement("iframe");
       iframe.setAttribute("title", "NDIS Support Chatbot");
       iframe.setAttribute("role", "region");
       iframe.style.border = "0";
       iframe.style.width = cfg.width;
       iframe.style.height = cfg.height;
       iframe.style.maxWidth = "100%";
       iframe.style.borderRadius = "8px";
       iframe.src = cfg.src;
       mount.appendChild(iframe);

       // Simple responsive resize (host can update data-height/width)
       const ro = new ResizeObserver(() => {
         iframe.style.width = (mount.dataset.width || "100%");
         iframe.style.height = (mount.dataset.height || "600px");
       });
       ro.observe(mount);
     })();
   </script>
   ```

3. **Run a local test page** (no framework needed):
   ```bash
   mkdir -p /tmp/ndis-embed-test && cd /tmp/ndis-embed-test
   printf '<!doctype html>\n<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>NDIS Widget Test</title></head><body>\n<h1>Host site</h1>\n<div id="ndis-chatbot-widget" data-height="600px" data-width="100%"></div>\n<script>(function(){const m=document.getElementById("ndis-chatbot-widget");const f=document.createElement("iframe");f.title="NDIS Support Chatbot";f.role="region";f.style.border="0";f.style.width=m.dataset.width||"100%";f.style.height=m.dataset.height||"600px";f.style.maxWidth="100%";f.style.borderRadius="8px";f.src="http://localhost:3000/widget-frame";m.appendChild(f);})();</script>\n</body></html>' > index.html
   npx serve -p 5050
   ```
   Expected output (from `serve`): a local URL like `http://localhost:5050` you can open.  
   **Note:** You also need your widget dev server running at `http://localhost:3000/widget-frame` for the iframe to show content.

4. **Make it responsive with CSS** (host page can add this):
   ```css
   #ndis-chatbot-widget iframe {
     width: 100%;
     height: 70vh;
     max-height: 720px;
     min-height: 420px;
   }
   ```

## Security notes
- **CORS & headers**: Keep your API locked down using `configs/security/baseline.json` and a strict CSP.  
- **Domain guard**: In production, only allow approved customer domains (Sprint 4 will fill the allowlist).  
- **No PII**: Don’t log end‑user personal info from the host page or the widget.

## Verify
1. **Doc guard & lint**  
   ```bash
   python ci/doc_completeness_check.py
   npm run lint
   npm run typecheck
   ```
2. **Local load check**  
   - Visit `http://localhost:5050` (your host page) in a browser.  
   - You should see the iframe area. If your widget dev server is up at `http://localhost:3000/widget-frame`, the chatbot UI appears.

## Troubleshoot
1. **Blank iframe** → Ensure the dev widget frame is running on port **3000** and the path is `/widget-frame`.  
2. **Mixed content errors** → Use HTTPS in staging/prod for both host and widget origins.  
3. **Blocked by CORS** → Add the host origin to the allowlist (done in Sprint 4), and check server headers.  
4. **Scroll bars inside the iframe** → Adjust host CSS (e.g., `height: 70vh`) or internal widget layout.  
5. **Slow load** → Use optimized assets in the widget app and enable caching headers.

## Acceptance Criteria
- [ ] `configs/widget/embed.config.json` exists with real values  
- [ ] Snippet injects an iframe that shows the widget when the dev server is running  
- [ ] Host page remains responsive (no layout breaks)  
- [ ] Security guidance present (CORS + domain guard)  
- [ ] Doc guard, lint, and typecheck pass
