// stores/project.ts
import { defineStore } from "pinia";
import { http } from "../http";

export const useProjectStore = defineStore("project", {
  state: () => ({
    projects: JSON.parse(localStorage.getItem("projects") || "[]") || [],
    currentProject: {
      _id: {},
    },
  }),
  actions: {
    updateProjects(projects) {
      this.projects = projects;
      localStorage.setItem("projects", JSON.stringify(projects));
    },
    updateCurrentProject(project) {
      this.currentProject = project;
    },
    updateCurrentProjectById(projectId) {
      this.currentProject = this.projects.find((x) => x._id.$oid === projectId);
    },
    async refreshProject(projectId) {
      const result = await http.get(`/api/project_info/${projectId}`);

      if (result.project_data) {
        const index = this.projects.findIndex(
          (item) => item._id.$oid === projectId
        );
        if (index !== -1) {
          this.projects.splice(index, 1, result.project_data);
          this.currentProject = this.projects[index];
        }
      }
    },
    async refreshAllProjects() {
      const result = await http
        .get("/api/display_user_projects", {})
        .then((response) => {
          this.updateProjects(response.data);
          return response.data;
        });
      return result;
    },
  },
});
