import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import Icons from "unplugin-icons/vite";

export default defineConfig({
  plugins: [
    vue(),
    Icons({
      compiler: "vue3",
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      name: "FrappeEditor",
      fileName: "frappe-editor",
      formats: ["umd"],
    },
    outDir: "frappe_editor/public/dist",
    emptyOutDir: true,
    minify: true,
    target: "es2022",
    rollupOptions: {
      output: {
        assetFileNames: "frappe-editor.css",
      },
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "production"
    ),
  },
  optimizeDeps: {
    include: ["frappe-ui"],
  },
});
