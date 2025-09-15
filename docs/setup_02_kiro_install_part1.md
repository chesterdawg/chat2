# setup_02_kiro_install_part1.md
> Sprint: **S0 — Foundation & Quality Rails**  
> Task: **S0-02 — Kiro install & workspace (first run)**  
> Audience: High school student (plain English, copy–paste steps)  
> Estimated time: **15–20 minutes**  
> Outcome: Kiro is installed, opens your **project workspace**, and saves a test file and JSON so we know it’s working.

---

## What
Install **Kiro**, open the project folder, and turn on a few editor settings so Kiro behaves the same way for everyone.

## Why
- **Faster building**: Kiro’s AI + spec flow makes repetitive tasks go faster.  
- **Consistency**: the same settings mean fewer formatting surprises in PRs.  
- **Confidence**: a quick “smoke test” proves Kiro can create files in the project.

## Before you start
- You finished **Node Part 1** and **Node Part 2**.  
- You have a project folder (for example `~/Projects/ndis-chatbot`).

---

## How

### 1) Install Kiro (macOS)
1. Download the latest **Kiro for macOS** installer (`.dmg`).  
2. Double‑click the `.dmg` and drag **Kiro** into **Applications**.  
3. Open **Applications → Kiro**. If macOS warns you, choose **Open**.

> Clean slate tip: If you ever installed a preview build, quit Kiro, delete the old app from Applications, and rename `~/Library/Application Support/Kiro` to `Kiro_backup_OLD`.

---

### 2) Open your project folder
- In Kiro: **File → Open Folder…** and choose your project folder (e.g., `~/Projects/ndis-chatbot`).  
- If the folders below don’t exist, create them now (we’ll use them later):

```
docs/
configs/
  kiro/
  quality/
  security/
  ci/
```

---

### 3) Set helpful editor settings
In Kiro **Preferences → Editor** turn on:
- **Format on save**  
- **Trim trailing whitespace**  
- **Insert final newline**  
- **Indent using spaces** (size **2**)

These make diffs smaller and easier to review.

---

### 4) Quick smoke test (prove Kiro can edit this repo)
Create a markdown file:
```
docs/hello-from-kiro.md
```
Put this in it:
```md
# Hello from Kiro
This is a quick test file saved by Kiro.
```

Create a JSON file:
```
configs/kiro/smoke.json
```
Content:
```json
{ "hello": "kiro", "timestamp": "2025-09-15" }
```

Make a first commit:
```bash
git add .
git commit -m "chore(kiro): first-run smoke files"
```

---

## Verify
- You can open and edit files in Kiro without errors.  
- `docs/hello-from-kiro.md` and `configs/kiro/smoke.json` exist and are committed.  
- The Kiro terminal runs `node -v` and prints a version (20.x).

---

## Troubleshoot
- **Kiro won’t open**: Right‑click the app → **Open**. Check macOS **Privacy & Security** settings.  
- **Files won’t save**: Make sure you opened the **project folder** (not your home folder).  
- **Terminal can’t find Node**: Close Kiro, ensure Node 20 is installed, reopen Kiro.

---

## Acceptance Criteria
- [ ] Kiro installed and opens from Applications  
- [ ] Project folder opened in Kiro  
- [ ] Editor settings changed (format on save, trim whitespace, 2‑space indent)  
- [ ] Test markdown and JSON files created and committed
