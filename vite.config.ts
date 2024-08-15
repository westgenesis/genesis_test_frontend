import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import nodePolyfills from 'vite-plugin-node-stdlib-browser';

export default defineConfig({
  plugins: [vue(), nodePolyfills()],
  resolve: {
    alias: {
      '@stores': path.resolve(__dirname, 'src/stores'),
      '@components': path.resolve(__dirname, 'src/components'),
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
  build: {
    minify: 'terser', // 使用 terser 进行压缩，内存占用更低
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console 语句
        drop_debugger: true, // 移除 debugger 语句
      },
    },
    chunkSizeWarningLimit: 1000, // 增加 chunk size 警告限制，避免过多警告信息
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 自定义代码拆分，减小单个 chunk 大小
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ['vue', 'vue-router'], // 明确指定要预构建的依赖，减少内存占用
  },
});