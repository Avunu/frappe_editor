#!/usr/bin/env node
// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * Fails the build if any rule in the compiled stylesheet could match outside
 * `.frappe-editor-root`.
 *
 * The bundle loads on every desk page, so one unscoped selector -- a new
 * frappe-ui rule the scoper did not understand -- restyles the whole desk.
 * Run after `yarn build:bundle`.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const SCOPE = ".frappe-editor-root";
const CSS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "frappe_editor",
  "public",
  "dist",
  "css",
);

const files = fs.existsSync(CSS_DIR)
  ? fs.readdirSync(CSS_DIR).filter((f) => f.endsWith(".css"))
  : [];
if (!files.length) {
  console.error(`No stylesheet in ${CSS_DIR} -- run \`yarn build:bundle\` first.`);
  process.exit(1);
}

/** Split on commas that are not inside brackets or parentheses. */
function topLevel(selector) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    const c = selector[i];
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (c === "," && depth === 0) {
      parts.push(selector.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(selector.slice(start).trim());
  return parts;
}

/** `[data-theme="dark"] .frappe-editor-root ...` -- the theme switch lives on <html>, above the scope. */
const SCOPED = new RegExp(`^(\\[data-theme[^\\]]*\\]\\s+)?${SCOPE.replace(".", "\\.")}(?![\\w-])`);

function isScoped(selector) {
  const inner = /^:is\((.*)\)$/s.exec(selector);
  if (inner) return topLevel(inner[1]).every(isScoped);
  return SCOPED.test(selector);
}

let rules = 0;
const leaks = new Set();

for (const file of files) {
  postcss.parse(fs.readFileSync(path.join(CSS_DIR, file), "utf8")).walkRules((rule) => {
    // Keyframe steps (`from`, `50%`) are not selectors.
    if (rule.parent?.type === "atrule" && rule.parent.name.endsWith("keyframes")) return;
    rules++;
    for (const selector of topLevel(rule.selector)) {
      if (!isScoped(selector)) leaks.add(selector);
    }
  });
}

if (leaks.size) {
  console.error(`${leaks.size} selector(s) are not scoped to ${SCOPE}:`);
  for (const selector of leaks) console.error(`  ${selector}`);
  process.exit(1);
}
console.log(`ok: all ${rules} rules are scoped to ${SCOPE}`);
