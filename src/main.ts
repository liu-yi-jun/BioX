import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import "./assets/scss/eig.scss";
const app = createApp(App);
import Highcharts from "highcharts";
import { CustomDatabase } from "./utils/db";
import { HighchartsKey } from "./types";

import Loading from "./plugin/loading";


interface loadingType {
  show():null
  hide():null
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    loading: loadingType;
  }
}
// 初始化数据库
const db = new CustomDatabase();
db.init().then(() => {
  app.provide(HighchartsKey, Highcharts);
  app.use(createPinia()); //use pinia
  app.use(router); //use router
  // 自定义插件全局loading
  app.use(Loading);
  app.use(Antd);
  app.mount("#app");
});
