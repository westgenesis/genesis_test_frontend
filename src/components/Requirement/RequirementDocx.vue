<template>
    <div ref="quillEditorRef" class="docx-editor"></div>
</template>

<script setup lang="ts">
import HTMLtoDOCX from 'html-to-docx';
import { DocumentWordEdit } from './DocumentWordEdit';
import { ref, defineProps, onMounted } from 'vue';
import { useProductFetch } from '../../handler/handler';

const { handler } = useProductFetch();

const props = defineProps({
    record: {
        type: Object,
        required: true
    }
})
console.log(props);

const quillEditorRef = ref();
let documentWordEdit: DocumentWordEdit
onMounted(async () => {
    documentWordEdit = new DocumentWordEdit(quillEditorRef.value);
    handler
        .DownloadFile(props.record.object_name.split('/')[0], props.record.object_name).then((stream: any) => {
            const blob = new Blob([stream], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            })
            const file = new File([blob], props.record.object_name)
            documentWordEdit.docxToQuill(file)
        })
})

</script>


<style scoped lang="less">

</style>
