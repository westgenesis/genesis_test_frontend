<template>
  <a-modal
    :open="props.visible"
    title="动作选择"
    @cancel="emit('update:visible', false)"
    width="80%"
    :footer="null"
  >
    <div class="flex-row flex mb-2">
      <a-form :model="searchForm" layout="inline" style="width: 100%">
        <a-row style="width: 80%">
          <a-col :span="10" style="max-width: 300px">
            <a-form-item label="关键字" name="key">
              <a-input
                v-model:value="searchForm.name"
                placeholder="请输入关键字"
                :allowClear="true"
              />
            </a-form-item>
          </a-col>

          <a-col :span="10" style="max-width: 300px">
            <a-form-item label="所属项目" name="projectid">
              <ProjectSelect
                v-model="searchForm.projectId"
                placeholder="请选择所属项目"
                :allowClear="true"
              >
              </ProjectSelect>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <div class="flex justify-end">
        <a-button type="primary" @click="query" class="mr-[2rem]"
          >查询</a-button
        >
      </div>
    </div>

    <div class="flex-1 overflow-auto">
      <a-table
        :columns="canColumns"
        :dataSource="pagedDataSource"
        :row-class-name="
          (_record, index) => (index % 2 === 1 ? 'table-striped' : null)
        "
        :pagination="false"
        sticky
        :scroll="{ y: 500 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-button type="primary" size="small" @click="confirm(record)"
              >选择</a-button
            >
          </template>
        </template>
      </a-table>
    </div>

    <div class="mt-2 flex justify-end">
      <a-pagination
        v-model:current="currentPage"
        :total="dataSource.length"
        :page-size="pageSize"
        show-less-items
        @change="handlePageChange"
      />
    </div>
  </a-modal>
</template>

<script setup>
import { cloneDeep } from "lodash-es";
import { http } from "@/http";
import { ref, onUpdated, computed } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const searchForm = ref({
  keyword: null,
  projectId: null,
});

const currentPage = ref(1);
const pageSize = 7;
const dataSource = ref([]);
const pagedDataSource = computed(() => {
  const start = currentPage.value - 1;
  const end = start + pageSize;
  return dataSource.value.slice(start, end);
});
const handlePageChange = (page) => {
  currentPage.value = page;
  // fetchActions();
};

const emit = defineEmits(["update:visible", "confirm"]);

onUpdated(() => {
  // 读数据
  if (props.visible === true) {
    query();
  }
});

const query = () => {
  const params = Object.assign(
    { start: 0, pagesize: 1000, belongs_to: "Vector_CAN" },
    searchForm.value
  );

  http({
    url: "/api/get_actions",
    params: params,
  })
    .then((response) => {
      dataSource.value = response.actions;
    })
    .catch((error) => {
      console.error(error);
      ElMessage.error("获取数据失败");
    });
};

const canColumns = [
  {
    title: "动作名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "动作描述",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "动作执行路径",
    dataIndex: "exec_path",
    key: "exec_path",
    width: "120px",
  },
  {
    title: "路径参数",
    dataIndex: "path_parameter",
    key: "path_parameter",
    width: "120px",
  },
  {
    title: "路径类型",
    dataIndex: "relation",
    key: "relation",
    width: "120px",
  },
  {
    title: "所属项目",
    dataIndex: "projectName",
    key: "projectName",
    width: "120px",
  },

  {
    title: "操作",
    key: "action",
    fixed: "right",
    width: 80,
  },
];

function confirm(record) {
  emit("confirm", record);
  emit("update:visible", false);
}
</script>

<style></style>
