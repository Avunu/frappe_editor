#!/usr/bin/env node
// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * Post-build script to update Frappe's assets.json with the Vite build output.
 * Mimics Frappe's esbuild cache-busting scheme.
 *
 * Reads the Vite manifest from the dist folder and maps the entry's hashed
 * filename to the key that Frappe's `app_include_js` / `app_include_css`
 * hooks resolve through assets.json.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const APP_NAME = "frappe_editor";
const SITES_PATH = path.resolve(__dirname, "..", "..", "sites");
const DIST_PATH = path.resolve(__dirname, APP_NAME, "public", "dist");
const ASSETS_JSON_PATH = path.resolve(SITES_PATH, "assets", "assets.json");
const ASSETS_DEST_PATH = path.resolve(SITES_PATH, "assets", APP_NAME, "dist");

/**
 * `manifestFile` is the manifest filename set in vite.config.ts.
 * `jsKey` / `cssKey` are the lookup keys used in hooks.py's
 * `app_include_js` / `app_include_css`.
 */
const BUNDLE = {
  manifestFile: "manifest.json",
  jsKey: "frappe_editor.bundle.js",
  cssKey: "frappe_editor.bundle.css",
};

function isSameFile(a, b) {
  return fs.existsSync(b) && fs.realpathSync(a) === fs.realpathSync(b);
}

/** Copy a built file to the assets destination and register it in assets.json. */
function publish(file, key, assetsJson) {
  const source = path.join(DIST_PATH, file);
  const dest = path.join(ASSETS_DEST_PATH, file);

  if (!fs.existsSync(source)) {
    console.warn(`  Warning: file not found: ${source}`);
    return;
  }

  // `sites/assets/<app>` is usually a symlink to `public/`, in which case the
  // file is already in place and there is nothing to copy.
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!isSameFile(source, dest)) {
    fs.copyFileSync(source, dest);
    if (fs.existsSync(source + ".map")) {
      fs.copyFileSync(source + ".map", dest + ".map");
    }
  }

  assetsJson[key] = `/assets/${APP_NAME}/dist/${file}`;
  console.log(`  ${key} -> ${assetsJson[key]}`);
}

function main() {
  const manifestPath = path.resolve(DIST_PATH, BUNDLE.manifestFile);
  if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath} -- run \`yarn build:bundle\` first.`);
    process.exit(1);
  }

  let assetsJson = {};
  if (fs.existsSync(ASSETS_JSON_PATH)) {
    assetsJson = JSON.parse(fs.readFileSync(ASSETS_JSON_PATH, "utf-8"));
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  for (const entry of Object.values(manifest)) {
    if (entry.isEntry) {
      publish(entry.file, BUNDLE.jsKey, assetsJson);
      // The CSS an entry pulls in (Vite extracts it for IIFE builds).
      for (const cssFile of entry.css ?? []) {
        publish(cssFile, BUNDLE.cssKey, assetsJson);
      }
    } else if (entry.file.endsWith(".css")) {
      // Standalone CSS entry (`cssCodeSplit: false` emits one).
      publish(entry.file, BUNDLE.cssKey, assetsJson);
    }
  }

  fs.writeFileSync(ASSETS_JSON_PATH, JSON.stringify(assetsJson, null, 4));
  console.log(`\nUpdated ${ASSETS_JSON_PATH}`);
}

main();
