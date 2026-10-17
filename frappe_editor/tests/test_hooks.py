# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""Smoke tests: the app's hooks load, and the desk bundle they name resolves.

The app has no Python behaviour of its own. What can break on the server side
is the contract between `hooks.py`, the Vite build (`vite.config.ts`) and the
bench's `sites/assets/assets.json`, which `scripts/vite-register.mjs` fills in.
"""

import json
import re
from pathlib import Path

import frappe
from frappe.tests import IntegrationTestCase
from frappe.utils.jinja_globals import bundled_asset

APP = "frappe_editor"
PACKAGE = Path(__file__).resolve().parent.parent
REPO = PACKAGE.parent
DIST = PACKAGE / "public" / "dist"
BUNDLES = {"app_include_js": "frappe_editor.bundle.js", "app_include_css": "frappe_editor.bundle.css"}


class TestHooks(IntegrationTestCase):
	def test_the_app_is_installed(self):
		self.assertIn(APP, frappe.get_installed_apps())

	def test_desk_includes_name_the_bundle(self):
		for hook, bundle in BUNDLES.items():
			with self.subTest(hook=hook):
				self.assertEqual(frappe.get_hooks(hook, app_name=APP), [bundle])

	def test_the_vite_build_writes_those_names(self):
		"""vite-register maps `<name>.bundle.<hash>.<ext>` to `<name>.bundle.<ext>`."""
		config = (REPO / "vite.config.ts").read_text()
		self.assertIn("js/frappe_editor.bundle.${hash}.js", config)
		self.assertIn("css/frappe_editor.bundle.${hash}", config)
		self.assertIn('outDir: "frappe_editor/public/dist"', config)
		self.assertIn(
			"node scripts/vite-register.mjs",
			json.loads((REPO / "package.json").read_text())["scripts"]["build"],
		)


class TestBuiltAssets(IntegrationTestCase):
	"""Only where the bundle was built and registered (`yarn build`, `bench build`).

	CI's test job does not build. CI's typecheck job builds the bundle alone
	(`yarn build:bundle`), with no bench to register it in, and so does a local
	`frappe-nix gate typecheck`: a bench without `assets.json` skips too.
	"""

	def setUp(self):
		if not (DIST / "manifest.json").exists():
			self.skipTest("the Vite bundle is not built here")
		if not frappe.read_file("assets/assets.json"):
			self.skipTest("no bundle is registered on this bench (sites/assets/assets.json)")

	def test_each_bundle_resolves_to_a_hashed_file(self):
		for bundle in BUNDLES.values():
			with self.subTest(bundle=bundle):
				url = bundled_asset(bundle, rtl=False)
				name, ext = bundle.split(".bundle.")
				self.assertRegex(
					url, rf"/assets/{APP}/dist/{ext}/{re.escape(name)}\.bundle\.[A-Za-z0-9_-]{{6,}}\.{ext}$"
				)
				self.assertTrue((DIST / url.split("/dist/", 1)[1]).is_file(), url)
