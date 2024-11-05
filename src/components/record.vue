<template>
  <div class="record-box">
    <div class="record-close" v-if="!isRecord" @click="playClose">
      <CloseCircleOutlined />
    </div>
    <div class="record-slider">
      <span class="record-title" v-if="!isRecord"
        >{{ name }}/{{ instanceID }}</span
      >
      <div class="record-slider-box">
        <div class="record-icon-box">
          <div
            @click="showStartRecordModal"
            v-if="isRecord && status === 0"
            class="start-record-icon"
          ></div>
          <div
            @click="changeStatus('recordEnd')"
            v-if="isRecord && status === 1"
            class="progress-record-icon"
          ></div>
          <PlayCircleOutlined
            @click="changeStatus('playStart')"
            v-if="!isRecord && status === 0"
          ></PlayCircleOutlined>
          <PauseCircleOutlined
            @click="changeStatus('playEnd')"
            v-if="!isRecord && status === 1"
          ></PauseCircleOutlined>
        </div>
        <div class="eig-slider">
          <a-slider
            :min="minTime"
            :max="totalTime"
            :step="playGap"
            @afterChange="changeTime"
            :tipFormatter="tipFormatter"
            v-model:value="currentTime"
            :disabled="disabled"
          />
        </div>
        <span v-if="!isRecord"
          >{{ tipFormatter(currentTime) }}/{{ tipFormatter(totalTime) }}</span
        >
      </div>
    </div>
    <a-modal
      v-model:open="openStartRecordModal"
      :title="modelStatus ? '是否保存数据录制' : '创建数据记录'"
      cancelText="取消"
      :maskClosable="false"
      okText="确认"
      @ok="handleStartRecordModal"
      @cancel="handleEndRecordModal"
    >
      <a-form
        style="padding-top: 30px"
        name="basic"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
        autocomplete="off"
      >
        <a-form-item label="名称" name="name" v-bind="validateInfos.name">
          <a-input v-model:value="formData.name" />
        </a-form-item>
        <a-form-item
          label="描述"
          name="describe"
          v-bind="validateInfos.describe"
        >
          <a-input v-model:value="formData.describe" />
        </a-form-item>
        <a-form-item v-if="modelStatus == 1" label="创建时间">
          <span>{{
            formatTimestamp(recoredCreateTime, "yyyy-MM-dd HH:mm:ss", true)
          }}</span>
        </a-form-item>
        <a-form-item v-if="modelStatus == 1" label="总时间长">
          <span>{{ tipFormatter(recoredTotalTime) }}</span>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  toRaw,
  onMounted,
  watch,
  getCurrentInstance,
  onBeforeUnmount,
} from "vue";
import { CustomDatabase } from "../utils/db";
import { message } from "ant-design-vue";
import { Form } from "ant-design-vue";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons-vue";
import { formatTimestamp, tipFormatter } from "../utils/common";
import { irInputMarkerList, eegInputMarkerList } from "../global";
import { useIndexStore } from "../store/index";
import { storeToRefs } from "pinia";
const app = getCurrentInstance();
const indexStore = useIndexStore();
const {
  play,
  recordId,
  playGap,
  playIndex,
  isDragSlider,
  isConnect,
  markerList,
  recordProgress,
  isNormalClose,
  isDeviceClose,
  isManyReconnect,
  configData,
} = storeToRefs(indexStore);
const useForm = Form.useForm;
const disabled = ref<boolean>(true);
// 0:开始 1:进行中
const status = ref<number>(0);
const isRecord = ref<boolean>(true);
const openStartRecordModal = ref<boolean>(false);
// 进度条最小时间
const minTime = ref<number>(0);
const recordtotalTime = 60 * 60 * 1000;
// 进度条总时间
const totalTime = ref<number>(recordtotalTime);
// 进度条当前时间
const currentTime = ref<number>(0);
// 记录创建时间
const recoredCreateTime = ref<number>(0);
// 记录结束时间
const recoredEndTime = ref<number>(0);
// 记录总时间长
const recoredTotalTime = ref<number>(0);
// 弹出框状态 0:创建 1:结束
const modelStatus = ref<number>(0);
const name = ref<string>("");
const instanceID = ref<string>("");

const ipcRenderer = require("electron").ipcRenderer;

let tempCurrentTime = 0;

// const recordSaveTime = 10 * 1000;

let recordLastID = 0;
// let timerRecord: any = null;

let timer;
let db;
const emit = defineEmits(["onRecord", "onStatus"]);

watch(isConnect, (newValue) => {
  if (
    !newValue &&
    status.value === 1 &&
    (isNormalClose.value || isDeviceClose.value)
  ) {
    changeStatus("recordEnd");
  }
});

// 多次重连失败，停止录制
watch(isManyReconnect, (newValue) => {
  if (newValue && status.value === 1) {
    changeStatus("recordEnd");
  }
});

watch(recordId, (newValue, oldValue) => {
  if (newValue) {
    isRecord.value = false;
    disabled.value = false;
    currentTime.value = 0;
    db.get(
      `select recoredTotalTime,name,recoredCreateTime from record where id = ${recordId.value}`
    ).then((res) => {
      totalTime.value = res.recoredTotalTime;
      name.value = res.name;
      instanceID.value = res.recoredCreateTime;
    });
  }
});

watch(isRecord, (newValue, oldValue) => {
  emit("onRecord", newValue);
});
watch(status, (newValue, oldValue) => {
  emit("onStatus", newValue);
});
watch(play, (newValue) => {
  if (!newValue) {
    status.value = 0;
    timer && clearInterval(timer);
  }
});

interface FormState {
  name: string;
  describe: string;
}

const formData = reactive<FormState>({
  name: "",
  describe: "",
});

const rulesRef = reactive({
  name: [{ required: true, message: "请输入名称" }],
  // describe: [{ required: true, message: "请输入描述" }],
});
const { resetFields, validate, validateInfos } = useForm(formData, rulesRef);

onMounted(() => {
  db = new CustomDatabase();
});

const changeStatus = (process: string) => {
  if (process == "recordStart") {
    recordProgress.value = true;
  }
  if (process == "recordEnd") {
    recordProgress.value = false;
  }
  status.value = status.value === 0 ? 1 : 0;

  if (status.value === 1 && isRecord.value === false) {
    // 开始播放录制
    indexStore.play = true;
  }
  // 进行中
  if (status.value === 1) {
    timer = setInterval(() => {
      currentTime.value = currentTime.value + playGap.value;
      if (currentTime.value > totalTime.value) {
        if (isRecord.value) {
          openModal();
        }
        status.value = 0;
        timer && clearInterval(timer);
        indexStore.play = false;
        return;
      }
      indexStore.playIndex++;
    }, playGap.value);
  }

  // 暂停
  if (status.value === 0) {
    timer && clearInterval(timer);
    indexStore.play = false;
  }

  // 是否保存数据录制
  if (status.value === 0 && isRecord.value === true) {
    // 打开弹出框
    openModal();
  }
};
//是否保存数据录制
const openModal = () => {
  recoredEndTime.value = new Date().getTime();
  modelStatus.value = 1;
  // 停止存储
  ipcRenderer.send("stop-store");

  recoredTotalTime.value = recoredEndTime.value - recoredCreateTime.value;
  openStartRecordModal.value = true;
};

const showStartRecordModal = () => {
  openStartRecordModal.value = true;
};

const generateUniqueId = () => {
  // 获取当前时间戳的毫秒部分
  const timestamp = Date.now().toString(36).slice(-8); // 转换为36进制并取后8位

  // 生成一个随机的6位36进制数
  const randomPart = Math.random().toString(36).slice(2, 8);

  // 合并时间戳和随机部分，总共12位
  const uniqueId = timestamp + randomPart;

  return uniqueId;
};

const handleStartRecordModal = (e?: MouseEvent) => {
  if (status.value === 0 && modelStatus.value === 0) {
    ipcRenderer.send("close-store");
    validate()
      .then(() => {
        message.success("开始记录");
        // startRecord();
        recoredCreateTime.value = new Date().getTime();
        db.insert("record", {
          instanceID: generateUniqueId(),
          ...toRaw(formData),
          waveLength: configData.value.irFilter.is2wave
            ? 2
            : configData.value.irFilter.is3wave
            ? 3
            : 4,
          recoredCreateTime: recoredCreateTime.value,
        }).then((res) => {
          // 创建存储进程
          ipcRenderer.send("create-store");
          // 开始存储
          recordLastID = res;
          ipcRenderer.send("start-store", { recordLastID: res });
        });
        openStartRecordModal.value = false;
        changeStatus("recordStart");
      })
      .catch((err) => {
        console.error("error", err);
      });
  } else if (status.value === 0 && modelStatus.value === 1) {
    app?.proxy?.loading.show("保存中...");
    let eegInputMarkerListCopy = eegInputMarkerList.filter((item) => {
      return (
        recoredCreateTime.value <= item.time_stamp &&
        item.time_stamp <= recoredEndTime.value
      );
    });

    let irInputMarkerListCopy = irInputMarkerList.filter((item) => {
      return (
        recoredCreateTime.value <= item.time_stamp &&
        item.time_stamp <= recoredEndTime.value
      );
    });
    db.update(
      "record",
      {
        ...toRaw(formData),
        recoredEndTime: recoredEndTime.value,
        recoredTotalTime: recoredTotalTime.value,
        eegInputMarkerList: JSON.stringify(eegInputMarkerListCopy),
        irInputMarkerList: JSON.stringify(irInputMarkerListCopy),
        markerList: JSON.stringify(markerList.value),
      },
      {
        id: recordLastID,
      }
    )
      .then((res) => {
        app?.proxy?.loading.hide();
        message.success("保存成功");

        openStartRecordModal.value = false;
        clearData();
      })
      .catch((err) => {
        app?.proxy?.loading.hide();
        message.error("保存失败,请重试!");
        console.error("error", err);
      });
    // saveRecord((sourceData) => {
    //   // timerRecord && clearInterval(timerRecord);
    //   // saveRecordSource(sourceData);

    // });
  }
};

const handleEndRecordModal = () => {
  openStartRecordModal.value = false;
  clearData();
};
const clearData = () => {
  formData.name = "";
  formData.describe = "";
  recoredCreateTime.value = 0;
  recoredEndTime.value = 0;
  recoredTotalTime.value = 0;
  modelStatus.value = 0;
  status.value = 0;
  currentTime.value = 0;
  resetFields();
};

const changeTime = (value) => {
  if (tempCurrentTime == value) {
    return;
  }
  indexStore.playIndex = parseInt(value / playGap.value + "");
  indexStore.isDragSlider = true;
  tempCurrentTime = value;
};

const playClose = () => {
  totalTime.value = recordtotalTime;
  indexStore.playIndex = 0;
  indexStore.isDragSlider = false;
  indexStore.recordId = 0;
  isRecord.value = true;
  status.value = 0;
  disabled.value = true;
  timer && clearInterval(timer);
  indexStore.play = false;
  clearData();
};

onBeforeUnmount(() => {
  //  关闭存储进程
  ipcRenderer.send("close-store");
  ipcRenderer.send("stop-store");
  // timerRecord && clearInterval(timerRecord);
});
</script>
<style scoped></style>
