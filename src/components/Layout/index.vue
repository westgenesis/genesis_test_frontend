<template>
  <div class="w-screen h-screen flex flex-col overflow-hidden">
    <LayoutHeader v-if="!$route.meta.hideHeader" />

    <main class="flex-1 flex overflow-hidden">
      <LayoutSidebar v-if="!$route.meta.hideSidebar" />

      <div class="flex-1 overflow-hidden flex flex-col">
        <PageHeader v-if="!$route.meta.hidePageHeader" />
        <div
          class="flex-1 overflow-auto"
          :class="{ 'p-5': !$route.meta.hideDefaultPadding }"
        >
          <AppRouterView />
        </div>
      </div>

      <CANMonitorTab />
    </main>
  </div>
</template>

<script setup lang="ts">
import LayoutHeader from "./Header.vue";
import LayoutSidebar from "./SideBar.vue";
import AppRouterView from "./AppRouterView.vue";
import PageHeader from "./PageHeader.vue";
</script>
