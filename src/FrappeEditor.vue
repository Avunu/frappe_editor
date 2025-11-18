<template>
	<div class="frappe-editor">
		<TextEditor
			ref="editor"
			:editor-class="editorClass"
			:fixedMenu="!hideToolbar"
			:bubbleMenu="!hideToolbar"
			:content="content"
			@change="$emit('change', $event)"
			:placeholder="placeholder"
			:editable="!disabled"
		/>
	</div>
</template>

<script>
import { TextEditor } from "frappe-ui";

export default {
	name: "FrappeEditor",
	components: {
		TextEditor,
	},
	props: {
		content: {
			type: String,
			default: "",
		},
		placeholder: {
			type: String,
			default: "",
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		hideToolbar: {
			type: Boolean,
			default: false,
		},
		editorClass: {
			type: String,
			default:
				"border focus:outline-none max-w-none overflow-auto p-3 prose-sm rounded-b-lg",
		},
	},
	emits: ["change"],
};
</script>
