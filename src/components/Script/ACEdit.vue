<!-- 动作组合编辑 -->
<template>
    <a-form :model="formData" :rules="rules" layout="vertical" ref="formRef">
        <a-form-item label="动作组合名称" name="name">
            <a-input v-model:value="formData.name" placeholder="请输入内容" auto-focus />
        </a-form-item>

        <a-form-item label="动作组合描述" name="description">
            <a-input v-model:value="formData.description" placeholder="请输入内容" />
        </a-form-item>

        <a-form-item label="所属项目" name="projectId">
            <Project v-model="formData.projectId" @selectedObject="formData.projectName = $event.name"></Project>
        </a-form-item>

        <a-form-item label="动作组合编辑" name="expression">

            <div class="flex">
                <a-textarea v-model:value="formData.expression" :allowClear="true" placeholder="请输入内容"
                    :readonly="true" />
                <a-button type="primary" class="ml-[15px]" :disabled="history.length === 0"
                    @click="historyBack()">回退</a-button>
                <a-button type="primary" class="ml-[15px]" @click="formData.expression = ''">清除</a-button>
            </div>
        </a-form-item>
    </a-form>

    <div class=" border border-inherit rounded p-[20px] mb-[20px]">
        <div class="mb-[10px]">
            操作符：<a-tag @click="actionClick(obj)" v-for="obj in orperations" :key="obj.name" color="red"
                class="cursor-pointer">{{ obj.name }}</a-tag>
        </div>
        <div class="min-h-[42px]">
            元动作：<a-tag @click="actionClick(obj)" v-for="obj in names" :key="obj" color="processing"
                class="cursor-pointer mb-[20px]">{{ obj.name }}</a-tag>
        </div>
        <a-button type="primary" @click="transVisible = true">添加元动作</a-button>
    </div>

    <a-modal v-model:open="transVisible" title="请选择元动作" okText="确定" @ok="transVisible = false" cancelText="取消">
        <a-transfer v-model:target-keys="targetKeys" :render="item => item.name" :data-source="transferData"
            :one-way="true" :titles="['  未选择', '  已选择']" :rowKey="(obj) => obj._id" @change="change"
            :filter-option="filterOption" pagination show-search />
    </a-modal>

    <div slot="footer" class="flex justify-end">
        <a-button class="custom-purple-button mr-[2rem]" type="primary" @click="emit('close')"
            size="large">关闭</a-button>
        <a-button class="custom-purple-button mr-[2rem]" type="primary" @click="handleEditOk" size="large">提交</a-button>
    </div>

</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import Project from '@common/projectSelect.vue'
import { http } from "@/http"
import { cloneDeep } from 'lodash-es'
import { ElMessage } from 'element-plus';

const transVisible = ref(false)

const defaultData = {
    name: '',
    description: '',
    expression: '',
    projectId: null,
    projectName: '',
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

const formData = ref(cloneDeep(defaultData));

function change(e, f) {
    console.log(e, f);
}

const history = ref([]);

function historyBack() {
    formData.value.expression = history.value.pop();
}

const orperations = [
    {
        type: 'operation',
        name: '&',
    },
    {
        type: 'operation',
        name: '||',
    },
    {
        type: 'operation',
        name: '()',
    },
    {
        type: 'operation',
        name: '(',
    },
    {
        type: 'operation',
        name: ')',
    },

]

const names = computed(() => {
    return targetKeys.value.map(key => {
        let obj = transferData.value.find(it => it._id === key)

        obj.type = 'action'

        return obj
    })
})

const emit = defineEmits(['close', 'success'])

const actionClick = function (oper) {
    history.value.push(formData.value.expression)

    if (oper.name === '()') {
        formData.value.expression = "(" + formData.value.expression + ")";
        return;
    }

    formData.value.expression += oper.name;

    // if (['&', '||', '(', ')'].includes(oper.name)) {
    //     formData.value.expression += oper.name;
    //     return;
    // }
}

const targetKeys = ref([]);
const transferData = ref([]);

function select(action) {
    formData.value.name = action.name;
    formData.value.status = action.status || '状态1';
}

onMounted(() => {
    if (props.status === 'edit' || props.status === 'copy') {
        formData.value = (cloneDeep(props.data))
    }

    fetchActions();
})

const fetchActions = () => {
    http({
        url: '/api/get_actions',
        params:{
            start:0,
            pagesize:2000,
            // belongs_to: 'Vector_CAN'
        }
    }).then(response => {
        transferData.value = response.actions;
    })
};

const rules = {
    name: [{ required: true, message: '请输入动作组合名称' }],
    description: [{ required: true, message: '请输入动作组合描述' }],
    expression: [{ required: true, message: '请编辑动作组合' }],
    projectId: [{ required: true, message: '请选择项目' }],
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

const filterOption = (inputValue, option) => {
    return option.name.indexOf(inputValue) > -1;
};


</script>

<style></style>