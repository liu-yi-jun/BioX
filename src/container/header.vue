<template>
  <div class="header">
    <div>BraInward BioX</div>
    <a-popover
      v-if="!isConnect"
      overlayClassName="header-device-popover"
      v-model:open="connectVisible"
      :overlayStyle="{ width: '300px' }"
      trigger="click"
    >
      <template #content>
        <div>
          <ul class="header-device-list">
            <li
              v-for="item in deviceList"
              :key="item.deviceId"
              class="header-device-item"
              @click="connectDevice(item)"
            >
              <DeploymentUnitOutlined />
              <div>
                <p>{{ item.deviceName }}</p>
                <p>{{ item.deviceId }}</p>
              </div>
            </li>
          </ul>
        </div>
      </template>
      <div class="header-headset" @click="openConnectVisible">
        <span>Connect device</span>
      </div>
    </a-popover>

    <div class="header-center" v-else @click="closeDevice">
      <span>BIO X</span>
      <div class="electricity">
        <span>100</span>
      </div>
    </div>
    <div></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, getCurrentInstance, watch } from "vue";
const ipcRenderer = require("electron").ipcRenderer;
import { DeploymentUnitOutlined } from "@ant-design/icons-vue";
import { CustomBluetooth } from "../utils/bluetooth";
const isConnect = ref(true);
const connectVisible = ref<boolean>(false);
import { message } from "ant-design-vue";
const bluetooth = new CustomBluetooth();
const app = getCurrentInstance();

interface DeviceItem {
  deviceId: string;
  deviceName: string;
}
let selectDeviceItem: DeviceItem | null = null;
const deviceList = ref<DeviceItem[]>([]);

const openConnectVisible = () => {
  connectVisible.value = true;
  findDevice();
};

watch(connectVisible, (value) => {
  if (!value && !selectDeviceItem) {
    // 取消蓝牙扫描
    // ipcRenderer.send("cancel-bluetooth-request");
  } else {
    selectDeviceItem = null;
  }
});

// 蓝牙扫描和连接
const findDevice = async () => {
  bluetooth.init((value, msg) => {
    if (value) {
      switch (msg) {
        case "loading":
          app?.proxy?.loading.show();
          break;
        case "hide":
          app?.proxy?.loading.hide();
          break;
        case "success":
          selectDeviceItem = null;
          isConnect.value = true;
          message.success("连接成功");
      }
    } else {
      app?.proxy?.loading.hide();
      if(msg !== "User cancelled the requestDevice() chooser.") {
        message.error(msg);
      }
  
    }
  });
};

// 确认连接设备
const connectDevice = (item) => {
  selectDeviceItem = item;
  ipcRenderer.send("connect-bluetooth-device", JSON.stringify(item));
  connectVisible.value = false;
};

// 蓝牙断开
const closeDevice = () => {
  selectDeviceItem = null;
  bluetooth.close((value, msg) => {
    isConnect.value = false;
    message.success(msg);
  });
};
onMounted(() => {
  // 蓝牙配对
  // ipcRenderer.on("bluetooth-pairing-request", () => (event, details) => {
  //   const response: any = {};
  //   switch (details.pairingKind) {
  //     case "confirm": {
  //       response.confirmed = window.confirm(
  //         `Do you want to connect to device ${details.deviceId}?`
  //       );
  //       break;
  //     }
  //     case "confirmPin": {
  //       response.confirmed = window.confirm(
  //         `Does the pin ${details.pin} match the pin displayed on device ${details.deviceId}?`
  //       );
  //       break;
  //     }
  //     case "providePin": {
  //       const pin = window.prompt(
  //         `Please provide a pin for ${details.deviceId}.`
  //       );
  //       if (pin) {
  //         response.pin = pin;
  //         response.confirmed = true;
  //       } else {
  //         response.confirmed = false;
  //       }
  //     }
  //   }
  //   ipcRenderer.send("bluetooth-pairing-response", response);
  // });
  // 蓝牙扫描出来的设备
  ipcRenderer.on("find-device", (event, data) => {
    deviceList.value = data;
  });
});
</script>
<style scoped></style>
