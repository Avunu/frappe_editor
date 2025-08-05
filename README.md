### Frappe UI Editor Integration

Incorporate the Text Editor control from Frappe UI into the Frappe Framework. Who\'s not to like?

### Features

- **Frappe FileUploader Integration**: Images are uploaded using Frappe's built-in file library (`frappe.ui.FileUploader`) instead of direct uploads
- **Document Context**: File uploads are automatically associated with the current document (doctype/docname)
- **Customizable Folders**: Upload files to specific folders within the Frappe file system
- **Fallback Support**: Falls back to default frappe-ui upload behavior when not in a Frappe environment

### Usage

When using the editor in a Frappe form, the following props are automatically passed from the form context:

- `doctype`: The document type of the current form
- `docname`: The name of the current document
- `frm`: The form object for additional context
- `folder`: The folder where uploaded files should be stored (defaults to "Home/Attachments")

### Custom Usage

You can also use the editor standalone with custom Frappe context:

```vue
<FrappeEditor
  v-model:content="content"
  doctype="Blog Post"
  docname="blog-post-001"
  folder="Home/Blog Images"
  placeholder="Start writing..."
/>
```

### Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app https://github.com/Avunu/frappe_editor --branch develop
bench install-app frappe_editor
```

### Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/frappe_editor
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade

### License

mit
