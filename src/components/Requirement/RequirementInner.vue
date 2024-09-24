<template>
    <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="modules" tab="功能模块列表"></a-tab-pane>
        <a-tab-pane key="points" tab="功能点列表"></a-tab-pane>
    </a-tabs>
    <div v-if="activeTab === 'modules'">
        <div style="border-left: 2px solid purple; margin-left: 1rem; padding-left: 1rem;">项目信息</div>
        <div class="flex-container" style="margin-left: 1rem">
            <div class="flex-item">
                <strong>项目ID:</strong> {{ currentRequirement?.project?._id?.$oid }}
            </div>
            <div class="flex-item">
                <strong>测试环境:</strong> {{ currentRequirement?.project?.kind }}
            </div>
            <div class="flex-item">
                <strong>计划周期:</strong> {{ currentRequirement?.project?.period_start }} 至 {{
                    currentRequirement?.project?.period_end }}
            </div>
            <div class="flex-item">
                <strong>项目描述:</strong> {{ currentRequirement?.project?.notes || '无描述' }}
            </div>
        </div>
        <div
            style="border-left: 2px solid purple; margin-left: 1rem; padding-left: 1rem;margin-top: 1rem; margin-bottom: 1rem;">
            功能模块信息</div>
        <div class="w-full flex justify-end mr-[2rem] mb-[1rem]">
            <a-button type="primary" size="large" @click="fetchData"
                class="custom-purple-button mr-[2rem]">刷新</a-button>
            <a-button type="primary" size="large" @click="openAddDrawer"
                class="custom-purple-button mr-[2rem]">新建功能模块</a-button>
            <a-button type="primary" size="large" @click="handleModuleDelete"
                class="custom-purple-button mr-[2rem]">删除</a-button>
            <a-button type="primary" size="large" @click="handleBatchSplit"
                class="custom-purple-button mr-[2rem]">批量拆分</a-button>
        </div>
        <div style="width: 100%">
            <el-table :data="pagedDataModules" style="width: 100%" id="function_module_table"
                @selection-change="handleModuleSelectionChange">
                <el-table-column type="selection" width="50" />
                <el-table-column type="expand" width="70">
                    <template #default="props">
                        <requirement-docx :record="props.row" :currentRequirement="currentRequirement" />
                    </template>
                </el-table-column>
                <el-table-column prop="split_file_id" label="功能模块ID" :width="table_width2 / 7 || 100" />
                <el-table-column prop="file_name" label="功能模块名称" :width="table_width2 / 7 || 100">
                    <template #default="scope">
                        {{ scope.row.file_name?.replace('.docx', '') }}
                    </template>
                </el-table-column>
                <el-table-column prop="version" label="版本" :width="table_width2 / 7 || 100" />
                <el-table-column prop="status" label="状态" :width="table_width2 / 10 || 100">
                    <template #default="scope">
                        <a-tag :color="statusMap[scope.row.status] || ''">
                            {{ scope.row.status ? scope.row.status : '待操作' }}
                        </a-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="progress" label="拆分进度" :width="table_width2 / 10 || 100">
                    <template #default="scope">
                        <a-progress v-if="scope.row.progress !== undefined && scope.row.progress !== null"
                            :percent="scope.row.progress" size="small" stroke-width="4" show-info />
                        <span v-else>- -</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" :width="table_width2 / 7 || 100">
                    <template #default="scope">
                        <el-button type="text" @click="handleSplit(scope.row)"
                            :disabled="scope.row.is_table === true">拆分</el-button>
                    </template>
                </el-table-column>

            </el-table>
            <div class="flex justify-center">
                <el-pagination layout="prev, pager, next" :total="totalItems" :page-size="pageSizeModules"
                    :current-page="currentPageModules" @current-change="handlePageChange" />
            </div>

        </div>
    </div>
    <div v-if="activeTab === 'points'">
        <div style="width: 100%">
            <div class="w-full flex justify-end mr-[2rem] mb-[1rem]">
                <a-button type="primary" size="large" @click="fetchData"
                    class="custom-purple-button mr-[2rem] mb-[1rem]">刷新</a-button>
                <a-button type="primary" size="large" @click="handleBatchGenerate"
                    class="custom-purple-button mr-[2rem] mb-[1rem]">批量生成用例</a-button>
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
    <AddModuleDrawer :visible="drawerVisible" @close="closeAddDrawer" @save="saveNewModule"
    :currentRequirement="currentRequirement" />
</template>

<script setup lang="ts">
import { onMounted, watch, defineProps, computed, ref, onUpdated } from 'vue';
import { http } from '../../http';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useProjectStore } from '../../stores/project';

const { refreshAllProjects } = useProjectStore();
const activeTab = ref('modules')
const props = defineProps({
    currentRequirement: {
        type: Object,
    },
    selectNodeByKey: {
        type: Function
    }
});

const { currentRequirement } = props;
const moduleTableData = ref([])
const pointsTableData = ref([]);

// 监听 currentRequirement 的变化
const project_id = computed(() => {
    return props.currentRequirement?.project?._id?.$oid;
})
const req_id = computed(() => {
    return props.currentRequirement.req.req_id;
})

const fetchData = () => {
    return http.post('/api/query_requirement_by_id', {
        project_id: project_id.value,
        req_id: req_id.value,
    }).then(resp => {
        console.log(resp);
        moduleTableData.value = resp.split_files;
        pointsTableData.value = resp.split_cases;
    });
};

const selectedRowsModule = ref([]);

const handleModuleSelectionChange = (rows) => {
    selectedRowsModule.value = rows;
};

onMounted(() => {
    fetchData();
})

watch([project_id, req_id], () => {
    fetchData();
});

const statusMap = {
    '正在拆分': 'processing',
    '拆分完成': 'success',
    '拆分过程中出错': 'error',
}

const currentPageModules = ref(1);
const pageSizeModules = ref(10);

const pagedDataModules = computed(() => {
    const start = (currentPageModules.value - 1) * pageSizeModules.value;
    const end = start + pageSizeModules.value;
    return moduleTableData.value?.slice(start, end) || [];
});

const handleModuleDelete = () => {
    if (selectedRowsModule.value.length === 0) {
        ElMessage.warning('请选择要删除的功能模块');
        return;
    }

    ElMessageBox.confirm('确定要删除选中的功能模块吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const split_file_ids = selectedRowsModule.value.map(row => row.split_file_id);
        const deleteSplitRequireParams = {
            project_id: project_id.value,
            req_id: req_id.value,
            split_file_ids,
        };

        http.post('/api/delete_function_module', deleteSplitRequireParams).then((res) => {
            if (res) {
                ElMessage.success('删除成功');
                refreshAllProjects();
                fetchData();
            } else {
                ElMessage.error('删除失败');
            }
        });
    }).catch(() => {
        ElMessage.info('已取消删除操作');
    });
};

const totalItems = computed(() => moduleTableData.value?.length || 0);

const table_width2 = ref(1000);

onUpdated(() => {
    const ele = document.getElementById('function_module_table');
    if (ele) {
        const width = ele.getBoundingClientRect().width;
        table_width2.value = width;
        const height = window.innerHeight * 0.7;
    }
});

const handlePageChange = (page: number) => {
    currentPageModules.value = page;
};

const drawerVisible = ref(false);

const openAddDrawer = () => {
    drawerVisible.value = true;
};

const closeAddDrawer = async () => {
    drawerVisible.value = false;
    const result = await refreshAllProjects();
};

const handleSplit = (row: any) => {
    ElMessageBox.confirm('拆分会覆盖当前模块的已有功能点，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const params = {
            project_id: project_id.value,
            ...row,
            req_id: req_id.value
        };
        ElMessage.success('已下发功能点拆解任务，请等待或刷新后去功能点页面查看结果');
        http.post('/api/subrequire_generate_points', params).then((res) => {
            console.log(res);
        });
    }).catch(() => {
        // 用户点击取消，不做任何操作
        ElMessage.info('已取消拆分操作');
    });
};

const saveNewModule = (module) => {
    closeAddDrawer();
    fetchData();
};

const handleBatchSplit = () => {
    if (selectedRowsModule.value.length === 0) {
        ElMessage.warning('请选择要拆分的功能模块');
        return;
    }

    ElMessageBox.confirm('拆分会覆盖当前模块的已有功能点，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const params = selectedRowsModule.value.map(row => ({
            project_id: project_id.value,
            object_name: row.object_name,
            split_file_id: row.split_file_id,
            version: row.version,
            req_id: req_id.value
        }));

        http.post('/api/subrequire_batch_generate_points', params).then((res) => {
            if (res) {
                ElMessage.success('已下发功能点拆解任务，请等待或刷新后查看结果');
                refreshAllProjects();
            } else {
                ElMessage.error('拆分失败');
            }
        });
    }).catch(() => {
        ElMessage.info('已取消拆分操作');
    });
};


// =======points=======

const selectedRowsPoints = ref([]);
const onPointsSelectionChange = (rows) => {
    selectedRowsPoints.value = rows;
};

const table_width1 = ref(1000);
onUpdated(() => {
    const ele = document.getElementById('function_point_table');
    if (ele) {
        const width = ele.getBoundingClientRect().width;
        table_width1.value = width;
    }
});

const clickTitle = (row) => {
    console.log(row)
    props.selectNodeByKey([project_id.value, req_id.value, row.split_file_id].join('-'))
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
            split_file_id: row.split_file_id,
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
</script>

<style scoped lang="less">
.flex-container {
    display: flex;
    flex-wrap: wrap;
    margin-top: 1rem;
}

.flex-item {
    flex: 1 1 calc(33.333% - 1rem);
    /* 每个项目占据1/3的宽度，减去间距 */
    box-sizing: border-box;
    padding: 0.2rem;
}

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