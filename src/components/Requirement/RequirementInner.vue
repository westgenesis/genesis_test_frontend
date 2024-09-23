<template>
    <div>RequirementInner</div>
</template>

<script setup lang="ts">
import { onMounted, watch, defineProps, computed } from 'vue';

const props = defineProps({
    currentRequirement: {
        type: Object,
    }
});

// 监听 currentRequirement 的变化
const project_id = computed(() => {
    return props.currentRequirement?.project?._id?.$oid;
})
const req_id = computed(() => {
    return props.currentRequirement.req.req_id;
})
</script>

<style scoped lang="less">

</style>