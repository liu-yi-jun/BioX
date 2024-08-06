import { createWebHashHistory, createRouter } from "vue-router";
import Home from "@/views/home/index.vue";
import Layout from "@/views/layout/index.vue";
import DataManage from "@/views/dataManage/index.vue";
import LSL from "@/views/LSL/index.vue";
import EEG from "@/views/EEG/index.vue";
import FNIRS from "@/views/FNIRS/index.vue";
import Setting from "@/views/Setting/index.vue";
import Log from "@/views/log/index.vue";

const routes = [
  {
    path: "/",
    redirect: "/EEG",
  },
  {
    path: "/EEG",
    name: "EEG",
    component: EEG,
  },
  {
    path: "/FNIRS",
    name: "FNIRS",
    component: FNIRS,
  },
  {
    path: "/dataManage",
    name: "DataManage",
    component: DataManage,
  },
  {
    path: "/LSL",
    name: "LSL",
    component: LSL,
  },
  // {
  //   path: "/setting",
  //   name: "Setting",
  //   component: Setting,
  // },
  {
    path: "/log",
    name: "Log",
    component: Log,
  },
  {
    path: "/home",
    name: "Home",
    component: Home,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
