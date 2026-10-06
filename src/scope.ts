// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * Where the editor's floating UI lives.
 *
 * The stylesheet is scoped to `.frappe-editor-root` (see `build/scope.ts`), so
 * anything frappe-ui renders outside an editor -- dropdowns, the link and
 * colour popups, dialogs -- has to land inside an element that carries that
 * class, or it would render unstyled.
 */

/** Every rule in the bundle's stylesheet only matches under this class. */
export const SCOPE_CLASS = "frappe-editor-root";

/**
 * frappe-ui's documented hook for "teleport your overlays here"
 * (`portalTargetKey` in `usePortalTarget.ts`). It is `Symbol.for`, so it
 * matches without importing the library's root entry -- which would drag every
 * component into this bundle.
 */
export const PORTAL_TARGET_KEY = Symbol.for("frappe-ui:portal-target");

/**
 * Above Frappe's modals (Bootstrap's `.modal` is 1050) so a popup opened from
 * an editor inside a dialog is not hidden behind it.
 */
const POPUP_Z_INDEX = "1200";

let host: HTMLElement | undefined;

/** The element every frappe-ui overlay teleports into; created on first use. */
export function portalHost(): HTMLElement {
	if (host?.isConnected) return host;
	host = document.createElement("div");
	host.className = `${SCOPE_CLASS} frappe-editor-portal`;
	document.body.append(host);
	return host;
}

/**
 * Bring a popup container that frappe-ui mounted itself under the scoped
 * stylesheet, and above Frappe's own overlays.
 */
export function adopt(container: Element): void {
	container.classList.add(SCOPE_CLASS);
	if (container instanceof HTMLElement) container.style.setProperty("z-index", POPUP_Z_INDEX);
}
