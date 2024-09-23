<template>
    <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="detail" tab="功能点详情"></a-tab-pane>
        <a-tab-pan key="testcase_table" tab="测试用例"></a-tab-pan>
    </a-tabs>
    <div v-if="activeTab === 'detail'">
        <div style="border-left: 2px solid purple; margin-left: 0.25rem; padding-left: 1rem; margin-bottom: 1rem;">
            功能点
        </div>
        <a-form :model="form" layout="vertical">
            <a-form-item label="功能点名称">
                <a-input v-model:value="form.testcase_name" placeholder="请输入功能点名称" :rows="4" />
            </a-form-item>
            <a-form-item label="初始条件">
                <a-textarea v-model:value="form.pre_condition" placeholder="请输入初始条件" :rows="3" />
            </a-form-item>
            <a-form-item label="触发条件">
                <a-textarea v-model:value="form.action" placeholder="请输入触发条件" :rows="3" />
            </a-form-item>
            <a-form-item label="预期结果">
                <a-textarea v-model:value="form.result" placeholder="请输入预期结果" :rows="3" />
            </a-form-item>
            <a-form-item>
                <div class="flex justify-center items-center" style="flex-direction: column;">
                    <a-button type="primary" @click="handleSave" class="custom-purple-button">保存</a-button>
                    <div style="color: red">提示：当前为V{{ form.version }}版本 保存后版本新增</div>
                </div>
            </a-form-item>
        </a-form>
    </div>
    <div v-if="activeTab === 'testcase_table'">
        <div style="display: flex; justify-content: flex-end;">
            <a-button type="primary" class="custom-purple-button" size="large" style="margin-right: 1rem;"
            @click="showDrawer">新建测试用例</a-button>
        <a-button type="primary" class="custom-purple-button" size="large" @click="handleExport">导出全部</a-button>
        </div>

        <el-table :data="tableData" style="width: 100%" id="function_point_table" :height="table_height1"
            @selection-change="handleSelectionChange">
            <el-table-column type="expand">
                <template #default="scope">
                    <div style="padding: 10px;">
                        <div class="flex" style="border: 1px solid #eee;">
                            <div
                                style="min-width: 110px; background-color: #f2f2f2; padding: 10px; text-align: center;">
                                初始条件</div>
                            <div>{{ scope.row.pre_condition }}</div>
                        </div>
                        <div class="flex" style="border: 1px solid #eee;">
                            <div
                                style="min-width: 110px; background-color: #f2f2f2; padding: 10px; text-align: center;">
                                初始条件信号</div>
                            <div>{{ scope.row.pre_condition_signal }}</div>
                        </div>
                        <div class="flex" style="border: 1px solid #eee;">
                            <div
                                style="min-width: 110px; background-color: #f2f2f2; padding: 10px; text-align: center;">
                                触发条件</div>
                            <div>{{ scope.row.action }}</div>
                        </div>
                        <div class="flex" style="border: 1px solid #eee;">
                            <div
                                style="min-width: 110px; background-color: #f2f2f2; padding: 10px; text-align: center;">
                                触发条件信号</div>
                            <div>{{ scope.row.action_signal }}</div>
                        </div>
                        <div class="flex" style="border: 1px solid #eee;">
                            <div
                                style="min-width: 110px; background-color: #f2f2f2; padding: 10px; text-align: center;">
                                预期结果</div>
                            <div>{{ scope.row.result }}</div>
                        </div>
                        <div class="flex" style="border: 1px solid #eee;">
                            <div
                                style="min-width: 110px; background-color: #f2f2f2; padding: 10px; text-align: center;">
                                预期结果信号</div>
                            <div>{{ scope.row.result_signal }}</div>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column type="selection" width="50"></el-table-column>
            <el-table-column prop="testcase_id" label="测试用例ID" :width="table_width1 / 8 || 100" />
            <el-table-column prop="testcase_name" label="测试用例名称" :width="table_width1 / 5 || 100">
                <template #default="scope">
                    <el-button type="primary" text @click="clickTitle(scope.row)">{{ scope.row.testcase_name
                        }}</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="version" label="版本" :width="table_width1 / 8 || 100" />
            <el-table-column prop="type" label="用例类型" :width="table_width1 / 8 || 100">
                <template #default="scope">
                    {{ scope.row.type === 'positive' ? '正例' : '反例' }}
                </template>
            </el-table-column>
            <el-table-column prop="is_generalized" label="是否泛化" :width="table_width1 / 8 || 100">
                <template #default="scope">
                    {{ scope.row.is_generalized ? '泛化用例' : '非泛化用例' }}
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" :width="table_width1 / 10 || 100">
                <template #default="scope">
                    {{ scope.row.status ? scope.row.status : '待操作' }}
                </template>
            </el-table-column>
            <el-table-column label="操作" :width="250">
                <template #default="scope">
                    <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
    <a-drawer title="新建测试用例" :visible="visible" :width="720" @close="onDrawerClose">
        <a-form :model="newForm" layout="vertical">
            <a-form-item label="测试用例类型">
                <a-select v-model:value="newForm.type" placeholder="请选择测试用例类型">
                    <a-select-option value="positive">正例</a-select-option>
                    <a-select-option value="negative">反例</a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item label="测试用例名称">
                <a-input v-model:value="newForm.name" placeholder="请输入功能点名称" :rows="4" />
            </a-form-item>
            <a-form-item label="初始条件">
                <a-textarea v-model:value="newForm.pre_condition" placeholder="请输入初始条件" :rows="3" />
            </a-form-item>
            <a-form-item label="初始条件信号">
                <a-textarea v-model:value="newForm.pre_condition_signal" placeholder="请输入初始条件信号" :rows="3" />
            </a-form-item>
            <a-form-item label="触发条件">
                <a-textarea v-model:value="newForm.action" placeholder="请输入触发条件" :rows="3" />
            </a-form-item>
            <a-form-item label="触发条件信号">
                <a-textarea v-model:value="newForm.action_signal" placeholder="请输入触发条件信号" :rows="3" />
            </a-form-item>
            <a-form-item label="预期结果">
                <a-textarea v-model:value="newForm.result" placeholder="请输入预期结果" :rows="3" />
            </a-form-item>
            <a-form-item label="预期结果信号">
                <a-textarea v-model:value="newForm.result_signal" placeholder="请输入预期结果" :rows="3" />
            </a-form-item>
            <a-form-item>
                <div class="flex justify-center items-center" style="flex-direction: column;">
                    <a-button type="primary" @click="handleNewSave" class="custom-purple-button">保存</a-button>
                </div>
            </a-form-item>
        </a-form>
    </a-drawer>
</template>

<script setup lang="ts">
import { onMounted, watch, defineProps, computed, ref, onUpdated } from 'vue';
import { http } from '../../http';
import { ElMessage } from 'element-plus';
import { useProjectStore } from '../../stores/project';
const { refreshAllProjects } = useProjectStore();

const form = ref({
    testcase_name: '',
    pre_condition: '',
    action: '',
    result: '',
    version: '',
    project_id: '',
    testcase_id: '',
});

const props = defineProps({
    currentRequirement: {
        type: Object,
    },
    selectNodeByKey: {
        type: Function
    }
});
const table_height1 = ref(500);
const activeTab = ref('detail')
const selectedRowsPoints = ref([]);
const tableData = ref([]);
const visible = ref(false)
console.log(props)

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

const clickTitle = (row) => {
    console.log(row)
    props.selectNodeByKey([project_id.value, req_id.value, split_file_id.value, split_case_id.value, row.testcase_id].join('-'))
}
const fetchData = () => {
    http.post('/api/query_split_case_by_id', {
        project_id: project_id.value,
        req_id: req_id.value,
        split_file_id: split_file_id.value,
        split_case_id: split_case_id.value,
    }).then(resp => {
        if (resp.result) {
            form.value = resp;
            tableData.value = resp.testcases || []
        }
    });
};

const newForm = ref({
    type: '',
    name: '',
    pre_condition: '',
    pre_condition_signal: '',
    action: '',
    action_signal: '',
    result: '',
    result_signal: '',
    project_id: '',
    req_id: '',
    split_file_id: '',
    split_req_version: '',
    split_case_id: '',
    split_case_version: '',
});

const showDrawer = () => {
    newForm.value.project_id = project_id.value;
    newForm.value.split_file_id = split_file_id.value;
    newForm.value.req_id = req_id.value;
    console.log(newForm.value);
    newForm.value.action = '';
    newForm.value.action_signal = '';
    newForm.value.result = ''
    newForm.value.result_signal = '';
    newForm.value.pre_condition_signal = '';
    newForm.value.pre_condition = '';
    visible.value = true;
};

const handleSelectionChange = (rows) => {
    selectedRowsPoints.value = rows;
};
const table_width1 = ref(500)

onUpdated(() => {
    const ele = document.getElementById('function_point_table');
    if (ele) {
        const width = ele.getBoundingClientRect().width;
        table_width1.value = width;
    }
});



onMounted(() => {
    fetchData();
});

watch([project_id, req_id, split_file_id, split_case_id], () => {
    fetchData();
});


const handleSave = async () => {
    const params = {
        ...form.value,
        project_id: project_id.value,
        req_id: req_id.value,
        split_file_id: split_file_id.value,
        split_case_id: split_case_id.value,
    }
    return http.post('/api/modify_split_case', params).then(response => {
        if (response) {
            ElMessage.success('保存成功');
            refreshAllProjects();
            form.value.version = response.version;
        }
    })
}

const handleDelete = (row) => {
    const rows = [row]
    const params = rows.map(row => ({
        project_id: project_id.value,
        req_id: req_id.value,
        split_file_id: split_file_id.value,
        split_case_id: split_case_id.value,
        testcase_id: row.testcase_id,
    }));

    http.post('/api/delete_testcases', params).then(response => {
        if (response.status === 'OK') {
            ElMessage.success('删除成功');
            refreshAllProjects();
            fetchData();
        } else {
            ElMessage.error('删除失败');
        }
    });
}

const handleExport = () => {
    if (!currentRequirement.value.splitCase?.testcases?.length) {
        ElMessage.error('请先生成或添加用例');
        return;
    }
    const params = {
        project_id: currentRequirement.value.project._id.$oid,
        split_file_id: currentRequirement.value.splitReq.split_file_id,
        req_id: currentRequirement.value.req.req_id,
        split_case_id: currentRequirement.value.splitCase.testcase_id,
    }

    http.post('/api/export_by_splitcase', params, { responseType: 'blob' })
        .then(response => {
            const blob = new Blob([response as any], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', currentRequirement.value.splitCase.testcase_id + '.xlsx');
            document.body.appendChild(link);
            link.click();
        }).catch(() => {
            ElMessage.error('导出失败');
        })
}

const onDrawerClose = () => {
    visible.value = false;
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
</style>