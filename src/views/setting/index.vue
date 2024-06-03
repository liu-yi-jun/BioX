<template>
  <div style="padding: 10px">
    <a-space wrap>
      <a-button type="primary" @click="openDevTools">DevTools</a-button>
     <span>
      <span>开启滤波：</span>
      <a-switch @change="changeConfig" v-model:checked="configData.isFilter" />
     </span>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
const ipcRenderer = require("electron").ipcRenderer;
import { storeToRefs } from "pinia";
import { useIndexStore } from "../../store/index";
const indexStore = useIndexStore();
const { configData } = storeToRefs(indexStore);
import { message } from "ant-design-vue";

const openDevTools = () => {
  ipcRenderer.send("open-devtools");
};
const changeConfig = () => {
  message.warn("重连设备后生效");
}
</script>
<style scoped></style>
