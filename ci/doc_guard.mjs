#!/usr/bin/env node
/**
 * Doc completeness guard (Node.js / ESM)
 *
 * Place at: <repo_root>/ci/doc_guard.mjs
 * Pipeline command: node ci/doc_guard.mjs
 *
 * Exit codes:
 *  0 = all good
 *  1 = missing files and/or placeholder hits
 *  2 = unexpected runtime error
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ------- Defaults -----------------------------------------------------------

const DEFAULT_REQUIRED = [
  // Sprint 0 docs
  'docs/setup_01_nodejs_part2.md',
  'docs/setup_02_kiro_install_part1.md',
  'docs/setup_03_git_repo_part1.md',
  'docs/setup_04_code_quality_part1_eslint_prettier.md',
  'docs/setup_05_accessibility_baseline.md',
  'docs/setup_06_security_baseline.md',
  'docs/setup_07_ci_baseline.md',
  // Required configs
  'configs/ci/pipeline.json',
  'configs/security/baseline.json',
  'configs/quality/eslint.config.json',
  'configs/quality/prettier.config.json',
  'configs/kiro/project.json',
  'configs/kiro/steering-rules.json',
  'configs/kiro/prompts/batch_prompt_template.md',
  'configs/kiro/prompts/sprint1_batchA_prompt.md',
  'configs/sources/allowlist.json'
];

const DEFAULT_PLACEHOLDERS = [
  String.raw`\\bREPLACE_WITH_TODAYS_DATE\\b`,
  String.raw`\\bTODO\\b`,
  String.raw`\\bTBD\\b`,
  String.raw`\\bFIXME\\b`,
];

const SCAN_SUFFIXES = new Set(['.md', '.json', '.yml', '.yaml', '.txt', '.rtf']);

// ------- CLI args -----------------------------------------------------------

function parseArgs(argv) {
  const out = {
    format: 'json',
    allowPlaceholders: false,
    root: null,
    list: false,
    require: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--format') {
      out.format = argv[++i] || out.format;
    } else if (a === '--allow-placeholders') {
      out.allowPlaceholders = true;
    } else if (a === '--root') {
      out.root = argv[++i] || null;
    } else if (a === '--list') {
      out.list = true;
    } else if (a === '--require') {
      out.require.push(argv[++i]);
    }
  }
  return out;
}

// ------- Utils --------------------------------------------------------------

function regexCompile(pattern) {
  try {
    return new RegExp(pattern, 'i');
  } catch {
    return new RegExp(pattern.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'i');
  }
}

async function loadJsonIfExists(p) {
  try {
    const s = await fs.readFile(p, 'utf8');
    return JSON.parse(s);
  } catch {
    return null;
  }
}

async function loadManifest(root) {
  const candidates = [
    path.join(root, 'configs', 'ci', 'doc_guard.json'),
    path.join(root, 'configs', 'ci', 'required.json'),
  ];

  let required = [...DEFAULT_REQUIRED];
  let placeholders = [...DEFAULT_PLACEHOLDERS];

  for (const c of candidates) {
    const data = await loadJsonIfExists(c);
    if (data && typeof data === 'object') {
      if (Array.isArray(data.required_files)) {
        required = Array.from(new Set(data.required_files));
      }
      if (Array.isArray(data.placeholder_patterns)) {
        placeholders = Array.from(new Set(data.placeholder_patterns));
      }
    }
  }
  return { required, placeholders };
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function scanFileForPlaceholders(filePath, regexes) {
  const hits = [];
  let text;
  try {
    text = await fs.readFile(filePath, 'utf8');
  } catch {
    return hits;
  }
  for (const rx of regexes) {
    let m;
    while ((m = rx.exec(text)) !== null) {
      // Compute line number and excerpt
      const before = text.slice(0, m.index);
      const lineNo = before.split('\\n').length;
      const lineStart = before.lastIndexOf('\\n') + 1;
      const nextNl = text.indexOf('\\n', m.index);
      const lineEnd = nextNl === -1 ? text.length : nextNl;
      const excerpt = text.slice(lineStart, lineEnd).trim().slice(0, 240);
      hits.push({ line: lineNo, match: m[0], excerpt });
    }
  }
  return hits;
}

// ------- Main ---------------------------------------------------------------

async function main() {
  const argv = parseArgs(process.argv.slice(2));

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Default root: parent of /ci when script lives in <root>/ci
  const defaultRoot = path.basename(__dirname) === 'ci'
    ? path.resolve(__dirname, '..')
    : process.cwd();

  const root = path.resolve(argv.root || defaultRoot);

  // Load manifest (optional) and merge --require entries
  const { required, placeholders } = await loadManifest(root);
  const requiredAll = Array.from(new Set([...required, ...argv.require.filter(Boolean)]));
  const placeholderRegexes = placeholders.map(regexCompile);

  if (argv.list) {
    for (const r of requiredAll) console.log(r);
    process.exit(0);
  }

  const missing = [];
  const placeholderHits = [];

  for (const rel of requiredAll) {
    const p = path.join(root, rel);
    const exists = await pathExists(p);
    if (!exists) {
      missing.push(rel);
      continue;
    }
    if (!argv.allowPlaceholders) {
      const ext = path.extname(p).toLowerCase();
      if (SCAN_SUFFIXES.has(ext)) {
        const hits = await scanFileForPlaceholders(p, placeholderRegexes);
        for (const h of hits) {
          placeholderHits.push({ file: rel, ...h });
        }
      }
    }
  }

  const ok = (missing.length === 0) && (argv.allowPlaceholders || placeholderHits.length === 0);

  const report = {
    root,
    required_count: requiredAll.length,
    missing,
    placeholder_hits: placeholderHits,
    placeholders_checked: !argv.allowPlaceholders
  };

  if (argv.format === 'text') {
    console.log(`Root: ${report.root}`);
    console.log(`Required files: ${report.required_count}`);
    if (missing.length) {
      console.log('\\nMissing:');
      for (const m of missing) console.log(`  - ${m}`);
    }
    if (!argv.allowPlaceholders && placeholderHits.length) {
      console.log('\\nPlaceholder hits:');
      for (const h of placeholderHits) {
        console.log(`  - ${h.file}:${h.line}  '${h.match}'  | ${h.excerpt}`);
      }
    }
  } else {
    console.log(JSON.stringify(report, null, 2));
  }

  process.exit(ok ? 0 : 1);
}

main().catch(err => {
  console.error('Unexpected error:', err?.stack || err);
  process.exit(2);
});
