<template>
    <a-modal :open="props.visible" title="DBC文件选择" @cancel="emit('update:visible', false)" width="60%" :footer="null">
        <div class="h-[50vh]">
            <a-table :columns="columns" :dataSource="dataList"
                :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'action'">
                        <a-button type="link" size="small" @click="confirm(record)">复用</a-button>
                    </template>
                </template>
            </a-table>
        </div>
    </a-modal>

</template>

<script setup>
import { cloneDeep } from 'lodash-es'
import { http } from "@/http"
import { ref, onUpdated } from 'vue'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:visible', 'confirm'])

onUpdated(() => {

    // 读数据
    if (props.visible === true) {
        // submitData.value = ref(cloneDeep(defaultData));
    }
})

const dataList = ref([
    {
        projectName: '项目1',
        description: '备注1',
        filename: 'dbc文件.dbc',
    },
    {
        projectName: '项目2',
        description: '备注2',
        filename: 'dbc文件2.dbc',
    }, {
        projectName: '项目2',
        description: '备注2',
        filename: 'dbc文件.dbc',
    }
])

const columns = [
    {
        title: '项目名称',
        dataIndex: 'projectName',
        key: 'projectName',
    },
    {
        title: '备注',
        dataIndex: 'description',
        key: 'description',
    },
    {
        title: '文件名',
        dataIndex: 'filename',
        key: 'filename',
    },
    {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 180,
    },
];


function confirm(record) {
    emit('confirm', record.filename)
    emit('update:visible', false)
}

</script>

<style></style>