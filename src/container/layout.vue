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
      @start-record="startRecord"
      @end-record="endRecord"
      @cancel-record="cancelRecord"
    ></record>
  </div>
</template>

<script setup lang="ts">
import record from "../components/record.vue";
import OfMenu from "./menu.vue";
import OfHeader from "./header.vue";
import { ref, reactive } from "vue";
const status = ref<number>(0);
const isRecord = ref<boolean>(true);
let sourceData: any[] = [];

const onRecord = (value) => {
  console.log("onRecord", value);
  isRecord.value = value;
};

const onStatus = (value) => {
  console.log("onStatus", value);
  status.value = value;
};
const startRecord = () => {
  // 开启录制
  setInterval(() => {
    let RD: number[] = [],
      OD: number[] = [],
      Conc: number[] = [];
    for (let i = 0; i < 8 * 3; i++) {
      RD.push(Math.round(Math.random() * 20 + 30));
      OD.push(Math.round(Math.random() * 20 + 30));
      Conc.push(Math.round(Math.random() * 20 + 30));
    }
    sourceData.push({
      series: Math.random() * 150,
      psd: {
        AF3: [
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
        ],
        F3: [
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
        ],
        P7: [
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
        ],
        F7: [
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
        ],
        AF4: [
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
        ],
      },
      absolute: {
        0: Math.random() * 20 + 80,
        1: Math.random() * 20 + 80,
        2: Math.random() * 20 + 80,
        3: Math.random() * 20 + 80,
        4: Math.random() * 20 + 80,
      },
      related: {
        γ: 100,
        β: Math.random() * 20 + 60,
        α: Math.random() * 20 + 40,
        θ: Math.random() * 20 + 20,
        δ: Math.random() * 20 + 0,
      },
      barnsTime: {
        EEG: Math.random() * 20 + 80,
        DELTA: Math.random() * 20 + 80,
        THETA: Math.random() * 20 + 80,
        ALPHA: Math.random() * 20 + 80,
        BETA: Math.random() * 20 + 80,
        GAMMA: Math.random() * 20 + 80,
      },
      RD,
      OD,
      Conc,
    });
  }, 250);
};
const endRecord = (cb) => {
  // 结束录制
  cb(sourceData);
}
const cancelRecord = () => {
  // 取消录制
  sourceData = [];
}
</script>
<style scoped></style>
