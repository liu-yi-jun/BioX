<template>
  <div class="charts-wrap fnirs-wrap">
    <p class="eig-nav-title">FNIRS</p>
    <div class="eig-card card-top">
      <div class="eig-filter eig-select-wrap">
        <div class="filter-left">
          <p class="card-title">
            Time Series
            <span style="margin-left: 10px">plr:{{ packetLossRate }}</span>
            <span style="margin-left: 5px">pln:{{ packetLossNum }}</span>
          </p>
        </div>
        <div class="filter-right" style="margin-top: -5px">
          <a-form size="small" :model="seriesForm" layout="inline">
            <div class="wavelength-color-box">
              <div @click="changeWavelength(1)" class="wavelength-color">
                <span
                  :style="{
                    background: checkboxValue1.includes('1')
                      ? '#ff0101'
                      : '#D9DADF',
                  }"
                ></span>
                <span v-if="radioValue === 3">HbO</span>
                <span v-else>735nm</span>
              </div>
              <div
                v-if="wavelengthsValue !== 1 || radioValue === 3"
                @click="changeWavelength(2)"
                class="wavelength-color"
              >
                <span
                  :style="{
                    background: checkboxValue1.includes('2')
                      ? '#ffba01'
                      : '#D9DADF',
                  }"
                ></span>
                <span v-if="radioValue === 3">HbR</span>
                <span v-else>805nm</span>
              </div>
              <div @click="changeWavelength(3)" class="wavelength-color">
                <span
                  :style="{
                    background: checkboxValue1.includes('3')
                      ? '#0073ff'
                      : '#D9DADF',
                  }"
                ></span>
                <span v-if="radioValue === 3">HbT</span>
                <span v-else>850nm</span>
              </div>
            </div>

            <a-form-item label="age" v-if="radioValue === 3">
              <a-input
                type="number"
                min="1"
                max="200"
                step="1"
                style="width: 60px"
                @change="changeConfigNoReply('age')"
                v-model:value="configData.irFilter.age"
                placeholder="auto"
              />
            </a-form-item>
            <a-form-item label="min">
              <a-input
                type="number"
                style="width: 100px"
                @change="handleChange"
                v-model:value="seriesForm.min"
                placeholder="auto"
              />
            </a-form-item>
            <a-form-item label="max">
              <a-input
                type="number"
                style="width: 100px"
                @change="handleChange"
                v-model:value="seriesForm.max"
                placeholder="auto"
              />
            </a-form-item>
            <a-form-item>
              <a-select
                v-model:value="seriesStep"
                style="width: 100px"
                @change="handleChange"
                aria-placeholder="Show Time"
                :options="showTimeOptions"
                size="small"
              ></a-select>
            </a-form-item>
          </a-form>
        </div>
      </div>

      <div class="time-series">
        <FnirsTime :numSeconds="seriesStep" ref="fnirsTimeRef"></FnirsTime>
      </div>
    </div>
    <div class="card-bottom">
      <div class="eig-card">
        <p class="card-title">Channel Selection</p>
        <div class="selection-box-wrap">
          <div class="selection" id="selection">
            <div class="selection-box">
              <div
                class="S1-D5 round-line"
                :style="`width: calc((${selectionHeight / 2}px + 50%) / 2);`"
              >
                <div class="S1 round"></div>
                <div
                  class="S1-D5 line-box"
                  @click="channelLineClick(7)"
                  :class="{ active: channels.includes(7) }"
                >
                  <span class="line"></span>
                </div>
                <div class="D5 round" @click="channelLineClick(7)">
                  <span class="D5-text text">D7</span>
                </div>
              </div>
              <div
                class="S1-D7 round-line"
                :style="`width: calc((${selectionHeight / 2}px + 50%) / 2);`"
              >
                <div
                  class="S1 round"
                  @click="channelLineClick([5, 6, 7, 8])"
                ></div>
                <span class="S1-text text">S2</span>
                <div
                  class="S1-D7 line-box"
                  @click="channelLineClick(6)"
                  :class="{ active: channels.includes(6) }"
                >
                  <span class="line"></span>
                </div>
                <div class="D7 round" @click="channelLineClick(6)">
                  <span class="D7-text text">D6</span>
                </div>
              </div>
              <div class="D8 round" @click="channelLineClick(5)">
                <span class="D8-text text">D5</span>
              </div>
              <div class="D6 round" @click="channelLineClick(8)">
                <span class="D6-text text">D8</span>
              </div>
              <div
                class="S1-D8 line-box"
                :class="{ active: channels.includes(5) }"
              >
                <svg
                  class="S1-D8-SVG"
                  width="100%"
                  @click="channelLineClick(5)"
                  height="25"
                  viewBox="0 0 220 25"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,25 Q110,-20, 220,25"
                    :stroke="channels.includes(5) ? '#00D008' : '#848484'"
                    fill="transparent"
                    stroke-width="3"
                  />
                </svg>
                <!-- <span class="line"></span> -->
              </div>
              <div class="S1-D6 line-box">
                <svg
                  class="S1-D6-SVG"
                  width="100%"
                  @click="channelLineClick(8)"
                  height="16"
                  viewBox="0 0 220 16"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,0 Q110,16, 220,0"
                    :stroke="channels.includes(8) ? '#00D008' : '#848484'"
                    fill="transparent"
                    stroke-width="3"
                  />
                </svg>
              </div>
            </div>
            <div class="selection-box selection-box-right">
              <div
                class="S1-D5 round-line"
                :style="`width: calc((${selectionHeight / 2}px + 50%) / 2);`"
              >
                <div class="D5 round" @click="channelLineClick(2)">
                  <span class="D5-text text">D2</span>
                </div>
                <div
                  @click="channelLineClick(2)"
                  :class="{ active: channels.includes(2) }"
                  class="S1-D5 line-box"
                >
                  <span class="line"></span>
                </div>
                <div class="S1 round"></div>
              </div>
              <div
                class="S1-D7 round-line"
                :style="`width: calc((${selectionHeight / 2}px + 50%) / 2);`"
              >
                <div class="D7 round" @click="channelLineClick(3)">
                  <span class="D7-text text">D3</span>
                </div>
                <div
                  class="S1-D7 line-box"
                  @click="channelLineClick(3)"
                  :class="{ active: channels.includes(3) }"
                >
                  <span class="line"></span>
                </div>
                <div class="S1 round" @click="channelLineClick([1, 2, 3, 4])">
                  <span class="S1-text text">S1</span>
                </div>
              </div>
              <div class="D8 round" @click="channelLineClick(1)">
                <span class="D8-text text">D1</span>
              </div>
              <div class="D6 round" @click="channelLineClick(4)">
                <span class="D6-text text">D4</span>
              </div>
              <div
                class="S1-D8 line-box"
                :class="{ active: channels.includes(1) }"
              >
                <svg
                  class="S1-D8-SVG"
                  width="100%"
                  @click="channelLineClick(1)"
                  height="25"
                  viewBox="0 0 220 25"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,25 Q110,-20, 220,25"
                    :stroke="channels.includes(1) ? '#00D008' : '#848484'"
                    fill="transparent"
                    stroke-width="3"
                  />
                </svg>
                <!-- <span class="line"></span> -->
              </div>
              <div class="S1-D6 line-box">
                <svg
                  class="S1-D6-SVG"
                  width="100%"
                  @click="channelLineClick(4)"
                  height="16"
                  viewBox="0 0 220 16"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,0 Q110,16, 220,0"
                    :stroke="channels.includes(4) ? '#00D008' : '#848484'"
                    fill="transparent"
                    stroke-width="3"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="eig-card view-setting-card">
        <p class="card-title">View Setting</p>
        <div class="eig-card view-setting-box">
          <div>
            <p class="card-title">Plot Type</p>
            <div class="view-setting">
              <div class="view-setting-radio">
                <a-radio-group
                  @change="handleChange"
                  v-model:value="radioValue"
                >
                  <a-radio :style="radioStyle" :value="1">Raw Data</a-radio>
                  <a-radio :style="radioStyle" :value="2"
                    >Optical Density</a-radio
                  >
                  <a-radio :style="radioStyle" :value="3"
                    >Concentration</a-radio
                  >
                </a-radio-group>
              </div>
              <!-- <div>
              <a-checkbox-group
                class="view-setting-checkbox-group"
                v-if="radioValue !== 3"
                v-model:value="checkboxValue1"
                @change="handleChange"
                style="width: 100%"
              >
                <a-checkbox value="1">735nm</a-checkbox>
                <a-checkbox value="2">805nm</a-checkbox>
                <a-checkbox value="3">850nm</a-checkbox>
              </a-checkbox-group>
              <a-checkbox-group
                class="view-setting-checkbox-group"
                v-if="radioValue === 3"
                @change="handleChange"
                v-model:value="checkboxValue2"
                style="width: 100%"
              >
                <a-checkbox value="1">HbO</a-checkbox>
                <a-checkbox value="2">HbR</a-checkbox>
                <a-checkbox value="3">HbT</a-checkbox>
              </a-checkbox-group> 
            </div> -->
            </div>
          </div>
          <div>
            <p class="card-title">Wavelengths</p>
            <div class="view-setting">
              <div class="view-setting-radio">
                <a-radio-group :disabled="configData.lsl.isOutLet || recordProgress" v-model:value="wavelengthsValue">
                  <a-radio :style="radioStyle" :value="1">Two</a-radio>
                  <a-radio :style="radioStyle" :value="2">Three</a-radio>
                </a-radio-group>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <a-modal
      v-model:open="baseLineLoadingOpen"
      title="tip"
      :closable="false"
      :maskClosable="false"
      :footer="null"
    >
      <div class="eig-baseline-loading-box">
        <span style="margin-bottom: 20px"
          >Baseline calculation, please wait...</span
        >
        <a-spin />
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import type { SelectProps } from "ant-design-vue";
import {
  ref,
  reactive,
  onMounted,
  nextTick,
  watch,
  onBeforeUnmount,
} from "vue";
// import { CustomDatabase } from "../../utils/db";
const ipcRenderer = require("electron").ipcRenderer;
import FnirsTime from "../../components/FnirsTime.vue";
import * as echarts from "echarts";

const radioValue = ref<number>(1);
const wavelengthsValue = ref<number>(1);
const checkboxValue1 = ref(["1", "3"]);
const checkboxValue2 = ref(["1", "3"]);
const selectionHeight = ref(0);
const selectionWidth = ref(0);
const seriesStep = ref(10);
const seriesMaxStep = 30;
const changeState = {
  age: false,
};
const fnirsTimeRef = ref<any>(null);
const isRender = ref(false);
const minTimeGap = 40;
const packetLossRate = ref(0);
const packetLossNum = ref(0);
const showTimeOptionsData = [
  {
    value: 1,
    label: "1 sec",
  },
  {
    value: 5,
    label: "5 sec",
  },
  {
    value: 10,
    label: "10 sec",
  },
  {
    value: 20,
    label: "20 sec",
  },
  {
    value: 30,
    label: "30 sec",
  },
];
const seriesForm = reactive({
  min: "",
  max: "",
});
const showTimeOptions = ref<SelectProps["options"]>(showTimeOptionsData);
let isRenderTimer, realTimer;
const channels = ref([1, 2, 3, 4, 5, 6, 7, 8]);
import { CustomDatabase } from "../../utils/db";
import { useIndexStore } from "../../store/index";
import { CustomBluetooth } from "../../utils/bluetooth";
import { storeToRefs } from "pinia";
let baseLineLoadingOpen = ref(false);
let pkgDataList: any = [];
let pkgSourceData: any = [];

let pkgMaxTime = 35;
const indexStore = useIndexStore();
const {
  play,
  recordId,
  playIndex,
  isDragSlider,
  isConnect,
  configData,
  isIrClear,
  playGap,
  recordProgress,
  bluetoothATConfig,
} = storeToRefs(indexStore);
let db = new CustomDatabase();
let bluetooth = new CustomBluetooth();
let timerPlay, timer;
interface showSeriesDataType {
  chanIndex: number;
  index: number;
  type: string;
  radioIndex: number;
  name: string;
  color: string;
}
let showSeriesData: showSeriesDataType[] = [];

const seriesRDNames = [
  "S1D1.λ1",
  "S1D1.λ2",
  "S1D1.λ3",
  "S1D2.λ1",
  "S1D2.λ2",
  "S1D2.λ3",
  "S1D3.λ1",
  "S1D3.λ2",
  "S1D3.λ3",
  "S1D4.λ1",
  "S1D4.λ2",
  "S1D4.λ3",
  "S2D5.λ1",
  "S2D5.λ2",
  "S2D5.λ3",
  "S2D6.λ1",
  "S2D6.λ2",
  "S2D6.λ3",
  "S2D7.λ1",
  "S2D7.λ2",
  "S2D7.λ3",
  "S2D8.λ1",
  "S2D8.λ2",
  "S2D8.λ3",
];
const seriesODNames = [
  "S1D1.λ1",
  "S1D1.λ2",
  "S1D1.λ3",
  "S1D2.λ1",
  "S1D2.λ2",
  "S1D2.λ3",
  "S1D3.λ1",
  "S1D3.λ2",
  "S1D3.λ3",
  "S1D4.λ1",
  "S1D4.λ2",
  "S1D4.λ3",
  "S2D5.λ1",
  "S2D5.λ2",
  "S2D5.λ3",
  "S2D6.λ1",
  "S2D6.λ2",
  "S2D6.λ3",
  "S2D7.λ1",
  "S2D7.λ2",
  "S2D7.λ3",
  "S2D8.λ1",
  "S2D8.λ2",
  "S2D8.λ3",
];
const seriesConcNames = [
  "S1D1.HbO",
  "S1D1.HbR",
  "S1D1.HbT",
  "S1D2.HbO",
  "S1D2.HbR",
  "S1D2.HbT",
  "S1D3.HbO",
  "S1D3.HbR",
  "S1D3.HbT",
  "S1D4.HbO",
  "S1D4.HbR",
  "S1D4.HbT",
  "S2D5.HbO",
  "S2D5.HbR",
  "S2D5.HbT",
  "S2D6.HbO",
  "S2D6.HbR",
  "S2D6.HbT",
  "S2D7.HbO",
  "S2D7.HbR",
  "S2D7.HbT",
  "S2D8.HbO",
  "S2D8.HbR",
  "S2D8.HbT",
];
const seriesColors = [
  "rgba(137,137,140,1)",
  "rgba(252,215,131,1)",
  "rgba(150,224,185,1)",
  "rgba(90,205,204,1)",
  "rgba(203,179,237,1)",
  "rgba(250,228,148,1)",
  "rgba(192,192,192,1)",
  "rgba(156,200,223,1)",
];

let seriesRDNameObj: showSeriesDataType[];
let seriesODNameObj: showSeriesDataType[];

let seriesConcNameObj: showSeriesDataType[];
const radioStyle = reactive({
  display: "flex",
  height: "30px",
  lineHeight: "30px",
});

watch(wavelengthsValue, (newValue) => {
  if (newValue == 1) {
    configData.value.irFilter.is2wave = true;
    configData.value.irFilter.is3wave = false;
    configData.value.irFilter.ir_sample_rate =
      configData.value.irFilter.two_ir_sample_rate;
    ipcRenderer.send(
      "change-config-field",
      JSON.stringify({
        field: "wave",
        config: configData.value,
      })
    );
  }
  if (newValue == 2) {
    configData.value.irFilter.is2wave = false;
    configData.value.irFilter.is3wave = true;
    configData.value.irFilter.ir_sample_rate =
      configData.value.irFilter.three_ir_sample_rate;
    ipcRenderer.send(
      "change-config-field",
      JSON.stringify({
        field: "wave",
        config: configData.value,
      })
    );
  }
  if (newValue == 1 && radioValue.value != 3) {
    checkboxValue1.value = ["1", "3"];
    checkboxValue2.value = ["1", "3"];
    indexStore.bluetoothATConfig.IRMODE.value = 0;
  }
  if (newValue == 1 && radioValue.value == 3) {
    checkboxValue1.value = ["1", "2", "3"];
    checkboxValue2.value = ["1", "2", "3"];
    indexStore.bluetoothATConfig.IRMODE.value = 0;
  }
  if (newValue == 2 && radioValue.value != 3) {
    checkboxValue1.value = ["1", "2", "3"];
    checkboxValue2.value = ["1", "2", "3"];
    indexStore.bluetoothATConfig.IRMODE.value = 1;
  }
  if (newValue == 2 && radioValue.value == 3) {
    checkboxValue1.value = ["1", "2", "3"];
    checkboxValue2.value = ["1", "2", "3"];
    indexStore.bluetoothATConfig.IRMODE.value = 1;
  }
  handleChange && handleChange();
});

watch(radioValue, (newValue) => {
  if ((newValue == 1 || newValue == 2) && wavelengthsValue.value == 1) {
    checkboxValue1.value = ["1", "3"];
    checkboxValue2.value = ["1", "3"];
  }
  if ((newValue == 1 || newValue == 2) && wavelengthsValue.value == 2) {
    checkboxValue1.value = ["1", "2", "3"];
    checkboxValue2.value = ["1", "2", "3"];
  }
  if (newValue == 3) {
    checkboxValue1.value = ["1", "2", "3"];
    checkboxValue2.value = ["1", "2", "3"];
  }
  pkgDataList = [];
  handleChange && handleChange();
  configData.value.irFilter.plotType = newValue;

  ipcRenderer.send(
    "change-config-field",
    JSON.stringify({
      field: "plotType",
      config: configData.value,
    })
  );
});

watch(
  play,
  (newValue) => {
    if (newValue) {
      timerPlay = setInterval(() => {
        if (pkgSourceData.length) {
          if (
            playIndex.value * playGap.value >=
            pkgSourceData[pkgSourceData.length - 1].time_mark
          ) {
            timerPlay && clearInterval(timerPlay);
            return;
          }
          let dataList = joinPkgList(true);
          dataList.forEach((item) => {
            ipcRenderer.send("start-data-replay", item);
          });
          // renderData();
        }
      }, playGap.value);
    } else {
      timerPlay && clearInterval(timerPlay);
    }
  },
  {
    immediate: true,
  }
);

watch(isRender, (newValue) => {
  if (newValue) {
    realTimerRenderData();
  } else {
    realTimer && clearInterval(realTimer);
  }
});

watch(isDragSlider, (newValue) => {
  // 拖拽了进度条更改渲染数据
  if (newValue) {
    indexStore.isDragSlider = false;
    pkgDataList = [];
    let dataList = joinPkgList();
    dataList.forEach((item) => {
      ipcRenderer.send("start-data-replay", item);
    });
    // handleOldData();
  }
});
watch(recordId, (value) => {
  if (value !== undefined) {
    initialize();
  }
});

watch(isConnect, (newValue) => {
  if (newValue) {
    indexStore.isIrClear = true;
  }
});

watch(
  isIrClear,
  (newValue) => {
    if (newValue) {
      pkgDataList = [];
      indexStore.isIrClear = false;
      if (radioValue.value == 2 || radioValue.value == 3) {
        baseLineLoading();
      }
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

onMounted(function () {
  indexStore.bluetoothATConfig.IRMODE.value = 0;
  configData.value.irFilter.plotType = 1;
  configData.value.irFilter.age = 25;
  if (
    configData.value.irFilter.ir_sample_rate ==
    configData.value.irFilter.two_ir_sample_rate
  ) {
    wavelengthsValue.value = 1;
  } else if (
    configData.value.irFilter.ir_sample_rate ==
    configData.value.irFilter.three_ir_sample_rate
  ) {
    wavelengthsValue.value = 2;
  }

  ipcRenderer.send(
    "change-config-field",
    JSON.stringify({
      field: "plotType",
      config: configData.value,
    })
  );
  // var sq = new CustomDatabase()
  // console.log(sq,"sq");
  ipcRenderer.on("change-config-field-success", changeConfigSuccess);
  nextTick(() => {
    getSelectionHeight();
  });
  initialize();
});

onBeforeUnmount(() => {
  ipcRenderer.removeListener(
    "change-config-field-success",
    changeConfigSuccess
  );
  ipcRenderer.removeListener("end-data-replay", rePlayNotice);
  ipcRenderer.send("close-replay");
  bluetooth.removeNotice(bluetoothNotice);
  timer && clearInterval(timer);
  timerPlay && clearInterval(timerPlay);
  realTimer && clearInterval(realTimer);
  isRenderTimer && clearTimeout(isRenderTimer);
  pkgDataList = [];
  pkgSourceData = [];
  db = null;
  bluetooth = null;
  timer = null;
  timerPlay = null;
  realTimer = null;
  isRenderTimer = null;
  showSeriesData = [];
});

// 获取元素高度
const getSelectionHeight = () => {
  selectionHeight.value =
    document.getElementById("selection")?.clientHeight || 0;
  selectionWidth.value = document.getElementById("selection")?.clientWidth || 0;
};

// 回放数据
const rePlayNotice = (event, data) => {
  handlePkgList({
    ...data,
    ...data.pkg,
  });
  renderData();
};

// 蓝牙数据通知
const bluetoothNotice = (data) => {
  handlePkgList(data);
  // handleRealTimeData(blueToothdataMapping(data));
  isRender.value = true;
  isRenderTimer && clearTimeout(isRenderTimer);
  isRenderTimer = setTimeout(() => {
    isRender.value = false;
  }, 4 * 1000);
};

// 定时渲染
const realTimerRenderData = () => {
  realTimer && clearInterval(realTimer);
  realTimer = setInterval(() => {
    renderData();
  }, minTimeGap);
};

// 渲染
const renderData = () => {
  undateTimeSerie("series");
};

// 数据包处理
const handlePkgList = (data) => {
  if (
    pkgDataList.length &&
    pkgDataList[pkgDataList.length - 1].time_mark - pkgDataList[0].time_mark >
      pkgMaxTime * 1000
  ) {
    pkgDataList.shift();
  }
  //  有IR标识
  if (data.pkg_type === 2) {
    packetLossRate.value = data.loss_data_info_el.packetLossRate;
    packetLossNum.value = data.loss_data_info_el.packetLossNum;
    // 判断是否完成基线计算，完成关闭提示弹出框

    if ((radioValue.value == 2 || radioValue.value == 3) && data.baseline_ok) {
      baseLineLoadingSuccess();
    }
    // if(!baseLineLoadingOpen.value) {
    pkgDataList.push(data);
    // }
  }
};

// 判断是否加入数据包队列
const joinPkgList = (isGap: boolean = false) => {
  let tempPkgDataList: any = [];
  if (!pkgSourceData.length) {
    return [];
  }
  for (let index = 0; index < pkgSourceData.length; index++) {
    const item = pkgSourceData[index];
    if (
      item.time_mark - pkgSourceData[0].time_mark <=
        playIndex.value * playGap.value &&
      item.pkg_type === 2
    ) {
      if (
        isGap &&
        item.time_mark - pkgSourceData[0].time_mark >=
          (playIndex.value - 1) * playGap.value
      ) {
        tempPkgDataList.push(item);
      }

      if (!isGap) {
        tempPkgDataList.push(item);
      }
    }
  }
  return tempPkgDataList;
};

const initialize = () => {
  pkgSourceData = [];
  if (!recordId.value) {
    ipcRenderer.removeListener("end-data-replay", rePlayNotice);
    ipcRenderer.send("close-replay");
    bluetooth.addNotice(bluetoothNotice);
  } else {
    ipcRenderer.send("create-replay");
    ipcRenderer.on("end-data-replay", rePlayNotice);
    bluetooth.removeNotice(bluetoothNotice);
    db.all(`select  * from source where recordId = ${recordId.value}`).then(
      (res) => {
        pkgSourceData = res
          .map((item) => {
            return JSON.parse(item.data);
          })
          .flat();
      }
    );
  }

  initData();
  nextTick(() => {
    undateTimeSerie("channel");
  });
};

// 配置改变
const handleChange = () => {
  generateShowSeriesData();
  // initSeries();
  undateTimeSerie("channel");
  undateTimeSerie("xAxis");
  undateTimeSerie("yAxis");
  undateTimeSerie("series");
};

const changeAlpha = (colorString: string, newAlpha: string) => {
  // 使用正则表达式替换alpha值
  return colorString.replace(/[^,]+(?=\))/, newAlpha);
};

// 生成颜色
const generateColor = (colorStr: string, index: number) => {
  if (index === 0) {
    return changeAlpha(colorStr, "0.8");
  }
  if (index === 1) {
    return changeAlpha(colorStr, "0.9");
  }
  return colorStr;
};

// 初始化数据集
const initData = () => {
  seriesRDNameObj = seriesRDNames.map((item, index) => {
    return {
      chanIndex: Math.ceil((index + 1) / 3),
      radioIndex: (index % 3) + 1,
      index: index,
      type: "RD",
      name: item,
      color: generateColor(
        seriesColors[Math.ceil((index + 1) / 3) - 1],
        index % 3
      ),
    };
  });
  seriesODNameObj = seriesODNames.map((item, index) => {
    return {
      chanIndex: Math.ceil((index + 1) / 3),
      radioIndex: (index % 3) + 1,
      index: index,
      type: "OD",
      name: item,
      color: generateColor(
        seriesColors[Math.ceil((index + 1) / 3) - 1],
        index % 3
      ),
    };
  });
  seriesConcNameObj = seriesConcNames.map((item, index) => {
    return {
      chanIndex: Math.ceil((index + 1) / 3),
      radioIndex: (index % 3) + 1,
      index: index,
      type: "Conc",
      name: item,
      color: generateColor(
        seriesColors[Math.ceil((index + 1) / 3) - 1],
        index % 3
      ),
    };
  });
  generateShowSeriesData();
};

// 生成需要显示的基础模版数据
const generateShowSeriesData = () => {
  let templateData: showSeriesDataType[] = [];
  let checkboxValue: string[] = [];
  if (radioValue.value === 1) {
    templateData = seriesRDNameObj;
    checkboxValue = checkboxValue1.value;
  } else if (radioValue.value === 2) {
    checkboxValue = checkboxValue1.value;
    templateData = seriesODNameObj;
  } else if (radioValue.value === 3) {
    checkboxValue = checkboxValue2.value;
    templateData = seriesConcNameObj;
  }
  showSeriesData = templateData.filter((item) => {
    return (
      channels.value.includes(item.chanIndex) &&
      checkboxValue.includes(item.radioIndex + "")
    );
  });
  console.log("showSeriesData", showSeriesData);
};

// 生成X轴
const generateXAxisArr = () => {
  xAxisArr = showSeriesData.map((item, index) => {
    return {
      type: "time",
      show: index === showSeriesData.length - 1,
      boundaryGap: false,
      gridIndex: index,
      splitNumber: seriesStep.value,
      max: seriesStep.value * 1000,
      axisLabel: {
        color: "#666666",
        formatter: function (value, index) {
          return echarts.format.formatTime("s", value);
        },
        showMaxLabel: true,
        showMinLabel: true,
      },
      axisLine: {
        lineStyle: {
          color: "#dddddd",
        },
      },
    };
  });
};
// 生成y轴
const generateYAxisArr = () => {
  yAxisArr = showSeriesData.map((item, index) => {
    return {
      show: true,
      axisLine: {
        show: true, // 显示y轴线
        // lineStyle: {
        //   width: 0.5,
        // },
      },
      axisLabel: {
        fontSize: 8,
        //坐标轴刻度标签
        show: showSeriesData.length <= 8,
      },
      max: seriesForm.max === "" ? undefined : seriesForm.max,
      min: seriesForm.min === "" ? undefined : seriesForm.min,
      axisTick: {
        show: showSeriesData.length <= 8, // 可取消y轴刻度线
        // lineStyle: {
        //   width: 0.5,
        // },
      },
      splitLine: {
        show: false, // 去除网格线
      },
      nameRotate: 0,
      name: item.name,
      nameLocation: "middle",
      nameTextStyle: {
        fontSize: 12,
        padding: 10, // 设置与坐标轴的距离，单位为像素
        fontWeight: "bold",
      },
      type: "value",
      gridIndex: index,
    };
  });
};

// 生成grid
const generateGrid = () => {
  gridArr = showSeriesData.map((item, index) => {
    return {
      left: "8%",
      right: "4%",
      top: index == 0 ? "2%" : (94 / showSeriesData.length) * index + "%",
      bottom: 100 - (94 / showSeriesData.length) * (index + 1) + "%",
      containLabel: false,
    };
  });
};

// 生成series
const generateSeries = () => {
  // let tempSeriesData;
  // tempSeriesData = Object.assign([], seriesData.slice(-seriesStep.value * 4));

  // seriesData
  // [{
  //   RD:[`通道1-735nm，通道1-805nm，通道1-850nm，通道2...`],
  //   OD:[`通道1-735nm，通道1-805nm，通道1-850nm，通道2...`],
  //   Conc:[`通道1-HbO，通道1-HbR，通道1-HbT，通道2...`]
  // },{
  //   RD:[`通道1-735nm，通道1-805nm，通道1-850nm，通道2...`],
  //   OD:[`通道1-735nm，通道1-805nm，通道1-850nm，通道2...`],
  //   Conc:[`通道1-HbO，通道1-HbR，通道1-HbT，通道2...`]
  // }]
  // 构建后
  // {
  // 通道1-735nm / 通道1-HbO
  // RD:['通道1-735nm','通道1-735nm']
  // OD:['通道1-735nm','通道1-735nm']
  // Conc:['通道1-HbO','通道1-HbO']
  // }
  seriesArr = showSeriesData.map((item, index) => {
    let tempObj: any = {
      RD: [],
      OD: [],
      Conc: [],
    };

    tempObj.RD = conversionPkgtoTimeSeries(
      "near_infrared",
      mapChanToField(item.chanIndex),
      mapRadioToField(item.radioIndex),
      seriesStep.value
    );

    tempObj.OD = conversionPkgtoTimeSeries(
      "ir_od_date",
      mapChanToField(item.chanIndex),
      mapRadioToField(item.radioIndex),
      seriesStep.value
    );
    tempObj.Conc = conversionPkgtoTimeSeries(
      "concentration_date",
      mapChanToField(item.chanIndex),
      mapRadioToField(item.radioIndex),
      seriesStep.value
    );
    return {
      data: tempObj[item.type],
      type: "line",
      name: item.name,
      symbol: "none",
      lineStyle: {
        width: 1,
        color: item.color,
      },
      markLine: {
        symbol: ["none", "none"],
        label: {
          show: false,
        },
        lineStyle: {
          type: "solid",
          width: 2,
          color: "#FFECE4",
        },
        // data: [{ xAxis: 3 }],
      },
      xAxisIndex: index,
      yAxisIndex: index,
    };
  });
};

const mapChanToField = (index) => {
  return index - 1;
  switch (
    index // 通道索引
  ) {
    case 1:
      return "near_infrared";
    case 2:
      return "near_infrared";
    case 3:
      return "near_infrared";
    default:
      return "near_infrared";
  }
};
const mapRadioToField = (index) => {
  switch (
    index // 波形索引
  ) {
    case 1:
      return 0;
    case 2:
      return 1;
    case 3:
      return 2;
    default:
      return 0;
  }
};

// 分租
function groupByChanIndex(objects) {
  let groupedArray = objects.reduce((acc, obj) => {
    let index = obj.chanIndex;
    if (!acc[index]) {
      acc[index] = [];
    }
    acc[index].push(obj);
    return acc;
  }, {});
  return Object.values(groupedArray).map((item: any) => {
    return {
      name: item[0].name.slice(0, 4),
      radioRows: item,
    };
  });
}

const undateTimeSerie = (type) => {
  let groupSeriesData = groupByChanIndex(showSeriesData);
  switch (type) {
    case "channel":
      fnirsTimeRef.value.setOption({
        channel: groupSeriesData,
      });
      break;
    case "series":
      fnirsTimeRef.value.setOption({
        series: groupSeriesData.map((groupItem, index) => {
          return {
            name: groupItem.name,
            radioRows: groupItem.radioRows.map((item) => {
              let tempObj: any = {
                RD: [],
                OD: [],
                Conc: [],
              };
              tempObj.RD = conversionPkgtoTimeSeries(
                "near_infrared",
                mapChanToField(item.chanIndex),
                mapRadioToField(item.radioIndex),
                seriesStep.value
              );

              tempObj.OD = conversionPkgtoTimeSeries(
                "ir_od_date",
                mapChanToField(item.chanIndex),
                mapRadioToField(item.radioIndex),
                seriesStep.value
              );
              tempObj.Conc = conversionPkgtoTimeSeries(
                "concentration_date",
                mapChanToField(item.chanIndex),
                mapRadioToField(item.radioIndex),
                seriesStep.value
              );
              return tempObj[item.type];
            }),
          };
        }),
      });
      break;
    case "xAxis":
      fnirsTimeRef.value.setOption({
        xAxis: groupSeriesData.map((item, index) => ({
          max: seriesStep.value,
        })),
      });
      break;
    case "yAxis":
      fnirsTimeRef.value.setOption({
        yAxis: groupSeriesData.map((item) => ({
          max: seriesForm.max === "" ? undefined : seriesForm.max,
          min: seriesForm.min === "" ? undefined : seriesForm.min,
        })),
      });
      break;
  }
};

const conversionPkgtoTimeSeries = (field, channel, index, step) => {
  if (pkgDataList.length < 1) return [];
  let maxTimer = pkgDataList[pkgDataList.length - 1].time_mark;
  let minTime = maxTimer - step * 1000;
  let sliceData = pkgDataList.filter(
    (item) => item.time_mark >= minTime && item.time_mark <= maxTimer
  );
  let baseTime = 0;
  return sliceData.map((item, sliceIndex) => {
    if (sliceIndex !== 0) {
      baseTime += item.time_mark - sliceData[sliceIndex - 1].time_mark;
    }
    return {
      value: [baseTime, item[field][channel][index], item.time_stamp],
    };
  });
};

// 切换渠道
const channelLineClick = (value: number | Array<number>) => {
  if (Array.isArray(value)) {
    let flag = value.every((item) => {
      return channels.value.includes(item);
    });
    if (flag) {
      channels.value = channels.value.filter((item) => {
        return !value.includes(item);
      });
    } else {
      value.forEach((item) => {
        if (!channels.value.includes(item)) {
          channels.value.push(item);
        }
      });
    }
  } else {
    let index = channels.value.find((item) => {
      return item === value;
    });
    if (index) {
      channels.value = channels.value.filter((item) => {
        return item !== value;
      });
    } else {
      channels.value.push(value);
    }
  }

  handleChange();
};

const changeConfigNoReply = (field) => {
  ipcRenderer.send(
    "change-config-field",
    JSON.stringify({
      field,
      config: configData.value,
    })
  );
};

const changeConfigSuccess = (event, data) => {
  if (data.field === "plotType") {
    pkgDataList = [];
    indexStore.isIrClear = true;
  }
  if (data.field === "wave") {
    pkgDataList = [];
    indexStore.isIrClear = true;
  }
};

const changeWavelength = (value) => {
  if (checkboxValue1.value.findIndex((item) => parseInt(item) === value) > -1) {
    checkboxValue1.value = checkboxValue1.value.filter(
      (item) => parseInt(item) !== value
    );
    checkboxValue2.value = checkboxValue2.value.filter(
      (item) => parseInt(item) !== value
    );
  } else {
    checkboxValue1.value.push(value + "");
    checkboxValue2.value.push(value + "");
  }
  checkboxValue1.value.sort((a, b) => parseInt(a) - parseInt(b));
  checkboxValue2.value.sort((a, b) => parseInt(a) - parseInt(b));
  handleChange();
};
const baseLineLoading = () => {
  baseLineLoadingOpen.value = true;
};
const baseLineLoadingSuccess = () => {
  baseLineLoadingOpen.value = false;
};
</script>
<style scoped></style>
