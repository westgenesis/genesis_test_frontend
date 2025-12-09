<!-- 动作组合编辑 -->
<template>
  <a-form :model="formData" :rules="rules" layout="vertical" ref="formRef">
    <a-form-item label="动作组合名称" name="name">
      <a-input v-model:value="formData.name" placeholder="请输入内容" />
    </a-form-item>

    <a-form-item label="动作组合描述" name="description">
      <a-input v-model:value="formData.description" placeholder="请输入内容" />
    </a-form-item>

    <a-form-item label="所属项目" name="projectId">
      <Project
        v-model="formData.projectId"
        @selectedObject="formData.projectName = $event.name"
      ></Project>
    </a-form-item>

    <a-form-item label="动作组合编辑" name="expression">
      <div class="flex">
        <a-textarea
          v-model:value="formData.expression"
          :allowClear="true"
          placeholder="请输入内容"
          :readonly="true"
        />
        <a-button
          type="primary"
          class="ml-[15px]"
          :disabled="history.length === 0"
          @click="historyBack()"
          >回退</a-button
        >
        <a-button type="primary" class="ml-[15px]" @click="clearAll"
          >清除</a-button
        >
      </div>
    </a-form-item>
  </a-form>

  <div class="border border-inherit rounded p-[20px] mb-[20px]">
    <div class="mb-[10px]">
      操作符：<a-tag
        @click="actionClick(obj)"
        v-for="obj in orperations"
        :key="obj.name"
        color="red"
        class="cursor-pointer"
        >{{ obj.name }}</a-tag
      >
    </div>
    <div class="min-h-[42px]">
      元动作：<a-tag
        @click="actionClick(obj)"
        v-for="obj in names"
        :key="obj"
        color="processing"
        class="cursor-pointer mb-[20px]"
        >{{ obj.name }}</a-tag
      >
    </div>
    <a-button type="primary" @click="transVisible = true">添加元动作</a-button>
  </div>

  <a-modal
    v-model:open="transVisible"
    title="请选择元动作"
    okText="确定"
    @ok="transVisible = false"
    cancelText="取消"
  >
    <a-transfer
      v-model:target-keys="targetKeys"
      :render="(item) => item.name"
      :data-source="transferData"
      :one-way="true"
      :titles="['  未选择', '  已选择']"
      :rowKey="(obj) => obj._id"
      :filter-option="filterOption"
      pagination
      show-search
    />
  </a-modal>

  <!-- <a-modal v-model:open="transVisible" title="请选择元动作" okText="确定" @ok="transVisible = false" cancelText="取消">
        <a-transfer v-model:target-keys="targetKeys" :render="item => item.name" :data-source="transferData"
            :one-way="true" :titles="['  未选择', '  已选择']" :rowKey="(obj) => obj._id" @change="change"
            :filter-option="filterOption" pagination show-search />
    </a-modal> -->

  <div slot="footer" class="flex justify-end">
    <a-button class="mr-2" type="primary" @click="emit('close')" size="large"
      >关闭</a-button
    >
    <a-button class="mr-2" type="primary" @click="handleEditOk" size="large"
      >提交</a-button
    >
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import Project from "@common/projectSelect.vue";
import { http } from "@/http";
import { cloneDeep, isEmpty, last } from "lodash-es";
import { ElMessage } from "element-plus";

const transVisible = ref(false);

const defaultData = {
  name: "",
  description: "",
  expression: "",
  projectId: null,
  projectName: "",
};

const props = defineProps({
  status: {
    type: String,
    default: "new",
  },
  data: {
    type: Object,
    default: {},
  },
  description: {
    type: String,
    default: "",
  },
});

const formData = ref(cloneDeep(defaultData));
const history = ref([]);

function historyBack() {
  history.value.pop();
  formData.value.expression = genExpress();
}

// 生成表达式
function genExpress() {
  let strArr = [];

  history.value.forEach((op) => {
    if (op.type === "action") {
      strArr.push(op.name);
      return;
    }

    if (op.name === "()") {
      strArr.unshift("(");
      strArr.push(")");
      return;
    }

    strArr.push(op.name);
  });

  return strArr.join("");
}

function getBarretCount() {
  let leftCount = 0,
    rightCount = 0;
  history.value.forEach((op) => {
    if (op.type === "operation" && op.name === "(") {
      leftCount++;
    }

    if (op.type === "operation" && op.name === ")") {
      rightCount++;
    }
  });

  return [leftCount, rightCount];
}

function isExpressionValid() {
  // 左右括号数量不匹配，不合法
  const [left, right] = getBarretCount();
  if (left != right) {
    return false;
  }

  const lastEle = last(history.value);
  if (["&", "||"].includes(lastEle.name)) {
    return false;
  }

  return true;
}

function isValid(modi) {
  console.log(modi);

  if (modi.type === "action") {
    const lastEle = last(history.value);

    //空的时候OK
    if (lastEle == undefined) {
      return true;
    }

    // name失败
    if (lastEle.type === "action") {
      return false;
    }

    //左括号OK
    //操作符后OK
    return ![")", "()"].includes(lastEle.name);
  }

  // 逻辑表达式
  if (["&", "||"].includes(modi.name)) {
    // ),(),操作数 后面可以跟逻辑表达式合法

    const lastEle = last(history.value);
    if (!lastEle) {
      return false;
    }

    if ([")", "()"].includes(lastEle.name)) {
      return true;
    }

    return lastEle.type === "action";
  }

  if (modi.name === "()") {
    // 操作数, ) 后面可以跟

    const lastEle = last(history.value);
    if (!lastEle) {
      return false;
    }
    return lastEle.type === "action" || lastEle.name === ")";
  }

  // 左括号
  if (modi.name === "(") {
    // 空,操作符后面可以跟
    const lastEle = last(history.value);
    if (!lastEle) {
      return true;
    }

    return ["&", "||"].includes(lastEle.name);
  }

  // 右括号
  // 1前面右数量括号，少于左括号时
  // 操作数,或右括号
  if (modi.name === ")") {
    // 空,操作符后面可以跟
    const lastEle = last(history.value);
    if (!lastEle) {
      return false;
    }

    if (["&", "||", "("].includes(lastEle.name)) {
      return false;
    }

    let leftCount = 0,
      rightCount = 0;
    history.value.forEach((op) => {
      if (op.type === "operation" && op.name === "(") {
        leftCount++;
      }

      if (op.type === "operation" && op.name === ")") {
        rightCount++;
      }
    });

    return rightCount < leftCount;
  }
}

function clearAll() {
  history.value = [];
  formData.value.expression = "";
}

const orperations = [
  {
    type: "operation",
    name: "&",
  },
  {
    type: "operation",
    name: "||",
  },
  {
    type: "operation",
    name: "()",
  },
  {
    type: "operation",
    name: "(",
  },
  {
    type: "operation",
    name: ")",
  },
];

const names = computed(() => {
  return targetKeys.value.map((key) => {
    let obj = transferData.value.find((it) => it._id === key);
    obj.type = "action";

    return obj;
  });
});

const emit = defineEmits(["close", "success"]);

const actionClick = function (oper) {
  if (!isValid(oper)) {
    ElMessage.error("不可进行此项操作！");
    return;
  }

  history.value.push(oper);

  formData.value.expression = genExpress();
};

const targetKeys = ref([]);
const transferData = ref([]);

onMounted(() => {
  if (props.status === "edit" || props.status === "copy") {
    formData.value = cloneDeep(props.data);
    console.log(props.data.history);
    history.value = props.data.history;
  }

  // 从台架测试用例详情页抄过来
  if (props.status === "new" && props.description) {
    formData.value.description = props.description;
  }

  fetchActions();
});

const fetchActions = () => {
  http({
    url: "/api/get_actions",
    params: {
      start: 0,
      pagesize: 20000,
    },
  }).then((response) => {
    let result = [];

    response.actions.forEach((action) => {
      if (isEmpty(action.values)) {
        return;
      }

      action.values.forEach((it, index) => {
        // Vector_IO
        let name = action.name + "=" + it.status;

        // Vector_CAN
        if (action.belongs_to === "Vector_CAN") {
          name = action.name + "=" + it.value;
        }

        result.push({
          name: name,
          actionName: action.name,
          value: it.value,
          _id: action._id + "_" + index,
        });
      });
    });

    transferData.value = result;
  });
};

const rules = {
  name: [{ required: true, message: "请输入动作组合名称" }],
  description: [{ required: true, message: "请输入动作组合描述" }],
  expression: [{ required: true, message: "请编辑动作组合" }],
  projectId: [{ required: true, message: "请选择项目" }],
};

const formRef = ref();
const handleEditOk = async () => {
  // console.log(formData.value)
  formRef.value.validate().then(() => {
    // console.log(formData.value)

    if (!isExpressionValid()) {
      ElMessage.error("表达式不完整，请检查！");
      return;
    }
    // return;
    formData.value.history = history.value;
    formData.value.actions = history.value
      .filter((it) => it.type === "action")
      .map((it) => {
        return { key: it.actionName, value: it.value };
      });

    let res = null;
    if (props.status === "new" || props.status === "copy") {
      res = http.post("/api/action_combinations", formData.value);
    } else {
      res = http.put(
        `/api/action_combinations/${formData.value._id}`,
        formData.value
      );
    }

    res.then(
      () => {
        ElMessage.success("操作成功");
        emit("close");
        emit("success", formData.value);
      },
      (err) => {
        ElMessage.error(err);
      }
    );
  });
};

const filterOption = (inputValue, option) => {
  return (
    option.name.toUpperCase().indexOf(String(inputValue).toUpperCase()) > -1
  );
};
</script>

<style></style>
