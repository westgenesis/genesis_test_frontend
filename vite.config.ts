import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@stores': path.resolve(__dirname, 'src/stores'), // 配置 @stores 路径别名
      '@components': path.resolve(__dirname, 'src/components'), // 可以根据需要添加更多别名
      // 你可以根据项目结构添加更多路径别名
    },
  },
  server: {
    port: 9200,
    proxy: {
      '/dev-api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev-api/, ''),
      },
    },
  },
});