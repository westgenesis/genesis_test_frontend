<template>
    <div class="flex">
        <div style="height: 100%;border-right: 1px solid #ddd" class="m-[20px] w-[400px]">
            <div style="border-bottom: 1px solid #ddd; padding-bottom: 1rem">全部项目 ({{ projects.length }})</div>
            <div>
                <a-tree :show-line="showLine" :show-icon="showIcon" :default-expanded-keys="['0-0-0']"
                    :tree-data="treeData" @select="onSelect">
                    <template #icon></template>
                </a-tree>
            </div>
        </div>
        <div class="w-full h-[99.9%]">
            <div v-show="currentFile && currentType === 'sub_requirement'" class="editor-container">
                <div style="border-left: 2px solid purple; margin-left: 1rem; padding-left: 1rem;">功能模块</div>
                <div class="flex  mt-[2rem]">
                    <div class="w-[200px] ml-[1rem]">
                        功能模块名称
                    </div>
                    <a-input v-model:value="fileName" placeholder="输入文件名" style="width: 16.5rem;" />
                </div>

                <div ref="quillEditorRef" class="docx-editor" />
                <div>
                    <a-button @click="onSaveContent">保存</a-button>
                </div>
            </div>
            <div v-show="currentType === 'requirement'">
                <div style="border-left: 2px solid purple; margin-left: 1rem; padding-left: 1rem;">项目信息</div>
                <div class="flex-container">
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
                <div style="border-left: 2px solid purple; margin-left: 1rem; padding-left: 1rem;">功能模块信息</div>
                <div>
                    <el-table :data="pagedData" style="width: 100%">
                        <el-table-column prop="chunk_index" label="Chunk Index" width="100" />
                        <el-table-column prop="object_name" label="Object Name" width="300" />
                        <el-table-column prop="file_name" label="File Name" width="200" />
                        <el-table-column label="操作" width="120">
                            <template #default="scope">
                                <el-button type="text" style="color: blue" @click="handleSplit(scope.row)">拆分</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-pagination
                        layout="prev, pager, next"
                        :total="totalItems"
                        :page-size="pageSize"
                        :current-page="currentPage"
                        @current-change="handlePageChange"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '../../stores/project';
import { ref, computed, onMounted } from 'vue';
import type { TreeProps } from 'ant-design-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useProductFetch } from '../../handler/handler';
import { DocumentWordEdit } from './DocumentWordEdit';
import HTMLtoDOCX from 'html-to-docx';
import { http } from '../../http';

const currentFile = ref()
const uploadRef = ref()

const { projects } = useProjectStore();
const showLine = ref<boolean>(true);
const showIcon = ref<boolean>(false);
const { handler } = useProductFetch();
const fileName = ref();
const currentRequirement = ref();

const quillEditorRef = ref()
let documentWordEdit: DocumentWordEdit
onMounted(async () => {
    documentWordEdit = new DocumentWordEdit(quillEditorRef.value);
})

const currentType = ref('');
const onClickPreviewFile = (node: any) => {
    const { splitReq, project } = node;
    console.log(splitReq, project)
    if (splitReq.is_table === true) {
        ElMessage.error('该docx包含表格 暂时无法在 Word 编辑器中预览');
        return;
    }
    const projectId = project._id.$oid;
    handler
        .DownloadFile(projectId, splitReq.object_name).then((stream: any) => {
            const blob = new Blob([stream], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            })
            const file = new File([blob], splitReq.file_name)
            documentWordEdit.docxToQuill(file)
            currentFile.value = node;
            fileName.value = splitReq.file_name;
        })
};

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
                    children: req.split_require && req.split_require.length > 0
                        ? req.split_require.map((splitReq, splitReqIndex) => ({
                            title: splitReq.file_name,
                            key: `0-${index}-${reqIndex}-${splitReqIndex}`,
                            fullPath: splitReq.object_name,
                            splitReq: splitReq,
                            req: req,
                            project: project,
                            type: 'sub_requirement'
                        }))
                        : []
                };
            })
            : []
    }));
});

const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    if (info?.node?.type === 'requirement') {
        console.log(info.node);
        currentType.value = 'requirement';
        currentRequirement.value = info.node;
        return;
    }
    if (info?.node?.splitReq) {
        currentType.value = 'sub_requirement';
        onClickPreviewFile(info?.node);
    }
};

const onSaveContent = () => {
    console.log(currentFile.value);
    ElMessageBox.confirm('保存后会覆盖文件，是否确定？', '覆盖提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
    }).then(() => {
        HTMLtoDOCX(documentWordEdit.quill.getSemanticHTML()).then((data) => {
            const file = new File([data], currentFile.value.file_name, {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            })
            const formData = new FormData()
            const info = new Blob([
                JSON.stringify({
                    db_id: currentFile.value.project._id.$oid,
                    category: 'save_requirement_docx',
                    splitReq: currentFile.value.splitReq,
                    newFileName: fileName
                })
            ])

            formData.append('user_file', file)
            formData.append('info', info)
            handler.UploadFile(formData).then((res) => {
                if (res) {
                    ElMessage.success('保存成功')
                } else {
                    ElMessage.error('保存失败')
                }
            })
        })
    })
}

const currentPage = ref(1);
const pageSize = ref(10);

const pagedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return currentRequirement.value?.req?.split_require.slice(start, end) || [];
});

const totalItems = computed(() => currentRequirement.value?.req?.split_require.length || 0);

const handlePageChange = (page: number) => {
    currentPage.value = page;
};

const handleSplit = (row: any) => {
    const params = {
        project_id: currentRequirement.value.project._id.$oid,
        ...row,
        reqId: currentRequirement.value.req.reqId,
    }
    http.post('/api/generate_testcase_new', params).then((res) => {
                if (res) {
                    ElMessage.success('拆分功能点成功')
                } else {
                    ElMessage.error('拆分功能点失败')
                }
            })
};

</script>

<style scoped lang="less">
:deep(.ql-toolbar svg) {
    display: none;
}

.docx-editor {
    border: none;
    margin: 1rem;
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
</style>