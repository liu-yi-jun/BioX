<template>
  <div class="record-box">
    <div class="record-close" v-if="!isRecord" @click="playClose">
      <CloseCircleOutlined />
    </div>
    <div class="record-slider">
      <span class="record-title" v-if="!isRecord">{{ name }}/{{ idName }}</span>
      <div class="record-slider-box">
        <div class="record-icon-box">
          <div
            @click="showStartRecordModal"
            v-if="isRecord && status === 0"
            class="start-record-icon"
          ></div>
          <div
            @click="changeStatus"
            v-if="isRecord && status === 1"
            class="progress-record-icon"
          ></div>
          <PlayCircleOutlined
            @click="changeStatus"
            v-if="!isRecord && status === 0"
          ></PlayCircleOutlined>
          <PauseCircleOutlined
            @click="changeStatus"
            v-if="!isRecord && status === 1"
          ></PauseCircleOutlined>
        </div>
        <div class="eig-slider">
          <a-slider
            :min="minTime"
            :max="totalTime"
            :step="250"
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
import { ref, reactive, toRaw, onMounted, watch } from "vue";
import { CustomDatabase } from "../utils/db";
import { message } from "ant-design-vue";
import { Form } from "ant-design-vue";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons-vue";
import { formatTimestamp, tipFormatter } from "../utils/common";
import { useIndexStore } from "../store/index";
import { storeToRefs } from "pinia";
const indexStore = useIndexStore();
const { play, recordId, playIndex, isDragSlider } = storeToRefs(indexStore);
const useForm = Form.useForm;
const disabled = ref<boolean>(true);
// 0:开始 1:进行中
const status = ref<number>(0);
const isRecord = ref<boolean>(true);
const openStartRecordModal = ref<boolean>(false);
// 进度条最小时间
const minTime = ref<number>(0);
// 进度条总时间
const totalTime = ref<number>(8 * 60 * 1000);
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
const idName = ref<string>("");

let timer;
let db;
const emit = defineEmits([
  "onRecord",
  "onStatus",
  "startRecord",
  "endRecord",
  "cancelRecord",
]);
const startRecord = () => {
  emit("startRecord");
};
const endRecord = (cb) => {
  emit("endRecord", cb);
};
const cancelRecord = () => {
  emit("cancelRecord");
};

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
      idName.value = res.recoredCreateTime;
    });
  }
});

watch(isRecord, (newValue, oldValue) => {
  emit("onRecord", newValue);
});
watch(status, (newValue, oldValue) => {
  emit("onStatus", newValue);
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
  describe: [{ required: true, message: "请输入描述" }],
});
const { resetFields, validate, validateInfos } = useForm(formData, rulesRef);

onMounted(() => {
  db = new CustomDatabase();
});

const changeStatus = () => {
  status.value = status.value === 0 ? 1 : 0;

  if (status.value === 1 && isRecord.value === false) {
    // 开始播放
    indexStore.play = true;
  }
  if (status.value === 1) {
    timer = setInterval(() => {
      currentTime.value = currentTime.value + 250;
      if (currentTime.value > totalTime.value) {
        status.value = 0;
        timer && clearInterval(timer);
        indexStore.play = false;
        return;
      }
      indexStore.playIndex++;
    }, 250);
  }
  if (status.value === 0) {
    timer && clearInterval(timer);
    indexStore.play = false;
  }
  if (status.value === 0 && isRecord.value === true) {
    // 打开弹出框
    recoredEndTime.value = new Date().getTime();
    modelStatus.value = 1;
    recoredTotalTime.value = recoredEndTime.value - recoredCreateTime.value;
    openStartRecordModal.value = true;
  }
};

const showStartRecordModal = () => {
  openStartRecordModal.value = true;
};

const handleStartRecordModal = (e: MouseEvent) => {
  if (status.value === 0 && modelStatus.value === 0) {
    validate()
      .then(() => {
        console.log(toRaw(formData));
        message.success("开始记录");
        startRecord();
        recoredCreateTime.value = new Date().getTime();
        openStartRecordModal.value = false;
        changeStatus();
      })
      .catch((err) => {
        console.log("error", err);
      });
  } else if (status.value === 0 && modelStatus.value === 1) {
    endRecord((sourceData) => {
      db.insert("record", {
        sourceData: JSON.stringify(sourceData),
        ...toRaw(formData),
        recoredCreateTime: recoredCreateTime.value,
        recoredEndTime: recoredEndTime.value,
        recoredTotalTime: recoredTotalTime.value,
      })
        .then((res) => {
          message.success("保存成功");
          openStartRecordModal.value = false;
          clearData();
        })
        .catch((err) => {
          message.error("保存失败,请重试!");
          console.log("error", err);
        });
    });
  }
};

const handleEndRecordModal = () => {
  openStartRecordModal.value = false;
  cancelRecord();
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
};

const changeTime = (value) => {
  indexStore.playIndex = parseInt(value / 250 + "");
  indexStore.isDragSlider = true;
};

const playClose = () => {
  indexStore.playIndex = 0;
  indexStore.isDragSlider = false;
  indexStore.recordId = 0;
  isRecord.value = true;
  status.value = 0;
  disabled.value = true;
  timer && clearInterval(timer);
  indexStore.play = false;
  clearData()
};
</script>
<style scoped></style>
