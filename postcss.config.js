module.exports = {
	plugins: {
		'tailwindcss/nesting': {},
		tailwindcss: {},
		autoprefixer: {},
		'postcss-prefix-selector': {
			prefix: '.frappe-editor',
			transform: function (prefix, selector, prefixedSelector) {
				// Don't prefix selectors that are already targeting popover containers
				if (selector.startsWith('#frappeui-popper-root') || 
				    selector.startsWith('[data-tippy-root]') ||
				    selector.includes('[data-headlessui-')) {
					return selector
				}
				
				// Generate dual selectors: one for .frappe-editor and one for popover containers
				const popoverSelectors = [
					'#frappeui-popper-root ' + selector,
					'[data-tippy-root] ' + selector
				];
				
				return [prefix + ' ' + selector, ...popoverSelectors].join(', ');
			}
		},
		cssnano: {},
	},
}