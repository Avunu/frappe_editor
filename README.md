<!-- Copyright (c) 2026, Avunu LLC and contributors
For license information, please see license.txt-->

# Frappe UI Editor Integration

Incorporate the Text Editor control from Frappe UI into the Frappe Framework. Who's not to like?

This app replaces the Quill editor behind every **Text Editor** field in the desk with the [frappe-ui](https://github.com/frappe/frappe-ui) editor (TipTap). No doctype changes are needed, and values already saved by the Quill editor open as they were.

## What you get

- A toolbar with headings, bold, italic, underline, strike, inline code, text and highlight colour, bullet, numbered and check lists, indent, alignment, quote, code block, horizontal rule, links, images, tables, undo and redo. Selecting text shows a small formatting menu; being inside a table shows row and column controls.
- Image upload: paste, drop or use the toolbar. Images are uploaded to Frappe's `upload_file` as public files, so they also load in emails and web pages. In a saved document they are attached to it; in a new one they are uploaded without an attachment.
- Light and dark theme, following the desk.
- A compact editor without the toolbar in grid rows, and `max_height` support.

## What is different from the Quill editor

- The value is saved the way Quill saved it: wrapped in `<div class="ql-editor read-mode">`, and an empty editor saves an empty string. Print formats, emails and read-only views keep working.
- Quill's bullet lists, check lists and alignment are converted when a value is opened. Text direction (RTL), font sizes and nested indentation that Quill stored as classes are not carried over.
- **Not included:** `@` mentions, emoji, slash commands, video, file attachments and iframe embeds. The editor's pop-ups for those are not styled for the desk, and the server strips iframes anyway.
- The `Comment` box in the form timeline is a separate control and still uses Quill.

## Installation

```bash
bench get-app https://github.com/Avunu/frappe_editor --branch develop
bench --site <site> install-app frappe_editor
bench build --app frappe_editor
```

## Development

Requires Node 22+ and yarn.

| Command | What it does |
| --- | --- |
| `yarn build` | Builds the bundle, then updates `sites/assets/assets.json` |
| `yarn dev` | Builds and registers the bundle, then rebuilds on change under a fixed file name. Reload the desk to pick it up |
| `yarn typecheck` | Type-checks the code |
| `yarn lint` / `yarn format` | Runs oxlint and oxfmt |
| `yarn test` | Unit-tests the CSS scoping |
| `yarn check:scope` | Checks that the built stylesheet cannot match outside the editor |

Where things live:

- `src/index.ts`: the desk entry point. It replaces `frappe.ui.form.ControlTextEditor`.
- `src/control.ts`: the field control. It reads and writes the model, and is the only code that knows about Frappe.
- `src/FrappeEditor.vue`, `src/toolbar.ts`: the editor and its toolbar.
- `src/html.ts`: converts between the stored value and the editor's HTML.
- `build/`: the CSS scoping used by the build, and its checks.
- `frappe_editor/public/dist/`: the build output. It is generated and not committed.

### Why the CSS is scoped

The bundle loads on every desk page, but frappe-ui expects to own the page: it brings Tailwind's reset, its design tokens on `:root`, and generic class names such as `.flex` and `.border` that the desk's Bootstrap also defines. The build rewrites every rule so it only matches inside `.frappe-editor-root` (`build/scope.ts`), and `yarn check:scope` fails if one gets through. A new frappe-ui release that adds a rule shape the scoper doesn't know is the usual cause.

Two things keep the editor's floating UI inside that scope:

- frappe-ui's overlays (menus, tooltips, dialogs) teleport into one portal host that carries the scope class, through frappe-ui's `portalTargetKey`.
- The link, colour and table-size pop-ups mount their own Vue apps directly on `<body>`. `vite.config.ts` routes the `vue` imports made from frappe-ui's editor to `src/popups.ts`, which tags each of those containers and points their overlays at the same host.

If a pop-up ever shows up unstyled, check that it goes through one of those two paths.

## License

[MIT](license.txt), Copyright (c) 2026 Avunu LLC.
