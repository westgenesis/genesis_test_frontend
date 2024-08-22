<template>
  <a-modal title="历史版本信息" :visible="visible" @cancel="handleCancel" @ok="handleOk" width="800px">
    <div>
      <a-table :columns="columns" :data-source="historyData" row-key="id" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a @click="handleViewDetail(record)">查看详情</a>
          </template>
        </template>
      </a-table>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  historyData: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:visible', 'viewDetail']);

const columns = [
  {
    title: '版本号',
    dataIndex: 'version',
    key: 'version',
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
  },
  {
    title: '操作',
    key: 'action',
    scopedSlots: { customRender: 'action' },
  },
];

const handleCancel = () => {
  emit('update:visible', false);
};

const handleOk = () => {
  emit('update:visible', false);
};

const handleViewDetail = (record) => {
  emit('viewDetail', record);
};
</script>

<style scoped lang="less">
/* 你可以在这里添加自定义样式 */
</style>