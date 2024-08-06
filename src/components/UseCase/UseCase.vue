<template>
    <div class="flex">
        <div style="height: 100%;border-right: 1px solid #ddd;" class="m-[20px] w-[400px]">
            <div style="border-bottom: 1px solid #ddd; padding-bottom: 1rem">全部项目 ({{ projects.length }})</div>
            <div style="height: 2rem; margin: 1rem">
                <a-input-search placeholder="请输入要搜索的名称" style="width: 100%"
                        @search="onSearch" />
            </div>
            <div style="height: calc(100vh - 10.3rem); overflow: scroll; background-color: rgba(248, 248, 254, 0.5);">
                <a-tree :show-line="showLine" :show-icon="showIcon" :default-expanded-keys="['0-0-0']"
                    :tree-data="treeData" @select="onSelect" v-model:selectedKeys="selectedKeys">
                    <template #icon></template>
                </a-tree>
            </div>
        </div>
        <div class="w-full h-[90%] pt-[2rem]">
            <div v-show="currentType === 'requirement'" class="w-full h-[90%] pt-[2rem]">
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
                    测试用例信息</div>
                <el-table :data="flattened_cases_req_paged" style="width: 100%" id="function_point_table" :height="table_height1">
                    <el-table-column type="expand" :width="100">
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
                    <el-table-column prop="testcase_id" label="测试用例ID" :width="100" />
                    <el-table-column prop="testcase_name" label="测试用例名称" :width="100" />
                    <el-table-column prop="version" label="版本" :width="100" />
                    <el-table-column prop="split_case_name" label="所属功能点" :width="100" />
                    <el-table-column prop="split_file_name" label="所属功能模块" :width="100"/>
                </el-table>
                <div class="flex justify-center mt-4">
                        <a-pagination v-model:current="currentPageReq" :total="totalItemsReq" :page-size="pageSizeReq"
                            @change="handlePageChangeReq" />
                    </div>
            </div>
            <div v-show="currentType === 'sub_requirement'" class="w-full h-[90%] pt-[2rem]">
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
                    <el-table :data="pagedData" style="width: 100%" id="function_point_table" :height="table_height1">
                        <el-table-column type="expand" :width="100">
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
                        <el-table-column prop="testcase_id" label="测试用例ID" :width="100" />
                        <el-table-column prop="testcase_name" label="测试用例名称" :width="100" />
                        <el-table-column prop="version" label="版本" :width="100" />
                        <el-table-column prop="split_case_name" label="所属功能点" :width="100" />
                        <el-table-column label="操作" :width="150">
                            <template #default="scope">
                                <el-button type="text" style="color: blue"
                                    @click="handleModify(scope.row)">修改</el-button>
                                <el-button type="text" style="color: blue"
                                    @click="handleSplit(scope.row)">生成脚本</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="flex justify-center mt-4">
                        <a-pagination v-model:current="currentPage" :total="totalItems" :page-size="pageSize"
                            @change="handlePageChange" />
                    </div>
                </div>
            </div>
            <div v-show="currentType === 'split_case'" class="w-full h-[90%] pt-[2rem]">
                <div style="border-left: 2px solid purple; margin-left: 1rem; padding-left: 1rem; margin-bottom: 1rem;">
                    功能点信息
                </div>
                <div class="flex-container" style="margin-left: 1rem">
                    <div class="flex-item">
                        <strong>功能点名称:</strong> {{ currentRequirement?.splitCase?.testcase_name }}
                    </div>
                    <div class="flex-item">
                        <strong>功能点ID:</strong> {{ currentRequirement?.splitCase?.testcase_id }}
                    </div>
                    <div class="flex-item">
                        <strong>当前版本:</strong> {{ currentRequirement?.splitCase?.version }}
                    </div>
                    <div class="flex-item">
                        <strong>功能点描述:</strong> {{ currentRequirement?.splitCase?.description || '无描述' }}
                    </div>
                </div>
                <div style="border-left: 2px solid purple; margin-left: 1rem; padding-left: 1rem; margin-bottom: 1rem;">
                    测试用例
                </div>
                <div class="flex" style="justify-content: flex-end; margin-right: 1rem">
                    <a-button type="primary" class="custom-purple-button" size="large"
                        @click="showDrawer">新建测试用例</a-button>
                </div>

                <el-table :data="currentRequirement?.splitCase?.testcases" style="width: 100%" id="function_point_table"
                    :height="table_height1">
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
                                        初始条件信号</div>
                                    <div>{{ scope.row.pre_condition_signal }}</div>
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
                                        触发条件信号</div>
                                    <div>{{ scope.row.action_signal }}</div>
                                </div>
                                <div class="flex" style="border: 1px solid #eee;">
                                    <div
                                        style="min-width: 100px; background-color: #f2f2f2; padding: 10px; text-align: center;">
                                        预期结果</div>
                                    <div>{{ scope.row.result }}</div>
                                </div>
                                <div class="flex" style="border: 1px solid #eee;">
                                    <div
                                        style="min-width: 100px; background-color: #f2f2f2; padding: 10px; text-align: center;">
                                        预期结果信号</div>
                                    <div>{{ scope.row.result_signal }}</div>
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="testcase_id" label="测试用例ID" :width="table_width1 / 5 || 100" />
                    <el-table-column prop="testcase_name" label="测试用例名称" :width="table_width1 / 6 || 100" />
                    <el-table-column prop="version" label="版本" :width="table_width1 / 6 || 100" />
                    <el-table-column label="操作" :width="150">
                        <template #default="scope">
                            <el-button type="text" style="color: blue" @click="handleModify(scope.row)">修改</el-button>

                            <el-button type="text" style="color: blue" @click="handleSplit(scope.row)">生成脚本</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div v-show="currentType === 'testcase'">
                <a-form :model="form" layout="vertical">
                    <a-form-item label="测试用例类型">
                        <a-select v-model:value="form.type" placeholder="请选择测试用例类型">
                            <a-select-option value="positive">正例</a-select-option>
                            <a-select-option value="negative">反例</a-select-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item label="测试用例名称">
                        <a-input v-model:value="form.name" placeholder="请输入测试用例名称" :rows="4" />
                    </a-form-item>
                    <a-form-item label="初始条件">
                        <a-textarea v-model:value="form.pre_condition" placeholder="请输入初始条件" :rows="2" />
                    </a-form-item>
                    <a-form-item label="初始条件信号">
                        <a-input v-model:value="form.pre_condition_signal" placeholder="请输入初始条件信号" />
                    </a-form-item>
                    <a-form-item label="触发条件">
                        <a-textarea v-model:value="form.action" placeholder="请输入触发条件" :rows="2" />
                    </a-form-item>
                    <a-form-item label="触发条件信号">
                        <a-textarea v-model:value="form.action_signal" placeholder="请输入触发条件信号" :rows="2" />
                    </a-form-item>
                    <a-form-item label="预期结果">
                        <a-textarea v-model:value="form.result" placeholder="请输入预期结果" :rows="2" />
                    </a-form-item>
                    <a-form-item label="预期结果信号">
                        <a-textarea v-model:value="form.result_signal" placeholder="请输入预期结果" :rows="2" />
                    </a-form-item>
                    <a-form-item>
                        <div class="flex justify-center items-center" style="flex-direction: column;">
                            <a-button type="primary" @click="handleSave" class="custom-purple-button">保存</a-button>
                            <div style="color: red">提示：当前为V{{ form.version }}版本 保存后版本新增</div>
                        </div>
                    </a-form-item>
                </a-form>
            </div>
            <a-drawer title="修改测试用例" :visible="editVisible" :width="720" @close="onEditDrawerClose">
                <a-form :model="newForm" layout="vertical">
                    <a-form-item label="测试用例类型">
                        <a-select v-model:value="newForm.type" placeholder="请选择测试用例类型">
                            <a-select-option value="positive">正例</a-select-option>
                            <a-select-option value="negative">反例</a-select-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item label="功能点名称">
                        <a-input v-model:value="newForm.name" placeholder="请输入功能点名称" :rows="4" />
                    </a-form-item>
                    <a-form-item label="初始条件">
                        <a-textarea v-model:value="newForm.pre_condition" placeholder="请输入初始条件" :rows="2" />
                    </a-form-item>
                    <a-form-item label="初始条件信号">
                        <a-input v-model:value="newForm.pre_condition_signal" placeholder="请输入初始条件信号" />
                    </a-form-item>
                    <a-form-item label="触发条件">
                        <a-textarea v-model:value="newForm.action" placeholder="请输入触发条件" :rows="2" />
                    </a-form-item>
                    <a-form-item label="触发条件信号">
                        <a-textarea v-model:value="newForm.action_signal" placeholder="请输入触发条件信号" :rows="2" />
                    </a-form-item>
                    <a-form-item label="预期结果">
                        <a-textarea v-model:value="newForm.result" placeholder="请输入预期结果" :rows="2" />
                    </a-form-item>
                    <a-form-item label="预期结果信号">
                        <a-textarea v-model:value="newForm.result_signal" placeholder="请输入预期结果" :rows="2" />
                    </a-form-item>
                    <a-form-item>
                        <div class="flex justify-center items-center" style="flex-direction: column;">
                            <a-button type="primary" @click="handleEditSave" class="custom-purple-button">保存</a-button>
                        </div>
                    </a-form-item>
                </a-form>
            </a-drawer>

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
                        <a-textarea v-model:value="newForm.pre_condition" placeholder="请输入初始条件" :rows="2" />
                    </a-form-item>
                    <a-form-item label="初始条件信号">
                        <a-input v-model:value="newForm.pre_condition_signal" placeholder="请输入初始条件信号" />
                    </a-form-item>
                    <a-form-item label="触发条件">
                        <a-textarea v-model:value="newForm.action" placeholder="请输入触发条件" :rows="2" />
                    </a-form-item>
                    <a-form-item label="触发条件信号">
                        <a-textarea v-model:value="newForm.action_signal" placeholder="请输入触发条件信号" :rows="2" />
                    </a-form-item>
                    <a-form-item label="预期结果">
                        <a-textarea v-model:value="newForm.result" placeholder="请输入预期结果" :rows="2" />
                    </a-form-item>
                    <a-form-item label="预期结果信号">
                        <a-textarea v-model:value="newForm.result_signal" placeholder="请输入预期结果" :rows="2" />
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
import { storeToRefs } from 'pinia';

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
const flattened_cases_req = ref([]);

const pageSizeReq = ref(10);
const currentPageReq = ref(1);

const flattened_cases_req_paged = computed(() => {
    const start = (currentPageReq.value - 1) * pageSizeReq.value;
    const end = start + pageSizeReq.value;
    console.log(start, end);
    return flattened_cases_req.value.slice(start, end);
});

const totalItemsReq = computed(() => flattened_cases_req.value.length);

const handlePageChangeReq = (page: number) => {
    currentPageReq.value = page;
};

const form = ref({
    name: '',
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

const getSplitCases = (req) => {
    if (!req.split_files) {
        return [];
    }
    const res = [];
    for (const file of req.split_files) {
        if (file.split_case?.length) {
            for (const singleCase of file.split_case) {
                if (singleCase.testcases?.length) {
                    for (const testcase of singleCase.testcases) {
                        testcase.split_case_name = singleCase.testcase_name;
                        testcase.split_file_name = file.file_name;
                        res.push(testcase);
                    }
                }
            }
        }
    }
    return res;
}

const searchValue = ref('');

const onSearch = (value) => {
    searchValue.value = value;
}

const filterTree = (items, searchTerm) => {
    return items.map((item) => {
        // 递归过滤子节点
        const children = item.children ? filterTree(item.children, searchTerm) : [];
        // 检查当前节点或其子节点是否匹配搜索条件
        const matches = item.title.includes(searchTerm) || children.length > 0;
        if (matches) {
            return { ...item, children };
        }
        return null;
    }).filter(item => item !== null);
};

const treeData = computed(() => {
    const searchTerm = searchValue.value.trim();

    const buildTree = (projects) => {
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
                        split_cases: getSplitCases(req),
                        children: req.split_files && req.split_files.length > 0
                            ? req.split_files.map((splitReq, splitReqIndex) => ({
                                title: splitReq.file_name.replace('.docx', ''),
                                key: `0-${index}-${reqIndex}-${splitReqIndex}`,
                                fullPath: splitReq.object_name,
                                splitReq: splitReq,
                                req: req,
                                project: project,
                                type: 'sub_requirement',
                                split_cases: (splitReq.split_case || []).map((singleCase) => {
                                    for (const testcase of (singleCase.testcases || [])) {
                                        testcase.split_case_name = singleCase.testcase_name;
                                    }
                                    return singleCase.testcases || [];
                                }),
                                children: splitReq.split_case && splitReq.split_case.length > 0
                                    ? splitReq.split_case.map((splitCase, splitCaseIndex) => ({
                                        title: (splitCase.testcase_name || ''),
                                        fullPath: splitCase.testcase_name,
                                        key: `0-${index}-${reqIndex}-${splitReqIndex}-${splitCaseIndex}`,
                                        splitCase: splitCase,
                                        splitReq: splitReq,
                                        req: req,
                                        project: project,
                                        type: 'split_case',
                                        children: splitCase.testcases && splitCase.testcases.length > 0 ?
                                            splitCase.testcases.map((testcase, testcaseIndex) => ({
                                                title: (testcase.testcase_name || ''),
                                                type: 'testcase',
                                                key: `0-${index}-${reqIndex}-${splitReqIndex}-${splitCaseIndex}-${testcaseIndex}`,
                                                splitCase: splitCase,
                                                splitReq: splitReq,
                                                req: req,
                                                project: project,
                                                testcase: testcase,
                                            })) : []
                                    }))
                                    : []
                            }))
                            : []
                    };
                })
                : []
        }));
    };

    if (searchTerm === '') {
        return buildTree(projects.value);
    }

    return filterTree(buildTree(projects.value), searchTerm);
});

const onSelect: TreeProps['onSelect'] = (_, info) => {
    if (info?.node?.type === 'requirement') {
        currentType.value = 'requirement';
        currentRequirement.value = info.node;
        const testcases_flatten = info.node.split_cases || [];
        flattened_cases_req.value = testcases_flatten;
    } else if (info?.node?.type === 'sub_requirement') {
        currentType.value = 'sub_requirement';
        currentRequirement.value = info.node;
        const split_cases = info.node.split_cases;
        const flattened = split_cases.reduce((acc, curr) => acc.concat(curr ?? []), []);
        flattened_cases.value = flattened;
    } else if (info?.node?.type === 'split_case') {
        currentType.value = 'split_case';
        currentRequirement.value = info.node;
        console.log(info.node.splitCase);
        form.value = {
            name: info.node.splitCase.testcase_name,
            pre_condition: info.node.splitCase.pre_condition,
            action: info.node.splitCase.action,
            action_signal: info.node.splitCase.action_signal,
            result_signal: info.node.splitCase.result_signal,
            pre_condition_signal: info.node.splitCase.pre_condition_signal,
            result: info.node.splitCase.result,
            version: info.node.splitCase.version,
            testcase_id: info.node.splitCase.testcase_id,
            project_id: info.node.project._id.$oid,
            req_id: info.node.req.req_id,
            split_file_id: info.node.splitReq.split_file_id,
        }
    } else if (info?.node?.type === 'testcase') {
        currentType.value = 'testcase';
        currentRequirement.value = info.node;
        console.log(info.node.testcase);
        form.value = {
            name: info.node.testcase.testcase_name,
            pre_condition: info.node.testcase.pre_condition,
            action: info.node.testcase.action,
            result: info.node.testcase.result,
            version: info.node.testcase.version,
            type: info.node.testcase.type,
            testcase_id: info.node.testcase.testcase_id,
            project_id: info.node.project._id.$oid,
            req_id: info.node.req.req_id,
            split_file_id: info.node.splitReq.split_file_id,
            split_case_id: info.node.splitCase.testcase_id,
            action_signal: info.node.testcase.action_signal,
            result_signal: info.node.testcase.result_signal,
            pre_condition_signal: info.node.testcase.pre_condition_signal,
        }
    }
};

const table_width1 = ref(window.innerWidth * 0.6);
const table_height1 = ref(window.innerHeight * 0.5);

const currentPage = ref(1);
const pageSize = ref(10);

const pagedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return flattened_cases.value.slice(start, end);
});

const totalItems = computed(() => flattened_cases.value.length);

const handlePageChange = (page: number) => {
    currentPage.value = page;
};

const handleSave = async () => {

    const params = {
        ...form.value,
        split_req_version: currentRequirement.value.splitReq.version,
        testcase_name: form.value.name,
        split_case_id: currentRequirement.value.splitCase.testcase_id,
        split_case_version: currentRequirement.value.splitCase.version,
        testcase_id: form.value.testcase_id,
    }
    return http.post('/api/modify_testcase', params).then(async response => {
        if (response.status === 'OK') {
            ElMessage.success('保存成功');
            const result = await refreshAllProjects();
            console.log(response.testcases);
            const currentTestcase = response.testcases.find(testcase => testcase.testcase_id === params.testcase_id);
            form.value.version = currentTestcase.version;
        }
    })
}

const handleEditSave = async () => {
    const params = {
        ...newForm.value,
        split_req_version: currentRequirement.value.splitReq.version,
        testcase_name: newForm.value.name,
        split_case_id: currentRequirement.value.splitCase.testcase_id,
        split_case_version: currentRequirement.value.splitCase.version,
        testcase_id: newForm.value.testcase_id,
    }
    delete params.name;
    return http.post('/api/modify_testcase', params).then(response => {
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

const onEditDrawerClose = () => {
    editVisible.value = false;
}

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
        split_req_version: currentRequirement.value.splitReq.version,
        testcase_name: newForm.value.name,
        split_case_id: currentRequirement.value.splitCase.testcase_id,
        split_case_version: currentRequirement.value.splitCase.version,
    }
    delete params.name;
    return http.post('/api/create_testcase', params).then(async response => {
        if (response) {
            ElMessage.success('保存成功');
            currentRequirement.value.splitCase.testcases = response.testcases;
            onDrawerClose();
        } else {
            ElMessage.error('保存失败');
        }
    }).catch(() => {
        ElMessage.error('保存失败');
    })
}

const handleSplit = (row) => {
    ElMessage.error('现在还不支持生成脚本')
}

const handleModify = (row) => {
    newForm.value.name = row.testcase_name;
    newForm.value.pre_condition = row.pre_condition;
    newForm.value.action = row.action;
    newForm.value.result = row.result;
    newForm.value.pre_condition_signal = row.pre_condition_signal;
    newForm.value.action_signal = row.action_signal;
    newForm.value.result_signal = row.result_signal;
    newForm.value.project_id = currentRequirement.value.project._id.$oid;
    newForm.value.split_file_id = currentRequirement.value.splitReq.split_file_id;
    newForm.value.req_id = currentRequirement.value.req.req_id;
    newForm.value.testcase_id = row.testcase_id;
    newForm.value.version = row.version;
    newForm.value.type = row.type;
    editVisible.value = true;
}
</script>
<style scoped lang="less">
:deep(.el-table__empty_block) {
    width: 100% !important;
    display: none;
}
:deep(.el-table) {
    width: 100%;
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
</style>