<!-- Copyright (c) 2026, Avunu LLC and contributors
     For license information, please see license.txt -->

<template>
	<div
		class="frappe-editor flex w-full flex-col rounded-4 border border-outline-gray-2 bg-surface-base text-ink-gray-8 focus-within:border-outline-gray-4"
		:class="{ 'opacity-60': !editable }"
	>
		<Editor
			ref="editor"
			:model-value="modelValue"
			:extensions="extensions"
			:placeholder="placeholder"
			:editable="editable"
			:upload-function="uploadFunction"
			@blur="emit('blur')"
		>
			<EditorFixedMenu
				v-if="toolbar && editable"
				:items="TOOLBAR"
				size="sm"
				class="w-full flex-wrap border-b border-outline-gray-1 px-1 py-1"
			/>
			<EditorBubbleMenu v-if="toolbar && editable" :items="BUBBLE_MENU" />
			<EditorTableMenu v-if="toolbar && editable" :items="TABLE_MENU" />
			<EditorContent
				class="min-h-[6rem] w-full overflow-auto px-3 py-2"
				:style="{ maxHeight: maxHeight || undefined }"
			/>
		</Editor>
	</div>
</template>

<script setup lang="ts">
import { markRaw, onBeforeUnmount, onMounted, useTemplateRef } from "vue";
import {
	Editor,
	EditorBubbleMenu,
	EditorContent,
	EditorFixedMenu,
	EditorTableMenu,
	Heading,
	RichTextKit,
	type TiptapEditor,
	type UploadFunction,
} from "frappe-ui/editor";
import { BUBBLE_MENU, TABLE_MENU, TOOLBAR } from "./toolbar";

/**
 * A rich-text editor on frappe-ui's `Editor`.
 *
 * `modelValue` is the editor's own HTML; the control (`control.ts`) converts to
 * and from the value Frappe stores. `change` fires for edits only -- never for
 * `modelValue` being replaced from outside, and never for the editor tidying
 * its own document.
 */
withDefaults(
	defineProps<{
		modelValue?: string;
		placeholder?: string;
		editable?: boolean;
		/** Show the toolbar and selection menus. Off for compact uses such as grid cells. */
		toolbar?: boolean;
		/** CSS max-height of the content area; it scrolls beyond that. */
		maxHeight?: string;
		uploadFunction?: UploadFunction;
	}>(),
	{ modelValue: "", placeholder: "", editable: true, toolbar: true, maxHeight: "" },
);

const emit = defineEmits<{
	/** The HTML after an edit, and whether the document is now empty. */
	change: [html: string, isEmpty: boolean];
	blur: [];
}>();

const editor = useTemplateRef<{ isEmpty: boolean; editor: TiptapEditor | null }>("editor");

/**
 * What the editor can author. Rich text, tables and task lists, plus images
 * (uploaded through Frappe). Left out on purpose:
 * - slash commands, mentions, emoji and tags open suggestion popups that
 *   frappe-ui mounts on `<body>` outside the scoped stylesheet;
 * - video, attachments, iframe embeds and the image gallery, which Frappe's
 *   Text Editor never had (and the server strips `<iframe>` anyway);
 * - Typography, which silently rewrites quotes and dashes in business text.
 *
 * Extensions are class instances the editor reads directly, so keep Vue's
 * proxies off them.
 */
const extensions = markRaw([
	RichTextKit.configure({
		// Registered below, on its own: the kit's heading comes with `HeadingIds`,
		// which stamps a generated id on every heading -- table-of-contents
		// bookkeeping that would end up in the stored value.
		heading: false,
		video: false,
		attachment: false,
		iframe: false,
		imageGroup: false,
		imageViewer: false,
		slashCommands: false,
		emoji: false,
		mention: false,
		tag: false,
		typography: false,
	}),
	Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
]);

/**
 * TipTap emits `update` when any transaction in a chain changed the document --
 * including follow-ups that plugins append on their own (a trailing paragraph
 * after a final list, say) the first time the editor is touched. Reporting
 * those would write to the model, and dirty the form, just from clicking into
 * a field. Only a transaction that itself changed the document is an edit.
 */
let instance: TiptapEditor | null = null;

function onUpdate({ editor: tiptap, transaction }: { editor: TiptapEditor; transaction: any }) {
	if (!transaction.docChanged) return;
	emit("change", tiptap.getHTML(), tiptap.isEmpty);
}

onMounted(() => {
	instance = editor.value?.editor ?? null;
	instance?.on("update", onUpdate);
});

onBeforeUnmount(() => instance?.off("update", onUpdate));

defineExpose({
	focus: () => editor.value?.editor?.commands.focus(),
});
</script>
