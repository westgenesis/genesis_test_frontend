<template>
    <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="detail" tab="功能模块详情"></a-tab-pane>
        <a-tab-pane key="points" tab="功能点列表"></a-tab-pane>
        <a-tab-pane key="testcase_table" tab="测试用例列表"></a-tab-pane>
    </a-tabs>
    <a-drawer title="新建功能点" :visible="visible" :width="720" @close="onDrawerClose">
        <a-form :model="newForm" layout="vertical">
            <a-form-item label="功能点名称">
                <a-input v-model:value="newForm.name" placeholder="请输入功能点名称" :rows="4" />
            </a-form-item>
            <a-form-item label="初始条件">
                <a-textarea v-model:value="newForm.pre_condition" placeholder="请输入初始条件" :rows="3" />
            </a-form-item>
            <a-form-item label="触发条件">
                <a-textarea v-model:value="newForm.action" placeholder="请输入触发条件" :rows="3" />
            </a-form-item>
            <a-form-item label="预期结果">
                <a-textarea v-model:value="newForm.result" placeholder="请输入预期结果" :rows="3" />
            </a-form-item>
            <a-form-item>
                <div class="flex justify-center items-center" style="flex-direction: column;">
                    <a-button type="primary" @click="handleNewSave" class="custom-purple-button">保存</a-button>
                </div>
            </a-form-item>
        </a-form>
    </a-drawer>
    <div v-if="activeTab === 'detail'">
        <requirement-docx :record="currentRecord" :currentRequirement="currentRequirement" />
    </div>
    <div v-if="activeTab === 'points'">
        <div style="width: 100%">
            <div class="w-full flex justify-end mr-[2rem] mb-[1rem]">
                <a-button type="primary" size="large" @click="fetchData"
                    class="custom-purple-button mr-[2rem] mb-[1rem]">刷新</a-button>
                <a-button type="primary" size="large" @click="handleBatchGenerate"
                    class="custom-purple-button mr-[2rem] mb-[1rem]">批量生成用例</a-button>
                <a-button type="primary" size="large" @click="showDrawer"
                    class="custom-purple-button mr-[2rem] mb-[1rem]">新建功能点</a-button>
            </div>
            <el-table :data="pointsTableData" style="width: 100%" id="function_point_table"
                @selection-change="onPointsSelectionChange">
                <el-table-column type="selection" width="50" />
                <el-table-column type="expand">
                    <template #default="scope">
                        <div style="padding: 10px;">
                            <div class="flex" style="border: 1px solid #eee;">
                                <div
                                    style="min-width: 100px; background-color: #f2f2f2; padding: 10px; text-align: center;">
                                    初始条件</div>
                                <div>{{ scope.row.pre_condition }}</div>
                            </div>
                            <div class="flex" style="border: 1px solid #eee;">
                                <div
                                    style="min-width: 100px; background-color: #f2f2f2; padding: 10px; text-align: center;">
                                    触发条件</div>
                                <div>{{ scope.row.action }}</div>
                            </div>
                            <div class="flex" style="border: 1px solid #eee;">
                                <div
                                    style="min-width: 100px; background-color: #f2f2f2; padding: 10px; text-align: center;">
                                    预期结果</div>
                                <div>{{ scope.row.result }}</div>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="testcase_id" label="功能点ID" :width="table_width1 / 8 || 100" />
                <el-table-column prop="testcase_name" label="功能点名称" :width="table_width1 / 4 || 100">
                    <template #default="scope">
                        <el-tooltip class="box-item" effect="dark" :content="scope.row.testcase_name"
                            placement="top-start"> <el-button type="primary" text @click="clickTitle(scope.row)">{{
                                scope.row.testcase_name
                            }}</el-button></el-tooltip>

                    </template>
                </el-table-column>
                <el-table-column prop="last_modified" label="更新时间" :width="table_width1 / 7 || 100">
                </el-table-column>
                <el-table-column prop="version" label="版本" :width="table_width1 / 14 || 100" />
                <el-table-column prop="status" label="状态" :width="table_width1 / 10 || 100">
                    <template #default="scope">
                        {{ scope.row.status ? scope.row.status : '待操作' }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" :width="100">
                    <template #default="scope">
                        <el-button type="text" @click="handleGenerate(scope.row)">生成用例</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
    <div v-if="activeTab === 'testcase_table'">
        <div style="display: flex; justify-content: flex-end; margin: 1rem;">
            <a-button type="primary" class="custom-purple-button" size="large" @click="handleBatchDelete">删除</a-button>
        </div>
        <el-table :data="pagedTableData" style="width: 100%" id="function_point_table" :height="table_height1"
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
                    <el-tooltip class="box-item" effect="dark" :content="scope.row.testcase_name" placement="top-start">
                        <el-button type="primary" text @click="clickTitleTestcase(scope.row)">{{ scope.row.testcase_name
                            }}</el-button></el-tooltip>

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
            <el-table-column label="操作" :width="150">
                <template #default="scope">
                    <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <a-pagination v-model:current="currentPage" v-model:pageSize="pageSize" :total="testcaseTableData.length"
            show-size-changer :page-size-options="['10', '20', '50']" @change="handlePageChange"
            @showSizeChange="handlePageSizeChange" style="margin-top: 1rem; text-align: center;" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, watch, defineProps, computed, ref, onUpdated } from 'vue';
import { http } from '../../http';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useProjectStore } from '../../stores/project';
import RequirementDocx from './RequirementDocx.vue';
const { refreshAllProjects } = useProjectStore();

const pointsTableData = ref([]);
const testcaseTableData = ref([])

const props = defineProps({
    currentRequirement: {
        type: Object,
    },
    selectNodeByKey: {
        type: Function
    }
});
const { currentRequirement } = props;
const table_height1 = ref(500);
const activeTab = ref('')
const selectedRowsPoints = ref([]);
const table_width1 = ref(1000);
const currentRecord = ref()

const newForm = ref({
    name: '',
    pre_condition: '',
    action: '',
    result: '',
    project_id: '',
    req_id: '',
    split_file_id: '',
    split_req_version: '',
});

const visible = ref(false);

const project_id = computed(() => {
    return props.currentRequirement?.project?._id?.$oid;
})
const req_id = computed(() => {
    return props.currentRequirement.req.req_id;
})
const split_file_id = computed(() => {
    return props.currentRequirement?.splitReq.split_file_id;
})

const fetchData = () => {
    return http.post('/api/query_split_file_by_id', {
        project_id: project_id.value,
        req_id: req_id.value,
        split_file_id: split_file_id.value,
    }).then(resp => {
        currentRecord.value = resp
        pointsTableData.value = resp.split_case
        testcaseTableData.value = resp.testcases
        
    });
};

onMounted(() => {
    fetchData().then(() => {
        activeTab.value = 'detail'
    });
});

watch([project_id, req_id, split_file_id], () => {
    fetchData();
});

onUpdated(() => {
    const ele = document.getElementById('function_point_table');
    if (ele) {
        const width = ele.getBoundingClientRect().width;
        table_width1.value = width;
    }
});
const clickTitle = (row) => {
    props.selectNodeByKey([project_id.value, req_id.value, split_file_id.value, row.testcase_id].join('-'))
}

const clickTitleTestcase = (row) => {
    props.selectNodeByKey([project_id.value, req_id.value, split_file_id.value, row.split_case_id, row.testcase_id].join('-'))
}

const onPointsSelectionChange = (rows) => {
    selectedRowsPoints.value = rows;
};

const handleGenerate = (row) => {
    const split_case_id = row.testcase_id;
    const singleCase = {
        ...row,
        project_id: project_id.value,
        split_file_id: split_file_id.value,
        req_id: req_id.value,
        split_case_id,
    }
    delete singleCase.testcases;
    http.post('/api/generate_testcases_by_points', {
        points: [singleCase]
    }).then(async response => {
        if (response?.status === 'OK') {
            ElMessage.success('已下发生成用例任务');
        } else {
            ElMessage.error('下发生成用例任务失败');
        }
    });
}


const handleBatchGenerate = () => {
    if (selectedRowsPoints.value.length === 0) {
        ElMessage.warning('请选择要生成用例的功能模块');
        return;
    }

    ElMessageBox.confirm('生成用例会覆盖当前模块的已有用例，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const points = selectedRowsPoints.value.map(row => ({
            ...row,
            project_id: project_id.value,
            split_file_id: split_file_id.value,
            req_id: req_id.value,
            split_case_id: row.testcase_id,
        }));

        http.post('/api/generate_testcases_by_points', { points }).then(async response => {
            if (response?.status === 'OK') {
                ElMessage.success('已下发生成用例任务');
                await refreshAllProjects();
            } else {
                ElMessage.error('下发生成用例任务失败');
            }
        });
    }).catch(() => {
        ElMessage.info('已取消生成用例操作');
    });
};

const showDrawer = () => {
    newForm.value = {
        name: '',
        pre_condition: '',
        action: '',
        result: '',
        project_id: '',
        req_id: '',
        split_file_id: '',
        split_req_version: '',
    }
    newForm.value.project_id = project_id.value;
    newForm.value.split_file_id = split_file_id.value;
    newForm.value.req_id = req_id.value;
    visible.value = true;
};

const handleNewSave = async () => {
    if (!newForm.value.name) {
        ElMessage.error('名称不能为空');
        return;
    } else if (!newForm.value.pre_condition) {
        ElMessage.error('初始条件不能为空');
        return;
    } else if (!newForm.value.action) {
        ElMessage.error('操作步骤不能为空');
        return;
    } else if (!newForm.value.result) {
        ElMessage.error('预期结果不能为空');
        return;
    }
    const params = {
        ...newForm.value,
        split_req_version: currentRequirement.splitReq.version,
        testcase_name: newForm.value.name
    }
    delete params.name;
    return http.post('/api/create_split_case', params).then(async response => {
        if (response) {
            ElMessage.success('保存成功');
            refreshAllProjects();
            fetchData();
            visible.value = false;
        } else {
            ElMessage.error('保存失败');
        }
    }).catch(() => {
        ElMessage.error('保存失败');
    })
}

const onDrawerClose = () => {
    visible.value = false;
};

const currentPage = ref(1);
const pageSize = ref(10);

const pagedTableData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return testcaseTableData.value.slice(start, end);
});

const handlePageChange = (page: number) => {
    currentPage.value = page;
};

const handlePageSizeChange = (current: number, size: number) => {
    pageSize.value = size;
    currentPage.value = 1; // 切换每页条数时，重置到第一页
};

const handleDelete = (row) => {
    const rows = [row]
    const params = rows.map(row => ({
        project_id: project_id.value,
        req_id: req_id.value,
        split_file_id: split_file_id.value,
        split_case_id: row.split_case_id,
        testcase_id: row.testcase_id,
    }));

    http.post('/api/delete_testcases', params).then(response => {
        if (response.status === 'OK') {
            ElMessage.success('删除成功');
            refreshAllProjects();
            fetchData();
            currentRequirement.value.splitCase.testcases = response.testcases
        } else {
            ElMessage.error('删除失败');
        }
    });
}

const selectedRows = ref([]);

const handleSelectionChange = (rows) => {
    selectedRows.value = rows;
};

const handleBatchDelete = () => {
    if (selectedRows.value.length === 0) {
        ElMessage.warning('请选择要删除的测试用例');
        return;
    }

    const params = selectedRows.value.map(row => ({
        project_id: project_id.value,
        req_id: req_id.value,
        split_file_id: split_file_id.value,
        split_case_id: row.split_case_id,
        testcase_id: row.testcase_id,
    }));

    http.post('/api/delete_testcases', params).then(response => {
        if (response.status === 'OK') {
            ElMessage.success('批量删除成功');
            refreshAllProjects();
            fetchData();
        } else {
            ElMessage.error('批量删除失败');
        }
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
</style>