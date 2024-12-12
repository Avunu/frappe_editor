import './style.css';
import { createApp, ref, h } from 'vue';
import FrappeEditor from './FrappeEditor.vue';

// Monkey patch to reroute the popper root
(function() {
    const originalAppend = document.body.appendChild.bind(document.body);
    document.body.appendChild = function(node) {
      if (node.id === 'frappeui-popper-root') {
        // We want to mount this inside a known container for our editor
        // We'll assume an element with class .frappe-editor-root exists in the DOM
        const container = document.querySelector('.frappe-editor-root');
        if (container) {
          container.appendChild(node);
          return node;
        }
      }
      return originalAppend(node);
    };
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
                    content: self.content
                }
            },
            render() {
                return h(FrappeEditor, {
                    content: self.content.value,
                    placeholder: self.df.placeholder || '',
                    disabled: self.disabled,
                    onChange: (value) => {
                        self.parse_validate_and_set_in_model(value);
                    }
                })
            }
        });

        this.editor_app.mount(this.editor_container[0]);
    }

    set_formatted_input(value) {
        if (!this.editor_container) return;
        
        this.value = value;
        
        if (this.content) {
            this.content.value = value || '';
        }
    }

    get_input_value() {
        if (this.content) {
            return this.content.value || '';
        }
        return this.value || '';
    }
};