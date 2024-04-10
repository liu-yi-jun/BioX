<template>
  <div class="header">
    <div>BraInward BioX</div>
    <div class="header-headset" v-if="!isConnect" @click="findDevice">
      <span>Connect device</span>
    </div>
    <div class="header-center" v-else>
      <span>BIO X</span>
      <div class="electricity">
        <span>100</span>
      </div>
    </div>
    <div></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, getCurrentInstance } from "vue";
const ipcRenderer = require("electron").ipcRenderer;
import { CustomBluetooth } from "../utils/bluetooth";
const isConnect = ref(false);
import { message } from "ant-design-vue";
const app = getCurrentInstance();
const findDevice = async () => {
  app?.proxy?.loading.show();
  new CustomBluetooth().init((value,msg) => {
    app?.proxy?.loading.hide();
    if(value){
      isConnect.value = true;
      message.success('连接成功');
    }else{
      message.error(msg);
    }
  });

};
onMounted(() => {
  ipcRenderer.on("bluetooth-pairing-request", () => (event, details) => {
    debugger;
    const response: any = {};
    switch (details.pairingKind) {
      case "confirm": {
        response.confirmed = window.confirm(
          `Do you want to connect to device ${details.deviceId}?`
        );
        break;
      }
      case "confirmPin": {
        response.confirmed = window.confirm(
          `Does the pin ${details.pin} match the pin displayed on device ${details.deviceId}?`
        );
        break;
      }
      case "providePin": {
        const pin = window.prompt(
          `Please provide a pin for ${details.deviceId}.`
        );
        if (pin) {
          response.pin = pin;
          response.confirmed = true;
        } else {
          response.confirmed = false;
        }
      }
    }
    ipcRenderer.send("bluetooth-pairing-response", response);
  });
});
</script>
<style scoped></style>
