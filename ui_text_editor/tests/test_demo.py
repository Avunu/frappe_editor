# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""The demo hook frappe-demo calls (`ui_text_editor.demo.setup`)."""

import datetime

import frappe
from frappe.tests import IntegrationTestCase

from ui_text_editor import demo

CTX = {"today": datetime.date(2026, 1, 15), "seed": 1, "company": None, "erpnext_demo": False}


class TestDemo(IntegrationTestCase):
	def test_setup_creates_the_note_in_quill_markup(self):
		demo.setup(CTX)
		note = frappe.get_doc("Note", demo.NOTE)
		self.assertTrue(note.content.startswith('<div class="ql-editor read-mode">'))
		self.assertIn('data-list="checked"', note.content)
		self.assertIn("January 29, 2026", note.content)

	def test_setup_is_idempotent(self):
		demo.setup(CTX)
		demo.setup(CTX)
		self.assertEqual(frappe.db.count("Note", {"name": demo.NOTE}), 1)
