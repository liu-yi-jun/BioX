import { createApp } from "vue";
import { createPinia } from "pinia";
// console.log = () => {}; // 阻止打印, 内存泄漏可以有效避免
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
  show(text?:string):null
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
  app.use(Antd);
  app.use(Loading);
  app.mount("#app");
});
