<template>
  <div class="frappe-editor-wrapper">
    <TextEditor
      :editor-class="editorClass"
      :fixedMenu="true"
      :bubbleMenu="true"
      :content="modelValue"
      @change="$emit('update:modelValue', $event)"
      :placeholder="placeholder"
      :editable="!disabled"
    />
  </div>
</template>

<script>
import { TextEditor } from 'frappe-ui'

export default {
  name: 'FrappeEditor',
  components: {
    TextEditor
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    editorClass: {
      type: String,
      default: 'prose-sm border max-w-none rounded-lg p-3 overflow-auto focus:outline-none'
    }
  },
  emits: ['update:modelValue']
}
</script>

<style>
.frappe-editor-wrapper {
  position: relative;
  isolation: isolate;
}

/* Ensure menus stay within the editor container */
.frappe-editor-wrapper :deep(.text-editor-menu) {
  position: absolute;
  z-index: 10;
}

/* Portal containment */
#frappeui-popper-root,
#headlessui-portal-root {
  position: relative !important;
  z-index: auto !important;
}
</style>