// stores/project.ts
import { defineStore } from 'pinia';
import { http } from '../http';

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [],
    currentProject: {
      _id: {}
    },
  }),
  actions: {
    updateProjects(projects) {
      this.projects = projects;
    },
    updateCurrentProject(project) {
      this.currentProject = project;
    },
    updateCurrentProjectById(projectId) {
      this.currentProject = this.projects.find(x => x._id.$oid === projectId);
    },
    async refreshProject(projectId) {
      const result = await http.get(`/api/project_info/${projectId}`);
      this.currentProject = result.project_data;
    }
  },
});