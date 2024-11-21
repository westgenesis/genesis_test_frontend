import axios from 'axios'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'; // 引入 nprogress
import { ElLoading } from 'element-plus';


let loadingInstance: any = null;
// 显示加载动画
const showLoading = (options = {}) => {
  if (!loadingInstance) {
    loadingInstance = ElLoading.service({
      lock: true, // 锁定屏幕，防止用户在加载过程中进行其他操作
      text: options.text || '加载中...', // 自定义加载提示文本
      background: options.background || 'rgba(0, 0, 0, 0.7)', // 自定义背景颜色
      spinner: options.spinner || null, // 自定义加载动画（可选）
      fullscreen: true, // 全屏模式
    });
  }
};

// 隐藏加载动画
const hideLoading = () => {
  if (loadingInstance) {
    loadingInstance.close(); // 关闭加载动画
    loadingInstance = null; // 重置实例
  }
}


const baseURL = import.meta.env.VITE_API_BASE_URL || '';

// 创建 Axios 实例
const http = axios.create({
  baseURL: baseURL, // 设置基本的请求 URL
  timeout: 60000 // 设置请求超时时间
})

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 在发送请求之前做一些处理，例如添加请求头、身份验证等
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }

    // 删除请求参数中的下划线开头的参数
    ;[config.params, config.data].forEach((params) => {
      for (const p in params) {
        if (p.startsWith('_')) {
          delete params[p]
        }
      }
    })

    if (config.url !== '/api/display_user_projects') {
      NProgress.start(); // 开始进度条
    }

    config.showloading = false;
    config.finished = false;

    setTimeout(() => {
      if (!config.finished) {
        config.showloading = true;
        showLoading()
      }
    }, 500)



    return config
  },
  (error) => {
    // 处理请求错误
    NProgress.done(); // 结束进度条
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    // console.log(response)

    response.config.finished = true;

    if (response.config.showloading = true) {
      hideLoading()
    }

    // 对响应数据进行处理，例如解析数据、错误处理等
    NProgress.done(); // 结束进度条
    if (response.status === 500) {
      ElMessage.error(response.data.message)
      return Promise.reject(response)
    }
    return response.data
  },
  (error) => {
    NProgress.done(); // 结束进度条

    error.config.finished = true;

    if (error.config.showloading = true) {
      hideLoading()
    }

 
    if (error?.response?.status === 401) {
      ElMessage.error('未授权，请重新登录')
      window.location.href = '#/login'
    } else {
      ElMessage.error(error)
    }

    // 处理响应错误
    return Promise.reject(error)
  }
)

export { http }