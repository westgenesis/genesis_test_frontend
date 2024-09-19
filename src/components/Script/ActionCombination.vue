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

  <div class="m-[32px]">
    <div class="mt-[20px] mb-[20px] flex justify-end">
      <a-button type="primary" size="large" @click="showDrawer" class="custom-purple-button mr-[2rem]">添加动作组合</a-button>
    </div>

    <a-table :columns="columns" bordered :data-source="pagedDataSource" size="middle" :pagination="false"
      :scroll="{ y: table_height }">
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
        <a-form-item label="选择类型" name="is_file">
          <a-radio-group v-model:value="formData.is_file">
            <a-radio-button value="动作组合文件">动作组合文件</a-radio-button>
            <a-radio-button value="元动作">元动作</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="formData.is_file === '动作组合文件'" label="动作组合文件" name="combination_file">
          <el-upload ref="uploadRef" :auto-upload="false" :on-change="onBeforeUpload" :show-file-list="false"
            accept=".blkx,.vtt">
            <template #trigger>
              <a-button type="primary" size="large" class="custom-purple-button">
                点击上传
              </a-button>
            </template>
          </el-upload>
          <div v-if="formData.file_name">{{ formData.file_name }}</div>
        </a-form-item>
        <a-form-item v-if="formData.is_file === '元动作'" label="动作组合内容" name="exec_path">
          <div v-for="(step, index) in formData.steps" :key="index" class="mb-[10px]">
            <span class="mr-[10px]">Step {{ index + 1 }}</span>
            <a-select :value="formData.steps[index]._id" @change="(v) => { handleChange(v, index) }" placeholder="请选择动作"
              class="w-[200px]">
              <a-select-option v-for="action in availableActions" :key="action.name" :value="action._id">{{ action.name
                }}</a-select-option>
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
        <a-form-item label="选择类型" name="is_file">
          <a-radio-group v-model:value="editFormData.is_file">
            <a-radio-button value="动作组合文件">动作组合文件</a-radio-button>
            <a-radio-button value="元动作">元动作</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="editFormData.is_file === '动作组合文件'" label="动作组合文件" name="combination_file">
          <el-upload ref="uploadRef" :auto-upload="false" :on-change="onBeforeUploadEdit" :show-file-list="false"
            accept=".blkx,.vtt">
            <template #trigger>
              <a-button type="primary" size="large" class="custom-purple-button">
                点击上传
              </a-button>
            </template>
          </el-upload>
          {{ editFormData.file_name }}
        </a-form-item>
        <a-form-item v-if="editFormData.is_file === '元动作'" label="动作组合内容" name="exec_path">
          <div v-for="(step, index) in editFormData.steps" :key="index" class="mb-[10px]">
            <span class="mr-[10px]">Step {{ index + 1 }}</span>
            <a-select :value="editFormData.steps?.[index]?._id" @change="(v) => { handleEditChange(v, index) }" placeholder="请选择动作"
              class="w-[200px]">
              <a-select-option v-for="action in availableActions" :key="action.name" :value="action._id">{{ action.name
                }}</a-select-option>
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
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
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
  steps: [{ action: '' }],
  file_name: '',
  is_file: '元动作' // 默认值为元动作
});
const editFormData = reactive({
  _id: '',
  name: '',
  description: '',
  steps: [{ action: '' }],
  file_name: '',
  is_file: '元动作' // 默认值为元动作
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

const handleEditChange = (v, index) => {
  const action = availableActions.value.find(x => x._id === v)
  editFormData.steps[index] = { action: action };
}

onMounted(() => {
  fetchActionCombinations();
  fetchAvailableActions();
});

const fetchActionCombinations = () => {
  http.get('/api/action_combinations').then(response => {
    dataSource.value = response.action_combinations;
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
  // 重置 formData
  formData.name = '';
  formData.description = '';
  formData.steps = [{ action: '' }];
  formData.file_name = '';
  formData.is_file = '元动作'; // 默认值为元动作

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

  // 检查 steps 数组中的每个 step 的 action 是否为空
  if (formData.is_file === '元动作') {
    const hasEmptyAction = formData.steps.some(step => !step.action);
    if (hasEmptyAction) {
      ElMessage.error('请为每个步骤选择动作');
      return;
    }
  }

  try {
    const steps = formData.steps.map(step => step.action);
    const payload = {
      ...formData,
      steps,
    };
    const resp = await http.post('/api/action_combinations', payload);
    visible.value = false;
    fetchActionCombinations();
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
    dataIndex: 'file_name',
    key: 'file_nam',
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 100,
  },
];

const showEditDrawer = (record) => {
  // 重置 editFormData
  editFormData._id = '';
  editFormData.name = '';
  editFormData.description = '';
  editFormData.steps = [{ action: '' }];
  editFormData.file_name = '';
  editFormData.is_file = '元动作'; // 默认值为元动作

  // 设置编辑表单的数据
  editFormData._id = record._id;
  editFormData.name = record.name;
  editFormData.description = record.description;
  editFormData.steps = record.steps;
  editFormData.is_file = record.is_file; // 设置 is_file 的值
  editFormData.file_name = record.file_name;

  nextTick(() => {
    editVisible.value = true;
  });
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

  if (editFormData.is_file === '元动作') {
    const hasEmptyAction = editFormData.steps.some(step => !step.action);
    if (hasEmptyAction) {
      ElMessage.error('请为每个步骤选择动作');
      return;
    }
  }

  try {
    const payload = {
      ...editFormData,
    };
    const resp = await http.put(`/api/action_combinations/${editFormData._id}`, payload);
    editVisible.value = false;
    fetchActionCombinations();
  } catch (errInfo) {
    console.error(errInfo);
  }
};

const deleteAction = async (id) => {
  ElMessageBox.confirm('确定要删除选中的动作组合吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const resp = await http.delete(`/api/action_combinations/${id}`);
      fetchActionCombinations();
    } catch (errInfo) {
      console.error(errInfo);
    }
  });
};

const onBeforeUpload = async (file) => {
  console.log(file)
  const newFormData = new FormData()
  const info = new Blob([
    JSON.stringify({ category: 'new_file' })
  ])
  newFormData.append('user_file', file.raw);
  newFormData.append('info', info);
  const loadingInstance = ElLoading.service({
    target: '.ant-form'
  })
  try {
    const result = await http.post(`/api/upload_combination_file`, newFormData);
    if (result.status === 'ok') {
      ElMessage.success('文件上传成功');
      formData.file_name = file.name;
    }
  } catch (e) {
    if (e?.response?.data?.message) {
      ElMessage.error(e.response.data.message);
    }
  } finally {
    loadingInstance.close()
  }
}

const onBeforeUploadEdit = async (file) => {
  console.log(file)
  const newFormData = new FormData()
  const info = new Blob([
    JSON.stringify({ category: 'edit_file', id: editFormData._id }),
  ])
  newFormData.append('user_file', file.raw);
  newFormData.append('info', info);
  const loadingInstance = ElLoading.service({
    target: '.ant-form'
  })
  try {
    const result = await http.post(`/api/upload_combination_file`, newFormData);
    if (result.status === 'ok') {
      ElMessage.success('文件上传成功');
      editFormData.file_name = file.name;
    }
  } catch (e) {
    if (e?.response?.data?.message) {
      ElMessage.error(e.response.data.message);
    }
  } finally {
    loadingInstance.close()
  }
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

:deep(.el-upload__input) {
  display: none !important;
}
</style>