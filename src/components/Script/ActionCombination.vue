<template>
    <div class="m-[20px] ml-[30px]">
      <a-breadcrumb>
        <a-breadcrumb-item href="">
          <home-outlined />
        </a-breadcrumb-item>
        <a-breadcrumb-item href="">
          <span>脚本管理</span>
        </a-breadcrumb-item>
        <a-breadcrumb-item>动作组合库</a-breadcrumb-item>
      </a-breadcrumb>
    </div>
  
    <div class="m-[20px]">
      <div class="mt-[20px] mb-[20px] flex justify-end">
        <a-button type="primary" size="large" @click="showDrawer" class="custom-purple-button mr-[2rem]">添加动作组合</a-button>
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
  
      <a-drawer v-model:visible="visible" title="添加动作组合" placement="right" width="40%" @close="handleClose">
        <a-form :model="formData" :rules="rules" layout="vertical">
          <a-form-item label="动作组合名称" name="name">
            <a-input v-model:value="formData.name" placeholder="请输入内容" />
          </a-form-item>
          <a-form-item label="动作组合描述" name="description">
            <a-input v-model:value="formData.description" placeholder="请输入内容" />
          </a-form-item>
          <a-form-item label="动作组合内容" name="exec_path">
            <div v-for="(step, index) in formData.steps" :key="index" class="mb-[10px]">
              <span class="mr-[10px]">Step {{ index + 1 }}</span>
              <a-select :value="formData.steps[index]._id" @change="(v) => { handleChange(v, index)}" placeholder="请选择动作" class="w-[200px]">
                <a-select-option v-for="action in availableActions" :key="action.name" :value="action._id">{{ action.name }}</a-select-option>
              </a-select>
            </div>
            <a-button type="dashed" @click="addStep" class="w-[200px]">添加步骤</a-button>
          </a-form-item>
        </a-form>
        <div slot="footer" class="flex justify-end">
          <a-button class="custom-purple-button mr-[2rem]" type="primary" @click="handleClose" size="large">关闭</a-button>
          <a-button class="custom-purple-button mr-[2rem]" type="primary" @click="handleOk" size="large"
            :loading="submitting">提交</a-button>
        </div>
      </a-drawer>
  
      <a-drawer v-model:visible="editVisible" title="编辑动作组合" placement="right" width="40%" @close="handleEditClose">
        <a-form :model="editFormData" :rules="rules" layout="vertical">
          <a-form-item label="动作组合名称" name="name">
            <a-input v-model:value="editFormData.name" placeholder="请输入内容" />
          </a-form-item>
          <a-form-item label="动作组合描述" name="description">
            <a-input v-model:value="editFormData.description" placeholder="请输入内容" />
          </a-form-item>
          <a-form-item label="动作组合内容" name="exec_path">
            <div v-for="(step, index) in editFormData.steps" :key="index" class="mb-[10px]">
              <span class="mr-[10px]">Step {{ index + 1 }}</span>
              <a-select v-model="editFormData.steps[index]" placeholder="请选择动作" class="w-[200px]">
                <a-select-option v-for="action in availableActions" :key="action._id" :value="action._id">{{ action.name }}</a-select-option>
              </a-select>
            </div>
            <a-button type="dashed" @click="addEditStep" class="w-[200px]">添加步骤</a-button>
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
  import { ElMessageBox } from 'element-plus';
  import { http } from '../../http';
  import { ElMessage } from 'element-plus';
  import { HomeOutlined } from '@ant-design/icons-vue';
  
  const dataSource = ref([]);
  const currentPage = ref(1);
  const pageSize = 10;
  const visible = ref(false);
  const editVisible = ref(false);
  const submitting = ref(false);
  const availableActions = ref([]);
  const formData = reactive({
    name: '',
    description: '',
    steps: [{ action: '' }]
  });
  const editFormData = reactive({
    _id: '',
    name: '',
    description: '',
    steps: [{ action: '' }]
  });
  
  const rules = {
    name: [{ required: true, message: '请输入动作名称' }],
    description: [{ required: true, message: '请输入动作描述' }],
  };
  
  const handleChange = (v, index) => {
    console.log(v, index);
    const action = availableActions.value.find(x => x._id === v)
    formData.steps[index] = { action: action };
    console.log(formData)
  }

  onMounted(() => {
    fetchActions();
    fetchAvailableActions();
  });
  
  const fetchActions = () => {
    http.get('/api/get_actions').then(response => {
      dataSource.value = response.actions;
    }).catch(error => {
      ElMessage.error('获取数据失败');
    });
  };
  
  const fetchAvailableActions = () => {
    http.get('/api/get_actions').then(response => {
      availableActions.value = response.actions;
    }).catch(error => {
      ElMessage.error('获取可用动作失败');
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
  
  const table_height = window.innerHeight * 0.6;
  
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
  
    try {
      console.log(formData)
      const actionsList = formData.steps.map(step => step.action);
      const payload = {
        ...formData,
        actionsList,
      };
      const resp = await http.post('/api/create_new_action', payload);
      visible.value = false;
      fetchActions();
    } catch (errInfo) {
      console.error(errInfo);
    }
  };
  
  const addStep = () => {
    formData.steps.push({ action: '' });
  };
  
  const addEditStep = () => {
    editFormData.steps.push({ action: '' });
  };
  
  const columns = [
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
      title: '动作组合文件',
      dataIndex: 'file',
      key: 'file',
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
    editFormData.steps = record.actionsList.map(action => ({ action }));
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
  
    try {
      const actionsList = editFormData.steps.map(step => step.action);
      const payload = {
        ...editFormData,
        actionsList,
      };
      const resp = await http.put(`/api/update_action/${editFormData._id}`, payload);
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
        fetchActions();
      } catch (errInfo) {
        console.error(errInfo);
      }
    });
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
  </style>