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

        <!-- 初始条件 -->
        <a-card title="初始条件描述/信号" style="margin-bottom: 1rem;">
            <div v-for="(item, index) in form.pre_condition_items" :key="index" class="condition-row">
                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-input v-model:value="item.description" placeholder="请输入初始条件描述" />
                    </a-col>
                    <a-col :span="12">
                        <a-input v-model:value="item.signal" placeholder="请输入初始条件信号" />
                    </a-col>
                </a-row>
            </div>
            <div>
                <a-button type="dashed" @click="addPreConditionItem" style="margin-right: 1rem;">+ 添加一行</a-button>
                <a-button type="dashed" @click="removePreConditionItem">- 删除一行</a-button>
            </div>
        </a-card>

        <!-- 触发条件 -->
        <a-card title="触发条件描述/信号" style="margin-bottom: 1rem;">
            <div v-for="(item, index) in form.action_items" :key="index" class="condition-row">
                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-input v-model:value="item.description" placeholder="请输入触发条件描述" />
                    </a-col>
                    <a-col :span="12">
                        <a-input v-model:value="item.signal" placeholder="请输入触发条件信号" />
                    </a-col>
                </a-row>
            </div>
            <div>
                <a-button type="dashed" @click="addActionItem" style="margin-right: 1rem;">+ 添加一行</a-button>
                <a-button type="dashed" @click="removeActionItem">- 删除一行</a-button>
            </div>
        </a-card>

        <!-- 预期结果 -->
        <a-card title="预期结果描述/信号" style="margin-bottom: 1rem;">
            <div v-for="(item, index) in form.result_items" :key="index" class="condition-row">
                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-input v-model:value="item.description" placeholder="请输入预期结果描述" />
                    </a-col>
                    <a-col :span="12">
                        <a-input v-model:value="item.signal" placeholder="请输入预期结果信号" />
                    </a-col>
                </a-row>
            </div>
            <div>
                <a-button type="dashed" @click="addResultItem" style="margin-right: 1rem;">+ 添加一行</a-button>
                <a-button type="dashed" @click="removeResultItem">- 删除一行</a-button>
            </div>
        </a-card>

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
    pre_condition_items: [] as { description: string; signal: string }[],
    action_items: [] as { description: string; signal: string }[],
    result_items: [] as { description: string; signal: string }[],
});

const fetchData = () => {
    http.post('/api/query_testcase_by_id', {
        project_id: project_id.value,
        req_id: req_id.value,
        split_file_id: split_file_id.value,
        split_case_id: split_case_id.value,
        testcase_id: testcase_id.value
    }).then(resp => {
        if (resp.result) {
            form.value = {
                ...resp,
                pre_condition_items: resp.pre_condition.split('\n').map((description, index) => ({
                    description,
                    signal: resp.pre_condition_signal.split('\n')[index] || ''
                })),
                action_items: resp.action.split('\n').map((description, index) => ({
                    description,
                    signal: resp.action_signal.split('\n')[index] || ''
                })),
                result_items: resp.result.split('\n').map((description, index) => ({
                    description,
                    signal: resp.result_signal.split('\n')[index] || ''
                })),
            };
        }
    })
}

onMounted(() => {
    fetchData();
});


watch([project_id, req_id, split_file_id, split_case_id, testcase_id], () => {
    fetchData();
});


const handleSave = async () => {
    const params = {
        ...form.value,
        project_id: project_id.value,
        req_id: req_id.value,
        split_file_id: split_file_id.value,
        split_case_id: split_case_id.value,
        testcase_id: testcase_id.value,
        pre_condition: form.value.pre_condition_items.map(item => item.description).join('\n'),
        pre_condition_signal: form.value.pre_condition_items.map(item => item.signal).join('\n'),
        action: form.value.action_items.map(item => item.description).join('\n'),
        action_signal: form.value.action_items.map(item => item.signal).join('\n'),
        result: form.value.result_items.map(item => item.description).join('\n'),
        result_signal: form.value.result_items.map(item => item.signal).join('\n'),
    }
    return http.post('/api/modify_testcase', params).then(async response => {
        if (response.status === 'OK') {
            ElMessage.success('保存成功');
            refreshAllProjects();
        }
    })
}

// 添加行逻辑
const addPreConditionItem = () => {
    form.value.pre_condition_items.push({ description: '', signal: '' });
};

const addActionItem = () => {
    form.value.action_items.push({ description: '', signal: '' });
};

const addResultItem = () => {
    form.value.result_items.push({ description: '', signal: '' });
};

// 删除行逻辑
const removePreConditionItem = () => {
    if (form.value.pre_condition_items.length > 0) {
        form.value.pre_condition_items.pop();
    }
};

const removeActionItem = () => {
    if (form.value.action_items.length > 0) {
        form.value.action_items.pop();
    }
};

const removeResultItem = () => {
    if (form.value.result_items.length > 0) {
        form.value.result_items.pop();
    }
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

.condition-row {
    margin-bottom: 1rem;
}
</style>
