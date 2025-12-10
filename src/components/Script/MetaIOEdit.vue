<template>
  <a-form :model="formData" :rules="rules" layout="vertical" ref="formRef">
    <a-form-item label="动作名称" name="name">
      <a-input v-model:value="formData.name" placeholder="请输入内容" />
    </a-form-item>

    <a-form-item label="动作描述" name="description">
      <a-input v-model:value="formData.description" placeholder="请输入内容" />
    </a-form-item>

    <a-form-item label="所属项目" name="projectId">
      <Project
        v-model="formData.projectId"
        @selectedObject="formData.projectName = $event.name"
      ></Project>
    </a-form-item>

    <div v-for="(value, index) in formData.values" :key="index">
      <a-card
        class="mb-[20px]"
        style="background-color: rgb(236 236 236 / 34%)"
      >
        <a-row :gutter="[16, 16]">
          <a-col :span="12">
            <a-form-item
              label="状态值"
              :name="['values', index, 'status']"
              :rules="{
                required: true,
                message: '状态值不可为空',
                trigger: 'change',
              }"
            >
              <a-input
                v-model:value="value.status"
                placeholder="请输入值名称"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="状态描述"
              :name="['values', index, 'description']"
              :rules="{
                required: true,
                message: '状态描述不可为空',
                trigger: 'change',
              }"
            >
              <a-input
                v-model:value="value.description"
                placeholder="请输入值描述"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="[16, 16]" align="middle">
          <a-col :span="7">
            <a-form-item
              label="VT信号"
              :name="['values', index, 'vt_signal']"
              :rules="{
                required: true,
                message: 'VT信号不可为空',
                trigger: 'change',
              }"
            >
              <a-select
                :value="value.vt_signal"
                style="width: 100%"
                @change="vtChanged"
                placeholder="请选择VT信号"
              >
                <a-select-option value="Current">Current</a-select-option>
                <a-select-option value="Frequency">Frequency</a-select-option>
                <a-select-option value="DigitalOutput"
                  >DigitalOutput</a-select-option
                >
                <a-select-option value="RelayVBatt">RelayVBatt</a-select-option>
                <a-select-option value="PWM">PWM</a-select-option>
                <a-select-option value="Active">Active</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="7">
            <a-form-item
              label="符号"
              :name="['values', index, 'relation']"
              :rules="{
                required: true,
                message: '符号不可为空',
                trigger: 'change',
              }"
            >
              <a-select
                v-model:value="value.relation"
                style="width: 100%"
                placeholder="请选择符号"
              >
                <a-select-option value="=">=</a-select-option>
                <a-select-option value="<">&lt; </a-select-option>
                <a-select-option value="≤">≤ </a-select-option>
                <a-select-option value=">">&gt;</a-select-option>
                <a-select-option value="≥">≥</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="7">
            <a-form-item
              label="取值"
              :name="['values', index, 'value']"
              :rules="{
                required: true,
                message: '取值不可为空',
                trigger: 'change',
              }"
            >
              <a-input v-model:value="value.value" placeholder="请输入值取值" />
            </a-form-item>
          </a-col>

          <a-col>
            <a-button
              type="link"
              :disabled="formData.values.length < 2"
              @click="formData.values.splice(index, 1)"
              >删除</a-button
            >
          </a-col>
        </a-row>
      </a-card>
    </div>
    <a-button
      style="margin-top: 0"
      type="primary"
      @click="addValue"
      :disabled="props.onlyOneStatus"
      >添加状态</a-button
    >

    <a-form-item label="动作执行路径" name="exec_path" class="mt-[20px]">
      <a-input v-model:value="formData.exec_path" placeholder="请输入内容" />
    </a-form-item>

    <!-- <a-form-item name="path_parameter">
            <template v-slot:label>
                路径参数<span style="color:brown;margin-left: 10px;">(仅dspace环境填写) </span>
            </template>
            <a-input v-model:value="formData.path_parameter" placeholder="请输入内容" />
        </a-form-item> -->

    <a-form-item label="路径类型" name="relation">
      <a-select v-model:value="formData.relation" style="width: 100%">
        <a-select-option value="IN">IN</a-select-option>
        <a-select-option value="OUT">OUT</a-select-option>
      </a-select>
    </a-form-item>
  </a-form>
  <div slot="footer" class="flex justify-end">
    <a-button class="mr-2" type="primary" @click="emit('close')">关闭</a-button>
    <a-button class="mr-2" type="primary" @click="handleEditOk">提交</a-button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Project from "@common/projectSelect.vue";
import { http } from "@/http";
import { cloneDeep } from "lodash-es";
import { ElMessage, ElMessageBox } from "element-plus";

const defaultData = {
  name: "",
  description: "",
  exec_path: "",
  path_parameter: "",
  belongs_to: "Vector_IO",
  projectId: null,
  relation: "", // 新增字段
  projectName: "",
  values: [
    {
      name: "",
      status: null,
      description: null,
      vt_signal: null,
      relation: null,
      value: null,
    },
  ], // 默认有一个值
};

const props = defineProps({
  status: {
    type: String,
    default: "new",
  },
  data: {
    type: Object,
    default: {},
  },
  onlyOneStatus: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close", "success"]);

const formData = ref<typeof defaultData>(cloneDeep(defaultData));

onMounted(() => {
  if (props.status === "edit" || props.status === "copy") {
    formData.value = cloneDeep(props.data) as typeof defaultData;
  }

  if (props.status === "new" && props.description) {
    formData.value.description = props.description;
  }
});

const rules = {
  name: [{ required: true, message: "请输入动作名称" }],
  description: [{ required: true, message: "请输入动作描述" }],
  exec_path: [{ required: true, message: "请输入动作执行路径" }],
  path_parameter: [{ required: false, message: "请输入路径参数" }],
  projectId: [{ required: true, message: "请选择所属项目" }],
  // exec_path: [{ required: true, message: '请选择所属项目' }],
  relation: [{ required: true, message: "请选择通道类型" }],
};

const addValue = () => {
  const defaultVt = formData.value.values[0].vt_signal;
  formData.value.values.push({
    status: null,
    description: null,
    vt_signal: defaultVt,
    relation: null,
    value: null,
  });
};

const formRef = ref();
const handleEditOk = async () => {
  // console.log(formData.value)
  formRef.value.validate().then(() => {
    formData.value.values.forEach((it) => {
      it.name = it.status;
    });

    let res = null;
    if (props.status === "new" || props.status === "copy") {
      res = http.post("/api/create_new_action", formData.value);
    } else {
      res = http.put(
        `/api/update_action/${formData.value._id}`,
        formData.value
      );
    }

    res.then(() => {
      ElMessage.success("操作成功");
      emit("close");
      emit("success", formData.value);
    });
  });
};

const vtChanged = (value) => {
  formData.value.values.forEach((action) => (action.vt_signal = value));
};
</script>

<style></style>
