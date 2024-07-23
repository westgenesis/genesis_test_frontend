<template>
    <div ref="quillEditorRef" class="docx-editor"></div>
</template>

<script setup lang="ts">
import { DocumentWordEdit } from './DocumentWordEdit';
import { ref, onMounted } from 'vue';

const quillEditorRef = ref();
let documentWordEdit: DocumentWordEdit;

onMounted(() => {
    documentWordEdit = new DocumentWordEdit(quillEditorRef.value);
    const emptyDoc = new Blob([], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    const file = new File([emptyDoc], 'empty.docx');
    documentWordEdit.docxToQuill(file);
});
</script>

<style scoped lang="less">
</style>