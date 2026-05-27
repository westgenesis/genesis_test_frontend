<template>
  <MdEditor v-model="markdownText" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { MdEditor } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import mammoth from "mammoth";
import { markdownToDoc } from "../../utils/markdown.ts";

const markdownText = ref("");

async function loadDocx(file: File): Promise<void> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  markdownText.value = result.value;
}

const getMarkdown = (): string => {
  return markdownText.value;
};

const getDocx = async (fileName: string): Promise<File> => {
  const markdown = markdownText.value;
  const file = await markdownToDoc(markdown, fileName);
  return file;
};

defineExpose({
  loadDocx,
  getMarkdown,
  getDocx,
});
</script>
