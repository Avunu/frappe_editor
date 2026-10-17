// Copyright (c) 2026, Avunu LLC and contributors
// For license information, please see license.txt

/**
 * Image uploads for the editor.
 *
 * Posts to Frappe's `upload_file` and resolves with the File document, which
 * is what frappe-ui's media nodes read `file_url` from. (frappe-ui ships an
 * uploader of its own, but it lives in the library's root entry, which would
 * pull every component into this bundle.)
 */

import type { UploadedMedia, UploadFunction } from "frappe-ui/editor";

/** The document an upload is attached to; empty while it is still unsaved. */
export interface UploadTarget {
	doctype?: string;
	docname?: string;
	fieldname?: string;
}

/** What `upload_file` answers with: the File document, or Frappe's error fields. */
interface UploadResponse {
	message?: Partial<UploadedMedia>;
	_server_messages?: string;
	exception?: string;
	_error_message?: string;
}

/** `{ message }` from Frappe's JSON response, or the server's own error text. */
function failure(body: UploadResponse | undefined, fallback: string): string {
	try {
		const messages: string[] = JSON.parse(body?._server_messages ?? "[]");
		const first = messages
			.map((message) => (JSON.parse(message) as { message?: string }).message)
			.find(Boolean);
		if (first) return first;
	} catch {
		// fall through to the generic message
	}
	return body?.exception ?? body?._error_message ?? fallback;
}

export function createUploader(target: () => UploadTarget): UploadFunction {
	return (file, options) =>
		new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", "/api/method/upload_file");
			xhr.setRequestHeader("Accept", "application/json");
			if (frappe.csrf_token) xhr.setRequestHeader("X-Frappe-CSRF-Token", frappe.csrf_token);

			xhr.upload.addEventListener("progress", (event) => {
				if (!event.lengthComputable) return;
				options?.onProgress?.({
					loaded: event.loaded,
					total: event.total,
					percent: Math.round((event.loaded / event.total) * 100),
				});
			});
			options?.signal?.addEventListener("abort", () => xhr.abort(), { once: true });

			xhr.addEventListener("load", () => {
				let body: UploadResponse | undefined;
				try {
					body = JSON.parse(xhr.responseText) as UploadResponse;
				} catch {
					// not JSON: reported below
				}
				const media = body?.message;
				if (xhr.status >= 200 && xhr.status < 300 && media?.file_url) {
					resolve(media as UploadedMedia);
				} else {
					reject(new Error(failure(body, __("Could not upload the file."))));
				}
			});
			xhr.addEventListener("error", () => reject(new Error(__("Could not upload the file."))));
			xhr.addEventListener("abort", () => reject(new DOMException("Upload aborted", "AbortError")));

			const form = new FormData();
			form.append("file", file, file.name);
			// Public: rich text is rendered in emails and web pages, where a private
			// file would not load.
			form.append("is_private", "0");
			form.append("folder", "Home");
			const { doctype, docname, fieldname } = target();
			if (doctype && docname) {
				form.append("doctype", doctype);
				form.append("docname", docname);
				if (fieldname) form.append("fieldname", fieldname);
			}
			xhr.send(form);
		});
}
