<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

const props = defineProps<{ text: string; link: boolean }>();

const container = ref<HTMLElement | null>(null);
const display = ref(props.text);

let ro: ResizeObserver | null = null;
let measureSpan: HTMLSpanElement | null = null;

/** 创建测量器 */
function createMeasurer() {
  measureSpan = document.createElement("span");
  measureSpan.style.cssText = `
    position: absolute;
    left: -9999px;
    top: -9999px;
    white-space: nowrap;
    pointer-events: none;
  `;
  document.body.appendChild(measureSpan);
}

/** 测量宽度 */
function measureWidth(text: string, target: HTMLElement) {
  if (!measureSpan) return 0;

  const style = getComputedStyle(target);
  measureSpan.style.font = style.font;
  measureSpan.textContent = text;

  return measureSpan.offsetWidth;
}

/** 执行截断 */
function update() {
  const el = container.value;
  if (!el) return;

  const full = props.text;
  display.value = full;

  // 重要：flex:1 时使用 offsetWidth 得到布局后的真实宽度
  const maxWidth = el.offsetWidth;

  const fullWidth = measureWidth(full, el);
  if (fullWidth <= maxWidth) return;

  let left = 0;
  let right = full.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    const head = full.slice(0, Math.ceil(mid / 2));
    const tail = full.slice(full.length - Math.floor(mid / 2));
    const truncated = `${head}...${tail}`;

    const w = measureWidth(truncated, el);

    if (w > maxWidth) {
      right = mid - 1;
    } else {
      display.value = truncated;
      left = mid + 1;
    }
  }
}

onMounted(() => {
  createMeasurer();
  update();

  // 重点：监听 flex 布局实际宽度变化
  ro = new ResizeObserver(() => update());
  ro.observe(container.value!);
});

watch(() => props.text, update);

onBeforeUnmount(() => {
  ro?.disconnect();
  measureSpan?.remove();
});
</script>

<template>
  <span
    ref="container"
    class="ellipsis-container"
    :class="{ 'is-link': props.link }"
  >
    {{ display }}
  </span>
</template>

<style scoped>
.ellipsis-container {
  display: inline-block; /* 防止 flex 自动拉满导致测量错误 */
  overflow: hidden;
  white-space: nowrap;
  width: 100%; /* 承接 flex:1 的宽度 */
}

.is-link {
  cursor: pointer;
  color: var(--VITE_APP_CSS_PRIMARY_COLOR);
}
</style>
