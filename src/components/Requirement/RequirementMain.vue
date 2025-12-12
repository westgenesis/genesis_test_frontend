<template>
  <div class="h-full overflow-hidden flex flex-col gap-2">
    <el-tabs v-model="currentProject">
      <el-tab-pane
        :label="item.name"
        :name="item._id.$oid"
        v-for="item in projects"
        :key="item._id.$oid"
      >
        <template #label>
          <span class="flex items-center gap-2 text">
            <el-icon :size="20"><Document /></el-icon>
            <span>{{ item.name }}</span>
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <div class="flex-1 flex gap-2 overflow-hidden">
      <SplitPanel
        :paneCount="2"
        :sizes="[35, 65]"
        class="h-full overflow-hidden"
        :gutterSize="10"
      >
        <template #pane-0>
          <div class="h-full overflow-hidden flex flex-col mr-2">
            <div class="mb-2">
              <a-input-search
                placeholder="请输入要搜索的名称"
                style="width: 100%"
                @search="onSearch"
              />
            </div>

            <div class="flex-1 overflow-auto">
              <el-tree
                ref="elTree"
                :default-expanded-keys="
                  treeData.length ? [treeData[0]?.key] : []
                "
                :data="treeData"
                :props="{
                  label: 'title',
                }"
                node-key="key"
                highlight-current
                accordion
                :current-node-key="currentKey"
                @node-click="onSelect"
                :expand-on-click-node="false"
              >
                <template #default="{ node, data }">
                  <div
                    class="flex justify-between items-center gap-2 w-full overflow-hidden pr-2"
                  >
                    <div class="flex-1 flex items-center overflow-hidden">
                      <el-tooltip
                        effect="dark"
                        :content="data.title"
                        placement="top"
                        :show-after="300"
                      >
                        <MiddleEllipsis :text="data.title"> </MiddleEllipsis>
                      </el-tooltip>
                    </div>

                    <ElTag
                      size="small"
                      effect="plain"
                      :type="typeMap[data.type].tagType"
                    >
                      <component :is="typeMap[data.type].icon" />
                      <span class="ml-1">{{ typeMap[data.type].title }}</span>
                    </ElTag>
                  </div>
                </template>
              </el-tree>
            </div>
          </div>
        </template>

        <template #pane-1>
          <div
            class="h-full overflow-auto flex-1 border p-4 border-solid border-gray-200 rounded-md ml-2"
          >
            <div v-if="currentType === 'requirement'">
              <RequirementInner
                :currentRequirement="currentRequirement"
                :selectNodeByKey="selectNodeByKey"
              />
            </div>
            <div v-else-if="currentType === 'sub_requirement'">
              <SplitRequirementInner
                :currentRequirement="currentRequirement"
                :selectNodeByKey="selectNodeByKey"
              />
            </div>
            <div v-else-if="currentType === 'split_case'">
              <SplitCaseInner
                :currentRequirement="currentRequirement"
                :selectNodeByKey="selectNodeByKey"
              />
            </div>
            <div v-else-if="currentType === 'testcase'">
              <TestCaseInner
                :currentRequirement="currentRequirement"
                :selectNodeByKey="selectNodeByKey"
              />
            </div>
            <ElEmpty description="请先选中文档节点进行查看" v-else />
          </div>
        </template>
      </SplitPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from "../../stores/project";
import { ref, computed, onUpdated, nextTick, useTemplateRef, watch } from "vue";
import type { TreeProps } from "ant-design-vue";
import { storeToRefs } from "pinia";
import {
  ApiOutlined,
  ProjectOutlined,
  DatabaseOutlined,
  ProfileOutlined,
  DownOutlined,
  ExperimentOutlined,
} from "@ant-design/icons-vue";
import RequirementInner from "./RequirementInner.vue";
import SplitCaseInner from "./SplitCaseInner.vue";
import TestCaseInner from "./TestCaseInner.vue";
import SplitRequirementInner from "./SplitRequirementInner.vue";
import { ElEmpty, ElTag } from "element-plus";
import { Document } from "@element-plus/icons-vue";
import MiddleEllipsis from "@/components/MiddleEllipsis.vue";
import SplitPanel from "@/components/SplitPanel.vue";

const currentType = ref();
const projectStore = useProjectStore();
const { projects } = storeToRefs(projectStore);

const currentProject = ref("");
const currentRequirement = ref();
const currentKey = ref("");
const searchValue = ref("");

const currentProjectInfo = computed(() => {
  if (!(projects.value.length && currentProject.value)) {
    return null;
  }
  return projects.value?.find(
    (item) => item._id?.$oid === currentProject.value
  );
});

watch(
  projects,
  () => {
    if (projects.value.length && !currentProject.value) {
      currentProject.value = projects.value[0]._id?.$oid;
    }
  },
  {
    immediate: true,
  }
);

const onSearch = (value) => {
  searchValue.value = value;
};

const getSplitCases = (req) => {
  if (!req.split_files) {
    return [];
  }
  const res = [];
  for (const file of req.split_files) {
    if (file?.split_case?.length) {
      for (const singleCase of file.split_case) {
        if (singleCase.testcases?.length) {
          for (const testcase of singleCase.testcases) {
            testcase.split_case_name = singleCase.testcase_name;
            testcase.split_file_name = file.file_name;
            res.push(testcase);
          }
        }
      }
    }
  }
  return res;
};

const filterTree = (items, searchTerm) => {
  return items
    .map((item) => {
      // 递归过滤子节点
      const children = item.children
        ? filterTree(item.children, searchTerm)
        : [];
      // 检查当前节点或其子节点是否匹配搜索条件
      const matches = item.title.includes(searchTerm) || children.length > 0;
      if (matches) {
        return { ...item, children };
      }
      return null;
    })
    .filter((item) => item !== null);
};

const treeData = computed(() => {
  const searchTerm = searchValue.value?.trim() || "";

  const buildTree = (project) =>
    project.requirement_files && project.requirement_files.length > 0
      ? project.requirement_files.map((req, reqIndex) => {
          const parts = req.name.split("/");
          const fileName = parts.pop();
          return {
            title: fileName,
            key: `${project._id.$oid}-${req.req_id}`,
            fullPath: req.name,
            req: req,
            project: project,
            type: "requirement",
            split_cases: getSplitCases(req),
            children:
              req.split_files && req.split_files.length > 0
                ? req.split_files
                    .filter((x) => x && x.file_name)
                    .map((splitReq, splitReqIndex) => {
                      return {
                        title: splitReq?.file_name.replace(".docx", ""),

                        key: `${project._id.$oid}-${req.req_id}-${splitReq.split_file_id}`,
                        fullPath: splitReq.object_name,
                        splitReq: splitReq,
                        req: req,
                        project: project,
                        type: "sub_requirement",
                        split_cases: (splitReq.split_case || []).map(
                          (singleCase, splitCaseIndex) => {
                            for (const [index, testcase] of (
                              singleCase.testcases || []
                            ).entries()) {
                              testcase.split_case_name =
                                singleCase.testcase_name;
                              testcase.testcaseIndex = index; // 添加index字段，值为当前的顺序
                              testcase.reqIndex = reqIndex;
                              testcase.splitReqIndex = splitReqIndex; // 添加splitReqIndex字段，值为当前的splitReq的顺序
                              testcase.splitCaseIndex = splitCaseIndex;
                            }
                            return singleCase.testcases || [];
                          }
                        ),
                        children:
                          splitReq.split_case && splitReq.split_case.length > 0
                            ? splitReq.split_case.map(
                                (splitCase, splitCaseIndex) => ({
                                  title: splitCase.testcase_name || "",
                                  fullPath: splitCase.testcase_name,
                                  key: `${project._id.$oid}-${req.req_id}-${splitReq.split_file_id}-${splitCase.testcase_id}`,
                                  splitCase: splitCase,
                                  splitReq: splitReq,
                                  req: req,
                                  project: project,
                                  type: "split_case",
                                  children:
                                    splitCase.testcases &&
                                    splitCase.testcases.length > 0
                                      ? splitCase.testcases.map(
                                          (testcase, testcaseIndex) => ({
                                            title: testcase.testcase_name || "",
                                            type: "testcase",
                                            key: `${project._id.$oid}-${req.req_id}-${splitReq.split_file_id}-${splitCase.testcase_id}-${testcase.testcase_id}`,
                                            splitCase: splitCase,
                                            splitReq: splitReq,
                                            req: req,
                                            project: project,
                                            testcase: testcase || [],
                                          })
                                        )
                                      : [],
                                })
                              )
                            : [],
                      };
                    })
                : [],
          };
        })
      : [];

  if (searchTerm === "") {
    return buildTree(currentProjectInfo.value);
  }

  return filterTree(buildTree(projects.value), searchTerm);
});

const typeMap = {
  project: {
    title: "项目",
    icon: ProjectOutlined,
  },
  requirement: {
    title: "需求",
    icon: ProfileOutlined,
    tagType: "primary",
  },
  sub_requirement: {
    title: "功能模块",
    icon: DatabaseOutlined,
    tagType: "warning",
  },
  split_case: {
    title: "功能点",
    icon: ExperimentOutlined,
    tagType: "success",
  },
  testcase: {
    title: "测试用例",
    icon: ApiOutlined,
    tagType: "info",
  },
};

const onSelect = (info) => {
  currentKey.value = info.key;
  if (info.type === "requirement") {
    currentType.value = "requirement";
    currentRequirement.value = info;
  } else if (info.type === "sub_requirement") {
    currentType.value = "sub_requirement";
    currentRequirement.value = info;
  } else if (info.type === "split_case") {
    currentType.value = "split_case";
    currentRequirement.value = info;
  } else if (info.type === "testcase") {
    currentType.value = "testcase";
    currentRequirement.value = info;
  }
};

const selectNodeByKey = async (key) => {
  currentKey.value = key;
  // 手动找到 key 对应的节点，并触发 onSelect
  const findNode = (nodes, targetKey) => {
    for (const node of nodes) {
      if (node.key === targetKey) {
        return node;
      }
      if (node.children) {
        const found = findNode(node.children, targetKey);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  const node = findNode(treeData.value, key);

  onSelect(node);
};

watch(
  currentProject,
  () => {
    if (treeData.value.length) {
      selectNodeByKey(treeData.value[0].key);
    }
  },
  {
    immediate: true,
  }
);
</script>
<style scoped lang="scss">
:deep(.el-table__empty_block) {
  width: 100% !important;
  display: none;
}

.flex-container {
  display: flex;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.flex-item {
  flex: 1 1 calc(33.333% - 1rem);
  /* 每个项目占据1/3的宽度，减去间距 */
  box-sizing: border-box;
  padding: 0.2rem;
}

:deep(.ant-tree-node-content-wrapper) {
  display: flex !important;
}
</style>
