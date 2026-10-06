// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

import { content as frappeUIContent } from "frappe-ui/tailwind";
import frappeUIPreset from "frappe-ui/tailwind";

// Tailwind 3 reads `content` from the app's own config only (a preset's is
// ignored), so frappe-ui's sources are listed here. Its `content` export covers
// the whole library -- charts, list, the docs theme -- and every `lucide-*`
// icon those use is a data-URI rule, so list only what the editor renders: the
// editor molecule and the components it imports (and the shared parts those
// use). A class missing from this list shows up as an unstyled control.
const uiRoot = frappeUIContent[0].replace(/\/src\/\*\*.*$/, "");
const ui = (dir) => `${uiRoot}/src/${dir}/**/*.{vue,js,ts}`;

/** @type {import('tailwindcss').Config} */
export default {
	presets: [frappeUIPreset],
	content: [
		"./src/**/*.{vue,ts}",
		ui("molecules/editor"),
		...[
			"Button",
			"Combobox",
			"Dialog",
			"Dropdown",
			"ErrorMessage",
			"InputLabeling",
			"ItemListRow",
			"Menu",
			"Popover",
			"Select",
			"Spinner",
			"Textarea",
			"TextInput",
			"Tooltip",
			"shared",
		].map((component) => ui(`components/${component}`)),
	],
};
