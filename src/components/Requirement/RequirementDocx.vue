<template>
    <div>
        <div class="flex mt-[2rem] mb-[1rem]">
            <div class="w-[160px] ml-[1rem] flex items-center justify-center">
                功能模块名称
            </div>
            <a-input v-model:value="fileName" placeholder="输入文件名" style="width: 18.5rem;" />
        </div>
    </div>
    <div ref="quillEditorRef" class="docx-editor"></div>
    <div class="flex justify-center mt-[1rem]">
                    <a-button type="primary" size="large" @click="onSaveContent"
                        class="custom-purple-button">保存</a-button>
                </div>
</template>

<script setup lang="ts">
import HTMLtoDOCX from 'html-to-docx';
import { DocumentWordEdit } from './DocumentWordEdit';
import { ref, defineProps, onMounted } from 'vue';
import { useProductFetch } from '../../handler/handler';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useProjectStore } from '../../stores/project';
const { handler } = useProductFetch();

const props = defineProps({
    record: {
        type: Object,
        required: true
    },
    currentRequirement: {
        type: Object,
    }
})
const fileName = ref(props.record?.file_name?.replace('.docx', ''));
console.log(props.record);
console.log(props.currentRequirement);
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
const { refreshAllProjects } = useProjectStore();
const onSaveContent = () => {
    ElMessageBox.confirm('保存后会覆盖文件，是否确定？', '覆盖提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
    }).then(() => {
        HTMLtoDOCX(documentWordEdit.quill.getSemanticHTML()).then((data) => {
            const file = new File([data], fileName.value, {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            const formData = new FormData();
            const info = new Blob([
                JSON.stringify({
                    db_id: props.currentRequirement.project._id.$oid,
                    category: 'save_requirement_docx',
                    ...props.record,
                    newFileName: fileName.value,
                    req_id: props.currentRequirement.req.req_id,
                })
            ]);

            formData.append('user_file', file);
            formData.append('info', info);
            handler.UploadFile(formData).then((res) => {
                if (res) {
                    ElMessage.success('保存成功');
                    props.record.version = (Number(props.record.version) + 0.1).toFixed(1);
                    refreshAllProjects();
                } else {
                    ElMessage.error('保存失败');
                }
            });
        });
    });
};

</script>


<style scoped lang="less">
.custom-purple-button {
    background-color: purple;
    border-color: purple;
}

.custom-purple-button:hover,
.custom-purple-button:focus {
    background-color: purple !important;
    border-color: purple !important;
    filter: opacity(0.9);
}

/* 覆盖 el-radio-button 的默认样式 */
:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
    background-color: purple;
    border-color: purple;
}

:deep(.el-radio-button__inner) {
    color: purple;
    border-color: purple;
}

:deep(.el-radio-button__original-radio:checked+.el-radio-button__inner) {
    background-color: purple;
    border-color: purple !important;
}
</style>
