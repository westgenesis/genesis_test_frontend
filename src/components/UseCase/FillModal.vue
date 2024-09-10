<template>
    <a-modal :visible="visible" title="补齐未匹配到的信号" @cancel="handleCancel" width="80%">
      <template #footer>
      </template>
      <div class="flex">
        <div class="w-1/3 pr-4">
          <div class="signals-container" v-if="preConditionSignals.length || actionSignals.length || resultSignals.length">
            <div v-if="preConditionSignals.length">
              <h3>初始条件信号</h3>
              <div v-for="signal in preConditionSignals" :key="signal.name" @click="handlePreConditionSignalChange(signal.name)" :class="['signal-item', { 'selected': selectedSignal === signal.name }]">
                {{ signal.name }} = {{ signal.value }}
              </div>
            </div>
            <div v-if="actionSignals.length">
              <h3>触发条件信号</h3>
              <div v-for="signal in actionSignals" :key="signal.name" @click="handleActionSignalChange(signal.name)" :class="['signal-item', { 'selected': selectedSignal === signal.name }]">
                {{ signal.name }} = {{ signal.value }}
              </div>
            </div>
            <div v-if="resultSignals.length">
              <h3>预期结果信号</h3>
              <div v-for="signal in resultSignals" :key="signal.name" @click="handleResultSignalChange(signal.name)" :class="['signal-item', { 'selected': selectedSignal === signal.name }]">
                {{ signal.name }} = {{ signal.value }}
              </div>
            </div>
          </div>
        </div>
        <div class="w-2/3">
          <a-form :model="form" layout="vertical">
            <a-form-item label="动作名称" name="name">
              <a-input v-model:value="form.name" placeholder="请输入动作名称" disabled="true"/>
            </a-form-item>
            <a-form-item label="动作值" name="value">
              <a-input v-model:value="form.value" placeholder="请输入信号值" disabled="true"/>
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
              <a-select v-model:value="form.actionType" style="width: 100%">
                <a-select-option value="In">In</a-select-option>
                <a-select-option value="Out">Out</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="所属对象" name="belongs_to">
              <a-select v-model:value="form.belongsTo" style="width: 100%">
                <a-select-option value="Vector_IO">Vector_IO</a-select-option>
                <a-select-option value="CAN">CAN</a-select-option>
                <a-select-option value="LIN">LIN</a-select-option>
                <a-select-option value="dSpace_IO">dSpace</a-select-option>
                <a-select-option value="dSpace_CAN">dSpace_CAN</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="动作支持的方法" name="allowed_methods">
              <a-checkbox-group v-model:value="form.allowedMethods">
                <a-checkbox value="set">Set</a-checkbox>
                <a-checkbox value="get">Get</a-checkbox>
                <a-checkbox value="write">Write</a-checkbox>
                <a-checkbox value="read">Read</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
          </a-form>
          <div class="flex justify-end mt-4">
            <a-button class="custom-purple-button" type="primary" @click="handleCreateAction">添加元动作</a-button>
          </div>
        </div>
      </div>
    </a-modal>
  </template>
  
  <script setup>
  import { ref, reactive, watch } from 'vue';
  import { Modal, Form, Input, Select, Checkbox, Button } from 'ant-design-vue';
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
  
  const emit = defineEmits(['update:visible', 'actionCreated']);
  
  const selectedPreConditionSignal = ref('');
  const selectedActionSignal = ref('');
  const selectedResultSignal = ref('');
  const selectedSignal = ref('');
  
  const form = reactive({
    name: '',
    value: '',
    actionDescription: '',
    execPath: '',
    pathParameter: '',
    actionType: 'In',
    belongsTo: 'Vector_IO',
    allowedMethods: ['set'],
  });
  
  watch(
    () => [selectedPreConditionSignal.value, selectedActionSignal.value, selectedResultSignal.value],
    ([preCondition, action, result]) => {
      const selectedSignalValue =
        props.preConditionSignals.find((signal) => signal.name === preCondition) ||
        props.actionSignals.find((signal) => signal.name === action) ||
        props.resultSignals.find((signal) => signal.name === result);
  
      if (selectedSignalValue) {
        form.name = selectedSignalValue.name;
        form.value = selectedSignalValue.value;
        selectedSignal.value = selectedSignalValue.name;
      }
    }
  );
  
  const handlePreConditionSignalChange = (value) => {
    selectedPreConditionSignal.value = value;
    selectedActionSignal.value = '';
    selectedResultSignal.value = '';
    selectedSignal.value = value;
  };
  
  const handleActionSignalChange = (value) => {
    selectedPreConditionSignal.value = '';
    selectedActionSignal.value = value;
    selectedResultSignal.value = '';
    selectedSignal.value = value;
  };
  
  const handleResultSignalChange = (value) => {
    selectedPreConditionSignal.value = '';
    selectedActionSignal.value = '';
    selectedResultSignal.value = value;
    selectedSignal.value = value;
  };
  
  const handleCancel = () => {
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
    if (!form.execPath) {
      ElMessage.error('动作执行路径不能为空');
      return;
    }
  
    try {
      const resp = await http.post('/api/create_new_action', {
        name: form.name,
        description: form.actionDescription,
        value: form.value,
        exec_path: form.execPath,
        path_parameter: form.pathParameter,
        action_type: form.actionType,
        belongs_to: form.belongsTo,
        allowed_methods: form.allowedMethods,
      });
  
      if (resp.status === 'ok') {
        ElMessage.success('元动作创建成功');
        emit('actionCreated');
        emit('update:visible', false);
      } else {
        ElMessage.error('元动作创建失败');
      }
    } catch (errInfo) {
      console.error(errInfo);
      ElMessage.error('元动作创建失败');
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
  </style>