module.exports = {
	presets: [require('frappe-ui/src/tailwind/preset.js')],
	content: [
	  './src/*.{vue,js}',
	  './node_modules/frappe-ui/src/components/**/*.{vue,js}',
	  './node_modules/@tiptap/**/*.{vue,js,ts}',
	],
	theme: {
	  extend: {},
	},
	plugins: [],
	important: true,
	minify: true,
  }