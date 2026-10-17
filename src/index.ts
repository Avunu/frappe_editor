// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * @module frappe_editor.bundle
 *
 * Desk entry point, loaded on every page through `app_include_js`. It swaps
 * Frappe's Quill-based `Text Editor` control for the frappe-ui editor; fields
 * built after this runs use it, with no change to doctypes or stored values.
 */

// The stylesheet first, so Tailwind's base layer precedes frappe-ui's own CSS.
// A re-export (of nothing) rather than a bare import: the module runs either way.
export * from "./style.css";
import { installTextEditorControl } from "./control";

installTextEditorControl();
