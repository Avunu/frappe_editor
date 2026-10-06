// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * `createApp` for frappe-ui's editor popups.
 *
 * `vite.config.ts` routes the `vue` imports made from frappe-ui's editor
 * molecule here (see `editorPopups`). The editor opens its link, colour,
 * table-size and dialog popups as separate Vue apps mounted directly on
 * `<body>`, which sits outside the scoped stylesheet. Each one is tagged when
 * it mounts, and its overlays are pointed at the editor's portal host.
 */

import { createApp as createVueApp, type App, type Component } from "vue";
import { PORTAL_TARGET_KEY, adopt, portalHost } from "./scope";

export function createApp(
	rootComponent: Component,
	rootProps?: Record<string, unknown> | null,
): App {
	const app = createVueApp(rootComponent, rootProps);
	// A getter, so the host is created when the first overlay opens.
	app.provide(PORTAL_TARGET_KEY, portalHost);

	const mount = app.mount.bind(app);
	app.mount = (container) => {
		if (container instanceof Element) adopt(container);
		return mount(container);
	};
	return app;
}
