<template>
  <a-dropdown>
    <div><UserOutlined class="mr-2" />{{ email || "游客" }}</div>
    <template #overlay>
      <a-menu>
        <a-menu-item @click="backToLogin"> 退出登录 </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

import { UserOutlined } from "@ant-design/icons-vue";

const router = useRouter();
const userStore = useUserStore();
const { email } = storeToRefs(userStore);

const backToLogin = () => {
  router.push("/login");
};
</script>
