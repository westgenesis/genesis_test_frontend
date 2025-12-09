<template>
  <div class="h-full flex flex-col justify-between">
    <div class="flex justify-center overflow-auto">
      <a-form
        :model="project"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
        ref="formRef"
      >
        <a-form-item label="项目编号" class="form-item-spacing">
          <a-input v-model:value="project.display_id" :disabled="true" />
        </a-form-item>
        <a-form-item label="项目名称" class="form-item-spacing">
          <a-input v-model:value="project.name" :disabled="!isEditing" />
        </a-form-item>
        <a-form-item label="测试环境" class="form-item-spacing">
          <a-input v-model:value="project.kind" :disabled="!isEditing" />
        </a-form-item>
        <a-form-item label="项目描述" class="form-item-spacing">
          <a-textarea
            v-model:value="project.description"
            :disabled="!isEditing"
          />
        </a-form-item>
        <a-form-item label="计划周期" class="form-item-spacing">
          <a-range-picker
            v-model:value="period"
            :disabled="!isEditing"
            @change="changePeriod"
          />
        </a-form-item>
        <a-form-item label="项目状态" class="form-item-spacing">
          <a-select
            v-model:value="project.project_status"
            :disabled="!isEditing"
          >
            <a-select-option
              v-for="(status, key) in statusOptions"
              :key="key"
              :value="key"
            >
              {{ status.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="知识库">
          <div v-for="file in fileList" :key="file">
            {{ file }}
            <a-button type="link" @click="downloadFile(file)">
              <DownloadOutlined />
            </a-button>
            <a-button type="link" class="ml-[1rem]" @click="deleteFile(file)">
              <DeleteOutlined />
            </a-button>
          </div>
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="onBeforeUpload"
            accept=".doc,.docx,.pdf,.xlsx,.png"
            :disabled="!isEditing"
          >
            <template #trigger v-if="isEditing">
              <el-button> 上传文件 </el-button>
            </template>
          </el-upload>
        </a-form-item>
        <!-- 其他详细信息可以根据需要添加 -->
      </a-form>
    </div>

    <div class="flex justify-center">
      <a-button type="primary" v-show="isEditing" @click="submit">
        确定
      </a-button>
      <a-button class="ml-2" @click="cancel"> 取消 </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { statusMap } from "./projectModal";
import dayjs, { Dayjs } from "dayjs";
import { DownloadOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { http } from "../../http";
import { message } from "ant-design-vue";
import { useUserStore } from "../../stores/user";

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["cancel"]);

const dateFormat = "YYYY/MM/DD";
const period = ref<[Dayjs, Dayjs]>([
  dayjs(props.project.period_start, dateFormat),
  dayjs(props.project.period_end, dateFormat),
]);

const fileList = ref(props.project.file_list);

const statusOptions = Object.keys(statusMap).reduce((acc, key) => {
  if (key !== "-1") {
    acc[key] = statusMap[key];
  }
  return acc;
}, {});

const deleteFile = (file_name) => {
  console.log(file_name);
  http
    .post(`/api/delete_project_file`, {
      project_id: props.project._id.$oid,
      object_name: props.project._id.$oid + "/" + file_name,
      file_name: file_name,
      object_type: "knowledges",
    })
    .then(() => {
      message.success("删除成功");
      fileList.value = fileList.value.filter((x) => x !== file_name);
    })
    .catch((error) => {
      message.error("删除失败");
      console.error("删除文件失败", error);
    });
};

watch(
  () => props.project,
  (newProject) => {
    if (newProject.period_start && newProject.period_end) {
      period.value = [
        dayjs(newProject.period_start, dateFormat),
        dayjs(newProject.period_end, dateFormat),
      ];
    }
    fileList.value = newProject.file_list;
  },
  { immediate: true, deep: false }
);

const downloadFile = (filename) => {
  http
    .post(
      `/api/get_document`,
      {
        project_id: props.project._id.$oid,
        object_name: props.project._id.$oid + "/" + filename,
      },
      { responseType: "blob" }
    )
    .then((response) => {
      const blob = new Blob([response as any], {
        type: "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // 移除下载链接
      link.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("下载文件失败", error);
    });
};

onMounted(() => {
  window.downloadFile = downloadFile;
});
const form = ref({
  dateFrom: props.project.period_start,
  dateTo: props.project.period_end,
});
const changePeriod = (v, strs) => {
  if (!strs?.length) {
    return;
  }
  form.value.dateFrom = strs[0];
  form.value.dateTo = strs[1];
};

const submit = () => {
  const { project } = props;
  const params = {
    name: project.name,
    notes: project.description || "",
    periodStart: form.value.dateFrom,
    periodEnd: form.value.dateTo,
    kind: project.kind,
    project_id: project._id.$oid,
    project_status: project.project_status,
  };
  http
    .put("/api/update_project", params)
    .then((response) => {
      message.success("修改项目成功");
    })
    .catch((error) => {
      message.error("修改项目失败");
    });
};

const cancel = () => {
  emit("cancel");
};

const onBeforeUpload = async (file) => {
  const formData = new FormData();
  const info = new Blob([
    JSON.stringify({
      db_id: props.project?._id?.$oid,
      category: "knowledges_update",
    }),
  ]);
  formData.append("user_file", file.raw as File);
  formData.append("info", info);

  await http.post(`/api/upload_project_file`, formData);
};
</script>

<style scoped>
.project-detail {
  padding: 20px;
}

.form-item-spacing {
  margin-bottom: 20px;
  /* 增加标签和表单项之间的距离 */
}

:deep(.el-upload__input) {
  display: none !important;
}
</style>
