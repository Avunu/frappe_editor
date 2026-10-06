// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * Builds the desk bundle: one IIFE, `frappe_editor.bundle.[hash].js`, plus its
 * stylesheet, into `frappe_editor/public/dist/`.
 *
 * The `*.bundle.[hash].*` names are what Frappe's own asset indexer
 * (`bench build --using-cached`) and `update-assets.mjs` map to the
 * `frappe_editor.bundle.js` / `.css` keys in `hooks.py`.
 *
 * The entry lives in `src/`, not `frappe_editor/public/`: Frappe's esbuild
 * compiles every `*.bundle.*` it finds under `public/` on its own, without Vue
 * SFCs, Tailwind or PostCSS, and would clobber this build.
 */

import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "tailwindcss";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { scopeCss } from "./build/scope.ts";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// frappe-ui's components declare props with imported types, which Vue's SFC
// compiler resolves through TypeScript's JS API.  The app's `typescript` is the
// native TS 7 build, which has none, so point the compiler at the TS 5 copy
// (`typescript5` alias).  Same compiler instance plugin-vue loads (CJS require).
const require = createRequire(import.meta.url);
require("vue/compiler-sfc").registerTS(() => require("typescript5"));

const POPUP_SHIM = "\0frappe-editor:vue-popups";

/**
 * Route `createApp` inside frappe-ui's editor to `src/popups.ts`.
 *
 * The editor opens several popups (link, colour, table size, dialogs) as
 * separate Vue apps mounted straight on `document.body`. They would sit outside
 * the scoped stylesheet, so the shim tags their container and points their
 * overlays at the editor's portal host. Only imports made from the editor
 * molecule are redirected; everything else gets the real `vue`.
 */
const editorPopups = (): Plugin => ({
	name: "frappe-editor:popups",
	enforce: "pre",
	async resolveId(source, importer) {
		if (source === POPUP_SHIM) return source;
		if (source !== "vue" || !importer) return null;
		if (!/[\\/]frappe-ui[\\/]src[\\/]molecules[\\/]editor[\\/]/.test(importer)) return null;
		return POPUP_SHIM;
	},
	load(id) {
		if (id !== POPUP_SHIM) return null;
		const popups = resolve(__dirname, "src/popups.ts").replaceAll("\\", "/");
		return `export * from "vue";\nexport { createApp } from ${JSON.stringify(popups)};`;
	},
});

export default defineConfig(({ mode }) => {
	// `yarn dev` rebuilds on every change. A fresh hash each time would leave
	// assets.json pointing at the first build, so development builds keep one
	// name (Frappe reads `dev` as the hash: `frappe_editor.bundle.dev.js`).
	const hash = mode === "development" ? "dev" : "[hash]";

	return {
		plugins: [editorPopups(), vue(), scopeCss()],
		base: "/assets/frappe_editor/dist/",
		css: {
			postcss: {
				plugins: [tailwindcss({ config: resolve(__dirname, "tailwind.config.js") })],
			},
		},
		build: {
			outDir: "frappe_editor/public/dist",
			// The dist folder holds only this build, so clear the previous hash.
			emptyOutDir: true,
			manifest: "manifest.json",
			sourcemap: true,
			cssCodeSplit: false,
			target: "es2022",
			rollupOptions: {
				input: resolve(__dirname, "src/index.ts"),
				onwarn(warning, warn) {
					// Drop noisy "/* #__PURE__ */" INVALID_ANNOTATION warnings from
					// third-party deps -- not actionable here. Anything outside
					// node_modules still surfaces normally.
					const where = String(warning.id ?? warning.loc?.file ?? warning.message ?? "");
					if (warning.code === "INVALID_ANNOTATION" && where.includes("node_modules")) return;
					warn(warning);
				},
				output: {
					format: "iife",
					entryFileNames: `js/frappe_editor.bundle.${hash}.js`,
					assetFileNames: (asset) =>
						asset.names.some((name) => name.endsWith(".css"))
							? `css/frappe_editor.bundle.${hash}[extname]`
							: "assets/[name]-[hash][extname]",
				},
			},
		},
	};
});
