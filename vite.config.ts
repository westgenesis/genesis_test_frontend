import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import nodePolyfills from "vite-plugin-node-stdlib-browser";
import vueJsx from "@vitejs/plugin-vue-jsx";
import tailwindcss from "@tailwindcss/vite";

import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import { FileSystemIconLoader } from "unplugin-icons/loaders";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: Object.entries(env)
            .filter(([key]) => key.startsWith("VITE_APP_CSS"))
            .map(([key, val]) => `$${key}: ${val};`) // 注入成 SCSS 变量
            .join("\n"),
        },
      },
    },
    plugins: [
      vue(),
      vueJsx(),
      nodePolyfills(),
      tailwindcss(),
      AutoImport({
        imports: ["vue", "vue-router", "pinia"],
        eslintrc: {
          enabled: true,
        },
      }),
      Components({
        resolvers: [
          IconsResolver({
            prefix: "icon",
            customCollections: ["my-icons"],
          }),
        ],
      }),
      // 图标插件 支持使用 unplugin-icons 提供的图标 例如：<icon-park-outline:home />
      Icons({
        compiler: "vue3",
        autoInstall: true,
        customCollections: {
          "my-icons": FileSystemIconLoader("./src/assets/icons", (svg) =>
            svg.replace(/^<svg /, '<svg fill="currentColor" ')
          ),
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@stores": path.resolve(__dirname, "src/stores"),
        "@components": path.resolve(__dirname, "src/components"),
        "@common": path.resolve(__dirname, "src/components/common"),
      },
    },
    server: {
      host: true, // 允许局域网访问
      port: 9200,
      proxy: {
        "/dev-api": {
          // target: "http://183.66.251.10:52080/",
          target: "http://192.168.1.148:5002/",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dev-api/, ""),
        },
      },
    },
    optimizeDeps: {
      include: ["vue", "vue-router"], // 明确指定要预构建的依赖，减少内存占用
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: "[name].js",
          chunkFileNames: "[name].js",
          // 对于 SVG 文件，将其输出到 /assets 目录
          assetFileNames: ({ name }) => {
            if (name && name.endsWith(".svg")) {
              return "assets/[name].[ext]"; // 将 SVG 文件输出到 /assets 目录
            }
            return "[name].[ext]"; // 其他文件保持默认输出
          },
        },
      },
    },
  };
});
