<template>
  <div
    class="h-full bg-white relative transition-all duration-300 ease-linear"
    :class="{ 'w-16': isCollapse, 'w-[146px]': !isCollapse }"
  >
    <Menu
      class="h-full overflow-y-auto overflow-x-hidden pb-4"
      :collapse="isCollapse"
    />

    <div class="trigger" @click="toggleExpand" :class="{ rotated: isCollapse }">
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M5.64645 3.14645C5.45118 3.34171 5.45118 3.65829 5.64645 3.85355L9.79289 8L5.64645 12.1464C5.45118 12.3417 5.45118 12.6583 5.64645 12.8536C5.84171 13.0488 6.15829 13.0488 6.35355 12.8536L10.8536 8.35355C11.0488 8.15829 11.0488 7.84171 10.8536 7.64645L6.35355 3.14645C6.15829 2.95118 5.84171 2.95118 5.64645 3.14645Z"
          fill="currentColor"
        ></path>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStorage } from "@vueuse/core";
import Menu from "./Menu.vue";

const isCollapse = useStorage("isCollapse", false);

const toggleExpand = () => {
  isCollapse.value = !isCollapse.value;
};
</script>

<style scoped lang="scss">
$--n-bezier: linear;

.trigger {
  transition: color 0.3s $--n-bezier, right 0.3s $--n-bezier,
    left 0.3s $--n-bezier, border-color 0.3s $--n-bezier,
    background-color 0.3s $--n-bezier, transform 0.3s ease;
  cursor: pointer;
  width: 24px;
  height: 24px;
  position: absolute;
  top: 50%;
  right: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: rgb(51, 54, 57);
  border: 1px solid rgb(239, 239, 245);
  background-color: #fff;
  box-shadow: 0 2px 4px 0px rgba(0, 0, 0, 0.06);
  transform: translateX(50%) translateY(-50%) rotate(0deg);
  z-index: 1;
}

.trigger.rotated {
  transform: translateX(50%) translateY(-50%) rotate(180deg);
}
</style>
