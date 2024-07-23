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
                <requirement-docx :record="{}" />
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
import { ref, defineProps, defineEmits } from 'vue';
import RequirementDocx from './AddRequirementDocx.vue';

const props = defineProps({
    visible: Boolean
});

const emit = defineEmits(['close', 'save']);

const newModuleName = ref('');
const newModuleDescription = ref('');

const closeDrawer = () => {
    emit('close');
};

const saveModule = () => {
    // 发出保存事件，并传递新模块的名称和描述
    emit('save', {
        name: newModuleName.value,
        description: newModuleDescription.value
    });
    closeDrawer();
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