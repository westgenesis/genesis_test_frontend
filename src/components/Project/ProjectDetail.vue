<template>
    <div class="project-detail">
        <div class="flex justify-end mr-[6rem]">
            <a-button type="primary" v-show="!isEditing" @click="changeEdit">编辑</a-button>
            <a-button type="primary" v-show="isEditing" @click="submit">确定</a-button>
            <a-button v-show="isEditing" @click="changeEdit" class="ml-[1rem]">取消</a-button>
        </div>
        <a-form :model="project" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" ref="formRef">
            <a-form-item label="项目编号" class="form-item-spacing">
                <a-input v-model:value="project.display_id" :disabled="!isEditing" style="width: 16.5rem" />
            </a-form-item>
            <a-form-item label="项目名称" class="form-item-spacing">
                <a-input v-model:value="project.name" :disabled="!isEditing" style="width: 16.5rem" />
            </a-form-item>
            <a-form-item label="测试环境" class="form-item-spacing">
                <a-input v-model:value="project.kind" :disabled="!isEditing" style="width: 16.5rem" />
            </a-form-item>
            <a-form-item label="项目描述" class="form-item-spacing">
                <a-textarea v-model:value="project.description" :disabled="!isEditing" style="width: 16.5rem" />
            </a-form-item>
            <a-form-item label="计划周期" class="form-item-spacing">
                <a-range-picker v-model:value="period" :disabled="!isEditing" @change="changePeriod" />
            </a-form-item>
            <a-form-item label="项目状态" class="form-item-spacing">
                <a-select v-model:value="project.project_status" :disabled="!isEditing" style="width: 16.5rem">
                    <a-select-option v-for="(status, key) in statusOptions" :key="key" :value="key">
                        {{ status.label }}
                    </a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item label="知识库">
                <div v-for="file in fileList" :key="file">
                    {{ file }}
                    <a-button type="link" @click="downloadFile(file)">
                        <DownloadOutlined />
                    </a-button>
                </div>
                <el-upload ref="uploadRef" :auto-upload="false" :on-change="onBeforeUpload"
                    accept=".doc,.docx,.pdf,.xlsx,.png">
                    <template #trigger>
                        <el-button>
                            上传文件
                        </el-button>
                    </template>
                </el-upload>
            </a-form-item>
            <!-- 其他详细信息可以根据需要添加 -->
        </a-form>
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps, watch } from 'vue';
import { statusMap } from './projectModal';
import dayjs, { Dayjs } from 'dayjs';
import { DownloadOutlined } from '@ant-design/icons-vue';
import { http } from '../../http';
import { message } from 'ant-design-vue';
import { useUserStore } from '../../stores/user';

const props = defineProps({
    project: {
        type: Object,
        required: true
    }
});
const formRef = ref();

const dateFormat = 'YYYY/MM/DD';
const period = ref<[Dayjs, Dayjs]>([dayjs(props.project.period_start, dateFormat), dayjs(props.project.period_end, dateFormat)]);
const isEditing = ref(false);
const fileList = ref(props.project.file_list);

const statusOptions = Object.keys(statusMap).reduce((acc, key) => {
    if (key !== "-1") {
        acc[key] = statusMap[key];
    }
    return acc;
}, {});

const changeEdit = () => {
    isEditing.value = !isEditing.value;
}

watch(() => props.project, (newProject) => {
    if (newProject.period_start && newProject.period_end) {
        period.value = [dayjs(newProject.period_start, dateFormat), dayjs(newProject.period_end, dateFormat)];
    }
    fileList.value = newProject.file_list;
    isEditing.value = false;
}, { immediate: true, deep: false });

const downloadFile = (filename) => {
    http.post(`/api/get_document`, {
        project_id: props.project._id.$oid,
        object_name: props.project._id.$oid + '/' + filename,
    }, { responseType: 'blob' })
        .then(response => {
            const blob = new Blob([response as any], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            // 移除下载链接
            link.remove();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('下载文件失败', error);
        });
};
const form = ref({
    dateFrom: props.project.period_start,
    dateTo: props.project.period_end,
})
const changePeriod = (v, strs) => {
    if (!strs?.length) {
        return;
    }
    form.value.dateFrom = strs[0];
    form.value.dateTo = strs[1];
}

const submit = () => {
    const { project } = props;
    const params = {
        name: project.name,
        notes: project.description || '',
        periodStart: form.value.dateFrom,
        periodEnd: form.value.dateTo,
        kind: project.kind,
        project_id: project._id.$oid,
    };
    http.put('/api/update_project', params)
        .then(response => {
            message.success('修改项目成功');
        })
        .catch(error => {
            message.error('修改项目失败');
        });
}

const onBeforeUpload = async (file) => {
  const formData = new FormData();
  const info = new Blob([
    JSON.stringify({ db_id: props.project?._id?.$oid, category: 'knowledges_update' })
  ]);
  formData.append('user_file', file.raw as File);
  formData.append('info', info);

  await http.post(`/api/upload_project_file`, formData);
};
</script>

<style scoped>
.project-detail {
    padding: 20px;
}

.form-item-spacing {
    margin-bottom: 20px;
    /* 增加标签和表单项之间的距离 */
}

:deep(.el-upload__input) {
    display: none !important;
}
</style>