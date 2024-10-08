// router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Registry from '../components/Registry.vue';
import MainLayout from '../components/MainLayout.vue';
import ProjectManage from '../components/Project/ProjectManage.vue';
import AddProject from '../components/Project/AddProject.vue';
import RequirementManage from '../components/Requirement/RequirementManage.vue';
import FunctionModule from '../components/Requirement/FunctionModule.vue';
import FunctionPoint from '../components/Requirement/FunctionPoint.vue';
import UseCase from '../components/UseCase/UseCase.vue';
import ScriptFile from '../components/Script/ScriptFile.vue';
import MetaAction from '../components/Script/MetaAction.vue';
import ActionCombination from '../components/Script/ActionCombination.vue';
import RequirementMain from '../components/Requirement/RequirementMain.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/registry',
    name: 'Registry',
    component: Registry
  },
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/project/projectManage',
    component: ProjectManage
  },
  {
    path: '/project/addProject',
    component: AddProject
  },
  {
    path: '/project/manageRequirement/:id',
    component: RequirementManage
  },
  {
    path: '/requirement/functionModules',
    component: FunctionModule
  },
  {
    path: '/requirement/functionPoints',
    component: FunctionPoint
  },
  {
    path: '/requirement/requirementMain',
    component: RequirementMain
  },
  {
    path: '/usecase/usecaseManage',
    component: UseCase
  },
  {
    path: '/script/file',
    component: ScriptFile
  },
  {
    path: '/script/metaAction',
    component: MetaAction
  },
  {
    path: '/script/actionCombination',
    component: ActionCombination
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;