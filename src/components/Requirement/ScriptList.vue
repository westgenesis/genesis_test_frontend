<template>

    <div class="flex-row flex mt-[20px] mb-[20px] pl-[30px]">
        <a-form :model="searchForm" layout="inline" style="width:100%">
            <a-row style="width:100%">
                <a-col :span="10" style="max-width: 300px">
                    <a-form-item label="关键字" name="keyword">
                        <a-input v-model:value="searchForm.keyword" placeholder="请输入关键字" :allowClear="true" />
                    </a-form-item>
                </a-col>

                <a-col :span="10" style="max-width: 300px">
                    <a-form-item label="可用状态" name="status">

                        <a-select v-model:value="searchForm.status" placeholder="请选择可用状态">
                            <a-select-option :value="'0'">可用</a-select-option>
                            <a-select-option :value="'1'">不可用</a-select-option>
                        </a-select>

                    </a-form-item>
                </a-col>
            </a-row>
        </a-form>

        <div class="flex justify-end">
            <a-button type="primary" size="large" @click="query"
                class="custom-purple-button mr-[2rem] flex items-center">
                <SearchOutlined /> 查询
            </a-button>
            <a-button type="primary" size="large" @click="deleteSelectedActions"
                class="custom-purple-button mr-[2rem] flex items-center">
                <DeleteOutlined />
                删除
            </a-button>
        </div>
    </div>

    <div class="m-[32px]">

        <a-table :columns="columns" :row-key="record => record._id" bordered :data-source="pagedDataSource"
            :scroll="{ y: table_height }" size="middle" :pagination="false" :row-selection="{
                selectedRowKeys: selectedRowKeys, onChange: onSelectChange, getCheckboxProps: (record) => ({
                    disabled: !Boolean(record.values)
                }),
            }" childrenColumnName="values"
            :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)">

            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                    <span>{{ record.displayName || record.name || record.status }}</span>
                </template>

                <template v-if="column.key === 'relation'">
                    <span v-if="record.values">{{ record.relation }}</span>
                    <span v-else></span>
                </template>

                <template v-if="column.key === 'acton_parameter'">
                    <span>{{ actionParmaDisplay(record) }}</span>
                </template>

                <template v-if="column.key === 'action'">
                    <a-button type="link" size="small" @click="showEditDrawer(record)">下载</a-button>
                    <a-button type="link" size="small" @click="deleteAction(record._id)">删除</a-button>
                </template>
            </template>
        </a-table>

        <div class="mt-[20px] flex justify-end">
            <a-pagination v-model:current="currentPage" :total="total" :page-size="pageSize" show-less-items
                @change="handlePageChange" />
        </div>

    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { http } from '../../http';
import { ElMessage, ElMessageBox } from 'element-plus';
import { cloneDeep } from 'lodash-es'
import { SearchOutlined, DeleteOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons-vue'

const dataSource = ref([]);
const pagedDataSource = ref([]);
const currentPage = ref(1);
const pageSize = 10;
const total = ref(0)

const selectedRowKeys = ref([]);

const searchForm = ref({
    keyword: null,
    status: null,
})

const onSelectChange = (selectedKeys) => {
    selectedRowKeys.value = selectedKeys;
}

const props = defineProps({
    type: {
        type: String,
        default: '',
    },
    id: {
        type: String,
        default: ''
    }
})

onMounted(() => {
    fetchActions();
});

//动作参数显式逻辑
function actionParmaDisplay(record) {

    // 只有一条显示第一条的 所有条件
    if (record.values && record.values.length === 1) {
        const opRecord = record.values[0]
        return opRecord.vt_signal + opRecord.relation + opRecord.value;
    }

    // 否则显示第一条的vt
    if (record.values && record.values.length > 0) {
        // console.log(record)
        return record.values[0].vt_signal;
    }

    return record.vt_signal + record.relation + record.value;
}
const fetchActions = () => {

    const start = currentPage.value - 1;

    const params = Object.assign({ start, pagesize: pageSize }, searchForm.value)

    params[props.type + '_id'] = props.id;

    http({
        url: '/api/get_actions',
        params: params,
    }).then(response => {
        pagedDataSource.value = response.actions;
        total.value = response.total
    }).catch(error => {
        console.error(error);
        ElMessage.error('获取数据失败');
    });

};

// const pagedDataSource = computed(() => {
//   // console.log(dataSource.value)
//   // console.log(dataSource.value, 123, result)
//   const start = (currentPage.value - 1) * pageSize;
//   const end = start + pageSize;
//   return dataSource.value.slice(start, end);
// });

const handlePageChange = (page) => {
    currentPage.value = page;
    fetchActions();
};

const table_height = window.innerHeight * 0.6

function query() {
    fetchActions()
}

const columns = [
    {
        title: '脚本文件ID',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: '对应的台架测试用例',
        dataIndex: 'description',
        key: 'description',
    },
    {
        title: '用例类型',
        dataIndex: 'acton_parameter',
        key: 'acton_parameter',
    },
    {
        title: '更新时间',
        dataIndex: 'exec_path',
        key: 'exec_path',
    },
    {
        title: '版本',
        dataIndex: 'path_parameter',
        key: 'path_parameter',
    },
    {
        title: '可用状态',
        dataIndex: 'relation',
        key: 'relation',
    },
    {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 180,
    },
];

const deleteSelectedActions = async () => {
    if (selectedRowKeys.value.length === 0) {
        ElMessage.warning('请选择要删除的项');
        return;
    }

    ElMessageBox.confirm('确定要删除选中的功能模块吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        try {
            const resp = await http.delete('/api/delete_actions', {
                data: { ids: selectedRowKeys.value }
            });
            console.log(resp);
            fetchActions();
            selectedIds.value = [];
        } catch (errInfo) {
            console.error(errInfo);
        }
    });
};

</script>

<style>
.ant-table-thead .ant-table-cell {
    color: #909399 !important;
}
</style>