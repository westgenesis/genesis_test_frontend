<template>
    <a-modal :open="props.visible" title="DBC文件上传" @ok="submit" @cancel="close" okText="提交" cancelText="取消" width="50%">
        <a-form :model="submitData" :rules="rules" layout="vertical" ref="formRef">

            <a-form-item label="所属项目" name="projectId">
                <ProjectSelect v-model="submitData.projectId" @selectedObject="submitData.projectName = $event.name" >
                </ProjectSelect>
            </a-form-item>

            <a-form-item label="备注" name="description">
                <a-input v-model:value="submitData.description" placeholder="请输入内容" />
            </a-form-item>

            <a-form-item label="DBC文件" name="filename">
                <div class="flex">
                    <a-upload v-model:file-list="fileList" name="file" @change="handleChange"
                        :beforeUpload="onBeforeUpload" :maxCount="1" accept=".dbc">
                        <a-button>
                            <upload-outlined></upload-outlined>
                            上传DBC文件
                        </a-button>
                    </a-upload>

                    <a-button type="primary" class="ml-[20px]" @click="selectorVisible = true">复用其他项目</a-button>
                </div>
            </a-form-item>
        </a-form>
    </a-modal>

    <DBCSelector v-model:visible="selectorVisible" @confirm="copyConfirm">
    </DBCSelector>

</template>

<script setup>
import ProjectSelect from '@common/projectSelect.vue'
import { cloneDeep } from 'lodash-es'
import { http } from "@/http"
import { ref, onUpdated } from 'vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import DBCSelector from './DBCSelector.vue'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

onUpdated(() => {

    // 关闭窗口时恢复默认值
    if (props.visible === true) {
        submitData.value = ref(cloneDeep(defaultData));
        submitData.filename = ''
        fileList.value = []
    }
})

const emit = defineEmits(['close', 'update:visible','success'])

const defaultData = {
    projectId: null,
    projectName: null,
    description: '',
    filename: '',
}

const selectorVisible = ref(false)
const submitData = ref(cloneDeep(defaultData));

const rules = ref({
    projectId: [{ required: true, message: '请输入项目名称', trigger: 'change' }],
    filename: [{ required: true, message: '请上传或复用DBC文件', trigger: 'blur' }],
});

const fileList = ref([]);

let randomFileName = ''
const handleChange = (result) => {

    if (result.fileList.length > 0) {
        fileList.value[0].name = randomFileName
        submitData.value.filename = randomFileName
    } else {
        submitData.value.filename = ''
    }
}

const onBeforeUpload = async (_file) => {

    // 在文件名中加入随机数字,防止被同名文件覆盖
    const randomStr = String(Math.random());
    const newName = _file.name.substring(0, _file.name.length - 4) + "_" + randomStr.substring(randomStr.length - 5) + ".dbc"

    randomFileName = newName;

    const file = new File([_file], newName, {
        type: _file.type,
    });

    const uploadFormData = new FormData();
    const info = new Blob([
        JSON.stringify({ db_id: 'dbc', category: 'knowledges' })
    ]);
    uploadFormData.append('user_file', file);
    uploadFormData.append('info', info);

    await http.post(`/api/upload_project_file`, uploadFormData);

    return false;
}

const formRef = ref();

function close() {
    emit('update:visible', false)
    emit('close')
}
function submit() {
    formRef.value.validate().then(() => {
        // console.log(submitData.value)

        http.post('/api/parsedbc', submitData.value).then(() => {
            ElMessage.success('DBC文件解析已提交,请耐心等待后刷新页面！');
            emit('success')
            emit('update:visible', false)
        });

    })
}

function copyConfirm(filename) {
    submitData.value.filename = filename

    if (fileList.value.length === 0) {
        fileList.value.push({})
    }

    fileList.value[0].name = filename
}


</script>

<style></style>