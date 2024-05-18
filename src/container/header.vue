<template>
  <div class="header">
    <div @click="findDeviceList">BraInward BioX</div>
    <a-popover
      v-if="!isConnect"
      overlayClassName="header-device-popover"
      v-model:open="connectVisible"
      :overlayStyle="{ width: '300px' }"
      trigger="click"
    >
      <template #content>
        <div>
          <ul class="header-device-list" v-if="deviceList.length">
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
          <div v-else class="header-device-loading">
            <a-spin />
          </div>
        </div>
      </template>
      <div class="header-headset" @click="openConnectVisible">
        <span>Connect device</span>
      </div>
    </a-popover>

    <div v-else>
      <a-dropdown placement="bottom" trigger="click" arrow>
        <div class="header-center">
          <span>BIO X</span>
          <div class="electricity">
            <span>100</span>
          </div>
        </div>
        <template #overlay>
          <a-menu>
            <a-menu-item>
              <div @click="closeDevice" style="text-align: center; color: #666">
                断开连接
              </div>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <div>
      <a-button danger type="primary" @click="closeWindow">
        <template #icon>
          <CloseCircleOutlined />
        </template>
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, getCurrentInstance, watch } from "vue";
const ipcRenderer = require("electron").ipcRenderer;
import { DeploymentUnitOutlined } from "@ant-design/icons-vue";
import { CustomBluetooth } from "../utils/bluetooth";
import { CustomDatabase } from "../utils/db";
import { CloseCircleOutlined } from "@ant-design/icons-vue";
import { createVNode } from 'vue';
const isConnect = ref(false);
const connectVisible = ref<boolean>(false);
import { message } from "ant-design-vue";
const bluetooth = new CustomBluetooth();
const app = getCurrentInstance();
const db = new CustomDatabase();
import { Modal } from "ant-design-vue";

interface DeviceItem {
  deviceId: string;
  deviceName: string;
}
let selectDeviceItem: DeviceItem | null = null;
const deviceList = ref<DeviceItem[]>([]);

const openConnectVisible = () => {
  connectVisible.value = true;
  bluetooth.scan();
};

// watch(connectVisible, (value) => {
//   if (!value && !selectDeviceItem) {
//     // 取消蓝牙扫描
//     // ipcRenderer.send("cancel-bluetooth-request");
//   } else {
//     selectDeviceItem = null;
//     debugger;
//   }
// });

// 蓝牙扫描和连接
const findDevice = () => {
  bluetooth.init((value, msg) => {
    if (value) {
      switch (msg) {
        case "initComplete":
          connectBluetooth();
          break;
        case "loading":
          app?.proxy?.loading.show("连接设备中...");
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
      if (msg !== "User cancelled the requestDevice() chooser.") {
        message.error(msg);
      }
    }
  }, selectDeviceItem?.deviceId);
};

// 关闭应用
const closeWindow = () => {
  ipcRenderer.send("close-window");
};

// 确认连接设备
const connectDevice = (item) => {
  app?.proxy?.loading.show();
  selectDeviceItem = item;
  // 取消蓝牙扫描
  ipcRenderer.send("cancel-bluetooth-request");
  console.log("selectDeviceItem", selectDeviceItem);
  db.all(`select * from device`).then((list) => {
    const device = list.find((i) => i.deviceId === item.deviceId);
    if (device) {
      // 连接过的设备，直接连接
      findDevice();
    } else {
      app?.proxy?.loading.show("获取UUID中...");
      // 未连接过的设备，调python生成uuid
      ipcRenderer.send("python-uuid", item.deviceId);
    }
  });

  connectVisible.value = false;
};

const connectBluetooth = () => {
  // 发起连接
  ipcRenderer.send(
    "connect-bluetooth-device",
    JSON.stringify(selectDeviceItem)
  );
};

// 蓝牙断开
const closeDevice = () => {
  selectDeviceItem = null;
  bluetooth.close((value, msg) => {
    isConnect.value = false;
    message.success(msg);
  });
};

// 蓝牙扫描
const findDeviceList = () => {
  bluetooth.bluetoothScan();
};
// 用户点击，开始连接蓝牙
const clickme = () => {
  findDevice();
};

onMounted(() => {
  // 蓝牙扫描出来的设备
  ipcRenderer.on("find-device", (event, data) => {
    deviceList.value = data;
  });
  // python生成uuid
  ipcRenderer.on("python-uuid-response", (event, data) => {
    data = JSON.parse(data);
    db.insert("device", {
      deviceId: data.address,
      uuidList: JSON.stringify(data.services),
      name: data.name,
      describe: "",
      createTime: new Date().getTime(),
    })
      .then((res) => {
        // 获取uuid后，直接调用会报错，所以得弹出框对话框
        Modal.confirm({
          title: "确认要连接设备",
          content: createVNode("div", null, [createVNode("p", null, `Name：${data.name}`),createVNode("p", null, `UUID：${data.services[data.services.length - 1].uuid}`)]),
          okText: "确认",
          cancelText: "取消",
          onOk() {
            findDevice();
          },
          onCancel() {
            app?.proxy?.loading.hide();
          },
        });
      })
      .catch((err) => {
        console.log("error", err);
      });
  });
});
</script>
<style scoped></style>
