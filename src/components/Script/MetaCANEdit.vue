<template>
    <a-form :model="formData" :rules="rules" layout="vertical" ref="formRef">

        <!-- 需要选择 -->
        <a-form-item label="动作名称" name="name">
            <a-row :gutter="[16, 16]">
                <a-col :span="16">
                    <a-input disabled v-model:value="formData.name" placeholder="请输入内容" />
                </a-col>
                <a-col>
                    <a-button type="primary" @click="canSelVisible = true">选择</a-button>
                </a-col>

            </a-row>
        </a-form-item>

        <a-form-item label="动作描述" name="description">
            <a-input v-model:value="formData.description" placeholder="请输入内容" />
        </a-form-item>

        <a-form-item label="所属项目" name="projectId">
            <Project v-model="formData.projectId" @selectedObject="formData.projectName = $event.name"></Project>
        </a-form-item>

        <a-form-item label="状态" name="status">
            <a-input :disabled="true" v-model:value="formData.status" placeholder="请输入内容" />
        </a-form-item>

        <a-form-item name="exec_path" class="mt-[20px]">
            <template v-slot:label>
                动作执行路径<span style="color:brown;margin-left: 10px;">(选接口卡通道) </span>
            </template>
            <a-input v-model:value="formData.exec_path" placeholder="请输入内容" />
        </a-form-item>

        <a-form-item name="path_parameter">
            <template v-slot:label>
                路径参数<span style="color:brown;margin-left: 10px;">(仅dspace环境填写) </span>
            </template>
            <a-input v-model:value="formData.path_parameter" placeholder="请输入内容" />
        </a-form-item>

        <a-form-item label="通道类型" name="relation">
            <a-select v-model:value="formData.relation" style="width: 100%">
                <a-select-option value="IN">IN</a-select-option>
                <a-select-option value="OUT">OUT</a-select-option>
            </a-select>
        </a-form-item>
    </a-form>
    <div slot="footer" class="flex justify-end">
        <a-button class="custom-purple-button mr-[2rem]" type="primary" @click="emit('close')"
            size="large">关闭</a-button>
        <a-button class="custom-purple-button mr-[2rem]" type="primary" @click="handleEditOk" size="large">提交</a-button>
    </div>

    <CANSelector v-model:visible="canSelVisible" @confirm="select"></CANSelector>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import Project from '@common/projectSelect.vue'
import { http } from "@/http"
import { cloneDeep } from 'lodash-es'
import { ElMessage } from 'element-plus';
import CANSelector from './CANSelector.vue';

const canSelVisible = ref(false)


const defaultData = {
    name: '',
    status: '',
    description: '',
    exec_path: '',
    path_parameter: '',
    belongs_to: 'tector_IO',
    projectId: null,
    relation: '', // 新增字段
    projectName: '',
    values: [{ status: null, description: null, vt_signal: null, relation: null, value: null }], // 默认有一个值
}

const props = defineProps({
    status: {
        type: String,
        default: 'new',
    },
    data: {
        type: Object,
        default: {}

    }
});

const emit = defineEmits(['close', 'success'])

const formData = ref<typeof defaultData>(cloneDeep(defaultData));

function select(action) {
    formData.value.name = action.name;
    formData.value.status = action.status || '状态1';
}

onMounted(() => {
    if (props.status === 'edit' || props.status === 'copy') {
        formData.value = (cloneDeep(props.data)) as typeof defaultData
    }
})

const rules = {
    name: [{ required: true, message: '请输入动作名称' }],
    description: [{ required: true, message: '请输入动作描述' }],
    exec_path: [{ required: false, message: '请输入动作执行路径' }],
    path_parameter: [{ required: false, message: '请输入路径参数' }],
    projectId: [{ required: true, message: '请选择所属项目' }],
};

const addValue = () => {
    formData.value.values.push({ status: null, description: null, vt_signal: '', relation: null, value: null });
};

const formRef = ref();
const handleEditOk = async () => {
    console.log(formData.value)
    formRef.value.validate().then(() => {
        console.log(formData.value)

        let res = null;
        if (props.status === 'new' || props.status === 'copy') {
            res = http.post('/api/create_new_action', formData.value);
        } else {
            res = http.put(`/api/update_action/${formData.value._id}`, formData.value);
        }

        res.then(() => {
            ElMessage.success('操作成功');
            emit('close')
            emit('success')
        }, (err) => {
            ElMessage.error(err)
        })
    })
};

</script>

<style></style>