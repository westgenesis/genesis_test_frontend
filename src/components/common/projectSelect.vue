<template>
    <a-select :value="model" @change="change" placeholder="请选择所属项目">
        <a-select-option v-for="project in projects" :key="project._id.$oid" :value="project._id.$oid">
            {{ project.name }}
        </a-select-option>
    </a-select>

</template>


<script setup lang="ts">

const model = defineModel()
import { onMounted, ref } from "vue";
import { http } from "@/http"

const emit = defineEmits(['selectedObject'])

const projects = ref([])

onMounted(() => {
    http.get('/api/display_user_projects', {}).then(response => {
        projects.value = response.data;
        // console.log(projects.value)
    });
})

function change(key, value) {
    model.value = key

    const result = projects.value.find(p => p._id.$oid === key)

    emit('selectedObject', result)
    // console.log(key, result)
}


</script>


<style scoped></style>