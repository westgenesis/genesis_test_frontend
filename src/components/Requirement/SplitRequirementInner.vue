<template>
    <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="points" tab="功能点列表"></a-tab-pane>
        <a-tab-pan key="testcase_table" tab="测试用例"></a-tab-pan>
    </a-tabs>
    <div v-if="activeTab === 'testcase_table'">
        <div style="width: 100%">
                    <div class="w-full flex justify-end mr-[2rem] mb-[1rem]">
                        <a-button type="primary" size="large" @click="fetchData"
                            class="custom-purple-button mr-[2rem] mb-[1rem]">刷新</a-button>
                        <a-button type="primary" size="large" @click="handleBatchGenerate"
                            class="custom-purple-button mr-[2rem] mb-[1rem]">批量生成用例</a-button>
                        <a-button type="primary" size="large" @click="showDrawer"
                            class="custom-purple-button mr-[2rem] mb-[1rem]">新建功能点</a-button>
                    </div>
                    <el-table :data="tableData" style="width: 100%"
                        id="function_point_table" :height="table_height" @selection-change="onPointsSelectionChange">
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
                        <el-table-column prop="testcase_id" label="功能点ID" :width="table_width1 / 6 || 100" />
                        <el-table-column prop="testcase_name" label="功能点名称" :width="table_width1 / 7 || 100" />
                        <el-table-column prop="last_modified.$date" label="更新时间" :width="table_width1 / 7 || 100">
                        </el-table-column>
                        <el-table-column prop="version" label="版本" :width="table_width1 / 7 || 100" />
                        <el-table-column prop="status" label="状态" :width="table_width1 / 10 || 100">
                            <template #default="scope">
                                {{ scope.row.status ? scope.row.status : '待操作' }}
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" :width="150">
                            <template #default="scope">
                                <el-button type="text"
                                    @click="handleModify(scope.row)">修改</el-button>

                                <el-button type="text"
                                    @click="handleGenerate(scope.row)">生成用例</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, watch, defineProps, computed, ref, onUpdated } from 'vue';
import { http } from '../../http';
import { ElMessage } from 'element-plus';
import { useProjectStore } from '../../stores/project';
const { refreshAllProjects } = useProjectStore();

const tableData = ref([])

const props = defineProps({
    currentRequirement: {
        type: Object,
    },
    selectNodeByKey: {
        type: Function
    }
});
const table_height1 = ref(500);
const activeTab = ref('points')
const selectedRowsPoints = ref([]);
const table_width1 = ref(1000);

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

const fetchData = () => {
    http.post('/api/query_split_file_by_id', {
        project_id: project_id.value,
        req_id: req_id.value,
        split_file_id: split_file_id.value,
    }).then(resp => {
        console.log(resp)
    });
};
onMounted(() => {
    fetchData();
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
    console.log(row)
    props.selectNodeByKey([project_id.value, req_id.value, split_file_id.value].join('-'))
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
</style>