<template>
  <ElSubMenu
    :index="menuItem.fullPath"
    v-if="menuItem.children && menuItem.children.length"
  >
    <template #title>
      <ElMenuItem
        class="-ml-5"
        :index="menuItem.fullPath"
        :route="{
          path: menuItem.fullPath,
        }"
      >
        <ElIcon>
          <component :is="menuItem.icon" />
        </ElIcon>
        <template #title v-if="!collapse">{{ menuItem.title }}</template>
      </ElMenuItem>
    </template>
    <template v-for="item in menuItem.children" :key="item.fullPath">
      <MenuItem :menuItem="item" collapse />
    </template>
  </ElSubMenu>

  <ElMenuItem
    :index="menuItem.fullPath"
    :route="{
      path: menuItem.fullPath,
    }"
    v-else
  >
    <ElIcon>
      <component :is="menuItem.icon" />
    </ElIcon>
    <template #title>{{ menuItem.title }}</template>
  </ElMenuItem>
</template>

<script setup lang="ts">
import { MenuItem as MenuItemType } from "@/router/index";
interface Props {
  menuItem: MenuItemType;
  collapse?: boolean;
}
defineOptions({
  name: "MenuItem",
});
defineProps<Props>();
</script>
