<template>
  <a-tabs v-model:activeKey="activeTab">
    <a-tab-pane key="detail" tab="测试用例详情"></a-tab-pane>
  </a-tabs>
  <div v-if="activeTab === 'detail'">
    <div
      style="
        border-left: 2px solid purple;
        margin-left: 0.25rem;
        padding-left: 1rem;
        margin-bottom: 1rem;
        display: flex;
        justify-content: space-between;
      "
    >
      反向测试用例
      <div
        class="flex justify-center items-center"
        style="gap: 2rem; margin-right: 2rem"
      >
        <a-button
          type="primary"
          @click="handleSave"
          class="custom-purple-button"
          >保存</a-button
        >
      </div>
    </div>
    <a-form :model="form" layout="vertical">
      <a-form-item label="用例名称">
        <a-input
          v-model:value="form.testcase_name"
          placeholder="请输入功能点名称"
          :rows="4"
        />
      </a-form-item>
      <a-form-item label="初始条件">
        <a-textarea
          v-model:value="form.pre_condition"
          placeholder="请输入初始条件"
          :rows="3"
        />
      </a-form-item>
      <a-form-item label="触发条件">
        <a-textarea
          v-model:value="form.action"
          placeholder="请输入触发条件"
          :rows="3"
        />
      </a-form-item>
      <a-form-item label="预期结果">
        <a-textarea
          v-model:value="form.result"
          placeholder="请输入预期结果"
          :rows="3"
        />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, defineProps, computed, ref, onUpdated } from "vue";
import { http } from "../../http";
import { ElMessage } from "element-plus";
import { useProjectStore } from "../../stores/project";
const { refreshAllProjects } = useProjectStore();

const form = ref({
  testcase_name: "",
  pre_condition: "",
  action: "",
  result: "",
  version: "",
  project_id: "",
  testcase_id: "",
});

const props = defineProps({
  currentRequirement: {
    type: Object,
  },
  selectNodeByKey: {
    type: Function,
  },
});

const activeTab = ref("detail");
const tableData = ref([]);

console.log(props);

const project_id = computed(() => {
  return props.currentRequirement?.project?._id?.$oid;
});
const req_id = computed(() => {
  return props.currentRequirement.req.req_id;
});
const split_file_id = computed(() => {
  return props.currentRequirement?.splitReq.split_file_id;
});
const split_case_id = computed(() => {
  return props.currentRequirement.splitCase.testcase_id;
});
const testcase_id = computed(() => {
  return props.currentRequirement?.testcase.testcase_id;
});

const fetchData = () => {
  http
    .post("/api/query_testcase_by_id", {
      project_id: project_id.value,
      req_id: req_id.value,
      split_file_id: split_file_id.value,
      split_case_id: split_case_id.value,
      testcase_id: testcase_id.value,
    })
    .then((resp) => {
      if (resp.result) {
        form.value = resp;
        tableData.value = resp.testcases || [];
      }
    })
    .then(() => {
      refreshAllProjects();
    });
};

const table_width1 = ref(500);

onUpdated(() => {
  const ele = document.getElementById("function_point_table");
  if (ele) {
    const width = ele.getBoundingClientRect().width;
    table_width1.value = width;
  }
});

onMounted(() => {
  fetchData();
});

watch([project_id, req_id, split_file_id, split_case_id], () => {
  fetchData();
});

const handleSave = async () => {
  const params = {
    ...form.value,
    project_id: project_id.value,
    req_id: req_id.value,
    split_file_id: split_file_id.value,
    split_case_id: split_case_id.value,
    testcase_id: testcase_id.value,
  };
  return http.post("/api/modify_testcase", params).then((response) => {
    if (response) {
      ElMessage.success("保存成功");
      refreshAllProjects();
      form.value.version = response.version;
    }
  });
};
</script>

<style scoped lang="less">
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
