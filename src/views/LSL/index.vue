<template>
  <div class="charts-wrap lsl-wrap">
    <p class="eig-nav-title">Lab Streaming Layer</p>
    <div class="eig-lsl-desc">
      <p>
        The lab streaming layer (LSL) is a system for the unified collection of
        measurement time series in research experiments that handles both the
        networking, time-synchronization, (near-) real-time access as well as
        optionally the centralized collection, viewing and disk recording of the
        data.
      </p>
    </div>
    <div class="eig-lsl-tab">
      <a-tabs class="header-tab" v-model:activeKey="activeKey">
        <a-tab-pane key="1" tab="Outlet">
          <div class="lsl-outlet">
            <div class="lsl-outlet-info">
              <p>Stream name: {{configData.lsl.streamName }}</p>
              <!-- <p>DeviceID: BioMultiLite Device 1-001</p> -->
              <p>Data stream info</p>
            </div>
            <div class="lsl-outlet-config">
              <div class="lsl-outlet-config-item">
                <a-checkbox
                  :disabled="configData.lsl.isOutLet"
                  @change="changeLslStatus"
                  v-model:checked="configData.lsl.isEeg"
                  >EEG</a-checkbox
                >
                <span>Number of stream: {{ configData.eegFilter.eeg_channel_count }}</span>
                <span
                  >Sample rate: {{ configData.eegFilter.sample_rate }}Hz</span
                >
                <span>Data format: cf_float32</span>
              </div>
              <div class="lsl-outlet-config-item">
                <a-checkbox
                  :disabled="configData.lsl.isOutLet"
                  @change="changeLslStatus"
                  v-model:checked="configData.lsl.isIr"
                  >FNIRS</a-checkbox
                >
                <span>Number of stream: {{configData.irFilter.ir_channel_count}}</span>
                <span
                  >Sample rate:
                  {{ configData.irFilter.ir_sample_rate }}Hz</span
                >
                <span>Data format: cf_float32</span>
              </div>
              <!-- <div class="lsl-outlet-config-item">
                <a-checkbox
                  :disabled="configData.lsl.isOutLet"
                  @change="changeLslStatus"
                  v-model:checked="configData.lsl.isMotion"
                  >Motion&Temp</a-checkbox
                >
                <span>Number of stream: 10</span>
                <span>Sample rate: 12.5Hz</span>
                <span>Data format: cf_float32</span>
              </div> -->
              <div class="lsl-outlet-config-item">
                <a-checkbox
                  :disabled="configData.lsl.isOutLet"
                  @change="changeLslStatus"
                  v-model:checked="configData.lsl.isMarker"
                  >Marker</a-checkbox
                >
                <span>Number of stream: 1</span>
                <span>Sample rate: auto</span>
                <span>Data format: cf_float32</span>
              </div>
            </div>
            <div class="left-btn-footer lsl-footer">
              <span
                class="started-text"
                v-if="configData.lsl.isOutLet"
                type="text"
                ><CheckCircleOutlined style="color: #67c23a; font-size: 18px" />
                <span style="margin-left: 6px; color: #67c23a"
                  >Started</span
                ></span
              >
              <a-button
                style="margin-right: 20px"
                v-else
                type="primary"
                @click="handleChangeOutLet"
                >Start</a-button
              >
              <a-button
                :disabled="!configData.lsl.isOutLet"
                type="primary"
                @click="handleChangeOutLet"
                >Stop</a-button
              >
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="Inlet">
          <div class="lsl-Inlet">
            <div class="lsl-Inlet-info">
              <div class="lsl-Inlet-info-select">
                <p>Stream name</p>
                <a-select
                  allowClear
                  :disabled="configData.lsl.isInlet"
                  style="width: 300px"
                  v-model:value="stream"
                  placeholder="Please select the stream"
                  :options="streamOptions"
                  @select="(e) => handleStreaamSelect(e, stream)"
                ></a-select>
              </div>
              <p>DeviceID: xxxxxx</p>
              <p>Number of streams: xxxxxx</p>
              <p>Type: xxxxx</p>
            </div>
            <div class="left-btn-footer lsl-footer">
              <span
                class="started-text"
                v-if="configData.lsl.isInlet"
                type="text"
                ><CheckCircleOutlined style="color: #67c23a; font-size: 18px" />
                <span style="margin-left: 6px; color: #67c23a"
                  >connected</span
                ></span
              >
              <a-button
                style="margin-right: 20px"
                v-else
                type="primary"
                @click="handleChangeInlet"
                >Connect</a-button
              >
              <a-button
                :disabled="!configData.lsl.isInlet"
                type="primary"
                @click="handleChangeInlet"
                >Disconnect</a-button
              >
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useIndexStore } from "../../store/index";
import { storeToRefs } from "pinia";
import { CheckCircleOutlined } from "@ant-design/icons-vue";
const indexStore = useIndexStore();
const { configData, socketConfig } = storeToRefs(indexStore);
const ipcRenderer = require("electron").ipcRenderer;
import { SelectProps } from "ant-design-vue";
import { message } from "ant-design-vue";
const streamOptions = ref<SelectProps["options"]>([]);

const stream = ref();
const activeKey = ref("1");
const changeLslStatus = () => {
  ipcRenderer.send(
    "change-config-field",
    JSON.stringify({
      field: "lslConfig",
      config: configData.value,
    })
  );
};
const handleChangeOutLet = () => {
  indexStore.configData.lsl.isOutLet = !configData.value.lsl.isOutLet;
  indexStore.configData.lsl.handOutLet = indexStore.configData.lsl.isOutLet;
  ipcRenderer.send(
    "change-config-field",
    JSON.stringify({
      field: "lslConfig",
      config: configData.value,
    })
  );
  if (configData.value.lsl.isOutLet) {
    ipcRenderer.send("connect-socket", {
      port: socketConfig.value.port,
    });
  } else {
    ipcRenderer.send("cancel-socket");
  }
};
const handleChangeInlet = () => {
  indexStore.configData.lsl.isInlet = !configData.value.lsl.isInlet;
  ipcRenderer.send(
    "change-config-field",
    JSON.stringify({
      field: "lslConfig",
      config: configData.value,
    })
  );
};
const handleStreaamSelect = (e, item) => {};
const handleSocketReceiveData = (event: any, data: any) => {
  if (data.msg) {
    if (data.type == 1) {
      message.success(data.msg);
    }
    if (data.type == 0) {
      message.success(data.msg);
    }
    if (data.type == -1) {
      message.error(data.msg);
    }
  }
};





onMounted(() => {
  // 监听socket
  ipcRenderer.on("receive-socket", handleSocketReceiveData);
});

onBeforeUnmount(() => {

  ipcRenderer.removeListener("receive-socket", handleSocketReceiveData);
});
</script>
<style scoped></style>
