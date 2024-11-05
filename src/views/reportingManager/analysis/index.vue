<template>
  <div class="eig-column analysis">
    <div class="eig-filter">
      <div class="filter-left">
        <a-select
          v-model:value="state"
          style="width: 140px"
          placeholder="State"
          :options="channelOptions"
        ></a-select>
      </div>
      <div class="filter-right">
        <a-button v-if="!isStart" type="primary" @click="changeStatus"
          >Start</a-button
        >
        <a-button danger type="primary" v-else @click="changeStatus"
          >Stop</a-button
        >
      </div>
    </div>
    <div class="eig-flex analysis-container">1</div>
    <div class="eig-shrink analysis-footer" style="height: 300px">
      <div>
        <p class="card-title">Concentration</p>
        <Psd ref="psdRef" style="width: 100%; height: 100%"></Psd>
      </div>
      <div>
        <p class="card-title">HeartRate</p>
        <Psd ref="psdRef" style="width: 100%; height: 100%"></Psd>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
const isStart = ref(false);
const state = ref<string[]>(["Concentration"]);
import type { SelectProps } from "ant-design-vue";
import Psd from "@/components/Psd.vue";
const stateOptionsData = [
  {
    value: "Concentration",
    label: "Concentration",
  },
  {
    value: "Relaxation",
    label: "Relaxation", 
  },
];
const channelOptions = ref<SelectProps["options"]>(stateOptionsData);

const changeStatus = () => {
  isStart.value = !isStart.value;
};
</script>
<style scoped></style>
