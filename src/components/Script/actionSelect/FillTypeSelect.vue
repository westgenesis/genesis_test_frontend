<template>
    <a-modal v-model:open="props.visible" oKText="下一步" @ok="ok" width="500px" @cancel="emit('update:visible', false)">
        <div class="w-[500px] h-[100px] flex justify-between  flex-col  ">
            <div>请选择补充方式</div>
            <a-radio-group v-model:value="checkValue" name="radioGroup" class="ml-[100px] mb-[10px]">
                <a-radio value="1">选择已有</a-radio>
                <a-radio value="2" class="ml-[30px]">新建动作</a-radio>
            </a-radio-group>
        </div>
    </a-modal>
</template>

<script setup>
import { ref, onUpdated } from 'vue';

const props = defineProps(['visible'])
const emit = defineEmits(['close', 'ok', 'update:visible'])

const checkValue = ref('1')

onUpdated(() => {
    checkValue.value = '1'
})

function ok() {
    emit('ok', checkValue.value)
    emit('update:visible', false)
}
</script>

<style scoped></style>