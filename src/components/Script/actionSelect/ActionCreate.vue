<template>

  <div class="max-h-[70vh] min-h-[50vh] overflow-hidden overflow-y-auto pr-[30px]">
    <a-tabs v-model:activeKey="activeTab" @change="query" class="ml-[30px]">
      <a-tab-pane key="1" tab="新建 元动作-IO信号"></a-tab-pane>
      <a-tab-pane key="2" tab="新建 元动作-总线信号"></a-tab-pane>
      <a-tab-pane key="3" tab="新建 动作组合"></a-tab-pane>
    </a-tabs>

    <MetaIOEdit v-if="activeTab === '1'" :status="status" :data="editData" @close="emit('close')" :onlyOneStatus="true"
      @success="emit('select', $event.name + '=' + $event.values[0].status)">
    </MetaIOEdit>
    <MetaCANEdit v-if="activeTab === '2'" :status="status" :data="editData"
      @success="emit('select', $event.name + '=' + $event.values[0].value)" :onlyOneStatus="true" @close="emit('close')">
    </MetaCANEdit>
    <ACEdit v-if="activeTab === '3'" :status="status" :data="editData" @success="emit('select', +'=' + $event.name)"
      @close="emit('close')"></ACEdit>

  </div>
</template>

<script setup>
import { ref } from 'vue';

import MetaIOEdit from '@/components/Script/MetaIOEdit.vue'
import MetaCANEdit from '@/components/Script/MetaCANEdit.vue'
import ACEdit from '@/components/Script/ACEdit.vue';

const emit = defineEmits(['select', 'close'])

const activeTab = ref('1')
const status = ref('new')
const editData = ref({})


</script>

<style scoped></style>