<template>
    <div>Function Points</div>
</template>

<script setup lang="ts">
import { useProjectStore } from '../../stores/project';

const { projects } = useProjectStore();
console.log(projects);

</script>


<style scoped lang="less">

</style>
