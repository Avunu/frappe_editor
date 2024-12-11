import { createApp, h } from 'vue';
import FrappeEditor from './FrappeEditor.vue';

frappe.ui.form.ControlTextEditor = class ControlTextEditor extends frappe.ui.form.ControlCode {
    make_wrapper() {
        super.make_wrapper();
    }

    make_input() {
        this.has_input = true;
        this.make_editor();
    }

    make_editor() {
        this.editor_container = $('<div class="relative w-full">').appendTo(this.input_area);
        
        this.editor_app = createApp({
            render: () => h(FrappeEditor, {
                modelValue: this.value,
                placeholder: this.df.placeholder || '',
                disabled: this.disabled,
                'onUpdate:modelValue': (value) => {
                    this.parse_validate_and_set_in_model(value);
                }
            })
        });

        // Add portal settings
        this.editor_app.config.unwrapInjectedRef = true;
        this.editor_app.mount(this.editor_container[0]);
    }

    set_formatted_input(value) {
        if (!this.editor_container) return;
        
        if (this.value !== value) {
            this.value = value;
            this.editor_app.unmount();
            this.make_editor();
        }
    }

    destroy() {
        if (this.editor_app) {
            this.editor_app.unmount();
            this.editor_app = null;
        }
        super.destroy();
    }
};