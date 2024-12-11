module.exports = {
	presets: [require("frappe-ui/src/tailwind/preset.js")],
	content: [
		"./src/*.{vue,js,ts}",
		"./node_modules/frappe-ui/src/components/**/*.{vue,js,ts}",
	]
}