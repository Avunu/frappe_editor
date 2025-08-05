<template>
	<div class="frappe-editor">
		<TextEditor
			ref="editor"
			:editor-class="editorClass"
			:fixedMenu="true"
			:bubbleMenu="true"
			:content="content"
			@change="$emit('change', $event)"
			:placeholder="placeholder"
			:editable="!disabled"
			:uploadFunction="uploadFunction"
		/>
	</div>
</template>

<script>
import { TextEditor, useFileUpload } from "frappe-ui";

// Custom upload function that uses Frappe's FileUploader when available
function createFrappeUploadFunction(context) {
	return (file) => {
		return new Promise((resolve, reject) => {
			// Check if we're in a Frappe environment with FileUploader available
			if (typeof frappe !== 'undefined' && frappe.ui && frappe.ui.FileUploader) {
				// Use Frappe's FileUploader
				new frappe.ui.FileUploader({
					doctype: context?.doctype,
					docname: context?.docname,
					frm: context?.frm,
					files: [file],
					folder: context?.folder || "Home/Attachments",
					on_success(file_doc) {
						// Transform Frappe file_doc to match expected UploadedFile format
						const uploadedFile = {
							file_name: file_doc.file_name,
							file_size: file_doc.file_size,
							file_url: file_doc.file_url,
							name: file_doc.name,
							owner: file_doc.owner,
							creation: file_doc.creation,
							modified: file_doc.modified,
							modified_by: file_doc.modified_by,
							is_private: file_doc.is_private,
							file_type: file_doc.file_type,
							folder: file_doc.folder,
							is_folder: file_doc.is_folder,
							content_hash: file_doc.content_hash
						};
						resolve(uploadedFile);
					},
					on_error(error) {
						reject(new Error(error || 'Failed to upload file'));
					}
				});
			} else {
				// Fallback to default frappe-ui upload behavior
				try {
					const fileUpload = useFileUpload();
					fileUpload.upload(file).then(resolve).catch(reject);
				} catch (error) {
					reject(new Error('No upload method available'));
				}
			}
		});
	};
}

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
		editorClass: {
			type: String,
			default:
				"border focus:outline-none max-w-none overflow-auto p-3 prose-sm rounded-b-lg",
		},
		// Frappe-specific props for file uploading
		doctype: {
			type: String,
			default: null,
		},
		docname: {
			type: String,
			default: null,
		},
		frm: {
			type: Object,
			default: null,
		},
		folder: {
			type: String,
			default: "Home/Attachments",
		},
	},
	emits: ["change"],
	computed: {
		uploadFunction() {
			return createFrappeUploadFunction({
				doctype: this.doctype,
				docname: this.docname,
				frm: this.frm,
				folder: this.folder
			});
		}
	},
};
</script>
