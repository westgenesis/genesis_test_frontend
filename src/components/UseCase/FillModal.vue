<template>
  <a-modal :visible="visible" title="补齐未匹配到的信号" @cancel="handleCancel" width="80%">
    <template #footer>
    </template>
    <div class="flex" v-if="preConditionSignals.length || actionSignals.length || resultSignals.length">
      <div class="w-1/3 pr-4">

        <div class="signals-container">
          <div v-if="preConditionSignals.length">
            <h3>初始条件信号</h3>
            <div v-for="signal in preConditionSignals" :key="signal.name + signal.value" @click="handlePreConditionSignalChange(signal)" :class="['signal-item', { 'selected': selectedSignal === signal.name + signal.value }]">
              {{ signal.name }} {{ signal.value ? '=' : '' }}  {{ signal.value }}
            </div>
          </div>
          <div v-if="actionSignals.length">
            <h3>触发条件信号</h3>
            <div v-for="signal in actionSignals" :key="signal.name + signal.value" @click="handleActionSignalChange(signal)" :class="['signal-item', { 'selected': selectedSignal === signal.name + signal.value }]">
              {{ signal.name }} {{ signal.value ? '=' : '' }}  {{ signal.value }}
            </div>
          </div>
          <div v-if="resultSignals.length">
            <h3>预期结果信号</h3>
            <div v-for="signal in resultSignals" :key="signal.name + signal.value" @click="handleResultSignalChange(signal)" :class="['signal-item', { 'selected': selectedSignal === signal.name + signal.value }]">
              {{ signal.name }} {{ signal.value ? '=' : '' }} {{ signal.value }}
            </div>
          </div>
        </div>
      </div>
      <div class="w-2/3">
        <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
          <a-tab-pane key="action" tab="添加元动作"></a-tab-pane>
          <a-tab-pane key="combination" tab="添加动作组合"></a-tab-pane>
        </a-tabs>
        <a-form :model="form" layout="vertical" v-if="activeTab === 'action'">
          <a-form-item label="动作名称" name="name">
            <a-input v-model:value="form.name" placeholder="请输入动作名称" disabled="true"/>
          </a-form-item>
          <a-form-item label="动作描述" name="description">
            <a-input v-model:value="form.actionDescription" placeholder="请输入动作描述" />
          </a-form-item>
          <a-form-item label="动作执行路径" name="exec_path">
            <a-input v-model:value="form.execPath" placeholder="请输入动作执行路径" />
          </a-form-item>
          <a-form-item label="路径参数" name="path_parameter">
            <a-input v-model:value="form.pathParameter" placeholder="请输入路径参数" />
          </a-form-item>
          <a-form-item label="动作类型" name="action_type">
            <a-select v-model:value="form.actionType" style="width: 100%" @change="updateAllowedMethods">
              <a-select-option value="In">In</a-select-option>
              <a-select-option value="Out">Out</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="所属对象" name="belongs_to">
            <a-select v-model:value="form.belongsTo" style="width: 100%" @change="updateAllowedMethods">
              <a-select-option value="Vector_IO">Vector_IO</a-select-option>
            <a-select-option value="Vector_CAN">Vector_CAN</a-select-option>
            <a-select-option value="Vector_LIN">Vector_LIN</a-select-option>
            <a-select-option value="dSpace_IO">dSpace_IO</a-select-option>
            <a-select-option value="dSpace_CAN">dSpace_CAN</a-select-option>
            <a-select-option value="dSpace_LIN">dSpace_LIN</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="动作支持的方法" name="allowed_methods">
            <a-radio-group v-model:value="form.allowedMethods" disabled>
              <a-radio value="set">Set</a-radio>
              <a-radio value="write">Write</a-radio>
              <a-radio value="check">Check</a-radio>
              <a-radio value="read">Read</a-radio>
            </a-radio-group>
          </a-form-item>

          <!-- 动态添加值的表单 -->
          <div v-for="(value, index) in form.values" :key="index">
            <a-card>
              <a-form-item label="值名称" :name="['values', index, 'name']">
                <a-input v-model:value="value.name" placeholder="请输入值名称" />
              </a-form-item>
              <a-form-item label="值描述" :name="['values', index, 'description']">
                <a-input v-model:value="value.description" placeholder="请输入值描述" />
              </a-form-item>
              <a-button type="link" @click="removeValue(index)">删除</a-button>
            </a-card>
          </div>
          <a-button style="margin-top: 1rem" type="dashed" @click="addValue">添加值</a-button>
        </a-form>
        <div class="flex justify-end mt-4" v-if="activeTab === 'action'">
          <a-button class="custom-purple-button" type="primary" @click="handleCreateAction">添加元动作</a-button>
        </div>
        <a-form :model="formData" :rules="rules" layout="vertical" v-if="activeTab === 'combination'">
        <a-form-item label="动作组合名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入内容" disabled/>
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
      <div slot="footer" class="flex justify-end" v-if="activeTab === 'combination'">
        <a-button class="custom-purple-button mr-[2rem]" type="primary" @click="handleOk" size="large"
          >添加动作组合</a-button>
      </div>
      </div>
    </div>
    <a-result v-else status="success" title="全部创建成功" sub-title="所有未匹配到的信号已成功创建为元动作。">
      <template #extra>
        <a-button type="primary" @click="handleCancel">关闭</a-button>
      </template>
    </a-result>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { Modal, Form, Input, Select, Radio, Button, Result, Tabs } from 'ant-design-vue';
import { http } from '../../http';
import { ElMessage } from 'element-plus';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  preConditionSignals: {
    type: Array,
    default: () => [],
  },
  actionSignals: {
    type: Array,
    default: () => [],
  },
  resultSignals: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:visible', 'actionCreated', 'removeSignal']);

const selectedPreConditionSignal = ref('');
const selectedActionSignal = ref('');
const selectedResultSignal = ref('');
const selectedSignal = ref('');
const selectedSignalType = ref('');
const activeTab = ref('action');

const form = reactive({
  name: '',
  actionDescription: '',
  execPath: '',
  pathParameter: '',
  actionType: 'In',
  belongsTo: 'Vector_IO',
  allowedMethods: 'set', // 改为单选
  values: [{ name: '', description: '' }] // 默认有一个值
});

const availableActions = ref([]);
const formData = reactive({
  name: '',
  description: '',
  steps: [{ action: '' }],
  file_name: '',
  is_file: '元动作' // 默认值为元动作
});


onMounted(() => {
  fetchAvailableActions();
});

const addStep = () => {
  formData.steps.push({ action: '' });
};

const fetchAvailableActions = () => {
  http.get('/api/get_actions').then(response => {
    availableActions.value = response.actions;
  }).catch(error => {
    ElMessage.error('获取可用动作失败');
  });
};


watch(
  () => [selectedPreConditionSignal.value, selectedActionSignal.value, selectedResultSignal.value],
  ([preCondition, action, result]) => {
    const selectedSignalValue =
      props.preConditionSignals.find((signal) => signal.name + signal.value === preCondition) ||
      props.actionSignals.find((signal) => signal.name + signal.value === action) ||
      props.resultSignals.find((signal) => signal.name + signal.value === result);

    if (selectedSignalValue) {
      form.name = selectedSignalValue.name;
      form.values[0].name = selectedSignalValue.value;
      form.values[0].description = '';
      formData.name = selectedSignalValue.name;
      selectedSignal.value = selectedSignalValue.name + selectedSignalValue.value;
    }
  }
);

const handlePreConditionSignalChange = (signal) => {
  selectedPreConditionSignal.value = signal.name + signal.value;
  selectedActionSignal.value = '';
  selectedResultSignal.value = '';
  selectedSignal.value = signal.name + signal.value;
  selectedSignalType.value = 'preCondition';
  form.actionType = 'In'
  form.allowedMethods = 'set'; // 默认选中 set
};

const handleActionSignalChange = (signal) => {
  selectedPreConditionSignal.value = '';
  selectedActionSignal.value = signal.name + signal.value;
  selectedResultSignal.value = '';
  selectedSignal.value = signal.name + signal.value;
  selectedSignalType.value = 'action';
  form.actionType = 'In'
  form.allowedMethods = 'set'; // 默认选中 check
};

const handleResultSignalChange = (signal) => {
  selectedPreConditionSignal.value = '';
  selectedActionSignal.value = '';
  selectedResultSignal.value = signal.name + signal.value;
  selectedSignal.value = signal.name + signal.value;
  selectedSignalType.value = 'result';
  form.actionType = 'Out'
  form.allowedMethods = 'check'; // 默认选中 check
};

const resetForm = () => {
  form.name = '';
  form.actionDescription = '';
  form.execPath = '';
  form.pathParameter = '';
  form.actionType = 'In';
  form.belongsTo = 'Vector_IO';
  form.allowedMethods = 'set';
  form.values = [{ name: '', description: '' }];
  selectedPreConditionSignal.value = '';
  selectedActionSignal.value = '';
  selectedResultSignal.value = '';
  selectedSignal.value = '';
  selectedSignalType.value = '';
};

const handleCancel = () => {
  resetForm();
  emit('update:visible', false);
};

const handleCreateAction = async () => {
  if (!form.name) {
    ElMessage.error('动作名称不能为空');
    return;
  }
  if (!form.actionDescription) {
    ElMessage.error('动作描述不能为空');
    return;
  }

  try {
    const resp = await http.post('/api/create_new_action', {
      name: form.name,
      description: form.actionDescription,
      values: form.values, // 传递 values 数组
      exec_path: form.execPath,
      path_parameter: form.pathParameter,
      action_type: form.actionType,
      belongs_to: form.belongsTo,
      allowed_methods: form.allowedMethods,
    });

    if (resp.status === 'ok') {
      ElMessage.success('元动作创建成功');
      emit('actionCreated');

      // 通知父组件移除已创建的信号
      emit('removeSignal', { type: selectedSignalType.value, signal: selectedSignal.value });

      // 如果所有信号都已创建，显示成功提示
      if (props.preConditionSignals.length === 0 && props.actionSignals.length === 0 && props.resultSignals.length === 0) {
        emit('update:visible', false);
      }
    } else {
      ElMessage.error('元动作创建失败');
    }
  } catch (errInfo) {
    console.log(errInfo)
    ElMessage.error('元动作创建失败');
  }
};

// 添加值
const addValue = () => {
  form.values.push({ name: '', description: '' });
};

// 删除值
const removeValue = (index) => {
  form.values.splice(index, 1);
};

onMounted(() => {
  if (props.preConditionSignals.length > 0) {
    handlePreConditionSignalChange(props.preConditionSignals[0]);
  } else if (props.actionSignals.length > 0) {
    handleActionSignalChange(props.actionSignals[0]);
  } else if (props.resultSignals.length > 0) {
    handleResultSignalChange(props.resultSignals[0]);
  }
});

const handleTabChange = (tabKey) => {
  let selectedSignalValue;

  if (selectedPreConditionSignal.value) {
    selectedSignalValue = props.preConditionSignals.find(signal => signal.name + signal.value === selectedPreConditionSignal.value);
  } else if (selectedActionSignal.value) {
    selectedSignalValue = props.actionSignals.find(signal => signal.name + signal.value === selectedActionSignal.value);
  } else if (selectedResultSignal.value) {
    selectedSignalValue = props.resultSignals.find(signal => signal.name + signal.value === selectedResultSignal.value);
  }

  if (selectedSignalValue) {
    if (tabKey === 'combination') {
      formData.name = selectedSignalValue.name;
      formData.description = '';
      formData.steps = [{ action: '' }];
      formData.file_name = '';
      formData.is_file = '元动作'; // 默认值为元动作
    } else if (tabKey === 'action') {
      form.name = selectedSignalValue.name;
      form.actionDescription = '';
      form.execPath = '';
      form.pathParameter = '';
      form.actionType = 'In';
      form.belongsTo = 'Vector_IO';
      form.allowedMethods = 'set';
      form.values = [{ name: '', description: '' }];
    }
  }
};

const handleChange = (v, index) => {
  const action = availableActions.value.find(x => x._id === v)
  formData.steps[index] = { action: action };
}

const onBeforeUpload = async (file) => {
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
    const steps = formData.steps.map(step => step.action);
    const payload = {
      ...formData,
      steps,
    };
    console.log(payload)
    const resp = await http.post('/api/action_combinations', payload);
    if (resp.status === 'ok') {
      ElMessage.success('动作组合创建成功');
      emit('actionCreated');

      // 通知父组件移除已创建的信号
      emit('removeSignal', { type: selectedSignalType.value, signal: selectedSignal.value });

      // 如果所有信号都已创建，显示成功提示
      if (props.preConditionSignals.length === 0 && props.actionSignals.length === 0 && props.resultSignals.length === 0) {
        emit('update:visible', false);
      }
    } else {
      ElMessage.error('元动作创建失败');
    }
  } catch (errInfo) {
    console.error(errInfo);
  }
};

const updateAllowedMethods = () => {
  const { actionType, belongsTo } = form;
  console.log(actionType, belongsTo)
  if (actionType && belongsTo) {
    if (actionType === 'In' && (belongsTo === 'Vector_IO' || belongsTo === 'Vector_CAN' || belongsTo === 'Vector_LIN')) {
      form.allowedMethods = 'set';
    } else if (actionType === 'Out' && (belongsTo === 'Vector_IO' || belongsTo === 'Vector_CAN' || belongsTo === 'Vector_LIN')) {
      form.allowedMethods = 'check';
    } else if (actionType === 'In' && (belongsTo === 'dSpace_IO' || belongsTo === 'dSpace_CAN' || belongsTo === 'dSpace_LIN')) {
      form.allowedMethods = 'write';
    } else if (actionType === 'Out' && (belongsTo === 'dSpace_IO' || belongsTo === 'dSpace_CAN' || belongsTo === 'dSpace_LIN')) {
      form.allowedMethods = 'read';
    }
  } else {
    form.allowedMethods = '';
  }
};
</script>

<style scoped>
.flex {
  display: flex;
}

.pr-4 {
  padding-right: 1rem;
}

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

.signals-container {
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  border-right: 1px solid #f0f0f0;
  padding-right: 0.5rem;
}

.signal-item {
  padding: 0.5rem;
  cursor: pointer;
}

.signal-item:hover {
  background-color: rgba(240, 129, 207, 0.2);
}

.signal-item.selected {
  background-color: #f5b7f5;
}

:deep(.el-upload__input) {
  display: none !important;
}
</style>