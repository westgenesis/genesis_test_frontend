<template>
  <div class="max-h-[70vh] min-h-[50vh] overflow-hidden overflow-y-auto pr-[30px]">
    <a-tabs v-model:activeKey="activeTab" @change="query" class="ml-[30px]">
      <a-tab-pane key="1" tab="元动作-IO信号"></a-tab-pane>
      <a-tab-pane key="2" tab="元动作-总线信号"></a-tab-pane>
      <a-tab-pane key="3" tab="动作组合"></a-tab-pane>
    </a-tabs>

    <div class="flex-row flex mt-[20px] mb-[20px] pl-[30px]">
      <a-form :model="searchForm" layout="inline" style="width:100%">
        <a-row style="width:100%">
          <a-col :span="10" style="max-width: 300px">
            <a-form-item label="关键字" name="keyword">
              <a-input v-model:value="searchForm.keyword" placeholder="请输入关键字" :allowClear="true" />
            </a-form-item>
          </a-col>

          <a-col :span="10" style="max-width: 300px">
            <a-form-item label="所属项目" name="projectid">
              <ProjectSelect v-model="searchForm.projectId" placeholder="请选择所属项目" :allowClear="true"></ProjectSelect>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <div class="flex justify-end">
        <a-button type="primary" size="large" @click="query" class="custom-purple-button mr-[2rem] flex items-center">
          <SearchOutlined /> 查询
        </a-button>
      </div>
    </div>

    <div class="m-[32px]">

      <!-- IO信号 -->
      <a-table :columns="ioColumns" :row-key="record => record._id" bordered :data-source="pagedDataSource"
        :scroll="{ y: table_height }" size="middle" :pagination="false" childrenColumnName="values"
        v-if="activeTab === '1'" :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
        :defaultExpandAllRows="true" :expandable="true" :key="pagedDataSource">

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
            <template v-if="!record.values">
              <a-button type="link" size="small" @click="select(record, 'IO')">选择</a-button>
            </template>
          </template>
        </template>
      </a-table>

      <!-- 总线信号 -->
      <a-table :columns="canColumns" :row-key="record => record._id" bordered :data-source="pagedDataSource"
        size="middle" :pagination="false" v-if="activeTab === '2'"
        :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)" childrenColumnName="values"
        :defaultExpandAllRows="true" :expandable="true" :key="pagedDataSource">
        <template #bodyCell="{ column, record }">

          <template v-if="column.key === 'name'">
            <span>{{ record.displayName || record.name || record.status }}</span>
          </template>

          <template v-if="column.key === 'action'">
            <template v-if="!record.values || record.values.length === 0">
              <a-button type="link" size="small" @click="select(record, 'CAN')">选择</a-button>
            </template>
          </template>
        </template>
      </a-table>

      <div class="mt-[20px] flex justify-end" v-if="activeTab !== '3'">
        <a-pagination v-model:current="currentPage" :total="total" :page-size="pageSize" show-less-items
          @change="handlePageChange" />
      </div>

      <!-- 元动作组合 -->
      <a-table :columns="combinationColumns" bordered :data-source="combinationPagedDataSource" size="middle"
        :pagination="false" v-if="activeTab === '3'">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-button type="link" size="small" @click="select(record, 'COM')">选择</a-button>
          </template>
        </template>
      </a-table>

      <!-- emit('select', record.name) -->

      <div class="mt-[20px] flex justify-end" v-if="activeTab === '3'">
        <a-pagination v-model:current="currentPage" :total="dataSource.length" :page-size="pageSize" show-less-items
          @change="combinationHandlePageChange" />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { http } from '@/http';
import { ElMessage, ElMessageBox } from 'element-plus';
import ProjectSelect from '@common/projectSelect.vue'

import { cloneDeep } from 'lodash-es'
import { SearchOutlined, DeleteOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons-vue'


const dataSource = ref([]);
const pagedDataSource = ref([]);
const currentPage = ref(1);
const pageSize = 7;

const selectedRowKeys = ref([]);

const emit = defineEmits(['select'])
const searchForm = ref({
  keyword: null,
  projectId: null,
})

const activeTab = ref("1")

const onSelectChange = (selectedKeys) => {
  selectedRowKeys.value = selectedKeys;
}

const total = ref(0)

onMounted(() => {
  fetchActions();
});

// 选定
function select(record, type) {
  const param = { id: record._id || record.id, type, isChild: record.values == undefined }

  param.name = record.displayName || record.name;
  param.idx = record.idx

  console.log(param)

  emit('select',param)
}

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
  params.belongs_to = activeTab.value === '1' ? 'Vector_IO' : 'Vector_CAN'

  http({
    url: '/api/get_actions',
    params: params,
  }).then(response => {

    // 为values补齐显示字段
    response.actions.forEach((ac) => {
      if (ac.values) {
        ac.values.forEach((it, index) => {
          it.id = ac._id
          it.idx = index

          if (ac.belongs_to === 'Vector_CAN') {
            ac.values[index].displayName = ac.name + '=' + it.value
          } else {
            ac.values[index].displayName = ac.name + '=' + it.status
          }

        })
      }
    })

    pagedDataSource.value = response.actions;
    total.value = response.total
  }).catch(error => {
    console.error(error);
    ElMessage.error('获取数据失败');
  });

};

const combinationPagedDataSource = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return dataSource.value.slice(start, end);
});

const fetchActionCombinations = () => {

  const params = Object.assign({}, searchForm.value)

  http('/api/action_combinations', { params }).then(response => {
    dataSource.value = response.action_combinations;
  }).catch(error => {
    ElMessage.error('获取数据失败');
  });
};

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchActions();
};


const combinationHandlePageChange = (page) => {
  currentPage.value = page;
};

const table_height = window.innerHeight * 0.6

function query() {

  currentPage.value = 1
  if (activeTab.value === '3') {
    fetchActionCombinations()
  } else {
    fetchActions()
  }
}


const ioColumns = [
  {
    title: '动作名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '动作描述',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: '动作参数',
    dataIndex: 'acton_parameter',
    key: 'acton_parameter',
  },
  {
    title: '动作执行路径',
    dataIndex: 'exec_path',
    key: 'exec_path',
  },
  {
    title: '通道参数',
    dataIndex: 'path_parameter',
    key: 'path_parameter',
  },
  {
    title: '通道类型',
    dataIndex: 'relation',
    key: 'relation',
  },
  {
    title: '所属项目',
    dataIndex: 'projectName',
    key: 'projectName',
  },

  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 180,
  },
];

const canColumns = [
  {
    title: '动作名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '动作描述',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '动作执行路径',
    dataIndex: 'exec_path',
    key: 'exec_path',
  },
  {
    title: '路径参数',
    dataIndex: 'path_parameter',
    key: 'path_parameter',
  },
  {
    title: '路径类型',
    dataIndex: 'relation',
    key: 'relation',
  },
  {
    title: '所属项目',
    dataIndex: 'projectName',
    key: 'projectName',
  },

  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 180,
  },
];


const combinationColumns = [
  {
    title: '动作组合名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '动作组合描述',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: '所属项目',
    dataIndex: 'projectName',
    key: 'projectName',
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 200,
  },
];

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

:deep(.ant-tree-node-content-wrapper) {
  display: flex !important;
}
</style>