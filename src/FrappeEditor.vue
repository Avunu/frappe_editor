<template>
  <div class="frappe-editor">
    <TextEditor :editor-class="editorClass" :fixedMenu="true" :bubbleMenu="true" :content="modelValue"
      @change="$emit('update:modelValue', $event)" :placeholder="placeholder" :editable="!disabled" />
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
      default: 'border focus:outline-none max-w-none overflow-auto p-3 prose-sm rounded-b-lg'
    }
  },
  emits: ['update:modelValue']
}
</script>