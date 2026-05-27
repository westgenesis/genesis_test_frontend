<template>
  <DocumentWordEditor ref="editorRef" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import DocumentWordEditor from "./DocumentWordEditor.vue";

const editorRef = ref<InstanceType<typeof DocumentWordEditor>>();

defineExpose({
  loadDocx: (file: File) => editorRef.value?.loadDocx(file),
  getMarkdown: () => editorRef.value?.getMarkdown() ?? "",
  getDocx: (fileName: string) => editorRef.value?.getDocx(fileName),
});
</script>
