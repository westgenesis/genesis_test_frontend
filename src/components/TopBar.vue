<template>
    <div v-if="!isLoginOrRegistry" class="minh-[60px] flex bg-custom-bg justify-between items-center">
        <div class="flex items-center">
            <div class="h-full flex ml-[16px]">
                <img :src="logo" />
            </div>
            <div class="h-full">
                <a-select ref="select" v-model:value="selectedProject"
                    style="width: 12rem; margin-top: 2px; margin-left: 16px;" class="mt-[12px]" @change="handleSelect">
                    <a-select-option v-for="project in projects" :key="project._id.$oid" :value="project._id.$oid">
                        {{ project.name }}
                    </a-select-option>
                </a-select>
            </div>
            <div class="ml-[10px]"></div>
            <div class="h-full flex items-center">
                <div v-for="item in topBarItems" :key="item.name" class="p-[10px] topBarItem cursor-pointer"
                    :class="{ 'bg-white': item.name === selectedItem }" @click="handleTopBarClick(item)">
                    <a-dropdown v-if="item.children" :trigger="['hover']">
                        <span>{{ item.name }}</span>
                        <template #overlay>
                            <a-menu>
                                <a-menu-item v-for="child in item.children" :key="child.name" @click="handleTopBarClick(child)">
                                    {{ child.name }}
                                </a-menu-item>
                            </a-menu>
                        </template>
                    </a-dropdown>
                    <span v-else>{{ item.name }}</span>
                </div>
            </div>
        </div>
        <a-dropdown>
            <div class="right mr-[16px] min-w-[150px]  cursor-pointer">
                <UserOutlined class="ml-[10px]"/>{{ email || "游客" }}
            </div>
            <template #overlay>
                <a-menu>
                    <a-menu-item @click="backToLogin">
                        退出登录
                    </a-menu-item>
                </a-menu>
            </template>
        </a-dropdown>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logo from '../assets/logo.svg';
import { useUserStore } from '../stores/user';
import { storeToRefs } from 'pinia';
import { useProjectStore } from '../stores/project';
import { UserOutlined } from '@ant-design/icons-vue'

const route = useRoute();
const router = useRouter();
const selectedProject = ref('');
const userStore = useUserStore();
const { email } = storeToRefs(userStore);

const projectStore = useProjectStore();
const { projects, currentProject } = storeToRefs(projectStore);

const isLoginOrRegistry = computed(() => {
    return route.path === '/login' || route.path === '/registry'
})

const selectedItem = ref('项目管理')

const topBarItems = [
    {
        name: '项目管理',
        to: '/project/projectManage'
    },
    {
        name: '需求管理',
        to: '/requirement/functionPoints'
    },
    {
        name: '用例管理',
        to: '/usecase/usecaseManage'
    },
]


const handleTopBarClick = async (item) => {
    selectedItem.value = item.name;
    await projectStore.refreshAllProjects();
    router.replace(item.to || '/');
}


const backToLogin = () => {
    router.push('/login');
}

// 监听 projects 的变化，并在其更新后设置 selectedProject
watch(projects, (newProjects) => {
    if (newProjects.length > 0) {
        selectedProject.value = newProjects[0]._id.$oid;
    }
}, { immediate: true });

const handleSelect = (newProjectId) => {
    const selectedProject = projects.value.find(project => project._id.$oid === newProjectId);
    if (selectedProject) {
        projectStore.updateCurrentProjectById(newProjectId);
        currentProject.value.name = selectedProject.name; // 更新 currentProject.name
    }
}

onMounted(() => {
    // 根据location.hash设置路由
    const hash = location.hash.replace('#', '');
    if (hash.startsWith('/project')) {
        selectedItem.value = '项目管理';
    } else if (hash.startsWith('/requirement')) {
        selectedItem.value = '需求管理';
    } else if (hash.startsWith('/usecase')) {
        selectedItem.value = '用例管理';
    } else if (hash.startsWith('/script')) {
        selectedItem.value = '脚本管理'
    }
})

</script>

<style scoped lang="less">
:deep(.ant-select-selector) {
    border: none !important;
    background-color: transparent !important;

    &:hover {
        background-color: #f3f3f3 !important;
    }
}

.topBarItem {
    background-color: transparent;
    color: #646466;
    font-size: 14px !important;
    border-radius: 0.5rem !important;
}

.bg-white {
    background-color: white;
    color: #70367f;
}

.right {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 5px;
    border-radius: 5px;
    &:hover {
        background-color: white;
    }
}
</style>