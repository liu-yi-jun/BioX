<template>
  <div style="padding: 20px">
    <div>
      <a-form size="small" layout="inline">
        <a-form-item label="tow">
          <a-input-number
            size="small"
            v-model:value="configData.irFilter.two_ir_sample_rate"
            :min="0"
            :step="0.1"
          ></a-input-number>
        </a-form-item>
        <a-form-item label="three">
          <a-input-number
            size="small"
            v-model:value="configData.irFilter.three_ir_sample_rate"
            :min="0"
            :step="0.1"
          ></a-input-number>
        </a-form-item>
        <a-button @click="changewava">保存</a-button>
      </a-form>
    </div>
    <div style="margin-top: 20px">
      <a-form size="small" layout="inline">
        <a-form-item label="port">
          <a-input-number
            size="small"
            v-model:value="socketConfig.port"
            :min="1"
            :step="1"
          ></a-input-number>
        </a-form-item>
        <a-button v-if="!isConnectSocket" @click="changeSocket">连接</a-button>
        <a-button v-else   @click="changeSocket">取消连接</a-button>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useIndexStore } from "../../store/index";
import { storeToRefs } from "pinia";
const indexStore = useIndexStore();
const { isConnect, bluetoothATConfig, configData, socketConfig } =
  storeToRefs(indexStore);
const ipcRenderer = require("electron").ipcRenderer;
import { CustomDatabase } from "../../utils/db";
import { message } from "ant-design-vue";
const db = new CustomDatabase();
const isConnectSocket = ref<boolean>(false);
const changewava = () => {
  ipcRenderer.send(
    "change-config-field",
    JSON.stringify({
      field: "filterConfig",
      config: configData.value,
    })
  );
  db.all(`select * from config`).then((list) => {
    if (list.length > 0) {
      let copeConfigData = JSON.parse(list[0].configData);
      copeConfigData.irFilter.two_ir_sample_rate =
        configData.value.irFilter.two_ir_sample_rate;
      copeConfigData.irFilter.three_ir_sample_rate =
        configData.value.irFilter.three_ir_sample_rate;
      copeConfigData.irFilter.ir_sample_rate =
        configData.value.irFilter.two_ir_sample_rate;
      db.update(
        "config",
        {
          configData: JSON.stringify(copeConfigData),
        },
        {
          id: list[0].id,
        }
      );
      message.success("保存成功");
    }
  });
};
const handleSocketReceiveData = (event: any, data: any) => {
  if (data.msg) {
    
    message.success(data.msg);
    if(data.type == 1){
      isConnectSocket.value = true;
    }
    if(data.type == 0){
      isConnectSocket.value = false;
    }
  }
};

const changeSocket = () => {
  if (isConnectSocket.value) {
    ipcRenderer.send("cancel-socket");
  } else {
    ipcRenderer.send("connect-socket", {
      port: socketConfig.value.port,
    });
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
