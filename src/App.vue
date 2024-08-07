<script setup lang="ts">
import TopBar from './components/TopBar.vue'
import LeftMenu from './components/LeftMenu/LeftMenu.vue'
import { useUserStore } from './stores/user';
import { onMounted } from 'vue'
import { http } from './http';
import { useProjectStore } from './stores/project';
import 'quill/dist/quill.snow.css'


const projectStore = useProjectStore();
const userStore = useUserStore();

onMounted(() => {
  if (localStorage.getItem('email')) {
    userStore.updateEmail(localStorage.getItem('email'));
  }
  http.get('/api/display_user_projects', { })
        .then(response => {
            projectStore.updateProjects(response.data);
            projectStore.updateCurrentProject(response.data[0]);
            return {
                data: response.data,
                total: response.total,
            }
        });
})
</script>

<template>
  <div class="main">
    <TopBar></TopBar>
    <div class="flex flex-1" style="overflow: hidden;">
        <LeftMenu />
        <div class="flex-1" style="background-color: #fff; overflow: hidden;" >
          <router-view></router-view>
        </div>
    </div>
  </div>
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
