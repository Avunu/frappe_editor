// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/// <reference types="frappe-types/global" />

/**
 * The desk globals (`frappe`, `__`) come from frappe-types. This file only
 * adds the control shape `control.ts` builds on.
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
