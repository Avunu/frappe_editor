// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

import assert from "node:assert/strict";
import { test } from "node:test";
import { scopeSelector } from "./scope.ts";

const scope = (selector: string) => scopeSelector(selector);

test("prefixes ordinary selectors", () => {
	assert.equal(scope(".flex"), ".frappe-editor-root .flex");
	assert.equal(scope("*, ::before"), ".frappe-editor-root *, ::before");
	assert.equal(scope("p:not(:where(.prose) *)"), ".frappe-editor-root p:not(:where(.prose) *)");
});

test("turns page-level selectors into the scope itself", () => {
	assert.equal(scope(":root"), ".frappe-editor-root");
	assert.equal(scope("html"), ".frappe-editor-root");
	assert.equal(scope("body"), ".frappe-editor-root");
	assert.equal(scope("html body"), ".frappe-editor-root");
	assert.equal(scope(":root.dark"), ".frappe-editor-root.dark");
});

test("does not mistake class names for page-level selectors", () => {
	assert.equal(scope(".html-viewer"), ".frappe-editor-root .html-viewer");
	assert.equal(scope("body-copy"), ".frappe-editor-root body-copy");
});

test("keeps the theme switch outside the scope", () => {
	assert.equal(scope('[data-theme="dark"]'), '[data-theme="dark"] .frappe-editor-root');
	assert.equal(
		scope('[data-theme="dark"] [type="checkbox"]:checked'),
		'[data-theme="dark"] .frappe-editor-root [type="checkbox"]:checked',
	);
});

test("is idempotent", () => {
	for (const selector of [".flex", ":root", '[data-theme="dark"]', "html body"]) {
		assert.equal(scope(scope(selector)), scope(selector));
	}
	assert.equal(
		scope(".frappe-editor-root.frappe-editor-portal"),
		".frappe-editor-root.frappe-editor-portal",
	);
});
