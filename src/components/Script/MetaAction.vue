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

  <a-tabs v-model:activeKey="activeTab" class="ml-[30px]">
    <a-tab-pane key="1" tab="IO信号"></a-tab-pane>
    <a-tab-pane key="2" tab="总线信号"></a-tab-pane>
  </a-tabs>

  <div class="flex-row flex mt-[20px] mb-[20px] pl-[30px]">
    <a-form :model="searchForm" layout="inline" style="width:100%">
      <a-row style="width:80%">
        <a-col :span="10" style="max-width: 300px">
          <a-form-item label="关键字" name="key">
            <a-input v-model:value="searchForm.name" placeholder="请输入关键字" :allowClear="true" />
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
      <a-button type="primary" size="large" @click="query" class="custom-purple-button mr-[2rem]">查询</a-button>
      <a-button type="primary" v-if="activeTab === '1'" size="large" @click="showDrawer"
        class="custom-purple-button mr-[2rem]">添加IO信号动作</a-button>
      <a-button type="primary" v-if="activeTab === '2'" size="large" @click="showDrawer"
        class="custom-purple-button mr-[2rem]">添加总线信号动作</a-button>
      <a-button type="primary" v-if="activeTab === '2'" size="large" @click="showDrawer"
        class="custom-purple-button mr-[2rem]">上传DBC文件</a-button>
      <a-button type="primary" size="large" @click="deleteSelectedActions"
        class="custom-purple-button mr-[2rem]">删除</a-button>
    </div>

  </div>

  <div class="m-[32px]">

    <a-table :columns="ioColumns" :row-key="record => record._id" bordered :data-source="pagedDataSource" size="middle"
      :pagination="false" :scroll="{ y: table_height }" :row-selection="{
        selectedRowKeys: selectedRowKeys, onChange: onSelectChange, getCheckboxProps: (record) => ({
          disabled: !Boolean(record.values)   // Column configuration not to be checked
          // name: record.name,
        }),
      }" childrenColumnName="values">
      <template #bodyCell="{ column, record }">

        <template v-if="column.key === 'name'">
          <span>{{ record.name || record.status }}</span>
        </template>

        <template v-if="column.key === 'relation'">
          <span v-if="record.values">{{ record.relation }}</span>
          <span v-else></span>
        </template>

        <template v-if="column.key === 'acton_parameter'">
          <span v-if="record.values">{{ record.values[0].vt_signal }}</span>
          <span v-else>{{ `${record.vt_signal}${record.relation}${record.value}` }}</span>
        </template>

        <template v-if="column.key === 'action'">
          <template v-if="record.values">
            <a-button type="link" size="small" @click="showEditDrawer(record)">编辑</a-button>
            <a-button type="link" size="small" @click="deleteAction(record._id)">删除</a-button>
          </template>
        </template>
      </template>
    </a-table>

    <div class="mt-[20px] flex justify-end">
      <a-pagination v-model:current="currentPage" :total="dataSource.length" :page-size="pageSize" show-less-items
        @change="handlePageChange" />
    </div>

    <a-drawer v-model:visible="visible" title="添加元动作 I/O信号" placement="right" width="50%" @close="handleClose">
      <IOEdit :data="editData" :status="editStatus" @close="visible = false" @success="query"></IOEdit>
    </a-drawer>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { http } from '../../http';
import { ElMessage, ElMessageBox } from 'element-plus';
import { HomeOutlined, UserOutlined } from '@ant-design/icons-vue';
import ProjectSelect from '@common/projectSelect.vue'
import IOEdit from './MetaIOEdit.vue'
import { cloneDeep } from 'lodash-es'

const dataSource = ref([]);
const currentPage = ref(1);
const pageSize = 10;
const visible = ref(false);
const editVisible = ref(false);
const submitting = ref(false);
const selectedRowKeys = ref([]);

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

const rules = {
  name: [{ required: true, message: '请输入动作名称' }],
  description: [{ required: true, message: '请输入动作描述' }],
  exec_path: [{ required: false, message: '请输入动作执行路径' }],
  path_parameter: [{ required: false, message: '请输入路径参数' }],
  values: {
    name: [{ required: true, message: '请输入值名称' }],
    description: [{ required: true, message: '请输入值描述' }]
  }
};

onMounted(() => {
  fetchActions();
});

const fetchActions = () => {
  // console.log(searchForm.value)
  const params = Object.assign({}, searchForm.value)

  params.belongs_to === activeTab.value === '1' ? 'Vector_IO' : 'Vector_CAN'

  http({
    url: '/api/get_actions',
    params: searchForm.value,
  }).then(response => {
    console.log(response);

    // response.forEach((row) => {
    //   row.children = 
    // })

    dataSource.value = response.actions;
  }).catch(error => {
    console.error(error);
    ElMessage.error('获取数据失败');
  });

};

const pagedDataSource = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return dataSource.value.slice(start, end);
});

const handlePageChange = (page) => {
  currentPage.value = page;
};

const table_height = window.innerHeight * 0.6

const showDrawer = () => {
  editStatus.value = 'new'
  editData.value = {}
  visible.value = true;
};

function query() {
  fetchActions()
}

const handleOk = async () => {
  if (!formData.name) {
    ElMessage.error('名称不能为空');
    return;
  }
  if (!formData.description) {
    ElMessage.error('描述不能为空');
    return;
  }
  for (const v of formData.values) {
    if (!v.name) {
      v.name = '';
    }
  }


  try {
    const resp = await http.post('/api/create_new_action', formData);
    console.log(resp);
    visible.value = false;
    fetchActions();
  } catch (e) {
    if (e?.response?.data?.message) {
      ElMessage.error(e.response.data.message);
    }
  }
};

const ioColumns = [
  {
    title: '动作名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '描述',
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

const editData = ref({})
const editStatus = ref("new")
const showEditDrawer = (record) => {
  editStatus.value = 'edit'
  editData.value = cloneDeep(record)
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

const handleEditOk = async () => {
  if (!editFormData.name) {
    ElMessage.error('名称不能为空');
    return;
  }
  if (!editFormData.description) {
    ElMessage.error('描述不能为空');
    return;
  }
  for (const v of editFormData.values) {
    if (!v.name) {
      v.name = '';
    }
  }
  try {
    const resp = await http.put(`/api/update_action/${editFormData._id}`, editFormData);
    console.log(resp);
    editVisible.value = false;
    fetchActions();
  } catch (errInfo) {
    console.error(errInfo);
  }
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

// 添加值
const addValue = () => {
  formData.values.push({ name: '', description: '' });
};

// 删除值
const removeValue = (index) => {
  formData.values.splice(index, 1);
};

// 添加编辑值
const addEditValue = () => {
  editFormData.values.push({ name: '', description: '' });
};

// 删除编辑值
const removeEditValue = (index) => {
  editFormData.values.splice(index, 1);
};
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