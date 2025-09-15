# NDIS AI Chatbot Platform - Setup Guide Part 1: Node.js Installation for Mac Sequoia

## 🎯 Focus Lock - Following Master Development Guide

**What We're Building:** NDIS AI Chatbot Platform - $299/month widget embedding business  
**Current Phase:** PHASE 1: FOUNDATION SETUP (Week 1)  
**Current File:** File #1 - Setup_01_NodeJS_Installation_Part1.md  
**Tech Stack:** Kiro IDE + Next.js 14 + shadcn/ui + GPT-5 + Figma + PostgreSQL  
**Compliance:** Zero-PII + WCAG 2.1 AA + Australian data sovereignty

---

## What We're Doing

You're installing Node.js - the foundation that powers your entire NDIS AI chatbot platform. Think of Node.js as the engine that will run your $299/month widget business. Every part of your platform - from the chat interface to the admin dashboard - depends on Node.js working correctly.

## Why We're Doing This

### Business Impact
- **Revenue Foundation:** Node.js powers the widget that customers pay $299/month for
- **Professional Development:** Enterprise-grade development environment
- **Customer Trust:** Stable, reliable platform infrastructure
- **Australian Compliance:** Supports deployment to AWS Sydney region for data sovereignty

### Technical Benefits
- **Modern JavaScript:** Write frontend and backend code in the same language
- **Package Ecosystem:** Access to millions of pre-built code libraries via npm
- **Performance:** Fast execution for real-time chat responses
- **Kiro Integration:** Required for AI-assisted development with Kiro IDE

### NDIS Platform Needs
- **Zero-PII Processing:** Secure environment for handling sensitive data
- **WCAG 2.1 AA Support:** Accessibility compliance tools
- **Government Content Processing:** Handle NDIS website scraping and AI responses
- **Multi-tenant Architecture:** Support multiple customer widgets simultaneously

---

## How to Install Node.js on Mac Sequoia

### Prerequisites Check

Before we start, let's verify your system is ready:

**System Requirements:**
- Mac running Sequoia (macOS 15)
- At least 4GB free disk space
- Admin privileges on your Mac
- Stable internet connection

**Quick System Check:**
1. Click Apple menu → About This Mac
2. Verify you're running macOS Sequoia (15.x)
3. Check available storage (should show 4GB+ free)

### Step 1: Check for Existing Node.js Installation

Many Macs already have an older version of Node.js installed. Let's check first to avoid conflicts.

**Open Terminal:**
1. Press `Cmd + Space` to open Spotlight
2. Type "Terminal" and press Enter
3. You'll see a window with white text on black background

**Check for Node.js:**
```bash
node --version
```

**What You'll See:**

*If Node.js is already installed:*
```
v18.19.0
```
(Numbers will vary - this is the version)

*If Node.js is NOT installed:*
```
zsh: command not found: node
```

**If You See a Version Number:**
- Version 20+ → ✅ You're good to go, skip to Step 4
- Version 18-19 → ⚠️ Update recommended, continue with installation
- Version 16 or lower → ❌ Must update, continue with installation

### Step 2: Download Node.js LTS

For our NDIS platform, we need the LTS (Long Term Support) version for maximum stability.

**Visit the Official Website:**
1. Open your web browser (Safari, Chrome, etc.)
2. Go to: **https://nodejs.org**
3. You'll see the Node.js homepage

**What You'll See:**
- Large Node.js logo at the top
- Two green download buttons
- Left button: "20.x.x LTS Recommended For Most Users"
- Right button: "21.x.x Current Latest Features"

**Choose LTS (Left Button):**
- Click the **LTS** button (left side)
- This downloads the most stable version
- File will be named something like `node-v20.11.0.pkg`

**Why LTS?**
- **Stability:** Thoroughly tested for production use
- **Long-term Support:** Security updates for 30+ months
- **Business Reliability:** Perfect for your $299/month customer platform
- **Kiro Compatibility:** Guaranteed to work with Kiro IDE

### Step 3: Install Node.js

Once the download completes, let's install Node.js properly.

**Run the Installer:**
1. Find the downloaded `.pkg` file (usually in Downloads folder)
2. Double-click the file to start installation
3. Follow the installation wizard

**Installation Steps:**

**1. Introduction Screen**
- Shows "Install Node.js and npm"
- Click "Continue"

**2. License Agreement**
- Read the software license
- Click "Continue", then "Agree"

**3. Installation Type**
- Shows destination (usually Macintosh HD)
- Shows space required (~75MB)
- Click "Install"

**4. Administrator Password**
- Enter your Mac password (the one you use to log in)
- Click "Install Software"

**5. Installation Progress**
- Green progress bar shows installation status
- Takes 1-2 minutes typically

**6. Summary Screen**
- "The installation was successful"
- Click "Close"

**Why We Need Admin Password:**
Node.js installs system-wide tools that require administrator privileges. This is normal and safe.

### Step 4: Verify Installation Success

Let's confirm Node.js installed correctly and is ready for NDIS development.

**Test Node.js:**
1. Open Terminal (if closed): `Cmd + Space` → "Terminal"
2. Type: `node --version`
3. Press Enter

**Expected Output:**
```
v20.11.0
```
(Exact numbers may vary, but should start with v20 or higher)

**Test npm (Node Package Manager):**
1. Type: `npm --version`
2. Press Enter

**Expected Output:**
```
10.2.4
```
(Numbers may vary, should be 9.0 or higher)

**Test Global Installation Path:**
1. Type: `which node`
2. Press Enter

**Expected Output:**
```
/usr/local/bin/node
```

**✅ Success Indicators:**
- All three commands return version numbers or paths
- No "command not found" errors
- Version numbers are current (Node 20+, npm 9+)

**❌ Troubleshooting Common Issues:**

*Problem: "command not found: node"*
- **Solution:** Restart Terminal completely and try again
- If still not working, restart your Mac
- Path may need time to update

*Problem: Permission errors during installation*
- **Solution:** Make sure you're using an admin account
- Try right-clicking the installer and selecting "Open"

*Problem: Old version still showing*
- **Solution:** The old version takes precedence
- Type: `which node` to see which version is being used
- May need to update your PATH environment variable

### Step 5: Configure npm for NDIS Development

Let's optimize npm for our professional development workflow.

**Set npm Configuration:**
```bash
# Set npm to use faster registry
npm config set registry https://registry.npmjs.org/

# Configure npm for better error reporting
npm config set loglevel warn

# Set npm to save exact versions (important for business stability)
npm config set save-exact true
```

**Why These Settings Matter:**
- **Faster Registry:** Quicker package downloads
- **Better Logging:** Clear error messages for troubleshooting
- **Exact Versions:** Prevents unexpected updates that could break customer widgets

**Verify npm Configuration:**
```bash
npm config list
```

You should see your settings listed in the output.

---

## Kiro IDE Integration Preparation

Since our NDIS platform uses Kiro IDE for AI-assisted development, let's prepare Node.js for seamless integration.

**Create Kiro-Compatible Environment:**
```bash
# Create a global directory for npm packages
mkdir ~/.npm-global

# Configure npm to use this directory
npm config set prefix '~/.npm-global'

# Add to your shell profile (for Mac Sequoia with zsh)
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc

# Reload your shell configuration
source ~/.zshrc
```

**Why This Matters:**
- **Kiro Compatibility:** Ensures Kiro can access npm packages
- **Clean Development:** Separates global packages from system
- **Permission Fix:** Avoids permission issues with global installs
- **Professional Setup:** Industry-standard configuration

---

## Next Steps

**Immediate Actions:**
1. ✅ Verify Node.js and npm are working with the commands above
2. ✅ Check that versions are Node 20+ and npm 9+
3. ✅ Test creating a simple test file (optional)

**Quick Test (Optional):**
```bash
# Create a test directory
mkdir ~/ndis-test
cd ~/ndis-test

# Create a simple JavaScript file
echo 'console.log("NDIS Platform Ready!");' > test.js

# Run it with Node.js
node test.js

# Should output: NDIS Platform Ready!

# Clean up
cd ~
rm -rf ~/ndis-test
```

**Coming Next:**
- **File #2:** Setup_01_NodeJS_Installation_Part2.md (Node.js configuration and testing)
- **Supporting Files:** kiro-config/nodejs-setup.json (Kiro integration settings)

**Sprint 1 Progress:**
- ✅ File #1: Node.js Installation Part 1 (Complete)
- ⏳ File #2: Node.js Installation Part 2 (Next)
- ⏳ File #3: Kiro IDE Installation Part 1
- ⏳ File #4: Kiro IDE Installation Part 2
- ⏳ File #5: Git Setup Part 1

---

## Success Criteria Checklist

Before proceeding to File #2, ensure:
- [ ] Node.js version 20+ installed and working
- [ ] npm version 9+ installed and working  
- [ ] No "command not found" errors
- [ ] npm configuration set for professional development
- [ ] Kiro preparation steps completed
- [ ] Optional test file ran successfully

**Business Impact Achieved:**
✅ Foundation ready for $299/month NDIS widget development  
✅ Professional development environment established  
✅ Kiro IDE integration prepared  
✅ Australian compliance infrastructure ready

---

*Following master_development_guide.md - File #1 of 494 total files*  
*PHASE 1: FOUNDATION SETUP - Building toward revenue-generating MVP*  
*Next: Setup_01_NodeJS_Installation_Part2.md*