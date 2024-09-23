<template>
    <div class="flex">
        <div style="height: 100%;border-right: 1px solid #ddd;" class="m-[20px] w-[28rem]">
            <div style="border-bottom: 1px solid #ddd; padding-bottom: 1rem">全部项目 ({{ projects.length }})</div>
            <div style="height: 2rem; margin: 1rem">
                <a-input-search placeholder="请输入要搜索的名称" style="width: 100%" @search="onSearch" />
            </div>
            
            <div style="height: calc(100vh - 10.3rem); overflow: scroll; background-color: rgba(248, 248, 254, 0.5);">
                <a-tree :show-line="false" :show-icon="true" :default-expanded-keys="[treeData?.[0]?._id?.$oid]" :tree-data="treeData"
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

        
        <div class="w-full h-[90vh] pt-[2rem] overflow-scroll">
            <div v-if="currentType === 'requirement'">
                <RequirementInner :currentRequirement="currentRequirement" :selectNodeByKey="selectNodeByKey" />
            </div>
            <div v-else-if="currentType === 'sub_requirement'">
                <SplitRequirementInner :currentRequirement="currentRequirement" :selectNodeByKey="selectNodeByKey"/>
            </div>
            <div v-else-if="currentType === 'split_case'">
                <SplitCaseInner :currentRequirement="currentRequirement" :selectNodeByKey="selectNodeByKey"/>
            </div>
            <div v-else-if="currentType === 'testcase'">
                <TestCaseInner :currentRequirement="currentRequirement" :selectNodeByKey="selectNodeByKey"/>
            </div>
        </div>



    </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '../../stores/project';
import { ref, computed, onUpdated, nextTick } from 'vue';
import type { TreeProps } from 'ant-design-vue';
import { storeToRefs } from 'pinia';
import { ApiOutlined, ProjectOutlined, DatabaseOutlined, ProfileOutlined, DownOutlined, ExperimentOutlined } from '@ant-design/icons-vue';
import RequirementInner from './RequirementInner.vue';
import SplitCaseInner from './SplitCaseInner.vue';
import TestCaseInner from './TestCaseInner.vue';
import SplitRequirementInner from './SplitRequirementInner.vue';
const currentType = ref();
const projectStore = useProjectStore();
const { projects } = storeToRefs(projectStore);
const currentRequirement = ref();
const selectedKeys = ref<string[]>([]);
const treeRef = ref();

const searchValue = ref('');

const onSearch = (value) => {
    searchValue.value = value;
}

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
            key: `${project._id.$oid}`,
            project: project,
            type: 'project',
            children: project.requirement_files && project.requirement_files.length > 0
                ? project.requirement_files.map((req, reqIndex) => {
                    const parts = req.name.split('/');
                    const fileName = parts.pop();
                    return {
                        title: fileName,
                        key: `${project._id.$oid}-${req.id}`,
                        fullPath: req.name,
                        req: req,
                        project: project,
                        type: 'requirement',
                        split_cases: getSplitCases(req),
                        children: req.split_files && req.split_files.length > 0
                            ? req.split_files.map((splitReq, splitReqIndex) => ({
                                title: splitReq.file_name.replace('.docx', ''),

                                key: `${project._id.$oid}-${req.req_id}-${splitReq.split_file_id}`,
                                fullPath: splitReq.object_name,
                                splitReq: splitReq,
                                req: req,
                                project: project,
                                type: 'sub_requirement',
                                split_cases: (splitReq.split_case || []).map((singleCase, splitCaseIndex) => {
                                    for (const [index, testcase] of (singleCase.testcases || []).entries()) {
                                        testcase.split_case_name = singleCase.testcase_name;
                                        testcase.testcaseIndex = index; // 添加index字段，值为当前的顺序
                                        testcase.reqIndex = reqIndex;
                                        testcase.splitReqIndex = splitReqIndex; // 添加splitReqIndex字段，值为当前的splitReq的顺序
                                        testcase.splitCaseIndex = splitCaseIndex;
                                    }
                                    return singleCase.testcases || [];
                                }),
                                children: splitReq.split_case && splitReq.split_case.length > 0
                                    ? splitReq.split_case.map((splitCase, splitCaseIndex) => ({
                                        title: (splitCase.testcase_name || ''),
                                        fullPath: splitCase.testcase_name,
                                        key: `${project._id.$oid}-${req.req_id}-${splitReq.split_file_id}-${splitCase.testcase_id}`,
                                        splitCase: splitCase,
                                        splitReq: splitReq,
                                        req: req,
                                        project: project,
                                        type: 'split_case',
                                        children: splitCase.testcases && splitCase.testcases.length > 0 ?
                                            splitCase.testcases.map((testcase, testcaseIndex) => ({
                                                title: (testcase.testcase_name || ''),
                                                type: 'testcase',
                                                key: `${project._id.$oid}-${req.req_id}-${splitReq.split_file_id}-${splitCase.testcase_id}-${testcase.testcase_id}`,
                                                splitCase: splitCase,
                                                splitReq: splitReq,
                                                req: req,
                                                project: project,
                                                testcase: testcase || [],
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
    console.log(info?.node)
    if (info?.node?.type === 'requirement') {
        currentType.value = 'requirement';
        currentRequirement.value = info.node;
    } else if (info?.node?.type === 'sub_requirement') {
        currentType.value = 'sub_requirement';
        currentRequirement.value = info.node;
    } else if (info?.node?.type === 'split_case') {
        currentType.value = 'split_case';
        currentRequirement.value = info.node;
    } else if (info?.node?.type === 'testcase') {
        currentType.value = 'testcase';
        currentRequirement.value = info.node;
    }
};

const selectNodeByKey = async (key) => {
    // 使用 ref 获取树实例，并设置选中 key
    selectedKeys.value = [key];
    console.log(key)
    // 等待 nextTick 确保 DOM 更新
    await nextTick();
    
    // 手动找到 key 对应的节点，并触发 onSelect
    const findNode = (nodes, targetKey) => {
        for (const node of nodes) {
            if (node.key === targetKey) {
                return node;
            }
            if (node.children) {
                const found = findNode(node.children, targetKey);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    };

    const node = findNode(treeData.value, key);
    console.log(node)
    if (node) {
        onSelect([], { node });
    }
};

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