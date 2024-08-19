<template>
    <div class="m-2rem">
        <a-card title="新建项目">
            <a-form :model="form" :rules="rules" ref="formRef" :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }">
                <a-form-item label="项目名称" name="name">
                    <a-input v-model:value="form.name" placeholder="请输入项目名称" style="width: 16.5rem"/>
                </a-form-item>
                <a-form-item label="测试环境" name="kind">
                    <a-select v-model:value="form.kind" placeholder="请选择测试环境" style="width: 16.5rem">
                        <a-select-option value="VT">VT</a-select-option>
                        <a-select-option value="NI">NI</a-select-option>
                        <a-select-option value="dSPACE">dSPACE</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="项目描述" name="description">
                    <a-textarea v-model:value="form.description" placeholder="请输入项目描述"  style="width: 16.5rem"/>
                </a-form-item>
                <a-form-item label="计划周期" name="period">
                    <a-range-picker @change="changePeriod" v-model:value="form.period"/>
                </a-form-item>
                
                <a-form-item label="项目知识库" name="repository">
                    <el-upload ref="uploadRef" :auto-upload="false" :on-change="onBeforeUpload"
                        accept=".doc,.docx,.pdf,.xlsx,.png"
                        v-model:file-list="fileList"    
                    >
                        <template #trigger>
                            <el-button>
                                上传文件
                            </el-button>
                        </template>
                    </el-upload>
                </a-form-item>
                <a-form-item :wrapper-col="{ offset: 4, span: 14 }">
                    <a-button @click="submitForm" type="primary" class="custom-purple-button">创建</a-button>
                    <a-button @click="cancel" style="margin-left: 16px;" >取消</a-button>
                </a-form-item>
            </a-form>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { http } from '../../http';
import { UploadProps } from 'element-plus';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user';

const router = useRouter();

interface FormState {
    name: string;
    kind: string;
    description: string;
    period: [Date, Date] | null;
    repository: Array<{ name: string; url: string }>;
    dateFrom: string;
    dateTo: string;
}

const fileList = ref<any[]>([]);

const form = ref<FormState>({
    name: '',
    kind: '',
    description: '',
    period: null,
    repository: [],
    dateFrom: null,
    dateTo: null,
});

const rules = ref({
    name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
    kind: [{ required: true, message: '请选择测试环境', trigger: 'change' }],
    description: [{ required: false, message: '请输入项目描述', trigger: 'blur' }],
    period: [{ required: true, message: '请选择计划周期', trigger: 'change' }],
    repository: [{ required: false, message: '请上传项目知识库文件', trigger: 'change' }],
});

const formRef = ref();

const onBeforeUpload: UploadProps['onChange'] = async (file) => {
  const formData = new FormData();
  const userStore = useUserStore();
  const info = new Blob([
    JSON.stringify({ db_id: 'temp', category: 'knowledges' })
  ]);
  formData.append('user_file', file.raw as File);
  formData.append('info', info);
  form.value.repository = fileList;
  await http.post(`/api/upload_project_file`, formData);
};

const submitForm = () => {
    formRef.value.validate().then(() => {
        const params = {
            name: form.value.name,
            notes: form.value.description,
            periodStart: form.value.dateFrom,
            periodEnd: form.value.dateTo,
            kind: form.value.kind,
            fileList: fileList._value.map(x => x.name),
        };
        http.put('/api/create_new_project', params)
            .then(response => {
                message.success('创建项目成功');
                router.replace('/project/projectManage')
            })
            .catch(error => {
                message.error('创建项目失败');
            });
    }).catch(() => {
        message.error('表单校验失败');
    });
};

const cancel = () => {
    router.replace('/project/projectManage');
};

const changePeriod = (v, strs) => {
    if (!strs?.length) {
        return;
    }
    form.value.dateFrom = strs[0];
    form.value.dateTo = strs[1];
}

</script>

<style scoped>
.m-2rem {
    margin: 2rem;
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

:deep(.el-upload__input) {
    display: none !important;
}
</style>