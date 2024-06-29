<template>
  <div class="eig-container">
    <div class="eig-header">
      <of-header></of-header>
    </div>
    <div class="eig-body">
      <div class="eig-menu">
        <of-menu></of-menu>
      </div>
      <div class="eig-content">
        <router-view></router-view>
      </div>
    </div>
    <record
      @on-record="onRecord"
      @on-status="onStatus"
    ></record>
  </div>
</template>

<script setup lang="ts">
import record from "../components/record.vue";
import OfMenu from "./menu.vue";
import OfHeader from "./header.vue";
import { ref, reactive, onMounted, onBeforeUnmount, watch,getCurrentInstance } from "vue";
const app = getCurrentInstance();
const status = ref<number>(0);
const isRecord = ref<boolean>(true);
let sourceData: any[] = [];
import { CustomBluetooth } from "../utils/bluetooth";
import { CustomDatabase } from "../utils/db";
const db = new CustomDatabase();
let bluetooth = new CustomBluetooth();
import { storeToRefs } from "pinia";
import { useIndexStore } from "../store/index";
const indexStore = useIndexStore();
const { configData } = storeToRefs(indexStore);
const ipcRenderer = require("electron").ipcRenderer;
const onRecord = (value) => {
  console.log("onRecord", value);
  isRecord.value = value;
};

const onStatus = (value) => {
  console.log("onStatus", value);
  status.value = value;
};



// 更新配置
watch(
  () => configData,
  () => {
    db.all(`select * from config`).then((list) => {
      if (list.length > 0) {
        db.update(
          "config",
          {
            configData: JSON.stringify(configData.value),
          },
          {
            id: list[0].id,
          }
        );
        ipcRenderer.send("change-config", JSON.stringify(configData.value));
      }
    });
  },
  { deep: true }
);

// 初始化配置
const initConfig = () => {
  db.all(`select * from config`).then((list) => {
    if (list.length > 0) {
      indexStore.configData = JSON.parse(list[0].configData);
      ipcRenderer.send("change-config", JSON.stringify(configData.value));
    } else {
      db.insert("config", {
        configData: JSON.stringify(configData.value),
      }).then(() => {
        ipcRenderer.send("change-config", JSON.stringify(configData.value));
      });
    }
  });
};
</script>
<style scoped></style>
