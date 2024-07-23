<template>
  <div class="charts-wrap eeg-wrap">
    <p class="eig-nav-title">EEG</p>
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
            <a-form-item label="min">
              <a-input
                type="number"
                style="width: 100px"
                @change="undateTimeSerie('yAxis')"
                v-model:value="seriesForm.min"
                placeholder="auto"
              />
            </a-form-item>
            <a-form-item label="max">
              <a-input
                type="number"
                style="width: 100px"
                @change="undateTimeSerie('yAxis')"
                v-model:value="seriesForm.max"
                placeholder="auto"
              />
            </a-form-item>
            <a-form-item>
              <a-select
                v-model:value="seriesStep"
                style="width: 100px"
                @change="undateTimeSerie('xAxis');undateTimeSerie('series')"
                aria-placeholder="Show Time"
                :options="showTimeOptions"
                size="small"
              ></a-select>
            </a-form-item>
            <a-form-item>
              <a-select
                v-model:value="channel"
                mode="multiple"
                :style="{ 'min-width': '100px' }"
                placeholder="Channels"
                :options="channelOptions"
                size="small"
                @change="undateTimeSerie('channel')"
              ></a-select>
            </a-form-item>
          </a-form>
        </div>
      </div>

      <div class="time-series">
        <TimeSeries :numSeconds="seriesStep" ref="timeSeriesRef"></TimeSeries>
      </div>
    </div>
    <div class="card-bottom">
      <div class="eig-card">
        <p class="card-title">Spectrum</p>
        <div class="spectrum">
          <div class="eig-filter eig-select-wrap">
            <div class="filter-left">
              <a-select
                v-model:value="spectrumType"
                style="width: 100px"
                @change="handleChangeSpectrumType"
                aria-placeholder="Show Time"
                :options="spectrumTypeOptions"
                size="small"
              ></a-select>
            </div>
            <div class="filter-right">
              <a-space>
                <a-select
                  v-model:value="spectrumShowTime"
                  style="width: 100px"
                  v-if="spectrumType === 'Heatmap'"
                  @change="
                    () => {
                      undateHeatmap('xAxis');
                      undateHeatmap('series');
                    }
                  "
                  aria-placeholder="Show Time"
                  :options="spectrumShowTimeOptions"
                  size="small"
                ></a-select>
                <a-select
                  v-model:value="maxFreq"
                  style="width: 100px"
                  v-if="spectrumType === 'PSD'"
                  aria-placeholder="Show Time"
                  :options="maxFreqOptions"
                  @change="undatePsd('xAxis')"
                  size="small"
                ></a-select>
                <a-select
                  v-model:value="psdChannel"
                  v-if="spectrumType === 'PSD'"
                  mode="multiple"
                  :style="{ 'min-width': '100px' }"
                  placeholder="Channels"
                  :options="psdChannelOptions"
                  size="small"
                  @change="
                    () => {
                      undatePsd('channel');
                      undatePsd('series');
                    }
                  "
                ></a-select>
                <a-select
                  v-if="spectrumType === 'Heatmap'"
                  v-model:value="heatmapChannel"
                  @change="undateHeatmap('series')"
                  style="width: 100px"
                  aria-placeholder="Show Time"
                  :options="heatmapChannelOptions"
                  size="small"
                ></a-select>
              </a-space>
            </div>
          </div>
          <Psd
            v-if="spectrumType === 'PSD'"
            ref="psdRef"
            style="width: 100%; height: 100%"
          ></Psd>
          <Heatmap
            :numSeconds="spectrumShowTime"
            v-if="spectrumType === 'Heatmap'"
            ref="heatmapRef"
            style="width: 100%; height: 100%"
          ></Heatmap>
        </div>
      </div>
      <div class="eig-card">
        <p class="card-title">EEG Bands</p>
        <div class="eeg-bands">
          <div class="eig-filter eig-select-wrap">
            <div class="filter-left">
              <a-select
                v-model:value="bandsType"
                style="width: 150px"
                @change="handleChangeBandsType"
                aria-placeholder="Show Time"
                :options="bandsTypeOptions"
                size="small"
              ></a-select>
            </div>
            <div class="filter-right">
              <a-space>
                <a-select
                  v-model:value="bandsChannel"
                  style="width: 100px"
                  @change="handleChangeBandsType"
                  aria-placeholder="Show Time"
                  :options="bandsChannelOptions"
                  size="small"
                ></a-select>
                <a-select
                  v-if="bandsType !== 'Time Series'"
                  v-model:value="relatedChannel"
                  style="width: 100px"
                  @change="handleChangeBandsType"
                  aria-placeholder="Show Time"
                  :options="relatedChannelOptions"
                  size="small"
                ></a-select>
                <a-select
                  v-if="bandsType === 'Related Power'"
                  v-model:value="relatedStep"
                  style="width: 100px"
                  @change="undateRelatedPower('xAxis')"
                  aria-placeholder="Show Time"
                  :options="showTimeOptions"
                  size="small"
                ></a-select>
                <a-select
                  v-if="bandsType === 'Time Series'"
                  v-model:value="barnsTimeStep"
                  style="width: 100px"
                  @change="undateBarnsTime('xAxis')"
                  aria-placeholder="Show Time"
                  :options="showTimeOptions"
                  size="small"
                ></a-select>
              </a-space>
            </div>
          </div>
          <AbsolutePower
            ref="absolutePowerRef"
            v-if="bandsType === 'Absolute Power'"
            style="width: 100%; height: 100%"
          ></AbsolutePower>
          <RelatedPower
            :numSeconds="relatedStep"
            ref="relatedPowerRef"
            v-if="bandsType === 'Related Power'"
            style="width: 100%; height: 100%"
          ></RelatedPower>
          <BarnsTime
            :numSeconds="barnsTimeStep"
            v-if="bandsType === 'Time Series'"
            style="width: 100%; height: 100%"
            ref="barnsTimeRef"
          ></BarnsTime>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  inject,
  onMounted,
  nextTick,
  getCurrentInstance,
  ComponentInternalInstance,
  onBeforeUnmount,
  watch,
} from "vue";
import type { SelectProps } from "ant-design-vue";
const ipcRenderer = require("electron").ipcRenderer;

import BarnsTime from "../../components/BarnsTime.vue";
import TimeSeries from "../../components/TimeSeries.vue";
import RelatedPower from "../../components/RelatedPower.vue";
import AbsolutePower from "../../components/AbsolutePower.vue";
import Heatmap from "../../components/Heatmap.vue";
import Psd from "../../components/Psd.vue";
import { HighchartsKey } from "../../types";
import { CustomBluetooth } from "../../utils/bluetooth";

let pkgSourceData: any = [];
let cachePkgSourceData: any = [];
let drawPkgSourceData: any = [];
let pkgDataList: any = [];
let pkgMaxTime = 20;
const EEGTimeGap = 4; // 采样间隔
let colors: string[] = ["#8FDCFE", "#B3B3B3"];
let bluetooth = new CustomBluetooth();
let psdMapData: number[][] = [];
const seriesStep = ref(10);
const seriesMaxStep = 20;
let isRenderTimer: any = null;
const spectrumShowTime = ref(1);
const relatedStep = ref(10);
const barnsTimeStep = ref(10);
const barnsTimeMaxStep = 20;
const minTimeGap = 40; //渲染间隔 （最小只能设置40ms，每个包10个EEG，对这10个eeg是一起渲染的。再小没意义），并且发送数据是40ms
const timeGap = Math.round(1000 / minTimeGap);
const isRender = ref(false);
const channel = ref(["Fp1", "Fp2"]);
const psdChannel = ref(["Fp1", "Fp2"]);
const heatmapChannel = ref("Fp1");
const bandsChannel = ref("Fp1");
const maxFreq = ref(125);
const packetLossRate = ref(0);
const packetLossNum = ref(0);
const relatedChannel = ref("Typical");
const spectrumType = ref("PSD");
const bandsType = ref("Absolute Power");
const timeSeriesRef = ref<any>(null);
const absolutePowerRef = ref<any>(null);
const relatedPowerRef = ref<any>(null);
const barnsTimeRef = ref<any>(null);
const heatmapRef = ref<any>(null);
const psdRef = ref<any>(null);
import * as echarts from "echarts";
import { CustomDatabase } from "../../utils/db";
import { useIndexStore } from "../../store/index";
import { storeToRefs } from "pinia";
import { Item } from "ant-design-vue/es/menu";
const indexStore = useIndexStore();
const app = getCurrentInstance();
const {
  play,
  recordId,
  playIndex,
  isEegClear,
  isDragSlider,
  isConnect,
  playGap,
  configData,
} = storeToRefs(indexStore);
const db = new CustomDatabase();
let sourceData;
let timerPlay, timer, realTimer;
const MaxFrequency = 257;

const seriesForm = reactive({
  min: "",
  max: "",
});

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
  // {
  //   value: 30,
  //   label: "30 sec",
  // },
];
const chanOptionsData = [
  {
    value: "Fp1",
    label: "Fp1",
  },
  {
    value: "Fp2",
    label: "Fp2",
  },
];
const showTimeOptions = ref<SelectProps["options"]>(showTimeOptionsData);
const spectrumShowTimeOptions =
  ref<SelectProps["options"]>(showTimeOptionsData);
const channelOptions = ref<SelectProps["options"]>(chanOptionsData);
const psdChannelOptions = ref<SelectProps["options"]>(chanOptionsData);
const heatmapChannelOptions = ref<SelectProps["options"]>(chanOptionsData);
const bandsChannelOptions = ref<SelectProps["options"]>(chanOptionsData);
const relatedChannelOptions = ref<SelectProps["options"]>([
  {
    value: "Typical",
    label: "Typical",
  },
  {
    value: "Low/High",
    label: "Low/High",
  },
]);
//257个fft数据是对应0～125Hz的，假如要画到125Hz，就要全画，假如只画到50Hz，那就按比例取前面的点 2.056
const maxFreqOptions = ref<SelectProps["options"]>([
  {
    value: 25,
    label: "25Hz",
  },
  {
    value: 50,
    label: "50Hz",
  },
  {
    value: 75,
    label: "75Hz",
  },
  {
    value: 100,
    label: "100Hz",
  },
  {
    value: 125,
    label: "125Hz",
  },
]);
const spectrumTypeOptions = ref<SelectProps["options"]>([
  {
    value: "PSD",
    label: "PSD",
  },
  {
    value: "Heatmap",
    label: "Heatmap",
  },
]);
const bandsTypeOptions = ref<SelectProps["options"]>([
  {
    value: "Absolute Power",
    label: "Absolute Power",
  },
  {
    value: "Related Power",
    label: "Related Power",
  },
  {
    value: "Time Series",
    label: "Time Series",
  },
]);

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

watch(isDragSlider, (newValue) => {
  // 拖拽了进度条更改渲染数据
  if (newValue) {
    indexStore.isDragSlider = false;
    pkgDataList = [];
    let dataList = joinPkgList();
    app?.proxy?.loading.show("解析中...");
    play.value = false
    ipcRenderer.send("start-data-replay", dataList);
  }
});

watch(recordId, (value) => {
  if (value !== undefined) {
    initialize();
  }
});

watch(isRender, (newValue) => {
  if (newValue) {
    realTimerRenderData();
  } else {
    realTimer && clearInterval(realTimer);
  }
});

watch(isConnect, (newValue) => {
  if (newValue) {
    pkgDataList = [];
  }
});

watch(
  isEegClear,
  (newValue) => {
    if (newValue) {
      pkgDataList = [];
      indexStore.isEegClear = false;
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

onMounted(function () {
  initialize();
  initPsdMapData(spectrumShowTime.value);
  // const { proxy } = getCurrentInstance() as ComponentInternalInstance;
  // const bluetooth = new CustomBluetooth();
  // bluetooth.addNotice((data) => {});
});

onBeforeUnmount(() => {
  ipcRenderer.removeListener("end-data-replay", rePlayNotice);
  ipcRenderer.send("close-replay");
  bluetooth.removeNotice(bluetoothNotice);
  timer && clearInterval(timer);
  timerPlay && clearInterval(timerPlay);
  realTimer && clearInterval(realTimer);
  isRenderTimer && clearTimeout(isRenderTimer);
});

// 初始化
const initialize = () => {
  pkgSourceData = [];

  if (!recordId.value) {
    // 正常模式
    ipcRenderer.removeListener("end-data-replay", rePlayNotice);
    ipcRenderer.send("close-replay");
    bluetooth.addNotice(bluetoothNotice);
  } else {
    // 回放模式
    ipcRenderer.send("create-replay");
    ipcRenderer.on("end-data-replay", rePlayNotice);
    bluetooth.removeNotice(bluetoothNotice);
    db.all(`select * from source where recordId = ${recordId.value}`).then(
      (res) => {
        pkgSourceData = res
          .map((item) => {
            return JSON.parse(item.data);
          })
          .flat();
      }
    );
  }
};

// 回放数据
const rePlayNotice = (event, data) => {
  if (Array.isArray(data)) {
    app?.proxy?.loading.hide();
    data.forEach((item) => {
      handlePkgList(item);
    });
  } else {
    handlePkgList(data);
  }

  renderData();
};

// 蓝牙数据通知
const bluetoothNotice = (data) => {
  handlePkgList(data);
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

// 数据包处理
const handlePkgList = (data) => {
  if (
    pkgDataList.length &&
    pkgDataList[pkgDataList.length - 1].time_mark - pkgDataList[0].time_mark >
      pkgMaxTime * 1000
  ) {
    
    pkgDataList.shift();
  }
  //  有EEG数据标志位
  if (data.pkg_type === 1) {
    packetLossRate.value = data.loss_data_info_el.packetLossRate;
    packetLossNum.value = data.loss_data_info_el.packetLossNum;
    pkgDataList.push(data);
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
    let reTime = item.time_mark - pkgSourceData[0].time_mark;
    if (reTime <= playIndex.value * playGap.value && item.pkg_type === 1) {
      if (isGap && reTime > (playIndex.value - 1) * playGap.value) {
        tempPkgDataList.push(item);
      }

      if (!isGap && reTime > playIndex.value * playGap.value - pkgMaxTime * 1000) {
        tempPkgDataList.push(item);
      }
    }
  }  
  return tempPkgDataList;
};

// 渲染
const renderData = () => {
  undateTimeSerie("series");
  if (spectrumType.value === "PSD") {
    undatePsd("series");
  }
  if (spectrumType.value === "Heatmap") {
    undateHeatmap("series");
  }
  if (bandsType.value === "Absolute Power") {
    undateAbsolutePower("series");
  }
  if (bandsType.value === "Related Power") {
    undateRelatedPower("series");
  }
  if (bandsType.value === "Time Series") {
    undateBarnsTime("series");
  }
};

const handleChangeSpectrumType = () => {
  nextTick(() => {
    if (spectrumType.value === "PSD") {
      undatePsd("series");
    }
    if (spectrumType.value === "Heatmap") {
      undateHeatmap("series");
    }
  });
};

const handleChangeBandsType = () => {
  nextTick(() => {
    if (bandsType.value === "Absolute Power") {
      undateAbsolutePower("series");
    }
    if (bandsType.value === "Related Power") {
      undateRelatedPower("series");
    }
    if (bandsType.value === "Time Series") {
      undateBarnsTime("series");
    }
  });
};

// 现在只取EEG最后一个数据进行渲染,太卡了
// const conversionPkgtoPsdMap = (typeChannel, step) => {
//   if (pkgDataList.length < 1) return 0;
//   let maxTimer = pkgDataList[pkgDataList.length - 1].time_mark;
//   let minTime = maxTimer - step * 1000;
//   let sliceData = pkgDataList.filter(
//     (item) => item.time_mark >= minTime && item.time_mark <= maxTimer
//   );
//   let psdMapData: number[][] = [];
//   let baseTime = 0;
//   sliceData.forEach((item, sliceIndex) => {
//     if (sliceIndex !== 0) {
//       baseTime += item.time_mark - sliceData[sliceIndex - 1].time_mark;
//     }

//     item.psd_s[parseChannel(typeChannel)].forEach((value, y) => {
//       psdMapData.push([baseTime, y, value]);
//     });
//   });
//   return psdMapData;
// };

const conversionPkgtoPsdMap = (typeChannel, step) => {
  if (pkgDataList.length < 1) return 0;
  let maxTimer = pkgDataList[pkgDataList.length - 1].time_mark;
  let minTime = maxTimer - step * 1000;
  let sliceData = pkgDataList.filter(
    (item) => item.time_mark >= minTime && item.time_mark <= maxTimer
  );

  let baseTime = 0;

  for (let sliceIndex = 0; sliceIndex < sliceData.length; sliceIndex++) {
    const item = sliceData[sliceIndex];
    if (sliceIndex !== 0) {
      baseTime += item.time_mark - sliceData[sliceIndex - 1].time_mark;
    }
    let dataList = item.psd_s_multiple;
    for (let dataIndex = 0; dataIndex < dataList.length; dataIndex++) {
      dataList[dataIndex][parseChannel(typeChannel)].forEach((value, y) => {
        let x = Math.round(baseTime / EEGTimeGap) + dataIndex;
        psdMapData[x * MaxFrequency + y] = [
          baseTime + dataIndex * EEGTimeGap,
          y,
          value,
        ];
      });
    }
  }

  return psdMapData;
};

const initPsdMapData = (step) => {
  psdMapData = [];
  for (let i = 0; i < (1000 / EEGTimeGap) * step; i++) {
    for (let j = 0; j < MaxFrequency; j++) {
      psdMapData.push([i, j, 0]);
    }
  }
};
const conversionPkgtoPsd = (typeChannel) => {
  if (pkgDataList.length < 1) return 0;
  return pkgDataList[pkgDataList.length - 1].psd_s[parseChannel(typeChannel)];
};

const conversionPkgtoAbsolute = (typeChannel, index) => {
  if (pkgDataList.length < 1) return undefined;
  return pkgDataList[pkgDataList.length - 1].psd_relative_s[
    parseChannel(typeChannel)
  ][index];
};

const conversionPkgtoBarnsTimeOrRelated = (field, typeChannel, index, step) => {
  if (pkgDataList.length < 1) return [];
  let maxTimer = pkgDataList[pkgDataList.length - 1].time_mark;
  let minTime = maxTimer - step * 1000;
  let sliceData = pkgDataList.filter(
    (item) => item.time_mark >= minTime && item.time_mark <= maxTimer
  );
  let baseTime = 0;
  let tempSliceData: any = [];
  for (let sliceIndex = 0; sliceIndex < sliceData.length; sliceIndex++) {
    const item = sliceData[sliceIndex];
    if (sliceIndex !== 0) {
      baseTime += item.time_mark - sliceData[sliceIndex - 1].time_mark;
    }
    let fieldDataList = item[field + "_multiple"];

    for (let fieldIndex = 0; fieldIndex < fieldDataList.length; fieldIndex++) {
      tempSliceData.push({
        value: [
          baseTime + fieldIndex * EEGTimeGap,
          fieldDataList[fieldIndex][parseChannel(typeChannel)][index],
        ],
      });
    }
  }
  return tempSliceData;
};

const conversionPkgtoSeriesData = (typeChannel, step) => {
  if (pkgDataList.length < 1) return [];
  let maxTimer = pkgDataList[pkgDataList.length - 1].time_mark;
  let minTime = maxTimer - step * 1000;
  let sliceData = pkgDataList.filter(
    (item) => item.time_mark >= minTime && item.time_mark <= maxTimer
  );
  let baseTime = 0;

  let tempSliceData: any = [];
  for (let sliceIndex = 0; sliceIndex < sliceData.length; sliceIndex++) {
    const item = sliceData[sliceIndex];
    if (sliceIndex !== 0) {
      baseTime += item.time_mark - sliceData[sliceIndex - 1].time_mark;
    }
    let brain_elec_channel = item.brain_elec_channel[parseChannel(typeChannel)];
    for (let brainIndex = 0; brainIndex < item.eeg_data_num; brainIndex++) {
      tempSliceData.push({
        value: [
          baseTime + brainIndex * EEGTimeGap,
          brain_elec_channel[brainIndex],
          item.time_stamp + brainIndex * EEGTimeGap,
        ],
        // 点演示
        // itemStyle: {
        //   color: item.color ? "red" : "#ffde33",
        //   borderWidth: 1,
        // },
      });
    }
  }

  return tempSliceData;
};

const undateTimeSerie = (type) => {
  switch (type) {
    case "channel":
      channel.value.sort((a, b) => {
        return (
          chanOptionsData.findIndex((i) => i.value == a) -
          chanOptionsData.findIndex((i) => i.value == b)
        );
      });
      timeSeriesRef.value &&
        timeSeriesRef.value.setOption({
          channel: channel.value,
        });
      break;
    case "series":
      timeSeriesRef.value &&
        timeSeriesRef.value.setOption({
          series: channel.value.map((item) => ({
            name: item,
            data: conversionPkgtoSeriesData(item, seriesStep.value),
          })),
        });
      break;
    case "xAxis":
      timeSeriesRef.value &&
        timeSeriesRef.value.setOption({
          xAxis: channel.value.map((item, index) => ({
            max: seriesStep.value,
          })),
        });
      break;
    case "yAxis":
      timeSeriesRef.value &&
        timeSeriesRef.value.setOption({
          yAxis: channel.value.map((item) => ({
            max: seriesForm.max === "" ? undefined : seriesForm.max,
            min: seriesForm.min === "" ? undefined : seriesForm.min,
          })),
        });
      break;
  }
};
const undateAbsolutePower = (type) => {
  switch (type) {
    case "series":
      absolutePowerRef.value.setOption({
        series: [
          conversionPkgtoAbsolute(bandsChannel.value, 0),
          conversionPkgtoAbsolute(bandsChannel.value, 1),
          conversionPkgtoAbsolute(bandsChannel.value, 2),
          conversionPkgtoAbsolute(bandsChannel.value, 3),
          conversionPkgtoAbsolute(bandsChannel.value, 4),
        ],
      });
      break;
  }
};

const undateHeatmap = (type) => {
  switch (type) {
    case "series":
      heatmapRef.value.setOption({
        series: {
          data: conversionPkgtoPsdMap(
            heatmapChannel.value,
            spectrumShowTime.value
          ),
        },
      });
      break;
    case "xAxis":
      initPsdMapData(spectrumShowTime.value);
      heatmapRef.value.setOption({
        xAxis: {
          max: spectrumShowTime.value,
        },
      });
      break;
  }
};

const undateRelatedPower = (type) => {
  switch (type) {
    // case "channel":
    //   channel.value.sort((a, b) => {
    //     return (
    //       chanOptionsData.findIndex((i) => i.value == a) -
    //       chanOptionsData.findIndex((i) => i.value == b)
    //     );
    //   });
    //   barnsTimeRef.value.setOption({
    //     channel: channel.value,
    //   });
    //   break;
    case "series":
      relatedPowerRef.value.setOption({
        series: [
          {
            name: "γ wave",
            data: conversionPkgtoBarnsTimeOrRelated(
              "psd_relative_percent_s",
              bandsChannel.value,
              4,
              relatedStep.value
            ),
          },
          {
            name: "β wave",
            data: conversionPkgtoBarnsTimeOrRelated(
              "psd_relative_percent_s",
              bandsChannel.value,
              3,
              relatedStep.value
            ),
          },
          {
            name: "α wave",
            data: conversionPkgtoBarnsTimeOrRelated(
              "psd_relative_percent_s",
              bandsChannel.value,
              2,
              relatedStep.value
            ),
          },
          {
            name: "θ wave",
            data: conversionPkgtoBarnsTimeOrRelated(
              "psd_relative_percent_s",
              bandsChannel.value,
              1,
              relatedStep.value
            ),
          },
          {
            name: "δ wave",
            data: conversionPkgtoBarnsTimeOrRelated(
              "psd_relative_percent_s",
              bandsChannel.value,
              0,
              relatedStep.value
            ),
          },
        ],
      });
      break;
    case "xAxis":
      relatedPowerRef.value.setOption({
        xAxis: {
          max: relatedStep.value,
        },
      });
      break;
  }
};

const undateBarnsTime = (type) => {
  switch (type) {
    // case "channel":
    //   channel.value.sort((a, b) => {
    //     return (
    //       chanOptionsData.findIndex((i) => i.value == a) -
    //       chanOptionsData.findIndex((i) => i.value == b)
    //     );
    //   });
    //   barnsTimeRef.value.setOption({
    //     channel: channel.value,
    //   });
    //   break;
    case "series":
      barnsTimeRef.value.setOption({
        series: [
          {
            name: "EEG",
            data: conversionPkgtoSeriesData(
              bandsChannel.value,
              barnsTimeStep.value
            ),
          },
          {
            name: "DELTA",
            data: conversionPkgtoBarnsTimeOrRelated(
              "time_e_s",
              bandsChannel.value,
              0,
              barnsTimeStep.value
            ),
          },
          {
            name: "THETA",
            data: conversionPkgtoBarnsTimeOrRelated(
              "time_e_s",
              bandsChannel.value,
              1,
              barnsTimeStep.value
            ),
          },
          {
            name: "ALPHA",
            data: conversionPkgtoBarnsTimeOrRelated(
              "time_e_s",
              bandsChannel.value,
              2,
              barnsTimeStep.value
            ),
          },
          {
            name: "BETA",
            data: conversionPkgtoBarnsTimeOrRelated(
              "time_e_s",
              bandsChannel.value,
              3,
              barnsTimeStep.value
            ),
          },
          {
            name: "GAMMA",
            data: conversionPkgtoBarnsTimeOrRelated(
              "time_e_s",
              bandsChannel.value,
              4,
              barnsTimeStep.value
            ),
          },
        ],
      });
      break;
    case "xAxis":
      barnsTimeRef.value.setOption({
        xAxis: [
          {
            max: barnsTimeStep.value,
          },
          {
            max: barnsTimeStep.value,
          },
          {
            max: barnsTimeStep.value,
          },
          {
            max: barnsTimeStep.value,
          },
          {
            max: barnsTimeStep.value,
          },
          {
            max: barnsTimeStep.value,
          },
        ],
      });
      break;
  }
};

const undatePsd = (type) => {
  switch (type) {
    case "channel":
      psdRef.value.setOption({
        channel: psdChannel.value,
      });
      break;
    case "xAxis":
      psdRef.value.setOption({
        xAxis: {
          max: maxFreq.value,
        },
      });
      break;
    case "series":
      psdRef.value.setOption({
        series: psdChannel.value.map((item) => ({
          name: item,
          data: conversionPkgtoPsd(item),
        })),
      });
      break;
  }
};

// 计算时间间隔
const calculateMinTimeGap = () => {
  if (pkgDataList.length >= 2) {
    return (
      pkgDataList[pkgDataList.length - 1].time_mark -
      pkgDataList[pkgDataList.length - 2].time_mark
    );
  } else {
    return minTimeGap;
  }
};

const handleChangePsdChannel = () => {
  // initPSD();
  // undateRenderPsd();
};

const parseChannel = (channel: string) => {
  switch (channel) {
    case "Fp1":
      return 0;
    case "Fp2":
      return 1;
  }
  return 0;
};
</script>
<style scoped></style>
