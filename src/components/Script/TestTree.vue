<template>
    <div>
        <a-transfer v-model:target-keys="targetKeys" class="tree-transfer" :data-source="dataSource"
            :render="item => item.title" :show-select-all="false">
            <template #children="{ direction, selectedKeys, onItemSelect }">
                <a-tree v-if="direction === 'left'" block-node checkable check-strictly default-expand-all
                    :checked-keys="[...selectedKeys, ...targetKeys]" :tree-data="treeData" @check="(_, props) => {
                        onChecked(props, [...selectedKeys, ...targetKeys], onItemSelect);
                    }
                        " @select="(_, props) => {
                            onChecked(props, [...selectedKeys, ...targetKeys], onItemSelect);
                        }
                            " />
            </template>
        </a-transfer>
    </div>
</template>
<script setup>
import { computed, ref } from 'vue';
const tData = [
    { key: '0-0', title: '0-0' },
    {
        key: '0-1',
        title: '0-1',
        selectable: false,
        disabled: true,
        disableCheckbox: true,
        children: [
            { key: '0-1-0', title: '0-1-0' },
            { key: '0-1-1', title: '0-1-1' },
        ],
    },
    { key: '0-2', title: '0-3' }
];

const transferDataSource = [];
function flatten(list = []) {
    list.forEach(item => {
        transferDataSource.push(item);
        flatten(item.children);
    });
}
flatten(JSON.parse(JSON.stringify(tData)));

function isChecked(selectedKeys, eventKey) {
    return selectedKeys.indexOf(eventKey) !== -1;
}

function handleTreeData(treeNodes, targetKeys = []) {
    return treeNodes.map(({ children, ...props }) => ({
        ...props,
        disabled: targetKeys.includes(props.key),
        children: handleTreeData(children ?? [], targetKeys),
    }));
}
const targetKeys = ref([]);

const dataSource = ref(transferDataSource);

const treeData = computed(() => {
    return handleTreeData(tData, targetKeys.value);
});

const onChecked = (
    e,
    checkedKeys,
    onItemSelect,
) => {
    const { eventKey } = e.node;
    onItemSelect(eventKey, !isChecked(checkedKeys, eventKey));
};
</script>
<style scoped>
.tree-transfer .ant-transfer-list:first-child {
    width: 50%;
    flex: none;
}
</style>