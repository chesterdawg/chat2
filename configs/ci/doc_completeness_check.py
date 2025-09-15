#!/usr/bin/env python3
import os, sys, json, re

ROOT = os.path.dirname(os.path.dirname(__file__))
DOCS = os.path.join(ROOT, "docs")
GUARD = os.path.join(ROOT, "configs", "quality", "placeholder_guard.json")

with open(GUARD) as f:
    banned = set(json.load(f).get("banned_tokens", []))

missing = []
violations = []

for root, _, files in os.walk(DOCS):
    for fn in files:
        if not fn.endswith(".md"):
            continue
        path = os.path.join(root, fn)
        text = open(path, "r", encoding="utf-8").read()
        # Required sections
        must = ["## What", "## Why", "## How", "## Verify", "## Troubleshoot", "## Acceptance Criteria"]
        for m in must:
            if m not in text:
                missing.append((path, m))
        # Banned tokens
        for token in banned:
            if token in text:
                violations.append((path, token))

if missing or violations:
    print("Doc completeness check failed:")
    for p, m in missing:
        print(f" - Missing section {m} in {p}")
    for p, t in violations:
        print(f" - Banned token '{t}' found in {p}")
    sys.exit(1)

print("Doc completeness check passed.")
