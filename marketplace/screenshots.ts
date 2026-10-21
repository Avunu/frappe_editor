// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

import type { ShotSpec } from "./shots.d.ts";

// The demo Note from ui_text_editor/demo.py, saved in Quill's markup.
const NOTE = "/app/note/DEMO-RELEASE-NOTES";
const EDITOR = ".frappe-editor-root .ProseMirror";

export default {
	demo: { date: "2026-01-15", seed: 1 },
	shots: [
		{
			name: "note-editor",
			route: NOTE,
			alt: "A Note's content field in the frappe-ui editor, with its toolbar, headings, check list, bullet list and table",
			waitFor: `${EDITOR} table`,
			mask: [".frappe-timestamp"],
			readme: "hero",
			featured: true,
		},
		{
			name: "table-menu",
			route: NOTE,
			alt: "The row and column controls shown while the cursor is in a table",
			waitFor: `${EDITOR} table`,
			actions: [{ click: `${EDITOR} table tr:nth-child(3) td:nth-child(2) p` }, { wait: 500 }],
			mask: [".frappe-timestamp"],
			readme: "feature",
			featured: true,
		},
		{
			name: "bubble-menu",
			route: NOTE,
			alt: "The formatting menu shown when text is selected",
			waitFor: `${EDITOR} p strong`,
			actions: [
				{
					eval: `(() => {
						const el = document.querySelector(${JSON.stringify(`${EDITOR} p strong`)});
						document.querySelector(${JSON.stringify(EDITOR)}).focus();
						const range = document.createRange();
						range.selectNodeContents(el);
						const selection = window.getSelection();
						selection.removeAllRanges();
						selection.addRange(range);
					})()`,
				},
				{ wait: 500 },
			],
			mask: [".frappe-timestamp"],
			readme: "feature",
		},
	],
} satisfies ShotSpec;
