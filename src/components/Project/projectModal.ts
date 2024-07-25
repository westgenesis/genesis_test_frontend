import {
    CheckCircleOutlined,
    SyncOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    ClockCircleOutlined,
    MinusCircleOutlined,
} from '@ant-design/icons-vue';

export const statusMap = {
    "-1": { label: "全部", icon: MinusCircleOutlined, color: "default" },
    0: { label: "未开始", icon: ClockCircleOutlined, color: "default" },
    1: { label: "进行中", icon: SyncOutlined, color: "processing" },
    2: { label: "已完成", icon: CheckCircleOutlined, color: "success" },
    3: { label: "已关闭", icon: CloseCircleOutlined, color: "error" },
};

export const getAllProjects = () => {
    
}