import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import nodePolyfills from 'vite-plugin-node-stdlib-browser';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { terser } from 'rollup-plugin-terser';

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    nodePolyfills(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
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
  optimizeDeps: {
    include: ['vue', 'vue-router'], // 明确指定要预构建的依赖，减少内存占用
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        // 对于 SVG 文件，将其输出到 /assets 目录
        assetFileNames: ({ name }) => {
          if (name && name.endsWith('.svg')) {
            return 'assets/[name].[ext]'; // 将 SVG 文件输出到 /assets 目录
          }
          return '[name].[ext]'; // 其他文件保持默认输出
        },
      },
      plugins: [
        terser({
          compress: {
            drop_console: true, // 移除 console 语句
          },
        }),
      ],
    },
  },
});