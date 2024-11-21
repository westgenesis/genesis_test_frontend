<template>
    <a-modal :visible="selectBelongsToModalVisible" title="脚本信息" @ok="handleSelectBelongsToOk">
        <a-form-item label="脚本环境">
            <a-radio-group v-model:value="selectForm.selectedBelongsTo">
                <a-radio value="Vector">Vector</a-radio>
                <a-radio value="dSpace">dSpace</a-radio>
                <a-radio value="NI">NI</a-radio>
            </a-radio-group>
        </a-form-item>
        <a-form-item label="Version">
            <a-input v-model:value="selectForm.version" placeholder="请输入版本号" />
        </a-form-item>
        <a-form-item label="Min Required Version">
            <a-input v-model:value="selectForm.minRequiredVersion" placeholder="请输入最小要求版本号" />
        </a-form-item>
        <a-form-item label="Min Required CANoe Version">
            <a-input v-model:value="selectForm.minRequiredCANoeVersion" placeholder="请输入最小要求CANoe版本号" />
        </a-form-item>
    </a-modal>
</template>

<script setup>
import { ref } from 'vue'
import { http } from "@/http"

const props = defineProps(['rowData'])
const emits = defineEmits(['ok'], 'cancel')

const selectForm = ref({
    selectedBelongsTo: 'Vector',
    version: '',
    minRequiredVersion: '',
    minRequiredCANoeVersion: ''
})

const selectBelongsToModalVisible = ref(true)

const handleSelectBelongsToOk = () => {
    if (!selectForm.value.selectedBelongsTo) {
        ElMessage.error('请选择所属对象');
        return;
    }

    // selectBelongsToModalVisible.value = false;

    http.post('/api/generate_script_file', {
        ...props.rowData,
        ...selectForm.value,
    }).then(response => {
        if (response.status === 'need_fill') {
            // const need_fill_result = {
            //     pre_condition_signal: response?.unmatched?.pre_condition_signal,
            //     action_signal: response?.unmatched?.action_signal,
            //     result_signal: response?.unmatched?.result_signal,
            // }
            // showFillModal(need_fill_result);
            ElMessage.success('需要补齐元动作，请去列表补齐！');
            emits('ok')
            emits('cancel')
        } else if (response.status === 'success') {
            ElMessage.success('生成成功, 现在可以下载文件');
            emits('ok')
            emits('cancel')
            // fetchData();
        } else {
            emit('cancel')
            ElMessage.error('生成失败');
        }
    });
};
</script>