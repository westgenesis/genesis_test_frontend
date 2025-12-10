<template>
  <div>
    <a-card title="项目信息">
      <a-descriptions>
        <a-descriptions-item label="项目名称">{{
          currentProject.name
        }}</a-descriptions-item>
        <a-descriptions-item label="项目ID">{{
          currentProject._id.$oid
        }}</a-descriptions-item>
        <a-descriptions-item label="测试环境">{{
          currentProject.kind
        }}</a-descriptions-item>
        <a-descriptions-item label="计划周期"
          >{{ currentProject.period_start }} 至
          {{ currentProject.period_end }}</a-descriptions-item
        >
        <a-descriptions-item label="项目描述">{{
          currentProject.notes || "无描述"
        }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
    <a-card title="需求文档" class="mt-4!" id="requirement-card">
      <template #extra>
        <div class="flex gap-2">
          <a-button type="primary" @click="doRefresh">
            <RedoOutlined />刷新
          </a-button>

          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="onBeforeUpload"
            :show-file-list="false"
            accept=".doc,.docx"
          >
            <template #trigger>
              <a-button type="primary">
                <template #icon>
                  <CloudUploadOutlined />
                </template>
                上传需求
              </a-button>
            </template>
          </el-upload>
        </div>
      </template>

      <a-table
        bordered
        :dataSource="requirements"
        :columns="columns"
        :pagination="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            {{ requirementStatusMap[record.status] }}
          </template>
          <template v-if="column.key === 'actions'">
            <div class="flex items-center">
              <el-upload
                ref="uploadRef"
                :auto-upload="false"
                :on-change="(file) => onBeforeUpdate(file, record)"
                :show-file-list="false"
                accept=".doc,.docx,.pdf"
              >
                <template #trigger>
                  <el-button type="text">更新</el-button>
                </template>
              </el-upload>
              <el-button
                class="ml-2"
                type="text"
                @click="doSplitRequirement(record)"
              >
                解析
              </el-button>
              <!-- <el-button type="text" @click="doDelete(record)">删除</el-button> -->
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from "@stores/project";
import { storeToRefs } from "pinia";
import { computed, watch } from "vue";
import { CloudUploadOutlined, RedoOutlined } from "@ant-design/icons-vue";
import { UploadProps, ElMessage } from "element-plus";
import { http } from "../../http";
import { requirementStatusMap } from "./RequirementModel";
import { ElLoading } from "element-plus";
import { useRoute } from "vue-router";

const projectStore = useProjectStore();

const { projects } = storeToRefs(projectStore);
const route = useRoute();

const id = computed(() => route.params.id);

const currentProject = computed(() =>
  projects.value.find((item) => item?._id?.$oid === id.value)
);

const requirements = computed(
  () => currentProject.value?.requirement_files || []
);

const columns = [
  {
    title: "ID",
    dataIndex: "req_id",
    key: "req_id",
  },
  {
    title: "名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "创建人",
    dataIndex: "creator",
    key: "creator",
  },
  {
    title: "创建时间",
    dataIndex: "created_time",
    key: "created_time",
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "操作",
    key: "actions",
  },
];

const onUploadMainDoc = () => {
  // 跳转到上传需求文档的页面
};

const onBeforeUpload: UploadProps["onChange"] = async (file) => {
  if (requirements.value.length >= 5) {
    ElMessage.error("一个项目最多上传五个需求文档");
    return;
  }
  const formData = new FormData();
  const info = new Blob([
    JSON.stringify({
      db_id: currentProject.value["_id"]["$oid"],
      category: "requirments_docx",
    }),
  ]);
  formData.append("user_file", file.raw as File);
  formData.append("info", info);
  const loadingInstance = ElLoading.service({
    target: "#requirement-card",
  });
  try {
    const result = await http.post(`/api/upload_project_file`, formData);
    await projectStore.refreshProject(currentProject.value["_id"]["$oid"]);
  } catch (e) {
    if (e?.response?.data?.message) {
      ElMessage.error(e.response.data.message);
    }
  } finally {
    loadingInstance.close();
  }
};

const doRefresh = async () => {
  await projectStore.refreshProject(currentProject.value["_id"]["$oid"]);
  ElMessage.success("需求文档已刷新");
};

const onBeforeUpdate: UploadProps["onChange"] = async (file, requirement) => {
  const formData = new FormData();
  const info = new Blob([
    JSON.stringify({
      db_id: currentProject.value["_id"]["$oid"],
      category: "update_requirments_docx",
      req_id: requirement.req_id,
      req_name: requirement.name,
      req_creator: requirement.creator,
      new_file_name: file.name,
      version: requirement.version,
    }),
  ]);
  formData.append("user_file", file.raw as File);
  formData.append("info", info);

  await http.post(`/api/upload_project_file`, formData).then((response) => {
    if (response.status === "OK") {
      ElMessage.success("更新成功");
    } else {
      ElMessage.error("更新失败");
    }
  });
  await projectStore.refreshProject(currentProject.value["_id"]["$oid"]);
};

const doSplitRequirement = async (requirement) => {
  ElMessage.success("已下发解析请求, 请等待一段时间或刷新后查看需求管理");
  const result = await http.post("/api/do_split_requirement", requirement);
  doRefresh();
};

const doDelete = async (requirement) => {};
</script>

<style scoped lang="scss">
.flex-container {
  display: flex;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.flex-item {
  flex: 1 1 calc(33.333% - 1rem);
  /* 每个项目占据1/3的宽度，减去间距 */
  box-sizing: border-box;
  padding: 0.2rem;
}

.requirement {
  display: flex;
  margin: 1rem;
  border-bottom: 1px solid #ddd;
}

.requirement-item {
  flex: 1;
  max-width: calc(100% / 7);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
