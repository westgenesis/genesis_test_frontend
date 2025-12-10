<template>
  <header class="items-center px-5 pt-4">
    <div
      class="flex items-center gap-2 before:content-[''] before:w-1 before:h-5 before:rounded-md before:bg-[#9362f2]"
    >
      <h2 class="text-base font-bold text-gray-700">
        {{ route.meta.title }}
      </h2>

      <!-- <ElIcon size="16" color="#9362f2">
        <component :is="route.meta.icon" v-if="route.meta.icon" />
      </ElIcon> -->
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
</script>
