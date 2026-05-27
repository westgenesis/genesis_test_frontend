<template>
  <div style="width: 100%">
    <div
      class="flex mt-[2rem] mb-[1rem]"
      style="align-items: center; justify-content: space-between; width: 100%"
    >
      <div class="ml-[1rem] flex items-center justify-center">
        <div class="mr-[1rem]">功能模块名称</div>
        <a-input
          v-model:value="fileName"
          placeholder="输入文件名"
          style="width: 18.5rem"
        />
      </div>

      <div class="flex justify-center mr-[1rem]" style="gap: 1rem">
        <a-button
          type="primary"
          @click="() => onSplit(false)"
          class="custom-purple-button"
          >拆分</a-button
        >
        <a-button
          type="primary"
          @click="onSaveContent"
          class="custom-purple-button"
          >保存</a-button
        >
      </div>
    </div>
  </div>
  <DocumentWordEditor ref="editorRef" />

  <div></div>

  <a-card title="图表" style="width: 100%; margin-top: 1rem; width: 100%">
    <template #extra>
      <a-button
        type="primary"
        @click="() => onSplit(true)"
        class="custom-purple-button"
        v-if="imagesUrl"
      >
        拆分图表
      </a-button>
    </template>
    <a-table
      bordered
      :dataSource="record?.tables_data ?? []"
      :columns="tableColumns"
      v-if="
        record?.tables_header?.length > 0 && record?.tables_data?.length > 0
      "
      :scroll="{ x: 2500 }"
      :pagination="false"
    >
    </a-table>

    <div style="display: flex; justify-content: center; margin-top: 1rem">
      <a-image
        v-if="imagesUrl"
        :src="imagesUrl"
        width="500px"
        fallback="data:image/png;base64,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"
      />
    </div>
  </a-card>
</template>

<script setup lang="ts">
import DocumentWordEditor from "./DocumentWordEditor.vue";
import { ref, onMounted, computed, watchEffect } from "vue";
import { useProductFetch } from "../../handler/handler";
import { ElMessage, ElMessageBox } from "element-plus";
import { useProjectStore } from "../../stores/project";
import { http } from "../../http";
const { handler } = useProductFetch();

const props = defineProps({
  record: {
    type: Object,
    required: true,
  },
  currentRequirement: {
    type: Object,
  },
});
const fileName = ref(props.record?.file_name?.replace(".docx", ""));
const editorRef = ref<InstanceType<typeof DocumentWordEditor>>();

const tableColumns = computed(() => {
  return (
    props.record?.tables_header?.map((item) => ({
      title: item,
      dataIndex: item,
      key: item,
      width: 300,
    })) || []
  );
});

const imagesUrl = ref("");

const getImageUrl = async () => {
  if (!props.record.images_url) {
    return;
  }

  const res = await http.post("/api/minio_presign", {
    image_url: props.record.images_url,
  });

  imagesUrl.value = res?.image_url_presign || "";
};

watchEffect(() => {
  getImageUrl();
});

onMounted(async () => {
  handler
    .DownloadFile(
      props.record.object_name.split("/")[0],
      props.record.object_name,
    )
    .then((stream: any) => {
      const blob = new Blob([stream], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const file = new File([blob], props.record.object_name);
      editorRef.value?.loadDocx(file);
    });
});
const { refreshAllProjects } = useProjectStore();

const onSaveContent = () => {
  ElMessageBox.confirm("保存后会覆盖文件，是否确定？", "覆盖提示", {
    confirmButtonText: "是",
    cancelButtonText: "否",
    type: "warning",
  }).then(() => {
    editorRef.value?.getDocx(fileName.value).then((file) => {
      const formData = new FormData();
      const info = new Blob([
        JSON.stringify({
          db_id: props.currentRequirement.project._id.$oid,
          category: "save_requirement_docx",
          ...props.record,
          newFileName: fileName.value,
          req_id: props.currentRequirement.req.req_id,
        }),
      ]);

      formData.append("user_file", file);
      formData.append("info", info);
      handler.UploadFile(formData).then((res) => {
        if (res) {
          ElMessage.success("保存成功");
          props.record.version = (Number(props.record.version) + 0.1).toFixed(
            1,
          );
          refreshAllProjects();
        } else {
          ElMessage.error("保存失败");
        }
      });
    });
  });
};

const onSplit = (isTableImage = false) => {
  ElMessageBox.confirm("拆分会覆盖当前模块的已有功能点，是否继续？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const params = {
        project_id: props.currentRequirement.project._id.$oid,
        ...props.record,
        req_id: props.currentRequirement.req.req_id,
      };

      if (isTableImage) {
        params.object_name = props.record?.images_url;
      }

      ElMessage.success(
        "已下发功能点拆解任务，请等待或刷新后去功能点页面查看结果",
      );
      http.post("/api/subrequire_generate_points", params).then((res) => {
        console.log(res);
      });
    })
    .catch((e) => {
      console.log(e);
      // 用户点击取消，不做任何操作
      ElMessage.info("已取消拆分操作");
    });
};
</script>

<style scoped lang="less">
/* 覆盖 el-radio-button 的默认样式 */
:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: purple;
  border-color: purple;
}

:deep(.el-radio-button__inner) {
  color: purple;
  border-color: purple;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: purple;
  border-color: purple !important;
}
</style>
