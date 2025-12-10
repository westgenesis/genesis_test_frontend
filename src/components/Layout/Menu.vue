<template>
  <ElMenu router :default-active="activeIndex" :collapse="collapse">
    <MenuItem
      v-for="(item, index) in menus"
      :key="index"
      :menuItem="item"
      :collapse="collapse"
    />
  </ElMenu>
</template>

<script setup lang="ts">
import { menus } from "@/router/index";
import MenuItem from "./MenuItem.vue";

interface Props {
  collapse: boolean;
}

defineProps<Props>();

const route = useRoute();

const activeIndex = computed(() => {
  const matched = route.matched;
  if (matched.length) {
    return matched[matched.length - 1].path;
  }
  return "";
});
</script>
