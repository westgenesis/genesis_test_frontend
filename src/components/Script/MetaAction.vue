<template>

  <div class="m-[20px] ml-[30px]">
    <a-breadcrumb>
      <a-breadcrumb-item href="">
        <home-outlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item href="">
        <span>动作库</span>
      </a-breadcrumb-item>
      <a-breadcrumb-item>元动作库</a-breadcrumb-item>
    </a-breadcrumb>
  </div>

  <a-tabs v-model:activeKey="activeTab" @change="query" class="ml-[30px]">
    <a-tab-pane key="1" tab="IO信号"></a-tab-pane>
    <a-tab-pane key="2" tab="总线信号"></a-tab-pane>
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
      <a-button type="primary" size="large" @click="query" class="custom-orange-button mr-[2rem] flex items-center">
        <SearchOutlined /> 查询
      </a-button>
      <a-button type="primary" v-if="activeTab === '1'" size="large" @click="showDrawer"
        class="custom-orange-button mr-[2rem] flex items-center">
        <PlusOutlined />新建IO信号动作
      </a-button>
      <a-button type="primary" v-if="activeTab === '2'" size="large" @click="showDrawer"
        class="custom-orange-button mr-[2rem] flex items-center">
        <PlusOutlined />新建总线信号动作
      </a-button>
      <a-button type="primary" v-if="activeTab === '2'" size="large" @click="dbcVisible = true"
        class="custom-orange-button mr-[2rem] flex items-center">
        <UploadOutlined />
        上传DBC文件
      </a-button>
      <a-button type="primary" size="large" @click="deleteSelectedActions"
        class="custom-orange-button mr-[2rem] flex items-center">
        <DeleteOutlined />
        删除
      </a-button>
    </div>
  </div>

  <div class="m-[32px]">

    <!--  -->
    <a-table :columns="ioColumns" :row-key="record => record._id" bordered :data-source="pagedDataSource"
      :scroll="{ y: table_height }" size="middle" :pagination="false" :row-selection="{
        selectedRowKeys: selectedRowKeys, onChange: onSelectChange, getCheckboxProps: (record) => ({
          disabled: !Boolean(record.values)
        }),
      }" childrenColumnName="values" v-if="activeTab === '1'"
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
          <template v-if="record.values">
            <a-button type="link" size="small" @click="showCopyDrawer(record)">复制</a-button>
            <a-button type="link" size="small" @click="showEditDrawer(record)">编辑</a-button>
            <a-button type="link" size="small" @click="deleteAction(record._id)">删除</a-button>
          </template>
        </template>
      </template>
    </a-table>


    <a-table :columns="canColumns" :row-key="record => record._id" bordered :data-source="pagedDataSource" size="middle"
      :pagination="false" :row-selection="{
        selectedRowKeys: selectedRowKeys, onChange: onSelectChange,
      }" v-if="activeTab === '2'" :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)"
      childrenColumnName="values">
      <template #bodyCell="{ column, record }">

        <template v-if="column.key === 'name'">
          <span>{{ record.displayName || record.name || record.vt_signal }}</span>
        </template>

        <template v-if="column.key === 'action'">
          <template v-if="record.values">
            <!-- <a-button type="link" size="small" @click="showCopyDrawer(record)">复制</a-button> -->
            <a-button type="link" size="small" @click="showEditDrawer(record)">编辑</a-button>
            <a-button type="link" size="small" @click="deleteAction(record._id)">删除</a-button>
          </template>
        </template>
      </template>
    </a-table>

    <div class="mt-[20px] flex justify-end">
      <a-pagination v-model:current="currentPage" :total="total" :page-size="pageSize" show-less-items
        @change="handlePageChange" />
    </div>

    <!-- IO编辑 -->
    <a-drawer v-model:open="visible" :title="dict[editStatus] + '元动作-I/O信号'" placement="right" width="50%"
      @close="visible = false">
      <IOEdit v-if="visible" :data="editData" :status="editStatus" @close="visible = false" @success="query"></IOEdit>
    </a-drawer>

    <!-- 总线编辑 -->
    <a-drawer v-model:open="canVisible" :title="dict[editStatus] + '元动作-总线信号'" placement="right" width="50%"
      @close="canVisible = false">
      <CANEdit v-if="canVisible" :data="editData" :status="editStatus" @close="canVisible = false" @success="query">
      </CANEdit>
    </a-drawer>

    <!-- DBC文件上传 -->
    <DBCUploader v-model:visible="dbcVisible" @success="query"></DBCUploader>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { http } from '../../http';
import { ElMessage, ElMessageBox } from 'element-plus';
import { HomeOutlined, UserOutlined } from '@ant-design/icons-vue';
import ProjectSelect from '@common/projectSelect.vue'
import IOEdit from './MetaIOEdit.vue'
import CANEdit from './MetaCANEdit.vue'
import DBCUploader from './DBCUploader.vue';
import { cloneDeep } from 'lodash-es'
import { SearchOutlined, DeleteOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons-vue'

const dataSource = ref([]);
const pagedDataSource = ref([]);
const currentPage = ref(1);
const pageSize = 10;
const visible = ref(false);
const canVisible = ref(false);
const editVisible = ref(false);
const canSelVisible = ref(true)

const dbcVisible = ref(false)

const submitting = ref(false);
const selectedRowKeys = ref([]);

const dict = {
  'new': '新建',
  'edit': '编辑',
  'copy': '复制',
}

const formData = reactive({
  name: '',
  description: '',
  exec_path: '',
  path_parameter: '',
  action_type: 'In',
  belongs_to: 'Vector_IO',
  allowed_methods: 'set',
  relation: 'greater_than', // 新增字段
  values: [{ name: '', description: '' }], // 默认有一个值
  vt_signal: ''
});

const searchForm = ref({
  keyword: null,
  projectId: null,
})

const activeTab = ref("1")

const editFormData = reactive({
  _id: '',
  name: '',
  description: '',
  exec_path: '',
  path_parameter: '',
  action_type: 'In',
  belongs_to: 'Vector_IO',
  allowed_methods: 'set',
  values: [{ name: '', description: '' }], // 默认有一个值
  vt_signal: ''
});

const onSelectChange = (selectedKeys) => {
  selectedRowKeys.value = selectedKeys;
}

const total = ref(0)

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
  params.belongs_to = activeTab.value === '1' ? 'Vector_IO' : 'Vector_CAN'

  http({
    url: '/api/get_actions',
    params: params,
  }).then(response => {

    // 为values补齐显示字段
    if (params.belongs_to === 'Vector_IO') {
      response.actions.forEach((ac) => {
        if (ac.values) {
          ac.values.forEach((it, index) => {
            ac.values[index].displayName = ac.name + '=' + it.status
          })
        }
      })
    }

    // 为values补齐显示字段
    if (params.belongs_to === 'Vector_CAN') {
      response.actions.forEach((ac) => {
        if (ac.values) {
          ac.values.forEach((it, index) => {
            ac.values[index].displayName = ac.name + '=' + it.value
          })
        }
      })
    }


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

const showDrawer = () => {
  editStatus.value = 'new'
  editData.value = {}

  if (activeTab.value === '1') {
    visible.value = true;
  } else {
    canVisible.value = true;
  }
};

function query() {
  fetchActions()
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
  // {
  //   title: '路径参数',
  //   dataIndex: 'path_parameter',
  //   key: 'path_parameter',
  // },
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

const editData = ref({})
const editStatus = ref("new")
const showEditDrawer = (record) => {
  editStatus.value = 'edit'
  editData.value = cloneDeep(record)

  if (activeTab.value === '1') {
    visible.value = true;
  } else {
    canVisible.value = true;
  }
};
const showCopyDrawer = (record) => {
  editStatus.value = 'copy'
  editData.value = cloneDeep(record)
  Reflect.deleteProperty(editData.value, '_id')
  visible.value = true;
};

const resetFormData = () => {
  formData.name = '';
  formData.description = '';
  formData.exec_path = '';
  formData.path_parameter = '';
  formData.action_type = 'In';
  formData.belongs_to = 'Vector_IO';
  formData.allowed_methods = 'set';
  formData.vt_signal = '';
  formData.values = [{ name: '', description: '' }];
};

const resetEditFormData = () => {
  editFormData._id = '';
  editFormData.name = '';
  editFormData.description = '';
  editFormData.exec_path = '';
  editFormData.path_parameter = '';
  editFormData.action_type = 'In';
  editFormData.belongs_to = 'Vector_IO';
  editFormData.allowed_methods = 'set';
  editFormData.vt_signal = '';
  editFormData.values = [{ name: '', description: '' }];
};

const handleClose = () => {
  visible.value = false;
  resetFormData(); // 重置表单数据
};

const handleEditClose = () => {
  editVisible.value = false;
  resetEditFormData(); // 重置表单数据
};

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

const deleteAction = async (id) => {
  ElMessageBox.confirm('确定要删除选中的功能模块吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const resp = await http.delete(`/api/delete_action/${id}`);
      console.log(resp);
      fetchActions();
    } catch (errInfo) {
      console.error(errInfo);
    }
  });
};
</script>

<style scoped>
.custom-orange-button {
  background-color: orange;
  border-color: orange;
}

.custom-orange-button:hover,
.custom-orange-button:focus {
  background-color: orange !important;
  border-color: orange !important;
  filter: opacity(0.9);
}

/* 覆盖 el-radio-button 的默认样式 */
:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: orange;
  border-color: orange;
}

:deep(.el-radio-button__inner) {
  color: orange;
  border-color: orange;
}

:deep(.el-radio-button__original-radio:checked+.el-radio-button__inner) {
  background-color: orange;
  border-color: orange !important;
}

:deep(.ant-tree-node-content-wrapper) {
  display: flex !important;
}
</style>