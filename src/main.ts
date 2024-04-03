import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import "./assets/scss/eig.scss";
const app = createApp(App);
import Highcharts from "highcharts";

import { HighchartsKey} from './types'

// declare module "@vue/runtime-core" {
//   interface ComponentCustomProperties {
//     $Highcharts: typeof Highcharts; 
//   }
// }


// app.config.globalProperties.$Highcharts = Highcharts;

app.provide(HighchartsKey, Highcharts)


app.use(createPinia()); //use pinia
app.use(router); //use router
app.use(Antd);
app.mount("#app");
