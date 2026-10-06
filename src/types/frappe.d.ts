// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * The slice of the Frappe desk's globals this bundle touches. Frappe ships no
 * type declarations, so only what `control.ts` and `upload.ts` use is listed.
 */

/** What every Frappe form control provides; `ControlCode` is the base used here. */
interface FrappeControl {
	df: { fieldname: string; placeholder?: string; max_height?: string; read_only?: 0 | 1 };
	/** The value in the model. */
	value?: string | null;
	disabled?: boolean;
	/** Set on a control rendered in a grid row. */
	grid_row?: unknown;
	frm?: { doctype: string; docname: string; is_new(): boolean };
	/** The element the control's input is built into. */
	input_area: HTMLElement;
	has_input: boolean;
	refresh(): void;
	parse_validate_and_set_in_model(value: unknown): Promise<unknown>;
}

declare const frappe: {
	ui: { form: { ControlCode: unknown; ControlTextEditor: unknown } };
	dom: { remove_script_and_style(html: string): string };
	/** The session's CSRF token, sent with uploads. */
	csrf_token?: string;
};

/** Frappe's translation function. */
declare function __(text: string, replace?: unknown, context?: string): string;
