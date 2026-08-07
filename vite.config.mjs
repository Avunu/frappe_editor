import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import fs from "node:fs";
import { createRequire } from "node:module";
import Icons from "unplugin-icons/vite";

const require = createRequire(import.meta.url);

// frappe-ui ships raw .vue sources, so @vue/compiler-sfc has to resolve the
// imported types behind its `defineProps<T>()` calls. It does that with the
// TypeScript *JS* API, which typescript@7 (the native Go port) no longer ships
// -- `require("typescript")` now exposes only `version`. `vue/compiler-sfc`
// auto-registers whatever `typescript` resolves to, so point it at an aliased
// TS 5 copy instead. This only drives build-time type resolution; the project's
// own `typescript` dependency stays on 7.
require("vue/compiler-sfc").registerTS(() => require("typescript-5"));

// Types imported across files also need filesystem access, which compiler-sfc
// otherwise takes from `ts.sys` -- absent for the same reason. Hand it node:fs.
const sfcFs = {
  fileExists: (file) => fs.existsSync(file),
  readFile: (file) => {
    try {
      return fs.readFileSync(file, "utf-8");
    } catch {
      return undefined;
    }
  },
  realpath: (file) => {
    try {
      return fs.realpathSync(file);
    } catch {
      return file;
    }
  },
};

export default defineConfig({
  plugins: [
    vue({ script: { fs: sfcFs } }),
    Icons({
      compiler: "vue3",
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(import.meta.dirname, "src/index.js"),
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
