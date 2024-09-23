<template>
  <div class="header">
    <div>
      BioMultiLite_1.2.0_240923_Alpha_Win
      <a-button @click="openAtDebug">
        <template #icon>
          <BugOutlined />
        </template>
      </a-button>
    </div>
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
            <span>{{batteryState}}</span>
          </div>
        </div>
        <template #overlay>
          <a-menu>
            <a-menu-item>
              <div @click="closeDevice" style="text-align: center; color: #666;padding: 6px 12px;">
                断开连接
              </div>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <div>
      <a-space size="middle">
        <a-dropdown placement="bottom" >
          <a-button>
            <template #icon>
              <SettingOutlined />
            </template>
          </a-button>
          <template #overlay>
            <a-menu>
              <!-- <a-menu-item> 
                <div @click="openDevTools">
                  DevTools
                </div>
              </a-menu-item> -->
              <a-menu-item>
                <div style="padding: 6px 26px" @click="openSettingModal">
                  Fillters
                </div>
              </a-menu-item>
              <a-menu-item>
                <div style="padding: 6px 26px" @click="openMarkerModal">
                  Marker
                </div>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
        <a-button @click="minimizeWindow">
          <template #icon>
            <MinusOutlined />
          </template>
        </a-button>

        <a-button danger type="primary" @click="closeWindow">
          <template #icon>
            <CloseCircleOutlined />
          </template>
        </a-button>
      </a-space>
    </div>
  </div>
  <a-modal
    v-model:open="openATModal"
    title="AT指令调试"
    cancelText="取消"
    width="40%"
    :maskClosable="false"
    okText="发送"
    :footer="null"
  >
    <span style="color: #999">例：AT+STOP_ALL(无需回车)</span>
    <a-textarea
      style="margin-top: 5px"
      v-model:value="ATValue"
      placeholder=""
      :rows="6"
    />
    <br />
    <br />
    <div class="at-content" ref="atContent">
      <p v-for="(item, index) in atNoticeList" :key="index">
        <span style="margin-right: 5px">{{
          formatTimestamp(item.time, "yyyy-MM-dd HH:mm:ss", true)
        }}</span>
        <span style="margin-right: 5px">{{
          item.type === 1 ? "发:" : "收:"
        }}</span>
        <span>{{ item.content }}</span>
      </p>
    </div>
    <div class="right-btn-footer">
      <a-button type="primary" @click="handleStartATModal">Send</a-button>
      <a-button @click="handleEndATModal">Cancel</a-button>
    </div>
  </a-modal>
  <a-modal
    v-model:open="openSetting"
    title="Filters"
    :footer="null"
    @cancel="handleEndSettingModal"
    width="600px"
    :maskClosable="false"
  >
    <a-tabs class="header-tab" v-model:activeKey="activeKey" centered>
      <a-tab-pane key="1" tab="EEG">
        <div class="DC-Notch">
          <a-checkbox
            :disabled="configData.eegFilter.isBandPass"
            v-model:checked="configData.eegFilter.isDCRemove"
            >DC Offset</a-checkbox
          >
          <a-checkbox v-model:checked="configData.eegFilter.isNotch"
            >Notch</a-checkbox
          >
        </div>
        <a-divider />
        <div class="BP-wrap">
          <a-checkbox
            @change="changeEegBandPass"
            v-model:checked="configData.eegFilter.isBandPass"
            >BandPass</a-checkbox
          >
          <div class="BP-input">
            <div>
              <span>Start(Hz)</span>
              <!-- 最大值为 1/2Fs(向下取整) -->
              <a-input-number
                size="small"
                v-model:value="configData.eegFilter.fl"
                :min="0"
                :max="Math.floor(configData.eegFilter.sample_rate / 2)"
                :step="0.1"
              ></a-input-number>
            </div>
            <div>
              <span>Stop(Hz)</span>
              <!-- 最大值为 1/2Fs(向下取整) -->
              <a-input-number
                size="small"
                v-model:value="configData.eegFilter.fh"
                :min="0"
                :max="Math.floor(configData.eegFilter.sample_rate / 2)"
                :step="0.1"
              ></a-input-number>
            </div>
            <div>
              <span>Type</span>
              <a-select
                v-model:value="configData.eegFilter.bpType"
                :style="{ 'min-width': '100px' }"
                placeholder="Channels"
                :options="eegTypeOptions"
                size="small"
              ></a-select>
            </div>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="FNIRS" force-render
        ><div class="DC-Notch">
          <a-checkbox
            :disabled="configData.irFilter.isBandPass"
            v-model:checked="configData.irFilter.isDCRemove"
            >DC Offset</a-checkbox
          >
        </div>
        <a-divider />
        <div class="BP-wrap">
          <a-checkbox
            @change="changeIrBandPass"
            v-model:checked="configData.irFilter.isBandPass"
            >BandPass</a-checkbox
          >
          <div class="BP-input">
            <div>
              <span>Start(Hz)</span>
              <!-- 最大值为 1/2Fs(向下取整) -->
              <a-input-number
                size="small"
                v-model:value="configData.irFilter.fl"
                :min="0"
                :max="Math.floor(configData.irFilter.ir_sample_rate / 2)"
                :step="0.01"
              ></a-input-number>
            </div>
            <div>
              <span>Stop(Hz)</span>
              <!-- 最大值为 1/2Fs(向下取整) -->
              <a-input-number
                size="small"
                v-model:value="configData.irFilter.fh"
                :min="0"
                :max="Math.floor(configData.irFilter.ir_sample_rate / 2)"
                :step="0.01"
              ></a-input-number>
            </div>
            <div>
              <span>Type</span>
              <a-select
                v-model:value="configData.irFilter.bpType"
                :style="{ 'min-width': '100px' }"
                placeholder="Channels"
                :options="eegTypeOptions"
                size="small"
              ></a-select>
            </div>
          </div></div
      ></a-tab-pane>
    </a-tabs>
    <div class="modal-btn-footer">
      <a-button type="primary" @click="handleSaveSetting">Save</a-button>
      <a-button @click="handleResetSetting">Reset</a-button>
      <a-button @click="handleCancelSetting">Cancel</a-button>
    </div>
  </a-modal>
  <a-modal
    v-model:open="openMarker"
    title="Marker"
    :footer="null"
    @cancel="handleMarkerModal"
    width="600px"
    :maskClosable="true"
  >
    <div>
      <p>
        Please edit the Marker and define the trigger description for each
        Marker
      </p>
      <a-form
        :disabled="isMarker"
        class="marker-form"
        style="margin-bottom: 10px"
      >
        <a-row style="margin-top: 15px" :gutter="24">
          <a-col :span="10"
            ><span style="color: red">* </span><span>Marker</span></a-col
          >
          <a-col :span="14"><span>Description</span></a-col>
        </a-row>
        <div
          style="
            margin-top: 10px;
            max-height: 60vh;
            min-height: 20vh;
            overflow-y: auto;
            overflow-x: hidden;
          "
        >
          <a-row :gutter="24" v-for="(item, index) in markerList" :key="index">
            <a-col :span="10">
              <a-select
                allowClear
                style="width: 100%"
                v-model:value="item.type"
                placeholder="Please select the Marker"
                :options="markerOptions"
                @select="(e) => handleMarkerSelect(e, item)"
              ></a-select>
            </a-col>
            <a-col :span="12">
              <a-form-item>
                <a-input
                  :disabled="!item.type || isMarker"
                  v-model:value="item.description"
                  placeholder="Please eidt the Description"
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="2">
              <span
                :style="{ cursor: isMarker ? 'not-allowed' : 'pointer' }"
                v-if="markerList.length > 1"
                @click="handleDeleteMarker(index)"
                class="marker-item-delete"
              >
                <DeleteOutlined style="font-size: 14px"
              /></span>
            </a-col>
          </a-row>
        </div>
      </a-form>
      <div class="right-btn-footer">
        <span
          style="display: inline-block; padding-top: 5px; margin-right: 5px"
          v-if="isMarker"
          type="text"
          ><CheckCircleOutlined style="color: #67c23a" />
          <span style="margin-left: 6px;color: #67c23a">Started</span></span
        >
        <a-button v-else type="primary" @click="handleStartMarker"
          >Start</a-button
        >
        <a-button type="primary" v-if="isMarker" @click="handleStopMarker"
          >Stop</a-button
        >
        <a-button v-else @click="handleCancelMarker">Cancel</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  onMounted,
  getCurrentInstance,
  watch,
  onBeforeUnmount,
  nextTick,
} from "vue";
let copyConfigData: any = {};
let ResetConfigData: any = {
  eegFilter: {
    isDCRemove: true,
    isNotch: true,
    isBandPass: true,
    fl: 0.1,
    fh: 100,
    bpType: 1,
    sample_rate: 250,
  },
  irFilter: {
    isDCRemove: true,
    isBandPass: true,
    is2wave: true,
    is3wave: false,
    age: 25,
    fl: 0.01,
    fh: 5,
    bpType: 1,
    plotType: 1,
    ir_sample_rate: 50,
  },
};
const ipcRenderer = require("electron").ipcRenderer;
import {
  DeploymentUnitOutlined,
  MinusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons-vue";
import { CustomBluetooth } from "../utils/bluetooth";
import { CustomDatabase } from "../utils/db";
import { formatTimestamp } from "../utils/common";
import { useRoute, useRouter } from "vue-router";
import {
  CloseCircleOutlined,
  BugOutlined,
  SettingOutlined,
} from "@ant-design/icons-vue";
import { useIndexStore } from "../store/index";
import { storeToRefs } from "pinia";
const indexStore = useIndexStore();
const { isConnect, bluetoothATConfig, configData, isMarker,markerList } =
  storeToRefs(indexStore);
import { createVNode } from "vue";
const connectVisible = ref<boolean>(false);
const batteryState = ref(0);
const ATValue = ref("");
import { message } from "ant-design-vue";
const bluetooth = new CustomBluetooth();
const app = getCurrentInstance();
const db = new CustomDatabase();
const openATModal = ref(false);
const openSetting = ref(false);
const openMarker = ref(false);
const router = useRouter();
const activeKey = ref("1");
import { Modal, SelectProps } from "ant-design-vue";
const eegTypeOptionsData = [
  {
    value: 1,
    label: "Butterworth",
  },
  {
    value: 2,
    label: "ChebyshevI",
  },
  {
    value: 3,
    label: "ChebyshevII",
  },
];
const eegTypeOptions = ref<SelectProps["options"]>(eegTypeOptionsData);
const markerOptions = ref<SelectProps["options"]>([]);
let timer_uuid: any = null;
const atContent: any = ref(null);

interface DeviceItem {
  deviceId: string;
  deviceName: string;
}
interface NoticeItem {
  time: number;
  type: number;
  content: string;
}
let selectDeviceItem: DeviceItem | null = null;
const deviceList = ref<DeviceItem[]>([]);
const atNoticeList = reactive<NoticeItem[]>([]);



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

watch(
  () => router.currentRoute.value,
  (to, from) => {
    if (to.name == "EEG") {
      activeKey.value = "1";
    }
    if (to.name == "FNIRS") {
      activeKey.value = "2";
    }
  },
  { immediate: false, deep: true } // 这里的 deep: true 是因为我们想深度监听路由对象的变化
);

watch(
  bluetoothATConfig,
  (value) => {
    setAtConfig();
  },
  { deep: true }
);

watch(
  markerList,
  (value) => {
    markerOptions.value?.forEach((item) => {
      item.disabled = false;
    });
    value.forEach((marker) => {
      let index = markerOptions.value?.findIndex(
        (item) => marker.type === item.value
      );
      if (index !== undefined && index > -1) {
        markerOptions.value && (markerOptions.value[index].disabled = true);
      }
    });
  },
  { deep: true }
);

// 设置AT配置
const setAtConfig = () => {
  // 发送初始化配置
  if (isConnect.value) {
    for (const key in bluetoothATConfig.value) {
      const item = bluetoothATConfig.value[key];
      bluetooth.sendAT(`AT+${key}${item.operate}${item.value}`);
    }
  }
};

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
          setAtConfig();
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

// 收缩窗口
const minimizeWindow = () => {
  ipcRenderer.send("minimize-window");
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
      findDevice();
      // app?.proxy?.loading.show("获取UUID中...");
      // timer_uuid = setTimeout(() => {
      //   app?.proxy?.loading.hide();
      //   timer_uuid && clearTimeout(timer_uuid);
      //   return message.error("获取UUID失败");
      // }, 120 * 1000);
      // // 未连接过的设备，调python生成uuid
      // ipcRenderer.send("python-uuid", item.deviceId);
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

// 测试蓝牙扫描
const findDeviceList = () => {
  bluetooth.bluetoothScan();
};
// 用户点击，开始连接蓝牙
const clickme = () => {
  findDevice();
};

const openSettingModal = () => {
  copyConfigData = JSON.parse(JSON.stringify(configData.value));
  openSetting.value = true;
};

// at通知事件
const atNotice = (value: string) => {
  console.log("at通知事件", value);
  atNoticeList.push({
    time: new Date().getTime(),
    type: 2,
    content: value,
  });
  scrollToBottom();
};

// 打开AT调试
const openAtDebug = () => {
  ATValue.value = "";
  bluetooth.addATNotice(atNotice);
  openATModal.value = true;
  scrollToBottom();
};

// 关闭AT调试
const handleEndATModal = () => {
  bluetooth.removeATNotice(atNotice);
  openATModal.value = false;
};

// 发送AT指令
const handleStartATModal = () => {
  atNoticeList.push({
    time: new Date().getTime(),
    type: 1,
    content: ATValue.value,
  });
  bluetooth.sendAT(ATValue.value);
  scrollToBottom();
};

const scrollToBottom = () => {
  nextTick(() => {
    if (atContent.value) {
      atContent.value.scrollTo({
        behavior: "smooth",
        top: atContent.value.scrollHeight,
      });
    }
  });
};

const initMarketOptions = () => {
  for (let i = 65; i <= 90; i++) {
    markerOptions.value?.push({
      label: String.fromCharCode(i),
      value: String.fromCharCode(i),
      disabled: false,
    });
  }
};

const initialize = () => {
     bluetooth.addNotice(bluetoothNotice);
}

// 蓝牙数据通知
const bluetoothNotice = ({pkg_type,Battery_State}:{pkg_type:number,Battery_State:number}) => {
 if(pkg_type == 0) {
    batteryState.value = Battery_State
  }
};

onMounted(() => {
  initialize();
  // 初始化A-Z Market选项
  initMarketOptions();
  // 蓝牙扫描出来的设备
  ipcRenderer.on("find-device", (event, data) => {
    deviceList.value = data;
  });
  // python生成uuid
  ipcRenderer.on("python-uuid-response", (event, data) => {
    timer_uuid && clearTimeout(timer_uuid);
    data = JSON.parse(data);
    if (!data.address) {
      app?.proxy?.loading.hide();
      return message.error("获取UUID失败");
    }
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
          content: createVNode("div", null, [
            createVNode("p", null, `Name：${data.name}`),
            createVNode(
              "p",
              null,
              `UUID：${data.services[data.services.length - 1].uuid}`
            ),
          ]),
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
  //
  ipcRenderer.on("select-bluetooth-callback", (event, data) => {
    if (!data) {
      // 执行失败
      app?.proxy?.loading.hide();
      return message.error(
        "执行失败，请不用频繁操作，并确保蓝牙设备处于广播状态！"
      );
    }
  });
  ipcRenderer.on("change-config-field-success", changeConfigSuccess);
});

onBeforeUnmount(() => {
  ipcRenderer.removeListener(
    "change-config-field-success",
    changeConfigSuccess
  );

  bluetooth.removeATNotice(atNotice);
  bluetooth.removeNotice(bluetoothNotice);
  timer_uuid && clearTimeout(timer_uuid);
});

const handleCancelSetting = () => {
  handleEndSettingModal();
  openSetting.value = false;
};

const handleEndSettingModal = () => {
  configData.value = JSON.parse(JSON.stringify(copyConfigData));
};

const handleResetSetting = () => {
  configData.value = JSON.parse(JSON.stringify(ResetConfigData));
};

const handleSaveSetting = () => {
  // db.all(`select * from config`).then((list) => {
  //   if (list.length > 0) {
  //     db.update(
  //       "config",
  //       {
  //         configData: JSON.stringify(configData.value),
  //       },
  //       {
  //         id: list[0].id,
  //       }
  //     );
  //   }
  // });

  if (configData.value.eegFilter.fl == null) {
    return message.error("请输入EEG起始频率");
  }
  if (configData.value.eegFilter.fh == null) {
    return message.error("请输入EEG结束频率");
  }
  if (configData.value.eegFilter.fl >= configData.value.eegFilter.fh) {
    return message.error("EEG起始频率必须小于结束频率");
  }
  if (configData.value.irFilter.fl == null) {
    return message.error("请输入FNIRS起始频率");
  }
  if (configData.value.irFilter.fh == null) {
    return message.error("请输入FNIRS结束频率");
  }
  if (configData.value.irFilter.fl >= configData.value.irFilter.fh) {
    return message.error("FNIRS起始频率必须小于结束频率");
  }

  ipcRenderer.send(
    "change-config-field",
    JSON.stringify({
      field: "filterConfig",
      config: configData.value,
    })
  );
  openSetting.value = false;
};

const changeConfigSuccess = (event, data) => {
  if (data.field === "filterConfig") {
    indexStore.isEegClear = true;
    indexStore.isIrClear = true;
  }
};

const changeEegBandPass = () => {
  if (configData.value.eegFilter.isBandPass) {
    indexStore.configData.eegFilter.isDCRemove = true;
  }
};

const changeIrBandPass = () => {
  if (configData.value.irFilter.isBandPass) {
    indexStore.configData.irFilter.isDCRemove = true;
  }
};

const openMarkerModal = () => {
  openMarker.value = true;
};

const handleMarkerModal = () => {};

// 删除标记
const handleDeleteMarker = (index) => {
  if (isMarker.value) {
    return;
  }
  markerList.value.splice(index, 1);
};
const handleMarkerSelect = (value, oldItem) => {
  let flag = false;
  markerList.value.forEach((item) => {
    if (!item.type) {
      flag = true;
    }
  });
  if (!flag) {
    markerList.value.push({
      type: undefined,
      description: "",
    });
  }
};

const handleCancelMarker = () => {
  openMarker.value = false;
};
const handleStartMarker = () => {
  indexStore.isMarker = true;
  // message.success("启动标记!");
};
const handleStopMarker = () => {
  indexStore.isMarker = false;
  // message.success("结束标记!");
};

</script>
<style scoped></style>
