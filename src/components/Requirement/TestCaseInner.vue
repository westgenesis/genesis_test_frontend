<template>
    <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="detail" tab="测试用例详情"></a-tab-pane>
    </a-tabs>
    <a-form :model="form" layout="vertical">
        <a-form-item label="测试用例类型">
            <a-select v-model:value="form.type" placeholder="请选择测试用例类型">
                <a-select-option value="positive">正例</a-select-option>
                <a-select-option value="negative">反例</a-select-option>
            </a-select>
        </a-form-item>
        <a-form-item label="测试用例名称">
            <a-input v-model:value="form.testcase_name" placeholder="请输入测试用例名称" />
        </a-form-item>
        <a-form-item label="初始条件">
            <a-textarea v-model:value="form.pre_condition" placeholder="请输入初始条件" :rows="3" />
        </a-form-item>
        <a-form-item label="初始条件信号">
            <a-textarea v-model:value="form.pre_condition_signal" placeholder="请输入初始条件信号" :rows="3" />
        </a-form-item>
        <a-form-item label="触发条件">
            <a-textarea v-model:value="form.action" placeholder="请输入触发条件" :rows="3" />
        </a-form-item>
        <a-form-item label="触发条件信号">
            <a-textarea v-model:value="form.action_signal" placeholder="请输入触发条件信号" :rows="3" />
        </a-form-item>
        <a-form-item label="预期结果">
            <a-textarea v-model:value="form.result" placeholder="请输入预期结果" :rows="3" />
        </a-form-item>
        <a-form-item label="预期结果信号">
            <a-textarea v-model:value="form.result_signal" placeholder="请输入预期结果" :rows="3" />
        </a-form-item>
        <a-form-item>
            <div class="flex justify-center items-center" style="flex-direction: column;">
                <a-button type="primary" @click="handleSave" class="custom-purple-button">保存</a-button>
                <div style="color: red">提示：当前为V{{ form.version }}版本 保存后版本新增</div>
            </div>
        </a-form-item>
    </a-form>
</template>

<script setup lang="ts">
import { onMounted, watch, defineProps, computed, ref } from 'vue';
import { http } from '../../http';
import { ElMessage } from 'element-plus';
import { useProjectStore } from '../../stores/project';
const { refreshAllProjects } = useProjectStore();
const activeTab = ref('detail');

const props = defineProps({
    currentRequirement: {
        type: Object,
    },
    refreshAllProject: {
        type: Function
    }
});

const project_id = computed(() => {
    return props.currentRequirement?.project?._id?.$oid;
})
const req_id = computed(() => {
    return props.currentRequirement.req.req_id;
})
const split_file_id = computed(() => {
    return props.currentRequirement?.splitReq.split_file_id;
})
const split_case_id = computed(() => {
    return props.currentRequirement.splitCase.testcase_id;
})
const testcase_id = computed(() => {
    return props.currentRequirement?.testcase.testcase_id;
})

const form = ref({
    testcase_name: '',
    pre_condition: '',
    pre_condition_signal: '',
    action: '',
    action_signal: '',
    result: '',
    result_signal: '',
    version: '',
    project_id: '',
    testcase_id: '',
});

onMounted(() => {
    http.post('/api/query_testcase_by_id', {
        project_id: project_id.value,
        req_id: req_id.value,
        split_file_id: split_file_id.value,
        split_case_id: split_case_id.value,
        testcase_id: testcase_id.value
    }).then(resp => {
        if (resp.result) {
            form.value = resp
        }
    })

})

const handleSave = async () => {
    const params = {
        ...form.value,
        project_id: project_id.value,
        req_id: req_id.value,
        split_file_id: split_file_id.value,
        split_case_id: split_case_id.value,
        testcase_id: testcase_id.value
    }
    return http.post('/api/modify_testcase', params).then(async response => {
        if (response.status === 'OK') {
            ElMessage.success('保存成功');
            refreshAllProjects();
        }
    })
}



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
