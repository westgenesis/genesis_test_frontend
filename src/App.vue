<script setup lang="ts">
import TopBar from './components/TopBar.vue'
import LeftMenu from './components/LeftMenu/LeftMenu.vue'
import { useUserStore } from './stores/user';
import { onMounted } from 'vue'
import { http } from './http';
import { useProjectStore } from './stores/project';
import 'quill/dist/quill.snow.css'
import zhCN from 'ant-design-vue/es/locale/zh_CN';
// import Project from './components/common/projectSelect.vue'
// import {ref} from 'vue'

const locale = zhCN
const projectStore = useProjectStore();
const userStore = useUserStore();

onMounted(() => {
  if (localStorage.getItem('email')) {
    userStore.updateEmail(localStorage.getItem('email'));
  }
  http.get('/api/display_user_projects', {})
    .then(response => {
      projectStore.updateProjects(response.data);
      projectStore.updateCurrentProject(response.data[0]);
      return {
        data: response.data,
        total: response.total,
      }
    });
})

// const abc = ref("Robot")
</script>

<template>
  <!-- <Project style="width: 100px;" v-model="abc" ></Project>
  abc{{ abc }} -->
  <a-config-provider :locale="locale">
    <div class="main">
      <TopBar></TopBar>
      <!-- style="overflow: hidden;" -->
      <div class="flex flex-1" >
        <div class="flex-1" style="background-color: #fff; overflow: hidden;">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </a-config-provider>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.main {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
