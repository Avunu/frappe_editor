// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

import type { ShotSpec } from "./shots.d.ts";

// The demo Note from ui_text_editor/demo.py, saved in Quill's markup.
const NOTE = "/app/note/DEMO-RELEASE-NOTES";
const EDITOR = ".frappe-editor-root .ProseMirror";
const EDITABLE = `${EDITOR}[contenteditable="true"]`;

// A Note opens in read mode; this does what its "Edit mode" button does, then waits for the
// editable editor to hold the converted content.
const READY =
	'window.cur_frm && cur_frm.doc && cur_frm.doc.name === "DEMO-RELEASE-NOTES" && !!cur_frm.events.set_editable';
const EDIT = [
	{ eval: "cur_frm.is_note_editable = true; cur_frm.events.set_editable(cur_frm);" },
	{ waitFor: `${EDITABLE} table` },
	// The browser's spell-check underlines depend on its dictionary; leave them out of the shots.
	{ eval: `document.querySelector(${JSON.stringify(EDITABLE)}).spellcheck = false;` },
	{ wait: 500 },
];

export default {
	demo: { date: "2026-01-15", seed: 1 },
	shots: [
		{
			name: "note-editor",
			route: NOTE,
			alt: "A Note's content field in the frappe-ui editor, with its toolbar, headings, check list, bullet list and table",
			waitForFn: READY,
			actions: [...EDIT],
			mask: [".frappe-timestamp"],
			readme: "hero",
			featured: true,
		},
		{
			name: "table-menu",
			route: NOTE,
			alt: "The row and column controls shown while the cursor is in a table",
			waitForFn: READY,
			actions: [...EDIT, { click: `${EDITABLE} table tr:nth-child(3) td:nth-child(2) p` }, { wait: 500 }],
			mask: [".frappe-timestamp"],
			readme: "feature",
			featured: true,
		},
	],
} satisfies ShotSpec;
