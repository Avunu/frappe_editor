module.exports = {
	plugins: {
		'tailwindcss/nesting': {},
		tailwindcss: {},
		autoprefixer: {},
		cssnano: {},
		'postcss-prefix-selector': {
			prefix: '.frappe-editor',
			transform: function (prefix, selector, prefixedSelector) {
				if (selector.startsWith('#frappeui-popper-root')) {
					return selector
				}
				return prefix + ' ' + selector;
			}
		},
	},
}