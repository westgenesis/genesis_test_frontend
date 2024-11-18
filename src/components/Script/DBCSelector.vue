<template>
    <a-modal :open="props.visible" title="DBC文件选择" @cancel="emit('update:visible', false)" width="60%" :footer="null">
        <div class="h-[50vh]">
            <a-table :columns="columns" :dataSource="pagedDataSource"
                :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'action'">
                        <a-button type="link" size="small" @click="confirm(record)">复用</a-button>
                    </template>
                </template>
            </a-table>
        </div>

        <div class="mt-[20px] flex justify-end">
            <a-pagination v-model:current="currentPage" :total="dataSource.length" :page-size="pageSize" show-less-items
                @change="handlePageChange" />
        </div>
    </a-modal>

</template>

<script setup>
import { cloneDeep } from 'lodash-es'
import { http } from "@/http"
import { ref, onUpdated, computed } from 'vue'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:visible', 'confirm'])
// const pagedDataSource = ref([
//     {
//         projectName: '项目1',
//         description: '备注1',
//         filename: 'dbc文件.dbc',
//     },
//     {
//         projectName: '项目2',
//         description: '备注2',
//         filename: 'dbc文件2.dbc',
//     }, {
//         projectName: '项目2',
//         description: '备注2',
//         filename: 'dbc文件.dbc',
//     }
// ])

const currentPage = ref(1);
const pageSize = 10;
const dataSource = ref([]);

const pagedDataSource = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    return dataSource.value.slice(start, end);
});

const handlePageChange = (page) => {
    currentPage.value = page;
    // fetchActions();
};


onUpdated(() => {

    // 读数据
    if (props.visible === true) {

        http({
            url: '/api/querydbc',
            // params: params,
        }).then(response => {
            dataSource.value = response.dbcs;
        })
    }
})

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
        dataIndex: 'file',
        key: 'file',
    },
    {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 180,
    },
];


function confirm(record) {
    emit('confirm', record.file)
    emit('update:visible', false)
}

</script>

<style></style>