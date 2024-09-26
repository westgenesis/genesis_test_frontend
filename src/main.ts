import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import './assets/tailwind.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router/router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import { createPinia } from 'pinia';
import NProgress from 'nprogress'; // 引入 nprogress
import 'nprogress/nprogress.css'; // 引入 nprogress 样式

const app = createApp(App)
const pinia = createPinia()

// 配置 NProgress
NProgress.configure({ showSpinner: false }); // 隐藏默认的旋转图标

// 在路由切换时显示进度条
router.beforeEach((to, from, next) => {
  NProgress.start(); // 开始进度条
  next();
});

router.afterEach(() => {
  NProgress.done(); // 结束进度条
});

app.use(pinia)
app.use(ElementPlus)
app.use(router)
app.use(Antd)
document.getElementById('loading')?.remove();
app.mount('#app')