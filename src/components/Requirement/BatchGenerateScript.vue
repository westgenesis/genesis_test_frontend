<template>
    <a-modal :open="selectBelongsToModalVisible" title="脚本信息" @ok="verify" @cancel="emit('cancel')">
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

    <a-modal :open="lackDataVisible" title="" @cancel="emit('cancel')" :footer="null" width="750px">

        <a-result status="warning" title="警告提示">
            <template #extra>
                <div>所选的用例中，存在信号缺失的情况，合并生成的脚本文件不可用，您可以选择以下操作：</div>

                <div class="mt-[20px]">
                    <a-button type="primary" @click="fill">补充对应动作</a-button>
                    <a-button type="primary" class="ml-[20px]" @click="handleSelectBelongsToOk('skip')"
                        v-if="props.type !== 'merge'">跳过缺失继续生成</a-button>
                    <a-button type="primary" class="ml-[20px]" @click="go">跳转动作库</a-button>
                    <!-- <a-button type="primary" class="ml-[20px]" @click="handleSelectBelongsToOk('continue')">继续生成</a-button> -->
                </div>

                <div v-if="props.type === 'merge'" class="mt-[20px]">提醒：跳转动作库补充信号动作后，需重新生成台架测试用例</div>
            </template>
        </a-result>

    </a-modal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { http } from "@/http"
import { useRouter } from 'vue-router'
const router = useRouter()

const props = defineProps(['rowData', 'type', 'category'])
const emit = defineEmits(['ok', 'cancel', 'fill'])

const selectForm = ref({
    selectedBelongsTo: 'Vector',
    version: '',
    minRequiredVersion: '',
    minRequiredCANoeVersion: ''
})

const selectBelongsToModalVisible = ref(true)
const lackDataVisible = ref(false)

onMounted(() => {
    const _version = localStorage.getItem('_version') || '';
    selectForm.value.version = _version;

    // _minRequiredVersion
    const _minRequiredVersion = localStorage.getItem('_minRequiredVersion') || '';
    selectForm.value.minRequiredVersion = _minRequiredVersion;

    const _minRequiredCANoeVersion = localStorage.getItem('_minRequiredCANoeVersion') || '';
    selectForm.value.minRequiredCANoeVersion = _minRequiredCANoeVersion;
})
const verify = () => {

    // 持久三个参数
    localStorage.setItem('_version', selectForm.value.version);
    localStorage.setItem('_minRequiredVersion', selectForm.value.minRequiredVersion);
    localStorage.setItem('_minRequiredCANoeVersion', selectForm.value.minRequiredCANoeVersion);

    http.post('/api/batch_verify_generate_script_file', {
        data: props.rowData,
        ...selectForm.value,
    }).then(response => {
        if (response.status === 'success') {
            handleSelectBelongsToOk();
        } else {
            lackDataVisible.value = true;
        }
    }, () => {
        lackDataVisible.value = true;
    }).finally(() => {
        selectBelongsToModalVisible.value = false;
    });
}

const fill = () => {
    // 记录下哪些需要补齐的台架测试用例，在页面勾选中预先选择出来
    const dis = props.rowData.map(it => it.testcase_id)
    const category = props.category || 'requirement'

    localStorage.setItem('select_' + category, JSON.stringify(dis));

    emit('cancel');
    emit('fill')
}

function go() {
    router.push('/script/metaAction')
}

const handleSelectBelongsToOk = (action = '') => {
    if (!selectForm.value.selectedBelongsTo) {
        ElMessage.error('请选择所属对象');
        return;
    }

    // selectBelongsToModalVisible.value = false;
    let url = '/api/batch_generate_script_file'
    if (props.type === 'merge') {
        url = '/api/merge_script_file'
    }

    http.post(url, {
        data: props.rowData,
        ...selectForm.value,
        type: action
    }).then(response => {
        if (response.status === 'need_fill') {
            ElMessage.success('需要补齐元动作，请去列表补齐！');
            emit('ok')
            emit('cancel')
        } else if (response.status === 'success') {
            ElMessage.success('生成成功, 现在可以下载文件');

            const category = props.category || 'requirement'
            localStorage.removeItem('select_' + category)

            emit('ok')
            emit('cancel')
        } else {
            emit('cancel')
            ElMessage.error('生成失败');
        }
    });
};
</script>