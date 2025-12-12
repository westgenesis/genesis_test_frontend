<template>
  <div class="m-2">
    <div class="flex mb-4 items-center justify-between">
      <div class="flex items-center">
        <el-radio-group v-model="selectedStatus" @change="onSearch">
          <el-radio-button
            v-for="status in statusList"
            :key="status"
            :value="status"
          >
            {{ statusMap[status].label }}
          </el-radio-button>
        </el-radio-group>
        <div class="ml-5">
          <a-input-search
            v-model:value="searchValue"
            placeholder="请输入项目名称"
            style="width: 200px"
            @search="onSearch"
          />
        </div>
      </div>
      <div>
        <a-button type="primary" @click="onCreate">
          <PlusOutlined />
          新建项目
        </a-button>

        <a-button
          type="primary"
          danger
          class="ml-2"
          :disabled="selectedRowKeys.length === 0"
          @click="onDelete"
        >
          <DeleteOutlined />
          删除项目
        </a-button>
      </div>
    </div>

    <a-table
      :columns="columns"
      :row-key="(record) => record._id.$oid"
      :data-source="data?.data"
      :pagination="false"
      :loading="loading"
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange,
      }"
      bordered
      :expand-column-width="120"
    >
      <template #expandColumnTitle> 需求文档配置 </template>
      <template #expandedRowRender="{ record }">
        <RequirementManage :id="record._id.$oid" />
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'display_id'">
          {{ record.display_id }}
        </template>
        <template v-else-if="column.dataIndex === 'name'">{{
          record.name
        }}</template>
        <template v-else-if="column.dataIndex === 'period'"
          >{{ record.period_start }} 至 {{ record.period_end }}</template
        >
        <template v-else-if="column.dataIndex === 'status'">
          <a-tag :color="statusMap[record.project_status ?? 0].color">
            <div class="flex items-center">
              <component :is="statusMap[record.project_status ?? 0].icon" />
              <span class="ml-[5px]">
                {{ statusMap[record.project_status ?? 0].label }}
              </span>
            </div>
          </a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'time_modified'">
          {{ formatDate(record.last_modified.$date) }}
        </template>
        <template v-else-if="column.dataIndex === 'actions'">
          <a-button
            class="ml-2"
            size="small"
            type="primary"
            @click="editProject(record)"
          >
            编辑
          </a-button>
          <a-button class="ml-2" size="small" @click="viewDetails(record)">
            详情
          </a-button>
        </template>
      </template>
    </a-table>

    <!-- 侧滑抽屉 -->
    <a-drawer
      :title="isEditing ? '编辑项目' : '项目详情'"
      placement="right"
      :visible="showDetail"
      @close="showDetail = false"
      width="500"
    >
      <ProjectDetail
        v-if="selectedProject"
        :project.sync="selectedProject"
        @cancel="showDetail = false"
        :isEditing="isEditing"
      />
    </a-drawer>

    <!-- 侧滑抽屉 -->
    <a-drawer
      title="新增项目"
      placement="right"
      :visible="showAdd"
      @close="showAdd = false"
      width="500"
    >
      <AddProject @success="onSearch" @cancel="showAdd = false" />
    </a-drawer>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useRequest } from "vue-request";
import axios from "axios";
import { http } from "../../http";
import { statusMap } from "./projectModal";
import { useRouter } from "vue-router";
import { useProjectStore } from "../../stores/project";

import {
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";

import { message } from "ant-design-vue";
import ProjectDetail from "./ProjectDetail.vue";
import AddProject from "./AddProject.vue";
import { ElMessageBox } from "element-plus";

const router = useRouter();
const statusList = Object.keys(statusMap).sort((a, b) => a - b);
const projectStore = useProjectStore();

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString(); // 使用本地化的日期时间格式
};

const columns = [
  {
    title: "项目编号",
    dataIndex: "display_id",
    width: 100,
  },
  {
    title: "项目名称",
    dataIndex: "name",
    sorter: true,
  },
  {
    title: "计划周期",
    dataIndex: "period",
    width: 220,
  },
  {
    title: "状态",
    dataIndex: "status",
    width: 100,
  },
  {
    title: "更新时间",
    dataIndex: "time_modified",
    width: 180,
  },
  {
    title: "测试环境",
    dataIndex: "kind",
    width: 100,
  },
  {
    title: "操作",
    dataIndex: "actions",
    width: 260,
  },
];

type APIParams = {
  results: number;
  page?: number;
  sortField?: string;
  sortOrder?: number;
  [key: string]: any;
};

type APIResult = {
  total: number;
  page: number;
  data: {
    _id: {
      $oid: string;
    };
    name: string;
    kind: string;
    storage_path: string;
  }[];
};

const queryData = (params: APIParams) => {
  return http.get("/api/display_user_projects", { params }).then((response) => {
    projectStore.updateProjects(response.data);
    return {
      data: response.data,
      total: response.total,
    };
  });
};

const { data, run, loading } = useRequest(queryData);

const selectedStatus = ref("-1");
const searchValue = ref("");
const selectedRowKeys = ref([]);
const showDetail = ref(false);
const selectedProject = ref(null);

const onSearch = () => {
  run({
    search: searchValue.value,
    status: selectedStatus.value === "-1" ? void 0 : selectedStatus.value,
  });
};

const showAdd = ref(false);
const onCreate = () => {
  showAdd.value = true;
};

const onSelectChange = (selectedKeys) => {
  selectedRowKeys.value = selectedKeys;
};

const onDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning("请选择要删除的项目");
    return;
  }

  ElMessageBox.confirm("确定要删除选中的项目吗？", "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    const ids = selectedRowKeys.value;
    http
      .post("/api/delete_projects", { ids })
      .then((response) => {
        message.success("删除成功");
        run(); // 重新加载数据
      })
      .catch((error) => {
        message.error("删除失败");
        console.error(error);
      });
  });
};
const isEditing = ref(false);

const viewDetails = (record) => {
  isEditing.value = false;
  selectedProject.value = record;
  showDetail.value = true;
};

const editProject = (record) => {
  isEditing.value = true;
  selectedProject.value = record;
  showDetail.value = true;
};

const changePeriod = (v, strs) => {
  if (!strs?.length) {
    return;
  }
  form.value.dateFrom = strs[0];
  form.value.dateTo = strs[1];
};
</script>
