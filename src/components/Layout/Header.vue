<template>
  <header class="flex justify-between items-center h-14 shadow-sm mb-px px-2">
    <div class="flex justify-between items-center">
      <Logo />
      <Breadcrumb class="flex-1 ml-4" />
      <ProjectSelect class="ml-4!" />
    </div>

    <div class="flex justify-between items-center gap-2 pr-4">
      <Actions />
    </div>
  </header>
</template>

<script setup lang="ts">
import Logo from "./Logo.vue";
import Breadcrumb from "./Breadcrumb.vue";
import ProjectSelect from "./ProjectSelect.vue";
import Actions from "./Actions.vue";
</script>
