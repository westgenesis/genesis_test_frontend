<template>
  <RouterView v-slot="{ Component }">
    <component
      :is="Component"
      :key="$route.fullPath"
      v-if="$route.meta.hideTransition"
    />

    <PageTransition v-else>
      <component :is="Component" :key="$route.fullPath" />
    </PageTransition>
  </RouterView>
</template>

<script setup lang="ts">
import PageTransition from "@/components/PageTransition.vue";
</script>
