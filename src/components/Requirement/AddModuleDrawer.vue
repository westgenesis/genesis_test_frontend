<!-- 父组件 -->
<template>
    <a-drawer title="新建功能模块" :visible="visible" @close="closeDrawer" placement="right" :width="500">
        <div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="moduleDescription">
                    功能模块名称
                </label>
                <a-input v-model:value="newModuleName" placeholder="请输入功能模块名称" />
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="moduleDescription">
                    功能模块定义文档
                </label>
                <requirement-docx ref="requirementDocxRef" />
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="moduleDescription">
                    功能模块描述
                </label>
                <a-textarea v-model:value="newModuleDescription" placeholder="请输入功能模块描述" />
            </div>

            <div class="flex justify-end">
                <a-button type="primary" @click="saveModule" class="custom-purple-button">保存</a-button>
            </div>
        </div>
    </a-drawer>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onUpdated } from 'vue';
import RequirementDocx from './AddRequirementDocx.vue';
import { http } from '../../http';
import HTMLtoDOCX from 'html-to-docx';

const props = defineProps({
    visible: Boolean,
    currentRequirement: Object,
});

const emit = defineEmits(['close']);

const newModuleName = ref('');
const newModuleDescription = ref('');
const requirementDocxRef = ref(null);

const closeDrawer = () => {
    emit('close');
};

const saveModule = () => {
    console.log({
        name: newModuleName.value,
        description: newModuleDescription.value,
        project_id: props.currentRequirement.project._id.$oid,
        req_id: props.currentRequirement.req.req_id,
    })
    const requirementDocxInstance = requirementDocxRef.value;
    if (requirementDocxInstance && requirementDocxInstance.documentWordEdit) {
        const documentWordEdit = requirementDocxInstance.documentWordEdit;
        HTMLtoDOCX(documentWordEdit.quill.getSemanticHTML()).then((data) => {
            const file = new File([data], newModuleName.value, {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            const formData = new FormData();
            const info = new Blob([
                JSON.stringify({
                    name: newModuleName.value,
                    description: newModuleDescription.value,
                    project_id: props.currentRequirement.project._id.$oid,
                    req_id: props.currentRequirement.req.req_id,
                    version: props.currentRequirement.req.version
                })
            ]);

            formData.append('user_file', file);
            formData.append('info', info);
            http.post('/api/add_function_module', formData).then((res) => {
                if (res) {
                    closeDrawer();
                } else {
                    console.error('保存失败');
                    closeDrawer();
                }
            });
        });
    } else {
        console.error('无法获取 documentWordEdit 实例');
    }
};
</script>

<style scoped>
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
</style>