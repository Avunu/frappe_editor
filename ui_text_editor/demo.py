# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""Demo data for frappe-demo and the screenshots in docs/screenshots/.

The app has no DocTypes of its own: it changes how every Text Editor field is
edited. The demo is one Note, a core DocType whose `content` is a Text Editor
field, saved the way Frappe's Quill control saves rich text, so the screenshots
show that value opening in the new editor.
"""

import frappe

NOTE = "DEMO-RELEASE-NOTES"

# Quill's own markup: the read-mode wrapper, bullet and check lists as `<ol>`
# with `data-list`, and an alignment class. The editor converts it on open.
CONTENT = """<div class="ql-editor read-mode">
<h2>Release 16.2 notes</h2>
<p>The <strong>spring release</strong> ships on <em>{release}</em>. Read the
<a href="https://docs.frappe.io/framework">framework documentation</a> before upgrading.</p>
<h3>Checklist</h3>
<ol>
<li data-list="checked">Freeze the release branch</li>
<li data-list="checked">Run the migration on a copy of production</li>
<li data-list="unchecked">Update the changelog</li>
<li data-list="unchecked">Announce the release</li>
</ol>
<h3>What changed</h3>
<ol>
<li data-list="bullet">Faster list views on large tables</li>
<li data-list="bullet">A new <code>bench doctor</code> report</li>
<li data-list="bullet">Smaller print format PDFs</li>
</ol>
<table>
<tbody>
<tr><th><p>Area</p></th><th><p>Owner</p></th><th><p>Status</p></th></tr>
<tr><td><p>Accounts</p></td><td><p>Priya</p></td><td><p>Ready</p></td></tr>
<tr><td><p>Stock</p></td><td><p>Marco</p></td><td><p>In review</p></td></tr>
<tr><td><p>HR</p></td><td><p>Aisha</p></td><td><p>Ready</p></td></tr>
</tbody>
</table>
<blockquote><p>Questions go to the release channel.</p></blockquote>
<p class="ql-align-center"><em>Thank you, everyone.</em></p>
</div>"""


def setup(ctx):
	"""Create the demo Note once; `ctx["today"]` dates the release it describes."""
	if frappe.db.exists("Note", NOTE):
		return
	release = frappe.utils.formatdate(frappe.utils.add_days(ctx["today"], 14), "MMMM d, yyyy")
	frappe.get_doc(
		{
			"doctype": "Note",
			"title": "Release 16.2 notes",
			"public": 1,
			"content": CONTENT.format(release=release),
		}
	).insert(ignore_permissions=True, set_name=NOTE)
