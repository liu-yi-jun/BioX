<template>
  <a-menu
    v-model:openKeys="state.openKeys"
    v-model:selectedKeys="selectedKeys"
    mode="inline"
    :inline-collapsed="state.collapsed"
    @click="clickMenu"
    :items="items"
  ></a-menu>
</template>

<script setup lang="ts">
import { ref, reactive, watch, h } from "vue";
import { useRoute, useRouter } from "vue-router";
const router = useRouter();
const route = useRoute();

const selectedKeys = ref<string[]>([route.path]);

import {
  LineChartOutlined,
  BarChartOutlined ,
  AppstoreOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons-vue";
const state = reactive({
  collapsed: true,
  openKeys: ["sub1"],
  preOpenKeys: ["sub1"],
});
const items = reactive([
  {
    key: "/EEG",
    icon: () => h(LineChartOutlined),
    label: "EEG",
    title: "EEG",
  },
  {
    key: "/FNIRS",
    icon: () => h(BarChartOutlined  ),
    label: "FNIRS",
    title: "FNIRS",
  },
  {
    key: "/dataManage",
    icon: () => h(AppstoreOutlined),
    label: "数据管理",
    title: "数据管理",
  },
  {
    key: "/setting",
    icon: () => h(SettingOutlined),
    label: "设置",
    title: "设置",
  },
  {
    key: "/log",
    icon: () => h(FileTextOutlined),
    label: "Log日志",
    title: "Log日志",
  },
]);

watch(
  () => route.path,
  (newPath) => {
    selectedKeys.value = [newPath];
  }
);

watch(
  () => state.openKeys,
  (_val, oldVal) => {
    state.preOpenKeys = oldVal;
  }
);

const clickMenu = ({ key }) => {
  router.push(key);
};

const toggleCollapsed = () => {
  state.collapsed = !state.collapsed;
  state.openKeys = state.collapsed ? [] : state.preOpenKeys;
};
</script>
<style scoped></style>
