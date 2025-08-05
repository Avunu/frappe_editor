import "./style.css";
import { createApp, ref, h } from "vue";
import FrappeEditor from "./FrappeEditor.vue";

// Ensure popper roots are properly positioned for our editor
(function () {
	// Create or ensure the popper root exists and is properly positioned
	const ensurePopperRoot = () => {
		let popperRoot = document.getElementById("frappeui-popper-root");
		if (!popperRoot) {
			popperRoot = document.createElement("div");
			popperRoot.id = "frappeui-popper-root";
			document.body.appendChild(popperRoot);
		}

		// Ensure it has the correct positioning and styling
		Object.assign(popperRoot.style, {
			position: "absolute",
			top: "0",
			left: "0",
			zIndex: "9999",
		});

		return popperRoot;
	};

	// Ensure both roots exist when DOM is ready
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => {
			ensurePopperRoot();
		});
	} else {
		ensurePopperRoot();
	}
})();

frappe.ui.form.ControlTextEditor = class ControlTextEditor extends frappe.ui.form.ControlCode {
	make_wrapper() {
		super.make_wrapper();
	}

	make_input() {
		this.has_input = true;
		this.make_editor();
	}

	make_editor() {
		this.editor_container = $('<div class="frappe-editor-root">').appendTo(this.input_area);

		const self = this;
		this.content = ref(this.value);

		this.editor_app = createApp({
			setup() {
				return {
					content: self.content,
				};
			},
			render() {
				return h(FrappeEditor, {
					content: self.content.value,
					placeholder: self.df.placeholder || "",
					disabled: self.disabled,
					doctype: self.frm?.doctype,
					docname: self.frm?.docname,
					frm: self.frm,
					folder: self.df.folder || "Home/Attachments",
					onChange: (value) => {
						self.parse_validate_and_set_in_model(value);
					},
				});
			},
		});

		this.editor_app.mount(this.editor_container[0]);
	}

	set_formatted_input(value) {
		if (!this.editor_container) return;

		this.value = value;

		if (this.content) {
			this.content.value = value || "";
		}
	}

	get_input_value() {
		if (this.content) {
			return this.content.value || "";
		}
		return this.value || "";
	}
};
