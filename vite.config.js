import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
	plugins: [vue()],
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/index.js'),
			name: 'FrappeEditor',
			fileName: 'frappe-editor',
			formats: ['umd']
		},
		outDir: 'frappe_editor/public/dist',
		emptyOutDir: true,
		target: 'es2015',
		rollupOptions: {
			output: {
				assetFileNames: 'frappe-editor.css'
			}
		}
	},
	optimizeDeps: {
		include: [
			"frappe-ui",
		],
	},
	define: {
		'process.env': process.env
	},
})