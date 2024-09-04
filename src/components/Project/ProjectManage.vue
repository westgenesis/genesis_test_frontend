<template>
    <div class="m-[2rem]">
        <div class="flex mb-[16px] items-center justify-between">
            <div class="flex items-center">
                <el-radio-group v-model="selectedStatus" @change="onSearch">
                    <el-radio-button v-for="status in statusList" :key="status" :value="status">
                        {{ statusMap[status].label }}
                    </el-radio-button>
                </el-radio-group>
                <div class="ml-[20px]">
                    <a-input-search v-model:value="searchValue" placeholder="请输入项目名称" style="width: 200px"
                        @search="onSearch" />
                </div>
            </div>
            <div>
                <a-button type="primary" @click="onCreate" size="large" class="custom-purple-button">新建项目</a-button>
                <a-button type="primary" @click="onDelete" size="large" class="ml-[10px] custom-purple-button">删除项目</a-button>
            </div>
        </div>

        <a-table :columns="columns" :row-key="record => record._id.$oid" :data-source="data.data"
            :pagination="pagination" :loading="loading" :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'display_id'">
                    {{ record.display_id }}
                </template>
                <template v-else-if="column.dataIndex === 'name'">{{ record.name }}</template>
                <template v-else-if="column.dataIndex === 'period'">{{ record.period_start }} to {{ record.period_end
                    }}</template>
                <template v-else-if="column.dataIndex === 'status'">
                    <a-tag :color="statusMap[record.project_status ?? 0].color">
                        <div class="flex items-center">
                            <component :is="statusMap[record.project_status ?? 0].icon" />
                            <span class="ml-[5px]">
                                {{ statusMap[record.project_status ?? 0].label }}
                            </span>
                        </div>
                    </a-tag>
                </template>
                <template v-else-if="column.dataIndex === 'time_modified'">
                    {{ formatDate(record.last_modified.$date) }}
                </template>
                <template v-else-if="column.dataIndex === 'actions'">
                    <a-button type="link" @click="manageRequirement(record)">需求管理</a-button>
                    <a-button type="link" @click="viewDetails(record)">详情</a-button>
                </template>
            </template>
        </a-table>

        <!-- 侧滑抽屉 -->
        <a-drawer
            title="项目详情"
            placement="right"
            :visible="showDetail"
            @close="showDetail = false"
            width="800"
        >
            <ProjectDetail v-if="selectedProject" :project.sync="selectedProject" />
        </a-drawer>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRequest } from 'vue-request';
import axios from 'axios';
import { http } from '../../http';
import { statusMap } from './projectModal';
import { useRouter } from 'vue-router';
import { useProjectStore } from '../../stores/project';
import {
    CheckCircleOutlined,
    SyncOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    ClockCircleOutlined,
    MinusCircleOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import ProjectDetail from './ProjectDetail.vue';

const router = useRouter();
const statusList = Object.keys(statusMap).sort((a, b) => a - b);
const projectStore = useProjectStore();

const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString(); // 使用本地化的日期时间格式
};

const columns = [
    {
        title: '项目编号',
        dataIndex: 'display_id',
        width: '10%',
    },
    {
        title: '项目名称',
        dataIndex: 'name',
        sorter: true,
        width: '25%',
    },
    {
        title: '计划周期',
        dataIndex: 'period',
        width: '15%',
    },
    {
        title: '状态',
        dataIndex: 'status',
        width: '10%',
    },
    {
        title: '更新时间',
        dataIndex: 'time_modified',
        width: '15%'
    },
    {
        title: '测试环境',
        dataIndex: 'kind',
        width: '10%',
    },
    {
        title: '操作',
        dataIndex: 'actions',
        width: '20%',
    },
];

type APIParams = {
    results: number;
    page?: number;
    sortField?: string;
    sortOrder?: number;
    [key: string]: any;
};

type APIResult = {
    total: number;
    page: number;
    data: {
        _id: {
            $oid: string;
        };
        name: string;
        kind: string;
        storage_path: string;
    }[];
};

const queryData = (params: APIParams) => {
    return http.get('/api/display_user_projects', { params })
        .then(response => {
            projectStore.updateProjects(response.data);
            return {
                data: response.data,
                total: response.total,
            }
        });
};

const { data, run, loading } = useRequest(queryData);

const selectedStatus = ref('-1');
const searchValue = ref('');
const selectedRowKeys = ref([]);
const showDetail = ref(false);
const selectedProject = ref(null);

const onSearch = () => {
    run({
        search: searchValue.value,
        status: selectedStatus.value === '-1' ? void 0 : selectedStatus.value,
    });
}

const onCreate = () => {
    router.replace('/project/addProject')
}

const onSelectChange = (selectedKeys) => {
    selectedRowKeys.value = selectedKeys;
}

const onDelete = () => {
    if (selectedRowKeys.value.length === 0) {
        message.warning('请选择要删除的项目');
        return;
    }

    const ids = selectedRowKeys.value;
    http.post('/api/delete_projects', { ids })
        .then(response => {
            message.success('删除成功');
            run(); // 重新加载数据
        })
        .catch(error => {
            message.error('删除失败');
            console.error(error);
        });
}

const viewDetails = (record) => {
    selectedProject.value = record;
    showDetail.value = true;
}

const manageRequirement = (record) => {
    router.replace(`/project/manageRequirement/${record._id.$oid}`);
    projectStore.updateCurrentProjectById(record._id.$oid);
}

</script>

<style scoped>
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

/* 覆盖 el-radio-button 的默认样式 */
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
</style>