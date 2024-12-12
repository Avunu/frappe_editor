module.exports = {
	plugins: {
		'tailwindcss/nesting': {},
		tailwindcss: {},
		autoprefixer: {},
		cssnano: {},
		'postcss-prefix-selector': {
			prefix: '.frappe-editor',
			transform: function (prefix, selector, prefixedSelector) {
				return prefix + ' ' + selector;
			}
		},
	},
}