<template>
    <div class="flex">
        <div style="height: 100%;border-right: 1px solid #ddd;" class="m-[20px] w-[28rem]">
            <div style="border-bottom: 1px solid #ddd; padding-bottom: 1rem">全部项目 ({{ projects.length }})</div>
            <div style="height: 2rem; margin: 1rem">
                <a-input-search placeholder="请输入要搜索的名称" style="width: 100%" @search="onSearch" />
            </div>
            <div style="height: calc(100vh - 10.3rem); overflow: scroll; background-color: rgba(248, 248, 254, 0.5);">
                <a-tree :show-line="false" :show-icon="true" :default-expanded-keys="['0-0-0']" :tree-data="treeData"
                    @select="onSelect" v-model:selectedKeys="selectedKeys">
                    <template #switcherIcon="{ switcherCls }"><down-outlined :class="switcherCls" /></template>
                    <template #icon="node">
                        <template v-if="node.type === 'project'">
                            <project-outlined />
                        </template>
                        <template v-if="node.type === 'requirement'">
                            <profile-outlined />
                        </template>
                        <template v-else-if="node.type === 'sub_requirement'">
                            <database-outlined />
                        </template>
                        <template v-else-if="node.type === 'split_case'">
                            <ExperimentOutlined />
                        </template>
                        <template v-else-if="node.type === 'testcase'">
                            <ApiOutlined />
                        </template>
                    </template>
                </a-tree>
            </div>
        </div>
        <div class="w-full h-[90%] pt-[2rem] overflow-scroll">
            <div v-show="currentType === 'requirement'" class="w-full pt-[2rem]" style="height: 90vh">
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
                    <a-button type="primary" size="large" @click="refreshModule"
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
            <div v-show="currentType === 'sub_requirement'" class="w-full pt-[2rem]"
                style="height: calc(100vh - 5.3rem)">
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
                    功能点信息
                </div>
                <div style="width: 100%">
                    <div class="w-full flex justify-end mr-[2rem] mb-[1rem]">
                        <a-button type="primary" size="large" @click="refreshCases"
                            class="custom-purple-button mr-[2rem] mb-[1rem]">刷新</a-button>
                        <a-button type="primary" size="large" @click="handleBatchGenerate"
                            class="custom-purple-button mr-[2rem] mb-[1rem]">批量生成用例</a-button>
                        <a-button type="primary" size="large" @click="showDrawer"
                            class="custom-purple-button mr-[2rem] mb-[1rem]">新建功能点</a-button>
                    </div>
                    <el-table :data="currentRequirement?.splitReq?.split_case" style="width: 100%"
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
            <div v-show="currentType === 'split_case'" class="w-full pt-[2rem]" style="height: calc(100vh - 5.3rem)">
                <div style="border-left: 2px solid purple; margin-left: 1rem; padding-left: 1rem; margin-bottom: 1rem;">
                    功能点
                </div>
                <a-form :model="form" layout="vertical">
                    <a-form-item label="功能点名称">
                        <a-input v-model:value="form.name" placeholder="请输入功能点名称" :rows="4" />
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
            <a-drawer title="修改功能点" :visible="editVisible" :width="720" @close="onEditDrawerClose">
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
                            <a-button type="primary" @click="handleEditSave" class="custom-purple-button">保存</a-button>
                        </div>
                    </a-form-item>
                </a-form>
            </a-drawer>

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
        </div>
    </div>
    <!-- 添加 a-drawer 组件 -->
    <AddModuleDrawer :visible="drawerVisible" @close="closeAddDrawer" @save="saveNewModule"
        :currentRequirement="currentRequirement" />

    <HistoryVersionModal
      :visible="showHistoryModal"
      :historyData="historyData"
      @update:visible="showHistoryModal = $event"
      @viewDetail="handleViewDetail"
    />
</template>

<script setup lang="ts">
import { useProjectStore } from '../../stores/project';
import { ref, computed, onUpdated } from 'vue';
import type { TreeProps } from 'ant-design-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useProductFetch } from '../../handler/handler';
import { http } from '../../http';
import { storeToRefs } from 'pinia';
import RequirementDocx from './RequirementDocx.vue';
import AddModuleDrawer from './AddModuleDrawer.vue'; // 引入新组件
import { ApiOutlined, ProjectOutlined, DatabaseOutlined, ProfileOutlined, DownOutlined, ExperimentOutlined } from '@ant-design/icons-vue';

const statusMap = {
    '正在拆分': 'processing',
    '拆分完成': 'success',
    '拆分过程中出错': 'error',
}
const currentType = ref();
const visible = ref(false);
const editVisible = ref(false);

const projectStore = useProjectStore();
const { refreshAllProjects } = useProjectStore();
const { projects } = storeToRefs(projectStore);
const showLine = ref<boolean>(true);
const showIcon = ref<boolean>(false);
const currentRequirement = ref();
const selectedKeys = ref<string[]>([]);
const flattened_cases = ref([]);

const showHistory = (row) => {
    console.log(row)
}

const saveNewModule = (module) => {
    closeAddDrawer();
};

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

const searchValue = ref('');

const onSearch = (value) => {
    searchValue.value = value;
}

const filterTree = (items, searchTerm) => {
    return items.map((item) => {
        const children = item.children ? filterTree(item.children, searchTerm) : [];
        if (item.title.includes(searchTerm) || children.length > 0) {
            return { ...item, children };
        }
        return null;
    }).filter(item => item !== null);
};

const treeData = computed(() => {
    if (searchValue.value.trim() === '') {
        return projects.value.map((project, index) => ({
            title: project.name,
            key: `0-${index}`,
            project: project,
            type: 'project',
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
                                        title: (splitCase.testcase_name || ''),
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
    }

    return filterTree(projects.value.map((project, index) => ({
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
                                    title: (splitCase.testcase_name || ''),
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
    })), searchValue.value);
});

const onSelect: TreeProps['onSelect'] = (_, info) => {
    console.log(info.node);
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
const table_width1 = ref(1000);
const table_height1 = ref(500);

const table_width2 = ref(1000);
const table_height2 = ref(500);

const pagedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return flattened_cases.value.slice(start, end) || [];
});


const currentPageModules = ref(1);
const pageSizeModules = ref(10);
const table_width = ref(1000);

const pagedDataModules = computed(() => {
    const start = (currentPageModules.value - 1) * pageSizeModules.value;
    const end = start + pageSizeModules.value;
    return currentRequirement.value?.req?.split_files?.slice(start, end) || [];
});

const totalItems = computed(() => currentRequirement.value?.req?.split_files?.length || 0);

const handlePageChange = (page: number) => {
    currentPageModules.value = page;
};

onUpdated(() => {
    const ele = document.getElementById('function_point_table');
    if (ele) {
        const width = ele.getBoundingClientRect().width;
        table_width1.value = width;
        const height = window.innerHeight * 0.7;
        table_height1.value = height;
    }
});

onUpdated(() => {
    const ele = document.getElementById('function_module_table');
    if (ele) {
        const width = ele.getBoundingClientRect().width;
        table_width2.value = width;
        const height = window.innerHeight * 0.7;
        table_height2.value = height;
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
            form.value.version = response.version;
        }
    })
}

const handleEditSave = async () => {
    console.log(newForm.value);
    const params = {
        ...newForm.value,
        testcase_name: newForm.value.name
    }
    delete params.name;
    return http.post('/api/modify_split_case', params).then(response => {
        if (response) {
            ElMessage.success('保存成功');
            refreshAllProjects();
            newForm.value.version = response.version;
            refreshCases(false);
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

const onEditDrawerClose = () => {
    editVisible.value = false;
}

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
    return http.post('/api/create_split_case', params).then(async response => {
        if (response) {
            ElMessage.success('保存成功');
            const res = await refreshAllProjects();
            const currentProject = res.find(x => x._id.$oid === newForm.value.project_id);
            const currentReq = currentProject.requirement_files.find(x => x.req_id === newForm.value.req_id);
            const currentSplitReq = currentReq.split_files.find(x => x.split_file_id === newForm.value.split_file_id);
            currentRequirement.value.splitReq.split_case = currentSplitReq.split_case;
            onDrawerClose();
            refreshCases();
        } else {
            ElMessage.error('保存失败');
        }
    }).catch(() => {
        ElMessage.error('保存失败');
    })
}



const handleGenerate = (row) => {
    const project_id = currentRequirement.value.project._id.$oid;
    const split_file_id = currentRequirement.value.splitReq.split_file_id;
    const req_id = currentRequirement.value.req.req_id;
    const split_case_id = row.testcase_id;
    const singleCase = {
        ...row,
        project_id,
        split_file_id,
        req_id,
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

    const project_id = currentRequirement.value.project._id.$oid;
    const split_file_id = currentRequirement.value.splitReq.split_file_id;
    const req_id = currentRequirement.value.req.req_id;

    ElMessageBox.confirm('生成用例会覆盖当前模块的已有用例，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const points = selectedRowsPoints.value.map(row => ({
            ...row,
            project_id,
            split_file_id,
            req_id,
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

const handleModify = (row) => {
    console.log(row);
    newForm.value.name = row.testcase_name;
    newForm.value.pre_condition = row.pre_condition;
    newForm.value.action = row.action;
    newForm.value.result = row.result;
    newForm.value.project_id = currentRequirement.value.project._id.$oid;
    newForm.value.split_file_id = currentRequirement.value.splitReq.split_file_id;
    newForm.value.req_id = currentRequirement.value.req.req_id;
    newForm.value.testcase_id = row.testcase_id;
    newForm.value.version = row.version;
    editVisible.value = true;
}


const drawerVisible = ref(false);
const newModuleName = ref('');
const newModuleDescription = ref('');

const openAddDrawer = () => {
    drawerVisible.value = true;
};

const closeAddDrawer = async () => {
    drawerVisible.value = false;
    const result = await projectStore.refreshAllProjects();
    const currentProject = result.find(x => x._id.$oid === currentRequirement.value.project._id.$oid);
    const currentReq = currentProject.requirement_files.find(x => x.req_id === currentRequirement.value.req.req_id);
    currentRequirement.value.req.split_files = currentReq.split_files;
};

const handleSplit = (row: any) => {
    ElMessageBox.confirm('拆分会覆盖当前模块的已有功能点，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const params = {
            project_id: currentRequirement.value.project._id.$oid,
            ...row,
            req_id: currentRequirement.value.req.req_id
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
            project_id: currentRequirement.value.project._id.$oid,
            object_name: row.object_name,
            split_file_id: row.split_file_id,
            version: row.version,
            req_id: currentRequirement.value.req.req_id
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


const selectedRowsModule = ref([]);

const handleModuleSelectionChange = (rows) => {
    selectedRowsModule.value = rows;
};

const selectedRowsPoints = ref([]);

const onPointsSelectionChange = (rows) => {
    selectedRowsPoints.value = rows;
};

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
            project_id: currentRequirement.value.project._id.$oid,
            req_id: currentRequirement.value.req.req_id,
            split_file_ids,
        };

        http.post('/api/delete_function_module', deleteSplitRequireParams).then((res) => {
            if (res) {
                ElMessage.success('删除成功');
                refreshAllProjects();
                currentRequirement.value.req.split_files = currentRequirement.value?.req?.split_files.filter(x => !split_file_ids.includes(x.split_file_id));
            } else {
                ElMessage.error('删除失败');
            }
        });
    }).catch(() => {
        ElMessage.info('已取消删除操作');
    });
};

const refreshModule = async () => {
    const result = await projectStore.refreshAllProjects();
    const currentProject = result.find(x => x._id.$oid === currentRequirement.value.project._id.$oid);
    const currentReq = currentProject.requirement_files.find(x => x.req_id === currentRequirement.value.req.req_id);
    if (currentReq) {
        currentRequirement.value.req.split_files = currentReq.split_files;
        ElMessage.success('已刷新')
    } else {
        ElMessage.error('刷新失败')
    }


}


const refreshCases = async (needShow = true) => {
    const res = await refreshAllProjects();
    const project_id = currentRequirement.value.project._id.$oid;
    const split_file_id = currentRequirement.value.splitReq.split_file_id;
    const req_id = currentRequirement.value.req.req_id;
    const currentProject = res.find(x => x._id.$oid === project_id);
    const currentReq = currentProject.requirement_files.find(x => x.req_id === req_id);
    const currentSplitReq = currentReq.split_files.find(x => x.split_file_id === split_file_id);
    if (currentSplitReq) {
        currentRequirement.value.splitReq.split_case = currentSplitReq.split_case;
        if (needShow) {
            ElMessage.success('已刷新')
        }
    } else {
        ElMessage.error('刷新失败')
    }
}

</script>
<style scoped lang="less">
:deep(.el-table__empty_block) {
    width: 100% !important;
    display: none;
}

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

:deep(.ant-tree-node-content-wrapper) {
    display: flex !important;
}
</style>