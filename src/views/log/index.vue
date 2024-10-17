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
        <a-space>
          <a-button v-if="!isConnectSocket" @click="changeSocket"
            >连接</a-button
          >
          <a-button v-else @click="changeSocket">取消连接</a-button>
          <a-button v-if="isSendSocket" @click="cancelSocket"
            >取消发送</a-button
          >
          <a-button v-else @click="sendSocket">模拟发送</a-button>
        </a-space>
      </a-form>
    </div>
    <div style="margin-top: 20px">
      <a-form size="small" layout="inline">
        <a-form-item label="serialPort"> com3 </a-form-item>
        <a-space>
          <a-button
            v-if="!configData.serialPort.isConnect"
            @click="changeSerialPortState"
            >连接</a-button
          >
          <a-button v-else @click="changeSerialPortState">取消连接</a-button>
        </a-space>
      </a-form>
    </div>
    <div style="margin-top: 20px">
      <a-form size="small">
        <a-form-item label="mindfulness">
          <span style="margin-right:20px" v-for="(item, index) in mindfulness_restfulness" :key="index">
            {{ item[0][0] }}---{{ item[1][0] }}
          </span>
        </a-form-item>
        <a-form-item label="restfulness">
          <span style="margin-right:20px" v-for="(item, index) in mindfulness_restfulness" :key="index">
         {{ item[0][1] }}---{{ item[1][1] }}
          </span>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useIndexStore } from "../../store/index";
import { CustomBluetooth } from "../../utils/bluetooth";
import { storeToRefs } from "pinia";
const indexStore = useIndexStore();
const { isConnect, bluetoothATConfig, configData, socketConfig } =
  storeToRefs(indexStore);
const ipcRenderer = require("electron").ipcRenderer;
import { CustomDatabase } from "../../utils/db";
import { message } from "ant-design-vue";
const db = new CustomDatabase();
let bluetooth = new CustomBluetooth();
const mindfulness_restfulness = ref();
import _ from "lodash";
const isConnectSocket = ref<boolean>(false);
const isSendSocket = ref<boolean>(false);
const isCreateSocketServer = ref<boolean>(false);
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
    if (data.type == 1) {
      message.success(data.msg);
      isConnectSocket.value = true;
    }
    if (data.type == 0) {
      message.success(data.msg);
      isConnectSocket.value = false;
    }
    if (data.type == -1) {
      message.error(data.msg);
    }
  }
};

const handleSerialPortReceiveData = (event: any, data: any) => {
  if (data.msg) {
    if (data.type == 1) {
      message.success(data.msg);
      configData.value.serialPort.isConnect = true;
    }
    if (data.type == 0) {
      message.success(data.msg);
      configData.value.serialPort.isConnect = false;
    }
    if (data.type == -1) {
      message.error(data.msg);
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

const changeSerialPortState = () => {
  if (configData.value.serialPort.isConnect) {
    ipcRenderer.send("close-serialPort");
  } else {
    ipcRenderer.send("create-serialPort");
  }
};

const sendSocket = () => {
  if (!isConnectSocket.value) {
    return message.error("请先连接");
  }
  // 读取txt文件并且将数据发送到socket
  ipcRenderer.send("start-send-socket");
  isSendSocket.value = true;
};
const cancelSocket = () => {
  ipcRenderer.send("end-send-socket");
  isSendSocket.value = false;
};

// 蓝牙数据通知
const bluetoothNotice = (data) => {
  mindRestThrottle(data.mindfulness_restfulness_s_multiple);
};

const mindRestThrottle = _.throttle(function (
  mindfulness_restfulness_s_multiple
) {
  mindfulness_restfulness.value = mindfulness_restfulness_s_multiple;
},
60);

onMounted(() => {
  bluetooth.addNotice(bluetoothNotice);
  // 监听socket
  ipcRenderer.on("receive-socket", handleSocketReceiveData);
  ipcRenderer.on("receive-serialPort", handleSerialPortReceiveData);
});

onBeforeUnmount(() => {
  bluetooth.removeNotice(bluetoothNotice);
  ipcRenderer.removeListener("receive-serialPort", handleSerialPortReceiveData);
  ipcRenderer.removeListener("receive-socket", handleSocketReceiveData);
});
</script>
<style scoped></style>
