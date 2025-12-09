<template>
  <div class="flex-row flex mt-[20px] mb-[20px] pl-[30px]">
    <a-form :model="searchForm" layout="inline" style="width: 100%">
      <a-row style="width: 100%">
        <a-col :span="10" style="max-width: 300px">
          <a-form-item label="关键字" name="keyword">
            <a-input
              v-model:value="searchForm.keyword"
              placeholder="请输入关键字"
              :allowClear="true"
            />
          </a-form-item>
        </a-col>

        <a-col :span="10" style="max-width: 300px">
          <a-form-item label="可用状态" name="status">
            <a-select
              v-model:value="searchForm.status"
              placeholder="请选择可用状态"
              :allowClear="true"
            >
              <a-select-option :value="0">可用</a-select-option>
              <a-select-option :value="1">不可用</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <div class="flex justify-end">
      <a-button
        type="primary"
        size="large"
        @click="query"
        class="mr-2 flex items-center"
      >
        <SearchOutlined /> 查询
      </a-button>
      <a-button
        type="primary"
        size="large"
        @click="deleteSelectedScript"
        class="mr-2 flex items-center"
      >
        <DeleteOutlined />
        删除
      </a-button>
    </div>
  </div>

  <div class="m-8">
    <a-table
      :columns="columns"
      :row-key="(record) => record.id"
      bordered
      :data-source="pagedDataSource"
      :scroll="{ y: table_height }"
      size="middle"
      :pagination="false"
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange,
        getCheckboxProps: (record) => ({
          disabled: !Boolean(record.info),
        }),
      }"
      childrenColumnName="children"
    >
      <!-- :row-class-name="(_record, index) => (index % 2 === 1 ? 'table-striped' : null)" -->
      <template #bodyCell="{ column, record }">
        <!-- <template v-if="column.key === 'script_name'">
                    <span>{{ record.script_name || record.name || record.status }}</span>
                </template> -->

        <template v-if="column.key === 'type'">
          <span v-if="record.type === 'positive'">正例</span>
          <span v-if="record.type === 'negative'">反例</span>
        </template>

        <template v-if="column.key === 'status' && record.info">
          <!-- <span>{{ actionParmaDisplay(record) }}</span> -->

          <a-select
            :value="record.status"
            style="width: 100%"
            placeholder="请选择"
            @change="updateActionStatus(record, $event)"
          >
            <a-select-option :value="0">不可用</a-select-option>
            <a-select-option :value="1">可用</a-select-option>
          </a-select>
        </template>

        <template v-if="column.key === 'action' && record.info">
          <a-button type="link" size="small" @click="download(record)"
            >下载</a-button
          >
          <a-button type="link" size="small" @click="deleteAction(record.id)"
            >删除</a-button
          >
        </template>
      </template>
    </a-table>

    <div class="mt-[20px] flex justify-end">
      <a-pagination
        v-model:current="currentPage"
        :total="total"
        :page-size="pageSize"
        show-less-items
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { http } from "../../http";
import { ElMessage, ElMessageBox } from "element-plus";
import { cloneDeep } from "lodash-es";
import {
  SearchOutlined,
  DeleteOutlined,
  UploadOutlined,
  PlusOutlined,
} from "@ant-design/icons-vue";
import FileSaver from "file-saver";

const dataSource = ref([]);
const pagedDataSource = ref([]);
const currentPage = ref(1);
const pageSize = 10;
const total = ref(0);

const selectedRowKeys = ref([]);

const searchForm = ref({
  keyword: null,
  status: null,
});

const onSelectChange = (selectedKeys) => {
  selectedRowKeys.value = selectedKeys;
};

const props = defineProps({
  type: {
    type: String,
    default: "",
  },
  id: {
    //
    type: String,
    default: "",
  },
  projectId: {
    type: String,
    default: "",
  },
});

onMounted(() => {
  fetchActions();
});

const updateActionStatus = function (record, status) {
  http
    .post("/api/updateScriptStatus", {
      id: record.id,
      status: status,
    })
    .then((response) => {
      record.status = status;
      ElMessage.success("更新成功");
      fetchActions();
    })
    .catch((error) => {
      // console.error(error);
      // ElMessage.error('更新失败');
    });
};

const fetchActions = () => {
  const start = currentPage.value - 1;

  const params = Object.assign({ start, pagesize: pageSize }, searchForm.value);

  params[props.type + "_id"] = props.id;
  params.projectId = props.projectId;

  http({
    url: "/api/get_scripts",
    params: params,
  })
    .then((response) => {
      response.scripts.forEach((script) => {
        // 如果script的info只有一条，则把里面内容抄到父亲上
        if (script.info.length === 1) {
          script.script_name = script.info[0].script_name;
          script.testcase_id = script.info[0].testcase_id;
          script.version = script.info[0].version;
          script.type = script.info[0].type;
        }

        // 如果大于2条，则展开
        if (script.info.length >= 2) {
          script.children = script.info;
        }
      });
      pagedDataSource.value = response.scripts;

      // console.log(pagedDataSource.value)
      total.value = response.total;
    })
    .catch((error) => {
      console.error(error);
      ElMessage.error("获取数据失败");
    });
};

// const pagedDataSource = computed(() => {
//   // console.log(dataSource.value)
//   // console.log(dataSource.value, 123, result)
//   const start = (currentPage.value - 1) * pageSize;
//   const end = start + pageSize;
//   return dataSource.value.slice(start, end);
// });

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchActions();
};

const table_height = window.innerHeight * 0.6;

function query() {
  fetchActions();
}

const columns = [
  {
    title: "脚本文件ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "对应的台架测试用例",
    dataIndex: "script_name",
    key: "script_name",
    width: "30%",
  },
  {
    title: "用例类型",
    dataIndex: "type",
    key: "type",
    width: 80,
  },
  {
    title: "更新时间",
    dataIndex: "update_at",
    key: "update_at",
    width: 230,
  },
  {
    title: "版本",
    dataIndex: "version",
    key: "version",
  },
  {
    title: "可用状态",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "操作",
    key: "action",
    fixed: "right",
    width: 180,
  },
];

const download = function (record) {
  http
    .post(
      `/api/download_script/${record.id}`,
      {
        scriptId: record.id,
      },
      { responseType: "blob" }
    )
    .then((response) => {
      FileSaver.saveAs(
        new Blob([response], { type: "application/octet-stream" }),
        record.id + "_vtt_export.vtt"
      );
    });
};

const deleteSelectedScript = async () => {
  if (selectedRowKeys.value.length === 0) {
    ElMessage.warning("请选择要删除的项");
    return;
  }

  ElMessageBox.confirm("确定要删除选中的功能模块吗？", "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      const resp = await http.delete("/api/batch_delete_script", {
        data: { ids: selectedRowKeys.value },
      });
      console.log(resp);
      fetchActions();
      selectedIds.value = [];
    } catch (errInfo) {
      // console.error(errInfo);
    }
  });
};
const deleteAction = async (id) => {
  ElMessageBox.confirm("确定要删除选中的功能模块吗？", "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    http
      .delete("/api/delete_script/" + id, {
        id: id,
      })
      .then((res) => {
        ElMessage.success("删除成功");
        fetchActions();
      });
  });
};
</script>

<style>
.ant-table-thead .ant-table-cell {
  color: #909399 !important;
}

:deep(.ant-tree-node-content-wrapper) {
  display: flex !important;
}
</style>
