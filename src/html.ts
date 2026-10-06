// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * Conversions between the HTML Frappe stores for a Text Editor field and the
 * HTML the editor works with.
 *
 * Frappe's Quill control saves every value wrapped in
 * `<div class="ql-editor read-mode">` -- that class is what the desk, print
 * formats and emails key their rich-text styling off -- and writes an empty
 * editor as an empty paragraph. This keeps those conventions, so values round
 * trip between this control, Quill, and everything that renders them.
 */

const WRAPPER_CLASS = "ql-editor read-mode";

/** Quill's `ql-align-*` classes, as the inline style the editor reads. */
const ALIGN = /\bql-align-(center|right|justify)\b/;

/**
 * Stored value -> editor content.
 *
 * Drops the wrapper and rewrites the Quill-only markup the editor would
 * otherwise misread: bullet and check lists (Quill puts all three kinds in an
 * `<ol>` and tells them apart with `data-list`), alignment classes and its
 * `ql-ui` list-marker spans.
 */
export function fromFrappe(value: string | null | undefined): string {
	if (!value) return "";

	// DOMParser documents are inert: nothing runs and nothing is fetched.
	const body = new DOMParser().parseFromString(value, "text/html").body;

	const only = body.children.length === 1 ? body.firstElementChild : null;
	const root = only?.matches(".ql-editor") ? only : body;

	for (const marker of root.querySelectorAll(".ql-ui, .ql-cursor")) marker.remove();

	for (const element of root.querySelectorAll<HTMLElement>("[class*='ql-align-']")) {
		const align = ALIGN.exec(element.className)?.[1];
		if (align) element.style.textAlign = align;
	}

	for (const list of root.querySelectorAll("ol")) {
		// Ordered lists are the one kind Quill really does write as an `<ol>`.
		const kind = list.querySelector(":scope > li[data-list]")?.getAttribute("data-list");
		if (kind !== "bullet" && kind !== "checked" && kind !== "unchecked") continue;

		const replacement = document.createElement("ul");
		if (kind !== "bullet") {
			replacement.setAttribute("data-type", "taskList");
			for (const item of list.querySelectorAll<HTMLElement>(":scope > li")) {
				item.setAttribute("data-type", "taskItem");
				item.setAttribute("data-checked", String(item.getAttribute("data-list") === "checked"));
			}
		}
		replacement.append(...list.childNodes);
		list.replaceWith(replacement);
	}

	return root.innerHTML;
}

/** Editor content -> the value stored on the document. */
export function toFrappe(html: string, isEmpty: boolean): string {
	// An empty editor stores nothing, so mandatory-field checks (which strip the
	// tags) and "is this field set" queries behave as they do for Quill.
	if (isEmpty) return "";
	return `<div class="${WRAPPER_CLASS}">${html}</div>`;
}
