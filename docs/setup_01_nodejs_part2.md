# setup_01_nodejs_part2.md
> Sprint: **S0 — Foundation & Quality Rails**  
> Task: **S0-01 — Node & npm harden**  
> Audience: High school student (plain English, copy–paste steps)  
> Estimated time: **15–25 minutes**  
> Outcome: Your computer uses the **right Node version by default**, and your project has **basic npm scripts** so later steps work smoothly.

---

## What
You’ll set your computer to use **Node 20** by default, create a clean project folder, and add a few **npm scripts** so future commands are consistent for everyone.

## Why
- **Same version = fewer bugs**. Everyone on Node 20 means fewer “works on my machine” problems.  
- **Scripts save time**. Instead of long commands, we run short scripts like `npm run lint`.  
- **Clean start**. A tidy project folder keeps the later setup steps simple.

## Before you start
- You already installed Node (Part 1). Check with:
  ```bash
  node -v
  npm -v
  ```
  You should see Node **v20.x** and npm **v10.x** or higher.

---

## How

### 1) Set Node 20 as your default (using nvm)
If you have `nvm`:
```bash
nvm install 20
nvm use 20
nvm alias default 20
```
Create a file so tools know which version to use:
```bash
echo "20" > .nvmrc
```

If you don’t have `nvm`, install it later; for now, make sure `node -v` shows **20.x**.

---

### 2) Create or update your project folder
If you haven’t already:
```bash
mkdir -p ~/Projects/ndis-chatbot
cd ~/Projects/ndis-chatbot
git init
git branch -M main
```

Create a minimal `.gitignore`:
```bash
printf "node_modules/\n.next/\ndist/\nbuild/\ncoverage/\n" > .gitignore
```

---

### 3) Create a package.json (if missing)
```bash
npm init -y
```

This makes a `package.json` so we can add scripts in the next step.

---

### 4) Add helpful npm scripts
We’ll add scripts now. Some of them will be powered up in later steps, but creating them today keeps our commands consistent:

```bash
npm pkg set scripts.typecheck="echo \"TypeScript not configured yet (comes in setup_04).\" && exit 0"
npm pkg set scripts.lint="echo \"ESLint not configured yet (comes in setup_04).\" && exit 0"
npm pkg set scripts.format="echo \"Prettier not configured yet (comes in setup_04).\" && exit 0"
npm pkg set scripts.test="echo \"no tests yet\" && exit 0"
npm pkg set scripts.prepare="husky"
```

> In **setup_04**, we replace the “echo” placeholders with the real TypeScript/ESLint/Prettier commands.

---

### 5) Add Node engine (optional but recommended)
This warns developers if they’re on the wrong Node version:
```bash
npm pkg set engines.node=">=20.0.0"
npm pkg set engine-strict=true
```

---

## Verify
Run each command and watch for clean output (no errors):
```bash
node -v
npm -v
npm run typecheck
npm run lint
npm run format
npm run test
```
You should see:
- Node **20.x**
- npm **10.x** or higher
- Each script prints a short message and exits successfully (we’ll replace them with real tools in **setup_04**).

---

## Troubleshoot
- **Node says v18 or v16**: install nvm and run `nvm install 20 && nvm use 20 && nvm alias default 20`.  
- **Permission errors**: make sure you’re inside a folder you own (e.g., `~/Projects/ndis-chatbot`).  
- **“Command not found: npm”**: reinstall Node (from Part 1) or open a fresh terminal window.

---

## Acceptance Criteria
- [ ] `node -v` shows **20.x** and `npm -v` shows **10.x** or higher  
- [ ] `.nvmrc` contains `20`  
- [ ] `package.json` exists with the scripts added above  
- [ ] The 4 scripts run and print their messages without errors
