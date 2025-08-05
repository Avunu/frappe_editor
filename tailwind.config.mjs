import frappeUIPreset from "frappe-ui/src/tailwind/preset"

export default {
	presets: [frappeUIPreset],
	content: [
		"./src/**/*.{vue,js,ts,jsx,tsx}",
		"./node_modules/frappe-ui/src/components/**/*.{vue,js,ts,jsx,tsx}",
		"./node_modules/@tiptap/**/*.{vue,js,ts,jsx,tsx}",
	],
	theme: {
		extend: {},
	},
	plugins: [],
	important: true,
	minify: true,
}