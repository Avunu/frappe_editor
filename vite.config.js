import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import autoprefixer from 'autoprefixer'
// import postcssModules from 'postcss-modules'
import prefixer from 'postcss-prefix-selector'
import Icons from 'unplugin-icons/vite';


export default defineConfig({
	plugins: [
		vue(),
		Icons({
			compiler: 'vue3'
		})
	],
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/index.js'),
			name: 'FrappeEditor',
			fileName: 'frappe-editor',
			formats: ['umd']
		},
		outDir: 'frappe_editor/public/dist',
		emptyOutDir: true,
		minify: true,
		target: 'es2015',
		rollupOptions: {
			output: {
				assetFileNames: 'frappe-editor.css'
			}
		}
	},
	// css: {
	// 	modules: {
	// 		scopeBehavior: 'local',
	// 		generateScopedName: '[hash:base64:5]',
	// 		localsConvention: 'camelCaseOnly'
	// 	},
	// 	postcss: {
	// 		plugins: [
	// 			autoprefixer(),
	// 			prefixer({
	// 				prefix: '.frappe-editor',
	// 				transform(prefix, selector, prefixedSelector, filePath, rule) {
	// 					return prefix + ' ' + selector;
	// 				}
	// 			}),
	// 		]
	// 	}
	// },
	define: {
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
	},
	optimizeDeps: {
		include: [
			"frappe-ui"
		],
	},
})