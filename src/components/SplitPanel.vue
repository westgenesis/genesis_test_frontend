<template>
  <div class="split-pane-container" :style="containerStyle">
    <div
      v-for="(pane, index) in paneCount"
      :key="index"
      :class="['split-pane-item', `pane-${index}`]"
    >
      <slot :name="`pane-${index}`"></slot>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";
import Split from "split.js";

const props = defineProps({
  // 定义窗格的数量。每个窗格将有一个对应的插槽。
  paneCount: {
    type: Number,
    required: true,
    validator: (value) => value >= 2,
  },
  // 分隔的方向（'vertical' 或 'horizontal'）
  direction: {
    type: String,
    default: "horizontal", // 默认为水平分隔
    validator: (value) => ["horizontal", "vertical"].includes(value),
  },
  // 窗格的初始大小（百分比数组）
  sizes: {
    type: Array,
    default: () => [], // 例如：[25, 75]
  },
  // 每个窗格的最小尺寸（像素）
  minSize: {
    type: [Number, Array],
    default: 0,
  },
  // 间隔器大小（像素）
  gutterSize: {
    type: Number,
    default: 5,
  },
  snapOffset: {
    type: Number,
    default: 30,
  },
  cursor: {
    type: String,
    default: "ew-resize", // 默认水平调整光标
  },
});

const emit = defineEmits(["drag-start", "drag", "drag-end"]);

const splitInstance = ref(null);
const splitPaneContainerRef = ref(null); // 用于获取容器的 DOM 引用

const containerStyle = computed(() => {
  // 根据分隔方向设置 flex 方向
  return {
    display: "flex",
    flexDirection: props.direction === "horizontal" ? "row" : "column",
    height: "100%", // 确保容器占据可用高度
    width: "100%", // 确保容器占据可用宽度
    overflow: "hidden", // 防止内部内容滚动条影响布局
  };
});

const initializeSplit = () => {
  if (splitInstance.value) {
    splitInstance.value.destroy(); // 创建新实例前销毁现有实例
  }

  const elements = [];
  // `splitPaneContainerRef.value` 是组件的根 DOM 元素
  if (splitPaneContainerRef.value) {
    for (let i = 0; i < props.paneCount; i++) {
      const paneElement = splitPaneContainerRef.value.querySelector(
        `.pane-${i}`
      );
      if (paneElement) {
        elements.push(paneElement);
      } else {
        console.warn(`SplitPane: 未找到窗格元素 .pane-${i}。请确保为 paneCount 提供了足够的内
容。`);
      }
    }
  }

  if (elements.length < 2) {
    console.error("SplitPane: 初始化 split.js 需要至少 2 个窗格元素。");
    return;
  }

  splitInstance.value = Split(elements, {
    direction: props.direction,
    sizes:
      props.sizes.length === props.paneCount
        ? props.sizes
        : Array(props.paneCount).fill(100 / props.paneCount),
    minSize: props.minSize,
    gutterSize: props.gutterSize,
    snapOffset: props.snapOffset,
    cursor: props.cursor,
    // 事件处理程序（可选）
    onDragStart: () => emit("drag-start"),
    onDrag: () => emit("drag"),
    onDragEnd: (sizes) => emit("drag-end", sizes),
  });
};

const reinitializeSplit = () => {
  // 简单地重新初始化，销毁旧实例并创建新实例
  initializeSplit();
};

// 在组件挂载后执行初始化
onMounted(() => {
  // 将组件的根 DOM 元素赋值给 splitPaneContainerRef
  // 当模板中的根元素是一个 `ref` 时，它会自动被 Vue 填充
  // 如果根元素不是 ref，或者有多个根元素，需要更具体的查找
  splitPaneContainerRef.value = document.querySelector(".split-pane-container"); // 确保这里的选择器能唯一匹配到当前组件实例的根元素
  nextTick(() => {
    initializeSplit();
  });
});

// 在组件卸载前销毁 split.js 实例
onBeforeUnmount(() => {
  if (splitInstance.value) {
    splitInstance.value.destroy();
    splitInstance.value = null;
  }
});

// 监听 props 变化，以便在配置改变时重新初始化
watch(
  () => [
    props.direction,
    props.sizes,
    props.minSize,
    props.gutterSize,
    props.paneCount,
  ],
  () => {
    reinitializeSplit();
  },
  { deep: true } // 对于数组或对象类型的 prop，需要深度监听
);
</script>

<style>
.gutter {
  width: 2px;
  background-color: #eee;
  background-repeat: no-repeat;
  background-position: 50%;
}

.gutter.gutter-horizontal {
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==");
  cursor: col-resize;
}

.gutter.gutter-vertical {
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFAQMAAABo7865AAAABlBMVEVHcEzMzMzyAv2sAAAAAXRSTlMAQObYZgAAABBJREFUeF5jOAMEEAIEEFwAn3kMwcB6I2AAAAAASUVORK5CYII=");
  cursor: row-resize;
}
</style>

<style scoped>
.split-pane-container {
  width: 100%;
  height: 100%;
}

.split-pane-item {
  overflow: auto;
}
</style>
