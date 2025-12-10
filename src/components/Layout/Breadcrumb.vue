<template>
  <ElBreadcrumb :separator-icon="ArrowRight" v-if="breadcrumbItems.length > 1">
    <ElBreadcrumbItem
      v-for="(item, index) in breadcrumbItems"
      :key="item.path"
      :to="index === breadcrumbItems.length - 1 ? '' : item.path"
      >{{ item.name }}</ElBreadcrumbItem
    >
  </ElBreadcrumb>
</template>

<script setup lang="ts">
import { ArrowRight } from "@element-plus/icons-vue";
const route = useRoute();
const router = useRouter();

const breadcrumbItems = computed(() => {
  const matched = route.matched;

  return matched
    .filter((item) => item.meta.title)
    .map((item) => {
      // 用当前参数替换掉 :id
      const resolved = router.resolve({
        name: item.name!,
        params: route.params,
        query: route.query,
      });
      return {
        name: item.meta.title,
        path: resolved.fullPath,
      };
    });
});
</script>
