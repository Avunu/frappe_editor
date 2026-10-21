# Rich Text Editor for Desk

Rich text editor from frappe-ui for every Text Editor field in the Frappe desk

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
bench get-app https://github.com/Avunu/ui_text_editor --branch develop
bench --site <site> install-app ui_text_editor
bench build --app ui_text_editor
```

## Development

The build commands, the source layout and the CSS scoping are described in [Development](development.md).

## License

[MIT](license.txt), Copyright (c) 2024–present Avunu LLC.
