<template>
    <div ref="quillEditorRef" class="docx-editor"></div>
</template>

<script setup lang="ts">
import { DocumentWordEdit } from './DocumentWordEdit';
import { ref, onMounted } from 'vue';

const quillEditorRef = ref();
let documentWordEdit = ref();

onMounted(() => {
    documentWordEdit.value = new DocumentWordEdit(quillEditorRef.value);
    const emptyDoc = new Blob([], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    const file = new File([emptyDoc], 'empty.docx');
    documentWordEdit.value.docxToQuill(file);
});

defineExpose({
    documentWordEdit
});
</script>

<style scoped lang="less">
</style>