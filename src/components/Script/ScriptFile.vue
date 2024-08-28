<template>
    <div>
        ScriptFile
    </div>
</template>

<script setup lang="ts">
import { useProjectStore } from '../../stores/project';
import { ref, computed, onUpdated, onMounted } from 'vue';
import type { TreeProps } from 'ant-design-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useProductFetch } from '../../handler/handler';
import { http } from '../../http';
import { storeToRefs } from 'pinia';

</script>


<style scoped lang="less">

</style>
