import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default ({ mode }) => {
  return defineConfig({
    alias: {
      "@": "/src",
      "@components": "/src/components/",
      "@/assets": "/src/assets/",
    },
    plugins: [vue()],
    build: {
      terserOptions: {
        compress: {
          drop_console: true, // 去掉console.log等调试语句
        },
      },
    },
    base: "./",
    server: {
      hmr: {
        overlay: false,
      },
    },
  });
};
