import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  alias: {
    "@": "/src",
    "@components": "/src/components/",
    "@assets": "/src/assets/",
  },
  plugins: [vue()],
  base: "./",
  server: {
    hmr: {
      overlay: false,
    },
  },
});
