<template>
  <div class="m-[20px] ml-[30px]">
    <a-breadcrumb>
      <a-breadcrumb-item href="">
        <home-outlined />
      </a-breadcrumb-item>
      <a-breadcrumb-item href="">
        <span>脚本管理</span>
      </a-breadcrumb-item>
      <a-breadcrumb-item>元动作库</a-breadcrumb-item>
    </a-breadcrumb>
  </div>
  
  <div class="m-[20px]">
    <div class="mt-[20px] mb-[20px] flex justify-end">
      <a-button type="primary" size="large" @click="showDrawer" class="custom-purple-button mr-[2rem]">添加元动作</a-button>
    </div>

    <a-table :columns="columns" bordered :data-source="pagedDataSource" size="middle" :pagination="false" :scroll="{ y: table_height}">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-button type="link" size="small" @click="showEditDrawer(record)">编辑</a-button>
          <a-button type="link" size="small" @click="deleteAction(record._id)">删除</a-button>
        </template>
      </template>
    </a-table>

    <div class="mt-[20px] flex justify-end">
      <a-pagination v-model:current="currentPage" :total="dataSource.length" :page-size="pageSize" show-less-items
        @change="handlePageChange" />
    </div>

    <a-drawer v-model:visible="visible" title="添加元动作" placement="right" width="40%" @close="handleClose">
      <a-form :model="formData" :rules="rules" layout="vertical">
        <a-form-item label="动作名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入内容" />
        </a-form-item>
        <a-form-item label="动作描述" name="description">
          <a-input v-model:value="formData.description" placeholder="请输入内容" />
        </a-form-item>
        <a-form-item label="值" name="value">
          <a-input v-model:value="formData.value" placeholder="请输入内容" />
        </a-form-item>
        <a-form-item label="动作执行路径" name="exec_path">
          <a-input v-model:value="formData.exec_path" placeholder="请输入内容" />
        </a-form-item>
        <a-form-item label="路径参数" name="path_parameter">
          <a-input v-model:value="formData.path_parameter" placeholder="请输入内容" />
        </a-form-item>

        <a-form-item label="动作类型" name="action_type">
          <a-select v-model:value="formData.action_type" style="width: 100%" @change="updateAllowedMethods">
            <a-select-option value="In">In</a-select-option>
            <a-select-option value="Out">Out</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="所属对象" name="belongs_to">
          <a-select v-model:value="formData.belongs_to" style="width: 100%" @change="updateAllowedMethods">
            <a-select-option value="Vector_IO">Vector_IO</a-select-option>
            <a-select-option value="CAN">CAN</a-select-option>
            <a-select-option value="LIN">LIN</a-select-option>
            <a-select-option value="dSpace_IO">dSpace</a-select-option>
            <a-select-option value="dSpace_CAN">dSpace_CAN</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="动作支持的方法" name="allowed_methods">
          <a-checkbox-group v-model:value="formData.allowed_methods" :disabled="true">
            <a-checkbox value="set">Set</a-checkbox>
            <a-checkbox value="get">Get</a-checkbox>
            <a-checkbox value="write">Write</a-checkbox>
            <a-checkbox value="read">Read</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
      <div slot="footer" class="flex justify-end">
        <a-button class="custom-purple-button mr-[2rem]" type="primary" @click="handleClose" size="large">关闭</a-button>
        <a-button class="custom-purple-button mr-[2rem]" type="primary" @click="handleOk" size="large"
          :loading="submitting">提交</a-button>
      </div>
    </a-drawer>

    <a-drawer v-model:visible="editVisible" title="编辑元动作" placement="right" width="40%" @close="handleEditClose">
      <a-form :model="editFormData" :rules="rules" layout="vertical">
        <a-form-item label="动作名称" name="name">
          <a-input v-model:value="editFormData.name" placeholder="请输入内容" />
        </a-form-item>
        <a-form-item label="动作描述" name="description">
          <a-input v-model:value="editFormData.description" placeholder="请输入内容" />
        </a-form-item>
        <a-form-item label="Value" name="value">
          <a-input v-model:value="editFormData.value" placeholder="请输入内容" />
        </a-form-item>
        <a-form-item label="动作执行路径" name="exec_path">
          <a-input v-model:value="editFormData.exec_path" placeholder="请输入内容" />
        </a-form-item>
        <a-form-item label="路径参数" name="path_parameter">
          <a-input v-model:value="editFormData.path_parameter" placeholder="请输入内容" />
        </a-form-item>

        <a-form-item label="动作类型" name="action_type">
          <a-select v-model:value="editFormData.action_type" style="width: 100%" @change="updateAllowedMethods">
            <a-select-option value="In">In</a-select-option>
            <a-select-option value="Out">Out</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="所属对象" name="belongs_to">
          <a-select v-model:value="editFormData.belongs_to" style="width: 100%" @change="updateAllowedMethods">
            <a-select-option value="Vector_IO">Vector_IO</a-select-option>
            <a-select-option value="CAN">CAN</a-select-option>
            <a-select-option value="LIN">LIN</a-select-option>
            <a-select-option value="dSpace_IO">dSpace</a-select-option>
            <a-select-option value="dSpace_CAN">dSpace_CAN</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="动作支持的方法" name="allowed_methods">
          <a-checkbox-group v-model:value="editFormData.allowed_methods" :disabled="true">
            <a-checkbox value="set">Set</a-checkbox>
            <a-checkbox value="get">Get</a-checkbox>
            <a-checkbox value="write">Write</a-checkbox>
            <a-checkbox value="read">Read</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
      <div slot="footer" class="flex justify-end">
        <a-button class="custom-purple-button mr-[2rem]" type="primary" @click="handleEditClose"
          size="large">关闭</a-button>
        <a-button class="custom-purple-button mr-[2rem]" type="primary" @click="handleEditOk" size="large"
          :loading="submitting">提交</a-button>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { Form, Input, Drawer, Table, Button, Select, CheckboxGroup, Pagination } from 'ant-design-vue';
import { http } from '../../http';
import { ElMessage } from 'element-plus';
import { HomeOutlined, UserOutlined } from '@ant-design/icons-vue';

const dataSource = ref([]);
const currentPage = ref(1);
const pageSize = 10;
const visible = ref(false);
const editVisible = ref(false);
const submitting = ref(false);
const formData = reactive({
  name: '',
  description: '',
  exec_path: '',
  path_parameter: '',
  action_type: 'In',
  belongs_to: 'Vector_IO',
  allowed_methods: ['set']
});
const editFormData = reactive({
  _id: '',
  name: '',
  description: '',
  exec_path: '',
  path_parameter: '',
  action_type: 'In',
  belongs_to: 'Vector_IO',
  allowed_methods: ['set']
});

const rules = {
  name: [{ required: true, message: '请输入动作名称' }],
  description: [{ required: true, message: '请输入动作描述' }],
  exec_path: [{ required: false, message: '请输入动作执行路径' }],
  path_parameter: [{ required: false, message: '请输入路径参数' }],
  value: [{ required: true, message: '请输入Value' }]
};

onMounted(() => {
  fetchActions();
});

const fetchActions = () => {
  http.get('/api/get_actions').then(response => {
    console.log(response);
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
  visible.value = true;
};

const handleClose = () => {
  visible.value = false;
};

const handleOk = async () => {
  if (!formData.name) {
    ElMessage.error('名称不能为空');
    return;
  }
  if (!formData.description) {
    ElMessage.error('描述不能为空');
    return;
  }
  if (!formData.exec_path) {
    ElMessage.error('执行路径不能为空');
    return;
  }
  try {
    const resp = await http.post('/api/create_new_action', formData);
    console.log(resp);
    visible.value = false;
    fetchActions();
  } catch (errInfo) {
    console.error(errInfo);
  }
};

const updateAllowedMethods = () => {
  const { action_type, belongs_to } = formData;
  if (action_type && belongs_to) {
    formData.allowed_methods = [];
    if (action_type === 'In' && (belongs_to === 'Vector_IO' || belongs_to === 'CAN' || belongs_to === 'LIN')) {
      formData.allowed_methods = ['set'];
    } else if (action_type === 'Out' && (belongs_to === 'Vector_IO' || belongs_to === 'CAN' || belongs_to === 'LIN')) {
      formData.allowed_methods = ['get'];
    } else if (action_type === 'In' && (belongs_to === 'dSpace_IO' || belongs_to === 'dSpace_CAN')) {
      formData.allowed_methods = ['write'];
    } else if (action_type === 'Out' && (belongs_to === 'dSpace_IO' || belongs_to === 'dSpace_CAN')) {
      formData.allowed_methods = ['read'];
    }
  } else {
    formData.allowed_methods = [];
  }
};

const columns = [
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
    title: 'Value',
    dataIndex: 'value',
    key: 'value',
  },
  {
    title: '执行路径',
    dataIndex: 'exec_path',
    key: 'exec_path',
  },
  {
    title: '路径参数',
    dataIndex: 'path_parameter',
    key: 'path_parameter',
  },
  {
    title: '动作类型',
    dataIndex: 'action_type',
    key: 'action_type',
  },
  {
    title: '所属对象',
    dataIndex: 'belongs_to',
    key: 'belongs_to',
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 100,
  },
];

const showEditDrawer = (record) => {
  editFormData._id = record._id;
  editFormData.name = record.name;
  editFormData.description = record.description;
  editFormData.exec_path = record.exec_path;
  editFormData.path_parameter = record.path_parameter;
  editFormData.action_type = record.action_type;
  editFormData.belongs_to = record.belongs_to;
  editFormData.allowed_methods = record.allowed_methods;
  editVisible.value = true;
};

const handleEditClose = () => {
  editVisible.value = false;
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
  if (!editFormData.value) {
    ElMessage.error('值不能为空');
    return;
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
  })

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