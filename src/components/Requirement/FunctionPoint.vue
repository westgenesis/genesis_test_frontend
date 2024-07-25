<template>
    <div class="flex">
        <div style="height: 100%;border-right: 1px solid #ddd;" class="m-[20px] w-[400px]">
            <div style="border-bottom: 1px solid #ddd; padding-bottom: 1rem">全部项目 ({{ projects.length }})</div>
            <div style="height: 90vh; overflow: scroll; background-color: rgba(248, 248, 254, 0.5);">
                <a-tree :show-line="showLine" :show-icon="showIcon" :default-expanded-keys="['0-0-0']"
                    :tree-data="treeData" @select="onSelect" v-model:selectedKeys="selectedKeys">
                    <template #icon></template>
                </a-tree>
            </div>
        </div>
        <div class="w-full h-[99.9%] pt-[2rem]">
            <div v-show="currentType === 'requirement'" class="w-full h-[99.9%] pt-[2rem]">
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
                <div style="width: 100%">
                    <div class="w-full flex justify-end mr-[2rem]">
                        <a-button type="primary" size="large" @click=""
                            class="custom-purple-button mr-[2rem]">新建功能点</a-button>
                    </div>

                    <el-table :data="pagedData" style="width: 100%" id="function_module_table">
                        <el-table-column prop="split_file_id" label="功能点ID" :width="table_width / 7 || 100" />
                        <el-table-column prop="file_name" label="功能模块名称" :width="table_width / 7 || 100">
                            <template #default="scope">
                                {{ scope.row.file_name?.replace('.docx', '') }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="description" label="功能模块描述" :width="table_width / 7 || 100" />
                        <el-table-column prop="version" label="版本" :width="table_width / 7 || 100" />
                        <el-table-column label="操作" :width="table_width / 7 || 100">
                            <template #default="scope">
                                <el-button type="text" style="color: blue"
                                    @click="handleSplit(scope.row)">拆分</el-button>
                            </template>
                        </el-table-column>

                    </el-table>
                    <div class="flex justify-center">
                        <el-pagination layout="prev, pager, next" :total="totalItems" :page-size="pageSize"
                            :current-page="currentPage" @current-change="handlePageChange" />
                    </div>

                </div>
            </div>
            <div v-show="currentType === 'sub_requirement'" class="w-full h-[99.9%] pt-[2rem]">
                <div style="border-left: 2px solid purple; margin-left: 1rem; padding-left: 1rem;">功能模块名称</div>
                <div class="flex-container" style="margin-left: 1rem">
                    <div class="flex-item">
                        <strong>功能模块名称:</strong> {{ currentRequirement?.splitReq?.file_name?.replace('.docx', '') }}
                    </div>
                    <div class="flex-item">
                        <strong>功能模块ID:</strong> {{ currentRequirement?.splitReq?.split_file_id }}
                    </div>
                    <div class="flex-item">
                        <strong>当前版本:</strong> {{ currentRequirement?.splitReq?.version }}
                    </div>
                    <div class="flex-item">
                        <strong>项目描述:</strong> {{ currentRequirement?.splitReq?.description || '无描述' }}
                    </div>
                </div>
                <div
                    style="border-left: 2px solid purple; margin-left: 1rem; padding-left: 1rem;margin-top: 1rem; margin-bottom: 1rem;">
                    测试用例信息
                </div>
                <div style="width: 100%">
                    <div class="w-full flex justify-end mr-[2rem] mb-[1rem]">
                        <a-button type="primary" size="large" @click="showDrawer"
                            class="custom-purple-button mr-[2rem]">新建功能点</a-button>
                    </div>
                    <el-table :data="currentRequirement?.splitReq?.split_case" style="width: 100%"
                        id="function_point_table" :height="table_height">
                        <el-table-column prop="testcase_id" label="功能点ID" :width="table_width / 7 || 100" />
                        <el-table-column prop="testcase_name" label="功能点名称" :width="table_width / 7 || 100" />
                        <el-table-column prop="pre_condition" label="初始条件" :width="table_width / 5 || 100" />
                        <el-table-column prop="action" label="触发条件" :width="table_width / 7 || 100" />
                        <el-table-column prop="result" label="预期结果" :width="table_width / 7 || 100" />
                        <el-table-column prop="version" label="版本" :width="table_width / 7 || 100" />
                    </el-table>
                </div>
            </div>
            <div v-show="currentType === 'split_case'" class="w-full h-[99.9%] pt-[2rem]">
                <div style="border-left: 2px solid purple; margin-left: 1rem; padding-left: 1rem; margin-bottom: 1rem;">
                    功能点
                </div>
                <a-form :model="form" layout="vertical">
                    <a-form-item label="功能点名称">
                        <a-input v-model:value="form.name" placeholder="请输入功能点名称" :rows="4" />
                    </a-form-item>
                    <a-form-item label="初始条件">
                        <a-textarea v-model:value="form.pre_condition" placeholder="请输入初始条件" :rows="2" />
                    </a-form-item>
                    <a-form-item label="触发条件">
                        <a-textarea v-model:value="form.action" placeholder="请输入触发条件" :rows="2" />
                    </a-form-item>
                    <a-form-item label="预期结果">
                        <a-textarea v-model:value="form.result" placeholder="请输入预期结果" :rows="2" />
                    </a-form-item>
                    <a-form-item>
                        <div class="flex justify-center items-center" style="flex-direction: column;">
                            <a-button type="primary" @click="handleSave" class="custom-purple-button">保存</a-button>
                            <div style="color: red">提示：当前为V{{ form.version }}版本 保存后版本新增</div>
                        </div>

                    </a-form-item>
                </a-form>
            </div>

            <a-drawer title="新建功能点" :visible="visible" :width="720" @close="onDrawerClose">
                <a-form :model="newForm" layout="vertical">
                    <a-form-item label="功能点名称">
                        <a-input v-model:value="newForm.name" placeholder="请输入功能点名称" :rows="4" />
                    </a-form-item>
                    <a-form-item label="初始条件">
                        <a-textarea v-model:value="newForm.pre_condition" placeholder="请输入初始条件" :rows="2" />
                    </a-form-item>
                    <a-form-item label="触发条件">
                        <a-textarea v-model:value="newForm.action" placeholder="请输入触发条件" :rows="2" />
                    </a-form-item>
                    <a-form-item label="预期结果">
                        <a-textarea v-model:value="newForm.result" placeholder="请输入预期结果" :rows="2" />
                    </a-form-item>
                    <a-form-item>
                        <div class="flex justify-center items-center" style="flex-direction: column;">
                            <a-button type="primary" @click="handleNewSave" class="custom-purple-button">保存</a-button>
                        </div>
                    </a-form-item>
                </a-form>
            </a-drawer>
        </div>
    </div>

</template>

<script setup lang="ts">
import { useProjectStore } from '../../stores/project';
import { ref, computed, onUpdated } from 'vue';
import type { TreeProps } from 'ant-design-vue';
import { ElMessage } from 'element-plus';
import { useProductFetch } from '../../handler/handler';
import { http } from '../../http';

const currentType = ref();
const visible = ref(false);

const { projects, refreshAllProjects } = useProjectStore();
const showLine = ref<boolean>(true);
const showIcon = ref<boolean>(false);
const currentRequirement = ref();
const selectedKeys = ref<string[]>([]);

const form = ref({
    name: '',
    pre_condition: '',
    action: '',
    result: '',
    version: '',
    project_id: '',
    testcase_id: '',
});

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

const treeData = computed<TreeProps['treeData']>(() => {
    return projects.map((project, index) => ({
        title: project.name,
        key: `0-${index}`,
        project: project,
        children: project.requirement_files && project.requirement_files.length > 0
            ? project.requirement_files.map((req, reqIndex) => {
                const parts = req.name.split('/');
                const fileName = parts.pop();
                return {
                    title: fileName,
                    key: `0-${index}-${reqIndex}`,
                    fullPath: req.name,
                    req: req,
                    project: project,
                    type: 'requirement',
                    children: req.split_files && req.split_files.length > 0
                        ? req.split_files.map((splitReq, splitReqIndex) => ({
                            title: splitReq.file_name.replace('.docx', ''),
                            key: `0-${index}-${reqIndex}-${splitReqIndex}`,
                            fullPath: splitReq.object_name,
                            splitReq: splitReq,
                            req: req,
                            project: project,
                            type: 'sub_requirement',
                            children: splitReq.split_case && splitReq.split_case.length > 0
                                ? splitReq.split_case.map((splitCase, splitCaseIndex) => ({
                                    title: (splitCase.testcase_name || '').split('/')[1],
                                    fullPath: splitCase.testcase_name,
                                    key: `0-${index}-${reqIndex}-${splitReqIndex}-${splitCaseIndex}`,
                                    splitCase: splitCase,
                                    splitReq: splitReq,
                                    req: req,
                                    project: project,
                                    type: 'split_case'
                                }))
                                : []
                        }))
                        : []
                };
            })
            : []
    }));
});

const onSelect: TreeProps['onSelect'] = (_, info) => {
    console.log(info.node);
    console.log(selectedKeys.value);
    if (info?.node?.type === 'requirement') {
        currentType.value = 'requirement';
        currentRequirement.value = info.node;
    } else if (info?.node?.type === 'sub_requirement') {
        currentType.value = 'sub_requirement';
        currentRequirement.value = info.node;
    } else if (info?.node?.type === 'split_case') {
        currentType.value = 'split_case';
        currentRequirement.value = info.node;
        form.value = {
            name: info.node.splitCase.testcase_name,
            pre_condition: info.node.splitCase.pre_condition,
            action: info.node.splitCase.action,
            result: info.node.splitCase.result,
            version: info.node.splitCase.version,
            testcase_id: info.node.splitCase.testcase_id,
            project_id: info.node.project._id.$oid,
            req_id: info.node.req.req_id,
            split_file_id: info.node.splitReq.split_file_id,
        }
    }
};

const currentPage = ref(1);
const pageSize = ref(10);
const table_width = ref(1000);
const table_height = ref(500);

const pagedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return currentRequirement.value?.req?.split_files.slice(start, end) || [];
});

const totalItems = computed(() => currentRequirement.value?.req?.split_files.length || 0);

const handlePageChange = (page: number) => {
    currentPage.value = page;
};

onUpdated(() => {
    const ele = document.getElementById('function_point_table');
    if (ele) {
        const width = ele.getBoundingClientRect().width;
        table_width.value = width;
        const height = window.innerHeight * 0.7;
        table_height.value = height;
    }
});

const handleSave = async () => {
    console.log(form.value);
    const params = {
        ...form.value,
        testcase_name: form.value.name
    }
    delete params.name;
    return http.post('/api/modify_split_case', params).then(response => {
        if (response) {
            ElMessage.success('保存成功');
            refreshAllProjects();
        }
    })
}

const showDrawer = () => {
    newForm.value.project_id = currentRequirement.value.project._id.$oid;
    newForm.value.split_file_id = currentRequirement.value.splitReq.split_file_id;
    newForm.value.req_id = currentRequirement.value.req.req_id;
    visible.value = true;
};

const onDrawerClose = () => {
    visible.value = false;
};

const handleNewSave = async () => {
    console.log(newForm.value);
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
        split_req_version: currentRequirement.value.splitReq.version,
        testcase_name: newForm.value.name
    }
    delete params.name;
    return http.post('/api/create_split_case', params).then(response => {
        if (response) {
            ElMessage.success('保存成功');
            refreshAllProjects();
            onDrawerClose();
        } else {
            ElMessage.error('保存失败');
        }
    }).catch(() => {
        ElMessage.error('保存失败');
    })
}
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