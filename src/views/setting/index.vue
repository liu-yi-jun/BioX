<template>
  <div style="padding: 10px;">
    <a-space wrap>
    <a-button type="primary" @click="openDevTools">DevTools</a-button>
  </a-space>
  </div>
  
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
const ipcRenderer = require("electron").ipcRenderer;
const openDevTools = () => {
  ipcRenderer.send("open-devtools");
}
</script>
<style scoped></style>
