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
import permission from './mixins/permission';
import log from 'electron-log/renderer';
console.log = log.log
console.error = log.error
import Loading from "./plugin/loading";

app.use(permission)

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
