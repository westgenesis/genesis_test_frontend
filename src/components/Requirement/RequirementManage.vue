<template>
    <div class="m-[2rem]">
        <a-card>
            <div style="border-left: 4px solid purple">
                <div class="ml-[1rem]">{{ currentProject.name }}</div>
            </div>

            <div class="flex-container">
                <div class="flex-item">
                    <strong>项目ID:</strong> {{ currentProject._id.$oid }}
                </div>
                <div class="flex-item">
                    <strong>测试环境:</strong> {{ currentProject.kind }}
                </div>
                <div class="flex-item">
                    <strong>计划周期:</strong> {{ currentProject.period_start }} 至 {{ currentProject.period_end }}
                </div>
                <div class="flex-item">
                    <strong>项目描述:</strong> {{ currentProject.notes || '无描述' }}
                </div>
            </div>
        </a-card>
        <a-card style="margin-top: 1rem;" id="requirement-card">
            <div
                style="border-left: 4px solid purple; display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <div class="ml-[1rem] flex align-center justify-center">需求文档 <div class="ml-[1rem] pb-[2px]" style="cursor: pointer; transform: translateY(-3px);" @click="doRefresh"><RedoOutlined /></div></div>

                <el-upload ref="uploadRef" :auto-upload="false" :on-change="onBeforeUpload" :show-file-list="false"
                    accept=".doc,.docx">
                    <template #trigger>
                        <a-button type="primary" size="large" class="custom-purple-button">
                            <template #icon>
                                <CloudUploadOutlined style="transform: translateY(-3px);" />
                            </template>
                            上传需求
                        </a-button>
                    </template>
                </el-upload>
            </div>
            <div v-if="requirements?.length">
                <div v-for="requirement in requirements" class="flex requirement">
                    <div class="flex-1 requirement-item">{{ requirement.req_id }}</div>
                    <div class="flex-1 requirement-item">{{ requirement.name.split('/')[1] }}</div>
                    <div class="flex-1 requirement-item">{{ requirement.creator }}</div>
                    <div class="flex-1 requirement-item">{{ requirement.created_time }}</div>
                    <div class="flex-1 requirement-item">{{ 'V' + requirement.version }}</div>
                    <div class="flex-1 requirement-item">{{ requirementStatusMap[requirement.status] }}</div>
                    <div class="flex-1 flex" style="gap: 1rem">
                        <el-upload ref="uploadRef" :auto-upload="false"
                            :on-change="file => onBeforeUpdate(file, requirement)" :show-file-list="false"
                            accept=".doc,.docx,.pdf">
                            <template #trigger>
                                <el-button type="text">更新</el-button>
                            </template>
                        </el-upload>
                        <el-button type="text" @click="doSplitRequirement(requirement)">解析</el-button>
                    </div>
                </div>

            </div>
            <div v-else class="flex justify-center items-center w-full">
                <div>暂无数据，请</div>
                <el-upload ref="uploadRef" :auto-upload="false" :on-change="onBeforeUpload" :show-file-list="false"
                    accept=".doc,.docx,.pdf">
                    <template #trigger>
                        <span style="color: purple; cursor: pointer;">上传需求</span>
                    </template>
                </el-upload>
            </div>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '@stores/project';
import { storeToRefs } from 'pinia';
import { computed, watch } from 'vue';
import { CloudUploadOutlined, RedoOutlined } from '@ant-design/icons-vue';
import { UploadProps, ElMessage } from 'element-plus';
import { http } from '../../http';
import { requirementStatusMap } from './RequirementModel';
import { ElLoading } from 'element-plus'
const projectStore = useProjectStore();
const { currentProject } = storeToRefs(projectStore);

watch(currentProject, (newVal) => {
    console.log(newVal);
})

const requirements = computed(() => currentProject.value?.requirement_files || []);

const onUploadMainDoc = () => {
    // 跳转到上传需求文档的页面
};

const onBeforeUpload: UploadProps['onChange'] = async (file) => {
    if (requirements.value.length >= 5) {
        ElMessage.error('一个项目最多上传五个需求文档');
        return;
    }
    const formData = new FormData()
    const info = new Blob([
        JSON.stringify({ db_id: currentProject.value['_id']['$oid'], category: 'requirments_docx' })
    ])
    formData.append('user_file', file.raw as File);
    formData.append('info', info);
    const loadingInstance = ElLoading.service({
        target: '#requirement-card'
    })
    try {
        const result = await http.post(`/api/upload_project_file`, formData);
        console.log(result)
        await projectStore.refreshProject(currentProject.value['_id']['$oid']);
    } catch(e) {
        console.log(e)
        console.log(e?.response?.data?.message)
        if (e?.response?.data?.message) {
            ElMessage.error(e.response.data.message);
        }
    } finally {
        loadingInstance.close()
    }

}

const doRefresh = async () => {
    await projectStore.refreshProject(currentProject.value['_id']['$oid']);
    ElMessage.success('需求文档已刷新');
}

const onBeforeUpdate: UploadProps['onChange'] = async (file, requirement) => {
    const formData = new FormData();
    const info = new Blob([
        JSON.stringify({
            db_id: currentProject.value['_id']['$oid'],
            category: 'update_requirments_docx',
            req_id: requirement.req_id, 
            req_name: requirement.name,
            req_creator: requirement.creator,
            new_file_name: file.name,
            version: requirement.version
        })
    ])
    formData.append('user_file', file.raw as File);
    formData.append('info', info);

    await http.post(`/api/upload_project_file`, formData).then(response => {
        if (response.status === 'OK') {
            ElMessage.success('更新成功')
        } else {
            ElMessage.error('更新失败');
        }
    });
    await projectStore.refreshProject(currentProject.value['_id']['$oid']);
}

const doSplitRequirement = async (requirement) => {
    ElMessage.success('已下发解析请求, 请等待一段时间或刷新后查看需求管理');
    const result = await http.post('/api/do_split_requirement', requirement);
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

.requirement {
    display: flex;
    margin: 1rem;
    border-bottom: 1px solid #ddd;
}

.requirement-item {
    flex: 1;
    max-width: calc(100% / 7);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>