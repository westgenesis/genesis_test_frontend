<template>
  <a-select
    v-model:value="selectedProject"
    class="w-[200px]"
    @change="handleSelect"
  >
    <a-select-option
      v-for="project in projects"
      :key="project._id.$oid"
      :value="project._id.$oid"
    >
      {{ project.name }}
    </a-select-option>
  </a-select>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useProjectStore } from "@/stores/project";
const projectStore = useProjectStore();
const { projects, currentProject } = storeToRefs(projectStore);

const selectedProject = ref("");

// 监听 projects 的变化，并在其更新后设置 selectedProject
watch(
  projects,
  (newProjects) => {
    if (newProjects.length > 0) {
      selectedProject.value = newProjects[0]._id.$oid;
    }
  },
  { immediate: true }
);

const handleSelect = (newProjectId) => {
  const selectedProject = projects.value.find(
    (project) => project._id.$oid === newProjectId
  );
  if (selectedProject) {
    projectStore.updateCurrentProjectById(newProjectId);
    currentProject.value.name = selectedProject.name; // 更新 currentProject.name
  }
};
</script>
