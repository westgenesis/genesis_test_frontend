<script setup lang="ts">
import { useUserStore } from "./stores/user";
import { onMounted } from "vue";
import { http } from "./http";
import { useProjectStore } from "./stores/project";
import "quill/dist/quill.snow.css";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import { ref } from "vue";
import ActionSelect from "@/components/Script/actionSelect/ActionSelect.vue";
import ActionCreate from "@/components/Script/actionSelect/ActionCreate.vue";

const locale = zhCN;
const projectStore = useProjectStore();
const userStore = useUserStore();

const theme = {
  token: {
    colorPrimary: "#1890ff",
  },
};

onMounted(() => {
  if (localStorage.getItem("email")) {
    userStore.updateEmail(localStorage.getItem("email"));
  }
  http.get("/api/display_user_projects", {}).then((response) => {
    projectStore.updateProjects(response.data);
    projectStore.updateCurrentProject(response.data[0]);
    return {
      data: response.data,
      total: response.total,
    };
  });
});

const visible = ref(true);

const colorPrimary = import.meta.env.VITE_APP_CSS_PRIMARY_COLOR;
</script>

<template>
  <a-config-provider
    :locale="locale"
    :theme="{
      token: {
        colorPrimary,
      },
    }"
  >
    <a-style-provider hash-priority="high">
      <RouterView v-slot="{ Component }">
        <component :is="Component" />
      </RouterView>
    </a-style-provider>

    <!-- <a-modal v-model:open="visible" title="脚本信息" width="90%">
      <ActionSelect v-if="visible"></ActionSelect>
    </a-modal> -->

    <!-- <a-modal v-model:open="visible" title="脚本信息" width="50%" :footer="null">
      <ActionCreate v-if="visible"></ActionCreate>
    </a-modal> -->
  </a-config-provider>
</template>
