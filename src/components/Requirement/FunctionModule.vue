<template>
    <div class="flex">
        <div style="height: 100%;border-right: 1px solid #ddd;" class="m-[20px] mb-[0] w-[400px] flex flex-col">
            <div style="border-bottom: 1px solid #ddd; padding-bottom: 1rem">全部项目 ({{ projects.length }})</div>
            <div style="height: 2rem; margin: 1rem">
                <a-input-search placeholder="请输入要搜索的名称" style="width: 100%"
                        @search="onSearch" />
            </div>
            <div style="height: calc(100vh - 10.3rem); overflow: scroll; background-color: rgba(248, 248, 254, 0.5);">
                <a-tree :show-line="showLine" :show-icon="showIcon" :default-expanded-keys="['0-0-0']"
                    :tree-data="treeData" @select="onSelect">
                    <template #icon></template>
                </a-tree>
            </div>
        </div>
        <div class="w-full pt-[2rem] overflow-scroll">
            <div v-show="currentFile && currentType === 'sub_requirement'" class="editor-container">
                <div style="border-left: 2px solid purple; margin-left: 1rem; padding-left: 1rem;">功能模块</div>
                <div class="flex  mt-[2rem] mb-[1rem]">
                    <div class="w-[200px] ml-[1rem]">
                        功能模块名称
                    </div>
                    <a-input v-model:value="fileName" placeholder="输入文件名" style="width: 16.5rem;" />
                    <div class="w-[200px] ml-[1rem]">V{{ currentFile?.splitReq?.version }}</div>
                </div>

                <div ref="quillEditorRef" class="docx-editor" />
                <div class="flex justify-center mt-[1rem]">
                    <a-button type="primary" size="large" @click="onSaveContent"
                        class="custom-purple-button">保存</a-button>
                </div>
                <div style="text-align: center;color: red;font-size: 12px;margin-top: 1rem;">提示：当前为V{{ currentFile?.splitReq?.version }}版本 由文档{{ (currentFile?.req?.name || '').split('/')[1] }} v1版本生成 保存后版本新增</div>
            </div>
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
                        <a-button type="primary" size="large" @click="openAddDrawer"
                        class="custom-purple-button mr-[2rem]">新建功能模块</a-button>
                        <a-button type="primary" size="large" @click="handleDelete"
                        class="custom-purple-button mr-[2rem]">删除</a-button>
                        <a-button type="primary" size="large" @click="handleBatchSplit"
                        class="custom-purple-button mr-[2rem]">批量拆分</a-button>
                    </div>
                <div style="width: 100%">
                    <el-table :data="pagedData" style="width: 100%" id="function_module_table" @selection-change="handleSelectionChange">
                        <el-table-column type="selection" width="50"/>
                        <el-table-column type="expand" width="70">
                            <template #default="props">
                                <requirement-docx :record="props.row" />
                            </template>
                        </el-table-column>
                        <el-table-column prop="split_file_id" label="功能模块ID" :width="table_width / 7 || 100"/>
                        <el-table-column prop="file_name" label="功能模块名称" :width="table_width / 7 || 100">
                            <template #default="scope">
                                {{  scope.row.file_name?.replace('.docx', '') }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="description" label="功能模块描述" :width="table_width / 7 || 100"/>
                        <el-table-column prop="version" label="版本" :width="table_width / 7 || 100"/>
                        <el-table-column label="操作" :width="table_width / 7 || 100">
                            <template #default="scope">
                                <el-button type="text"
                                    @click="handleSplit(scope.row)" :disabled="scope.row.is_table === true">拆分</el-button>
                            </template>
                        </el-table-column>
                        
                    </el-table>
                    <div class="flex justify-center">
                        <el-pagination layout="prev, pager, next" :total="totalItems" :page-size="pageSize"
                            :current-page="currentPage" @current-change="handlePageChange" />
                    </div>

                </div>
            </div>
        </div>
    </div>

    <!-- 添加 a-drawer 组件 -->
    <AddModuleDrawer :visible="drawerVisible" @close="closeAddDrawer" @save="saveNewModule" :currentRequirement="currentRequirement"/>
</template>

<script setup lang="ts">
import { useProjectStore } from '../../stores/project';
import { ref, computed, onMounted, watch, onUpdated } from 'vue';
import type { TreeProps } from 'ant-design-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useProductFetch } from '../../handler/handler';
import { DocumentWordEdit } from './DocumentWordEdit';
import HTMLtoDOCX from 'html-to-docx';
import { http } from '../../http';
import RequirementDocx from './RequirementDocx.vue';
import AddModuleDrawer from './AddModuleDrawer.vue'; // 引入新组件
import { storeToRefs } from 'pinia';


const searchValue = ref('');
const currentFile = ref();
const uploadRef = ref();

const projectStore = useProjectStore();
const { refreshAllProjects } = useProjectStore();
const { projects } = storeToRefs(projectStore);
const showLine = ref<boolean>(true);
const showIcon = ref<boolean>(false);
const { handler } = useProductFetch();
const fileName = ref();
const currentRequirement = ref();

const quillEditorRef = ref();
const quillEditorRefNew = ref();
let documentWordEdit: DocumentWordEdit;

onMounted(async () => {
    documentWordEdit = new DocumentWordEdit(quillEditorRef.value);
});

const currentType = ref('');
const onClickPreviewFile = (node: any) => {
    const { splitReq, project } = node;
    console.log(splitReq);
    if (splitReq.is_table === true) {
        ElMessage.error('该docx包含表格 暂时无法在 Word 编辑器中预览');
        return;
    }
    const projectId = project._id.$oid;
    handler.DownloadFile(projectId, splitReq.object_name).then((stream: any) => {
        const blob = new Blob([stream], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        const file = new File([blob], splitReq.file_name);
        documentWordEdit.docxToQuill(file);
        currentFile.value = node;
        fileName.value = splitReq.file_name.replace('.docx', '');
    });
};

const treeData = computed(() => {
    const filterTree = (items, searchTerm) => {
        return items.map((item) => {
            const children = item.children ? filterTree(item.children, searchTerm) : [];
            if (item.title.includes(searchTerm) || children.length > 0) {
                return { ...item, children };
            }
            return null;
        }).filter(item => item !== null);
    };

    if (searchValue.value.trim() === '') {
        return projects.value.map((project, index) => ({
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
                        }))
                        : []
                };
            })
            : []
    })), searchValue.value);
});

const onSearch = (value) => {
    searchValue.value = value;
}

const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    console.log(info.node);
    if (info?.node?.type === 'requirement') {
        currentType.value = 'requirement';
        currentRequirement.value = info.node;
    } else if (info?.node?.type === 'sub_requirement') {
        currentType.value = 'sub_requirement';
        currentRequirement.value = info.node;
        onClickPreviewFile(info?.node);
    } else if (info?.node?.type === 'split_case') {
        currentType.value ='split_case';
        currentRequirement.value = info.node;
    }
};


const onSaveContent = () => {
    ElMessageBox.confirm('保存后会覆盖文件，是否确定？', '覆盖提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
    }).then(() => {
        HTMLtoDOCX(documentWordEdit.quill.getSemanticHTML()).then((data) => {
            const file = new File([data], fileName.value, {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            const formData = new FormData();
            const info = new Blob([
                JSON.stringify({
                    db_id: currentFile.value.project._id.$oid,
                    category: 'save_requirement_docx',
                    ...currentFile.value.splitReq,
                    newFileName: fileName.value,
                    req_id: currentFile.value.req.req_id
                })
            ]);

            formData.append('user_file', file);
            formData.append('info', info);
            handler.UploadFile(formData).then((res) => {
                if (res) {
                    ElMessage.success('保存成功');
                    currentFile.value.splitReq.version = (Number(currentFile.value.splitReq.version) + 0.1).toFixed(1);
                    refreshAllProjects();
                } else {
                    ElMessage.error('保存失败');
                }
            });
        });
    });
};

const currentPage = ref(1);
const pageSize = ref(10);
const table_width = ref(1000);

const pagedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return currentRequirement.value?.req?.split_files.slice(start, end) || [];
});

const totalItems = computed(() => currentRequirement.value?.req?.split_files.length || 0);

const handlePageChange = (page: number) => {
    currentPage.value = page;
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
    if (selectedRows.value.length === 0) {
        ElMessage.warning('请选择要拆分的功能模块');
        return;
    }

    ElMessageBox.confirm('拆分会覆盖当前模块的已有功能点，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const params = selectedRows.value.map(row => ({
            project_id: currentRequirement.value.project._id.$oid,
            object_name: row.object_name,
            split_file_id: row.split_file_id,
            version: row.version,
            req_id: currentRequirement.value.req.req_id
        }));

        http.post('/api/subrequire_batch_generate_points', params).then((res) => {
            if (res) {
                ElMessage.success('已下发功能点拆解任务，请等待或刷新后去功能点页面查看结果');
                refreshAllProjects();
            } else {
                ElMessage.error('拆分失败');
            }
        });
    }).catch(() => {
        ElMessage.info('已取消拆分操作');
    });
};

onUpdated(() => {
    const ele = document.getElementById('function_module_table');
    if (ele) {
        const width = ele.getBoundingClientRect().width;
        table_width.value = width;
    }
});

// 新增的代码
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

const saveNewModule = (module) => {
    closeAddDrawer();
};

// 新增的代码
const selectedRows = ref([]);

const handleSelectionChange = (rows) => {
    selectedRows.value = rows;
};

const handleDelete = () => {
    if (selectedRows.value.length === 0) {
        ElMessage.warning('请选择要删除的功能模块');
        return;
    }

    ElMessageBox.confirm('确定要删除选中的功能模块吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const split_file_ids = selectedRows.value.map(row => row.split_file_id);
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
</style>