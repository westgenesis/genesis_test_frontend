<template>
  <a-tabs v-model:activeKey="activeTab" @change="tabChange">
    <a-tab-pane key="modules" tab="功能模块列表"></a-tab-pane>
    <a-tab-pane key="points" tab="功能测试用例"></a-tab-pane>
    <a-tab-pane key="testcase_table" tab="台架测试用例"></a-tab-pane>
    <a-tab-pane key="script_table" tab="台架测试脚本"></a-tab-pane>
  </a-tabs>
  <div v-if="activeTab === 'modules'">
    <div
      style="
        border-left: 2px solid var(--VITE_APP_CSS_PRIMARY_COLOR);
        margin-left: 1rem;
        padding-left: 1rem;
      "
    >
      项目信息
    </div>
    <div class="flex-container" style="margin-left: 1rem">
      <div class="flex-item">
        <strong>项目ID:</strong> {{ currentRequirement?.project?._id?.$oid }}
      </div>
      <div class="flex-item">
        <strong>测试环境:</strong> {{ currentRequirement?.project?.kind }}
      </div>
      <div class="flex-item">
        <strong>计划周期:</strong>
        {{ currentRequirement?.project?.period_start }} 至
        {{ currentRequirement?.project?.period_end }}
      </div>
      <div class="flex-item">
        <strong>项目描述:</strong>
        {{ currentRequirement?.project?.notes || "无描述" }}
      </div>
    </div>
    <div
      style="
        border-left: 2px solid var(--VITE_APP_CSS_PRIMARY_COLOR);
        margin-left: 1rem;
        padding-left: 1rem;
        margin-top: 1rem;
        margin-bottom: 1rem;
      "
    >
      功能模块信息
    </div>
    <div class="w-full flex justify-end mr-[2rem] mb-[1rem]">
      <a-button type="primary" @click="fetchData" class="mr-2">刷新</a-button>
      <a-button type="primary" @click="openAddDrawer" class="mr-2"
        >新建功能模块</a-button
      >
      <a-button type="primary" @click="handleBatchSplit" class="mr-2"
        >批量拆分</a-button
      >
      <a-button type="primary" danger @click="handleModuleDelete" class="mr-2"
        >删除</a-button
      >
    </div>
    <div style="width: 100%">
      <el-table
        :data="pagedDataModules"
        style="width: 100%"
        id="function_module_table"
        @selection-change="handleModuleSelectionChange"
      >
        <el-table-column type="selection" width="30" />
        <el-table-column type="expand" width="50">
          <template #default="props">
            <requirement-docx
              :record="props.row"
              :currentRequirement="currentRequirement"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="split_file_id"
          label="功能模块ID"
          width="120px"
        />
        <el-table-column prop="file_name" label="功能模块名称">
          <template #default="scope">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="scope.row.file_name?.replace('.docx', '')"
              placement="top-start"
            >
              <el-button
                type="primary"
                text
                @click="clickTitleModule(scope.row)"
                >{{ scope.row.file_name?.replace(".docx", "") }}</el-button
              ></el-tooltip
            >
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="80px" />
        <el-table-column prop="status" label="状态" width="120px">
          <template #default="scope">
            <a-tag :color="statusMap[scope.row.status] || 'warning'">
              {{ scope.row.status ? scope.row.status : "待操作" }}
            </a-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="拆分进度" width="180px">
          <template #default="scope">
            <div class="w-[180px] overflow-hidden">
              <a-progress
                v-if="
                  scope.row.progress !== undefined &&
                  scope.row.progress !== null
                "
                :percent="scope.row.progress"
                size="small"
                stroke-width="4"
                show-info
              />
              <span v-else>-</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100px">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleSplit(scope.row)"
              :disabled="scope.row.is_table === true"
              >拆分</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <el-pagination
          layout="prev, pager, next"
          :total="totalItems"
          :page-size="pageSizeModules"
          :current-page="currentPageModules"
          @current-change="handleModulePageChange"
        />
      </div>
    </div>
  </div>
  <div v-if="activeTab === 'points'">
    <div style="width: 100%">
      <div class="w-full flex justify-end mr-8 mb-4">
        <a-button type="primary" @click="fetchData" class="mr-2">刷新</a-button>
        <a-button type="primary" @click="handleBatchGenerate" class="mr-2"
          >批量生成用例</a-button
        >
        <a-button
          type="primary"
          danger
          @click="handleBatchDeleteTestcase"
          class="mr-2"
          >删除</a-button
        >
      </div>
      <el-table
        :data="pagedDataPoints"
        style="width: 100%"
        id="function_point_table"
        @selection-change="onPointsSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column type="expand">
          <template #default="scope">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="初始条件">{{
                scope.row.pre_condition
              }}</el-descriptions-item>
              <el-descriptions-item label="触发条件">{{
                scope.row.action
              }}</el-descriptions-item>
              <el-descriptions-item label="预期结果">{{
                scope.row.result
              }}</el-descriptions-item>
            </el-descriptions>
          </template>
        </el-table-column>
        <el-table-column prop="testcase_id" label="功能点ID" :width="140" />
        <el-table-column prop="testcase_name" label="功能点名称">
          <template #default="scope">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="scope.row.testcase_name"
              placement="top-start"
            >
              <MiddleEllipsis
                link
                :text="scope.row.testcase_name"
                @click="clickTitle(scope.row)"
            /></el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="last_modified" label="更新时间" :width="200">
          <template #default="scope">
            {{ formatDateTime(scope.row.last_modified) }}
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" :width="100" />
        <el-table-column prop="status" label="状态" :width="100">
          <template #default="scope">
            {{ scope.row.status ? scope.row.status : "待操作" }}
          </template>
        </el-table-column>
        <el-table-column label="操作" :width="100">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleGenerate(scope.row)"
              >生成用例</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center mt-[1rem]">
        <a-pagination
          v-model:current="currentPagePoints"
          :total="totalItemsPoints"
          :page-size="pageSizePoints"
          :page-size-options="['10', '20', '50']"
          show-size-changer
          @change="handlePointsPageChange"
          @showSizeChange="handlePointsPageSizeChange"
          :show-total="(total) => `共 ${total} 条`"
        />
      </div>
    </div>
  </div>
  <div v-if="activeTab === 'testcase_table'">
    <div style="display: flex; justify-content: flex-end; margin: 1rem">
      <a-button type="primary" @click="handleBatchGenerateScript"
        >生成脚本</a-button
      >
      <a-button type="primary" class="ml-2" @click="handleBatchMergeScript"
        >合成脚本</a-button
      >
      <a-button type="primary" danger class="ml-2" @click="handleBatchDelete"
        >删除</a-button
      >
    </div>
    <el-table
      :data="pagedTableData"
      style="width: 100%"
      id="function_point_table"
      ref="multipleTableRef"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="expand">
        <template #default="scope">
          <div style="padding: 10px">
            <div class="flex" style="border: 1px solid #eee">
              <div
                style="
                  min-width: 110px;
                  background-color: #f2f2f2;
                  padding: 10px;
                  text-align: center;
                "
              >
                初始条件
              </div>
              <div>{{ scope.row.pre_condition }}</div>
            </div>
            <div class="flex" style="border: 1px solid #eee">
              <div
                style="
                  min-width: 110px;
                  background-color: #f2f2f2;
                  padding: 10px;
                  text-align: center;
                "
              >
                初始条件信号
              </div>
              <div>{{ scope.row.pre_condition_signal }}</div>
            </div>
            <div class="flex" style="border: 1px solid #eee">
              <div
                style="
                  min-width: 110px;
                  background-color: #f2f2f2;
                  padding: 10px;
                  text-align: center;
                "
              >
                触发条件
              </div>
              <div>{{ scope.row.action }}</div>
            </div>
            <div class="flex" style="border: 1px solid #eee">
              <div
                style="
                  min-width: 110px;
                  background-color: #f2f2f2;
                  padding: 10px;
                  text-align: center;
                "
              >
                触发条件信号
              </div>
              <div>{{ scope.row.action_signal }}</div>
            </div>
            <div class="flex" style="border: 1px solid #eee">
              <div
                style="
                  min-width: 110px;
                  background-color: #f2f2f2;
                  padding: 10px;
                  text-align: center;
                "
              >
                预期结果
              </div>
              <div>{{ scope.row.result }}</div>
            </div>
            <div class="flex" style="border: 1px solid #eee">
              <div
                style="
                  min-width: 110px;
                  background-color: #f2f2f2;
                  padding: 10px;
                  text-align: center;
                "
              >
                预期结果信号
              </div>
              <div>{{ scope.row.result_signal }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column type="selection" width="50"></el-table-column>
      <el-table-column prop="testcase_id" label="测试用例ID" :width="200" />
      <el-table-column prop="testcase_name" label="测试用例名称">
        <template #default="scope">
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="scope.row.testcase_name"
            placement="top-start"
          >
            <MiddleEllipsis
              link
              :text="scope.row.testcase_name"
              @click="clickTitleTestCase(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="version" label="版本" :width="100" />
      <el-table-column prop="integrity" label="完整性" :width="100">
        <template #default="scope">
          <span v-if="String(scope.row.integrity) === '1'" class="text-red-400"
            >不完整</span
          >
          <span v-if="String(scope.row.integrity) === '0'">完整</span>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="用例类型" :width="100">
        <template #default="scope">
          {{ scope.row.type === "positive" ? "正例" : "反例" }}
        </template>
      </el-table-column>
      <el-table-column prop="is_generalized" label="是否泛化" :width="200">
        <template #default="scope">
          {{ scope.row.is_generalized ? "泛化用例" : "非泛化用例" }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" :width="100">
        <template #default="scope">
          {{ scope.row.status ? scope.row.status : "待操作" }}
        </template>
      </el-table-column>
      <el-table-column label="操作" :width="250">
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleGenerateScript(scope.row)"
            >生成脚本</el-button
          >
          <el-button type="danger" size="small" @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <a-pagination
      v-model:current="currentPage"
      v-model:pageSize="pageSize"
      :total="testcaseTableData.length"
      show-size-changer
      :page-size-options="['10', '20', '50']"
      @change="handlePageChange"
      @showSizeChange="handlePageSizeChange"
      style="margin-top: 1rem; text-align: center"
    />
  </div>

  <ScriptList
    v-if="activeTab === 'script_table'"
    type="requirement"
    :id="req_id"
    :projectId="project_id"
  ></ScriptList>
  <AddModuleDrawer
    :visible="drawerVisible"
    @close="closeAddDrawer"
    @save="saveNewModule"
    :currentRequirement="currentRequirement"
  />

  <GenerateScript
    v-if="generateScriptVisible"
    @cancel="generateScriptVisible = false"
    :row-data="genScriptRow"
    @ok="fetchData"
    @fill="fetchData"
  >
  </GenerateScript>
  <BatchGenerateScript
    v-if="batchGenerateScriptVisible"
    @cancel="batchGenerateScriptVisible = false"
    :row-data="batchGenScriptRows"
    @ok="fetchData"
    :type="batchType"
    @fill="fetchData"
  >
  </BatchGenerateScript>
</template>

<script setup lang="ts">
import {
  onMounted,
  watch,
  defineProps,
  computed,
  ref,
  onUpdated,
  nextTick,
} from "vue";
import { http } from "../../http";
import { ElMessage, ElMessageBox } from "element-plus";
import { useProjectStore } from "../../stores/project";
import GenerateScript from "./GenerateScript.vue";
import BatchGenerateScript from "./BatchGenerateScript.vue";
import { message } from "ant-design-vue";
import ScriptList from "./ScriptList.vue";
import { formatDateTime } from "@/utils/formatters.ts";
import MiddleEllipsis from "@/components/MiddleEllipsis.vue";

const multipleTableRef = ref<any>();
const generateScriptVisible = ref(false);
const genScriptRow = ref<any>({});

// 单条生成脚本
const handleGenerateScript = function (row) {
  genScriptRow.value = row;
  genScriptRow.value.project_id = project_id.value;
  genScriptRow.value.req_id = req_id.value;

  generateScriptVisible.value = true;
};

const batchGenerateScriptVisible = ref(false);
const batchGenScriptRows = ref<any[]>([]);
const batchType = ref("gen");

// 批量生成脚本
const handleBatchGenerateScript = function (type = "gen") {
  if (selectedRows.value.length === 0) {
    message.error("您没有选中数据");
    return;
  }

  console.log(selectedRows.value);
  batchType.value = type;

  // 修正值
  selectedRows.value.forEach((it) => {
    it.project_id = project_id.value;
    it.req_id = req_id.value;
  });

  batchGenScriptRows.value = selectedRows.value;
  batchGenerateScriptVisible.value = true;
};

const handleBatchMergeScript = function () {
  if (selectedRows.value.length < 2) {
    ElMessage.error("您需要选中至少2条数据");
    return;
  }

  batchType.value = "merge";
  handleBatchGenerateScript("merge");
};

const { refreshAllProjects } = useProjectStore();
const activeTab = ref("modules");
const props = defineProps({
  currentRequirement: {
    type: Object,
  },
  selectNodeByKey: {
    type: Function,
  },
});

const { currentRequirement } = props;
const moduleTableData = ref([]);
const pointsTableData = ref([]);
const testcaseTableData = ref([]);
// 监听 currentRequirement 的变化
const project_id = computed(() => {
  return props.currentRequirement?.project?._id?.$oid;
});
const req_id = computed(() => {
  return props.currentRequirement.req.req_id;
});

const fetchData = () => {
  return http
    .post("/api/query_requirement_by_id", {
      project_id: project_id.value,
      req_id: req_id.value,
    })
    .then((resp) => {
      console.log(resp);
      moduleTableData.value = resp.split_files;
      pointsTableData.value = resp.split_cases;
      testcaseTableData.value = resp.testcases;
      currentPage.value = 1;
      currentPagePoints.value = 1;
    })
    .then(() => {
      refreshAllProjects();

      if (multipleTableRef.value) {
        tabChange("testcase_table");
      }
    });
};

function tabChange(e) {
  nextTick(() => {
    if (e === "testcase_table") {
      // 恢复补齐的勾选 select_requirement

      let fillSelectIds = localStorage.getItem("select_requirement");

      if (!fillSelectIds) {
        return;
      }

      fillSelectIds = JSON.parse(fillSelectIds);

      const selectedDatas = pagedTableData.value.filter((it) =>
        fillSelectIds.includes(it.testcase_id)
      );

      selectedDatas.forEach((row) => {
        multipleTableRef.value.toggleRowSelection(row, true);
      });
    }
  });
}

const selectedRowsModule = ref([]);

const handleModuleSelectionChange = (rows) => {
  selectedRowsModule.value = rows;
};

onMounted(() => {
  fetchData();
});

watch([project_id, req_id], () => {
  fetchData();
});

const statusMap = {
  待操作: "warning",
  正在拆分: "processing",
  拆分完成: "success",
  拆分过程中出错: "error",
};

const currentPageModules = ref(1);
const pageSizeModules = ref(10);

const pagedDataModules = computed(() => {
  const start = (currentPageModules.value - 1) * pageSizeModules.value;
  const end = start + pageSizeModules.value;
  return moduleTableData.value?.slice(start, end) || [];
});

const handleModuleDelete = () => {
  if (selectedRowsModule.value.length === 0) {
    ElMessage.warning("请选择要删除的功能模块");
    return;
  }

  ElMessageBox.confirm("确定要删除选中的功能模块吗？", "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const split_file_ids = selectedRowsModule.value.map(
        (row) => row.split_file_id
      );
      const deleteSplitRequireParams = {
        project_id: project_id.value,
        req_id: req_id.value,
        split_file_ids,
      };

      http
        .post("/api/delete_function_module", deleteSplitRequireParams)
        .then((res) => {
          if (res) {
            ElMessage.success("删除成功");
            fetchData();
          } else {
            ElMessage.error("删除失败");
          }
        });
    })
    .catch(() => {
      ElMessage.info("已取消删除操作");
    });
};

const totalItems = computed(() => moduleTableData.value?.length || 0);

const handleModulePageChange = (page: number) => {
  currentPageModules.value = page;
};

const drawerVisible = ref(false);

const openAddDrawer = () => {
  drawerVisible.value = true;
};

const closeAddDrawer = async () => {
  drawerVisible.value = false;
  refreshAllProjects();
};

const handleSplit = (row: any) => {
  ElMessageBox.confirm("拆分会覆盖当前模块的已有功能点，是否继续？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const params = {
        project_id: project_id.value,
        ...row,
        req_id: req_id.value,
      };
      ElMessage.success(
        "已下发功能点拆解任务，请等待或刷新后去功能点页面查看结果"
      );
      http.post("/api/subrequire_generate_points", params).then((res) => {
        console.log(res);
      });
    })
    .catch(() => {
      // 用户点击取消，不做任何操作
      ElMessage.info("已取消拆分操作");
    });
};

const saveNewModule = (module) => {
  closeAddDrawer();
  fetchData();
};

const handleBatchSplit = () => {
  if (selectedRowsModule.value.length === 0) {
    ElMessage.warning("请选择要拆分的功能模块");
    return;
  }

  ElMessageBox.confirm("拆分会覆盖当前模块的已有功能点，是否继续？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const params = selectedRowsModule.value.map((row) => ({
        project_id: project_id.value,
        object_name: row.object_name,
        split_file_id: row.split_file_id,
        version: row.version,
        req_id: req_id.value,
      }));

      http.post("/api/subrequire_batch_generate_points", params).then((res) => {
        if (res) {
          ElMessage.success("已下发功能点拆解任务，请等待或刷新后查看结果");
          refreshAllProjects();
        } else {
          ElMessage.error("拆分失败");
        }
      });
    })
    .catch(() => {
      ElMessage.info("已取消拆分操作");
    });
};

// =======points=======

const selectedRowsPoints = ref([]);
const onPointsSelectionChange = (rows) => {
  console.log(1);
  selectedRowsPoints.value = rows;
};

const clickTitle = (row) => {
  console.log(row);
  props.selectNodeByKey(
    [project_id.value, req_id.value, row.split_file_id, row.testcase_id].join(
      "-"
    )
  );
};

const clickTitleModule = (row) => {
  props.selectNodeByKey(
    [project_id.value, req_id.value, row.split_file_id].join("-")
  );
};

const clickTitleTestCase = (row) => {
  console.log(row);
  props.selectNodeByKey(
    [
      project_id.value,
      req_id.value,
      row.split_file_id,
      row.split_case_id,
      row.testcase_id,
    ].join("-")
  );
};

const handleBatchGenerate = () => {
  if (selectedRowsPoints.value.length === 0) {
    ElMessage.warning("请选择要生成用例的功能模块");
    return;
  }

  ElMessageBox.confirm("生成用例会覆盖当前模块的已有用例，是否继续？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const points = selectedRowsPoints.value.map((row) => ({
        ...row,
        project_id: project_id.value,
        split_file_id: row.split_file_id,
        req_id: req_id.value,
        split_case_id: row.testcase_id,
        index_name: props.currentRequirement?.project?.index_name,
      }));

      http
        .post("/api/generate_testcases_by_points", { points })
        .then(async (response) => {
          if (response?.status === "OK") {
            ElMessage.success("已下发生成用例任务");
            await refreshAllProjects();
          } else {
            ElMessage.error("下发生成用例任务失败");
          }
        });
    })
    .catch(() => {
      ElMessage.info("已取消生成用例操作");
    });
};

const handleGenerate = (row) => {
  const split_file_id = row.split_file_id;
  const split_case_id = row.testcase_id;
  const singleCase = {
    ...row,
    project_id: project_id.value,
    split_file_id,
    req_id: req_id.value,
    split_case_id,
    index_name: props.currentRequirement?.project?.index_name,
  };
  delete singleCase.testcases;
  http
    .post("/api/generate_testcases_by_points", {
      points: [singleCase],
    })
    .then(async (response) => {
      if (response?.status === "OK") {
        ElMessage.success("已下发生成用例任务");
      } else {
        ElMessage.error("下发生成用例任务失败");
      }
    });
};

// 分页相关变量和方法
const currentPagePoints = ref(1);
const pageSizePoints = ref(10);
const totalItemsPoints = computed(() => pointsTableData.value?.length || 0);

const pagedDataPoints = computed(() => {
  const start = (currentPagePoints.value - 1) * pageSizePoints.value;
  const end = start + pageSizePoints.value;
  return pointsTableData.value?.slice(start, end) || [];
});

const handlePointsPageChange = (page: number) => {
  currentPagePoints.value = page;
};

const handlePointsPageSizeChange = (current: number, size: number) => {
  pageSizePoints.value = size;
  currentPagePoints.value = 1; // 重置为第一页
};

// =============testcase=======

const currentPage = ref(1);
const pageSize = ref(10);

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const pagedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return testcaseTableData.value.slice(start, end);
});

const handlePageSizeChange = (current: number, size: number) => {
  pageSize.value = size;
  currentPage.value = 1; // 切换每页条数时，重置到第一页
};

const handleDelete = (row) => {
  const rows = [row];
  const params = rows.map((row) => ({
    project_id: project_id.value,
    req_id: req_id.value,
    split_file_id: row.split_file_id,
    split_case_id: row.split_case_id,
    testcase_id: row.testcase_id,
  }));

  http.post("/api/delete_testcases", params).then((response) => {
    if (response.status === "OK") {
      ElMessage.success("删除成功");
      fetchData();
      currentRequirement.value.splitCase.testcases = response.testcases;
    } else {
      ElMessage.error("删除失败");
    }
  });
};

const selectedRows = ref([]);

const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请选择要删除的测试用例");
    return;
  }

  const params = selectedRows.value.map((row) => ({
    project_id: project_id.value,
    req_id: req_id.value,
    split_file_id: row.split_file_id,
    split_case_id: row.split_case_id,
    testcase_id: row.testcase_id,
  }));

  http.post("/api/delete_testcases", params).then((response) => {
    if (response.status === "OK") {
      ElMessage.success("批量删除成功");
      fetchData();
    } else {
      ElMessage.error("批量删除失败");
    }
  });
};
const handleBatchDeleteTestcase = () => {
  if (selectedRowsPoints.value.length === 0) {
    ElMessage.warning("请选择要删除的测试用例");
    return;
  }

  const params = {
    project_id: project_id.value,
    req_id: req_id.value,
    testcase_ids: selectedRowsPoints.value.map((row) => row.testcase_id),
  };

  http.post("/api/batch_delete_testcases", params).then((response) => {
    if (response.status === "OK") {
      ElMessage.success("批量删除成功");
      fetchData();
    } else {
      ElMessage.error("批量删除失败");
    }
  });
};
</script>

<style scoped lang="scss">
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
</style>
