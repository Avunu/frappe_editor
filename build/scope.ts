// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * CSS scoping for the editor bundle.
 *
 * frappe-ui is built for pages it owns: Tailwind's preflight, the token
 * variables on `:root` and generic class names like `.flex`, `.border` or
 * `.hidden`. The Frappe desk is a Bootstrap page that already defines several
 * of those, so the compiled stylesheet is rewritten so that every rule only
 * matches inside `.frappe-editor-root` -- the editor's own mount point, plus
 * the portal host and popup containers that `src/scope.ts` tags.
 */

import postcss, { type AnyNode } from "postcss";
import prefixSelector from "postcss-prefix-selector";
import type { Plugin } from "vite";

export const SCOPE = ".frappe-editor-root";

/** Page-level selectors that, inside the editor, mean "the editor root". */
const PAGE_ROOT = /^(?:html\s+body|:root\s+body|html|:root|body)(?![\w-])/;

/** The theme switch Frappe (and frappe-ui's `darkMode`) keys off, on `<html>`. */
const THEME = /^(\[data-theme[^\]]*\])\s*/;

/**
 * Map one source selector to its scoped form.
 *
 * - `:root` / `html` / `body` become the scope itself, so the token variables
 *   and base typography land on the editor root instead of the page.
 * - A leading `[data-theme="dark"]` stays *outside* the scope. It sits on
 *   `<html>`, above the editor, so `[data-theme="dark"] .frappe-editor-root .x`
 *   is the only order that can match.
 * - Selectors that are already scoped pass through, which keeps the transform
 *   idempotent (PostCSS re-visits a rule after it has been modified).
 */
export function scopeSelector(selector: string, prefix: string = SCOPE): string {
	const theme = THEME.exec(selector);
	const rest = theme ? selector.slice(theme[0].length) : selector;
	const lead = theme ? `${theme[1]} ` : "";

	if (rest.startsWith(prefix)) return selector;
	if (PAGE_ROOT.test(rest)) return lead + rest.replace(PAGE_ROOT, prefix);
	return `${lead}${prefix}${rest ? ` ${rest}` : ""}`;
}

/**
 * frappe-ui writes its editor styles with native CSS nesting. A nested rule is
 * resolved against its parent, which is already scoped, so prefixing it too
 * would turn `ul { li {} }` into `.root ul { .root li {} }` and never match.
 * (Rules inside an `@media` or `@supports` that is itself inside a rule count.)
 */
function isNested(node: AnyNode | undefined): boolean {
	for (let parent = node?.parent; parent; parent = parent.parent) {
		if (parent.type === "rule") return true;
	}
	return false;
}

const scoper = postcss([
	prefixSelector({
		prefix: SCOPE,
		transform: (prefix, selector, _prefixed, _file, rule) =>
			isNested(rule) ? selector : scopeSelector(selector, prefix),
	}),
]);

/** Plain stylesheets, and the style blocks Vue serves as `Foo.vue?...&lang.css`. */
const STYLESHEET = /\.css(?:$|\?)|[?&]lang\.css/;

/**
 * Scope every stylesheet in the bundle.
 *
 * This is a Vite plugin rather than a PostCSS plugin on purpose. Vue resolves
 * `:global(...)` in `<style scoped>` blocks *after* PostCSS has run, and when it
 * does it discards everything written before the `:global`, prefix included.
 * Registered after `vue()`, this transform sees each stylesheet in its final
 * form. Tailwind has already run by then, so the scoped output is what ships.
 */
export const scopeCss = (): Plugin => ({
	name: "frappe-editor:scope-css",
	async transform(code, id) {
		if (!STYLESHEET.test(id)) return null;
		const result = await scoper.process(code, { from: id, map: false });
		return { code: result.css, map: null };
	},
});
