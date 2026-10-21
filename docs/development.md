# Development

Requires Node 24+ and yarn. `nix develop` (or direnv) gives you both, plus the git hooks and a dev bench.

| Command                     | What it does                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn build`                | Builds the bundle, then registers it in the bench's `sites/assets/assets.json` (`scripts/vite-register.mjs`; skipped outside a bench) |
| `yarn dev`                  | Builds and registers the bundle, then rebuilds on change under a fixed file name. Reload the desk to pick it up                       |
| `yarn typecheck`            | Type-checks the code                                                                                                                  |
| `yarn lint` / `yarn format` | Runs oxlint and oxfmt                                                                                                                 |
| `yarn test`                 | Unit-tests the CSS scoping                                                                                                            |
| `yarn check:scope`          | Checks that the built stylesheet cannot match outside the editor                                                                      |
| `frappe-test --reuse-site`  | Runs the Python smoke tests (hooks, bundle names) on the dev site, with coverage                                                      |
| `frappe-shots`              | Rebuilds the demo site (`ui_text_editor/demo.py`) and retakes the screenshots in `docs/screenshots/`                                  |

## Where things live

- `src/index.ts`: the desk entry point. It replaces `frappe.ui.form.ControlTextEditor`.
- `src/control.ts`: the field control. It reads and writes the model, and is the only code that knows about Frappe.
- `src/FrappeEditor.vue`, `src/toolbar.ts`: the editor and its toolbar.
- `src/html.ts`: converts between the stored value and the editor's HTML.
- `src/upload.ts`: image uploads to Frappe's `upload_file`.
- `build/`: the CSS scoping used by the build, and its checks.
- `ui_text_editor/public/dist/`: the build output. It is generated and not committed.
- `marketplace/`: the marketplace listing and the screenshot spec.

## Why the CSS is scoped

The bundle loads on every desk page, but frappe-ui expects to own the page: it brings Tailwind's reset, its design tokens on `:root`, and generic class names such as `.flex` and `.border` that the desk's Bootstrap also defines. The build rewrites every rule so it only matches inside `.frappe-editor-root` (`build/scope.ts`), and `yarn check:scope` fails if one gets through. A new frappe-ui release that adds a rule shape the scoper doesn't know is the usual cause.

Two things keep the editor's floating UI inside that scope:

- frappe-ui's overlays (menus, tooltips, dialogs) teleport into one portal host that carries the scope class, through frappe-ui's `portalTargetKey`.
- The link, colour and table-size pop-ups mount their own Vue apps directly on `<body>`. `vite.config.ts` routes the `vue` imports made from frappe-ui's editor to `src/popups.ts`, which tags each of those containers and points their overlays at the same host.

If a pop-up ever shows up unstyled, check that it goes through one of those two paths.
