// router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import { useTitle } from "@vueuse/core";
import Login from "../components/Login.vue";
import Registry from "../components/Registry.vue";
import ProjectManage from "../components/Project/ProjectManage.vue";
import RequirementManage from "../components/Requirement/RequirementManage.vue";
import FunctionModule from "../components/Requirement/FunctionModule.vue";
import FunctionPoint from "../components/Requirement/FunctionPoint.vue";
import UseCase from "../components/UseCase/UseCase.vue";
import ScriptFile from "../components/Script/ScriptFile.vue";
import MetaAction from "../components/Script/MetaAction.vue";
import ActionCombination from "../components/Script/ActionCombination.vue";
import RequirementMain from "../components/Requirement/RequirementMain.vue";
import Layout from "@/components/Layout/index.vue";

import { defineAsyncComponent, type Component } from "vue";
import type { RouteRecordRaw, RouteMeta } from "vue-router";
import { ElMessage } from "element-plus";

interface AppRouteMeta extends RouteMeta {
  title?: string; // 菜单标题
  icon?: Component; // 菜单图标
  hidden?: boolean; // 是否在菜单中隐藏
  hideHeader?: boolean; // 是否隐藏头部
  hideSidebar?: boolean; // 是否隐藏侧边栏
  hideDefaultPadding?: boolean; // 是否隐藏默认内边距
  hideTransition?: boolean; // 是否隐藏动画
}

interface AppRouteRecordRaw {
  path: string; // 路由路径
  alias?: string;
  name?: string; // 路由名称
  component?: Component; // 路由组件
  redirect?: string; // 重定向路径
  meta?: AppRouteMeta; // 路由元数据
  children?: AppRouteRecordRaw[]; // 子路由
}
const routes: AppRouteRecordRaw[] = [
  {
    path: "/",
    component: Layout,
    redirect: "/project/projectManage",
    children: [
      {
        path: "project/projectManage",
        component: ProjectManage,
        meta: {
          title: "项目管理",
          icon: defineAsyncComponent(() => import("~icons/mdi/work")),
        },
      },
      {
        path: "project/manageRequirement/:id",
        component: RequirementManage,
        meta: {
          title: "需求配置",
          hidden: true,
        },
      },
      {
        path: "requirement/requirementMain",
        component: RequirementMain,
        meta: {
          title: "需求管理",
          icon: defineAsyncComponent(
            () => import("~icons/pajamas/work-item-requirement")
          ),
        },
      },
      {
        path: "script",
        redirect: "/script/metaAction",
        meta: {
          title: "动作库",
          icon: defineAsyncComponent(
            () => import("~icons/material-symbols/action-key")
          ),
        },
        children: [
          {
            path: "metaAction",
            component: MetaAction,
            meta: {
              title: "元动作库",
              icon: defineAsyncComponent(
                () => import("~icons/material-symbols/circle")
              ),
            },
          },
          {
            path: "actionCombination",
            component: ActionCombination,
            meta: {
              title: "动作组合库",

              icon: defineAsyncComponent(
                () => import("~icons/material-symbols/group-work-outline")
              ),
            },
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/registry",
    name: "Registry",
    component: Registry,
  },
];

export type MenuItem = {
  title: string;
  path: string;
  fullPath: string;
  icon?: Component | string;
  children?: MenuItem[];
};

const router = createRouter({
  history: createWebHistory(),
  routes: routes as RouteRecordRaw[],
});
/**
 * 生成菜单，返回完整 path
 * @param {AppRouteRecordRaw[]} routes
 * @param {string} parentPath
 * @return {MenuItem[]}
 */
const generateMenu = (
  routes: AppRouteRecordRaw[],
  parentPath = ""
): MenuItem[] => {
  return routes
    .filter((route) => !route.meta?.hidden)
    .map((route) => {
      // 拼接完整路径
      const fullPath =
        parentPath +
        (route.path.startsWith("/") ? route.path : "/" + route.path);

      const menu: MenuItem = {
        title: route.meta?.title || "",
        path: route.path,
        fullPath,
        icon: route.meta?.icon,
      };

      if (route.children) {
        menu.children = generateMenu(route.children, fullPath);
      }

      return menu;
    });
};

// 更新标题
const updateTitle = (title: string) => {
  useTitle(title, {
    titleTemplate: `%s | ${import.meta.env.VITE_APP_NAME}`,
  });
};

const menus = generateMenu(routes[0].children || []);

router.beforeEach((to) => {
  const whiteList = ["/login", "/registry"];
  if (!localStorage.getItem("token") && !whiteList.includes(to.path)) {
    ElMessage.error("请先登录");
    return {
      path: "/login",
    };
  }
});

router.afterEach((to) => {
  const title = (to.meta?.title as string) ?? "";
  updateTitle(title);
});

export { menus };

export default router;
