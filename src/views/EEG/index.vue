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
        <div class="filter-right">
          <a-form size="small" :model="seriesForm" layout="inline">
            <a-form-item label="preproc">
              <a-switch @change="changeConfig" v-model:checked="configData.isFilter" />
            </a-form-item>
            <a-form-item label="min">
              <a-input
                type="number"
                style="width: 100px"
                @change="updateRenderRealSeriesData('yAxis')"
                v-model:value="seriesForm.min"
                placeholder="auto"
              />
            </a-form-item>
            <a-form-item label="max">
              <a-input
                type="number"
                style="width: 100px"
                @change="updateRenderRealSeriesData('yAxis')"
                v-model:value="seriesForm.max"
                placeholder="auto"
              />
            </a-form-item>
            <a-form-item>
              <a-select
                v-model:value="seriesStep"
                style="width: 100px"
                @change="updateRenderRealSeriesData('channel')"
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
                @change="generateSeries"
              ></a-select>
            </a-form-item>
          </a-form>
        </div>
      </div>

      <div class="time-series">
        <div style="width: 100%; height: 100%" id="series"></div>
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
                  @change="undateRenderPsdMap"
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
                  @change="handleChangePsdChannel"
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
                  @change="handleChangePsdChannel"
                ></a-select>
                <a-select
                  v-if="spectrumType === 'Heatmap'"
                  v-model:value="heatmapChannel"
                  @change="undateRenderPsdMap"
                  style="width: 100px"
                  aria-placeholder="Show Time"
                  :options="heatmapChannelOptions"
                  size="small"
                ></a-select>
              </a-space>
            </div>
          </div>
          <div
            v-if="spectrumType === 'PSD'"
            id="psd"
            style="width: 100%; height: 100%"
          ></div>
          <div
            v-if="spectrumType === 'Heatmap'"
            id="heatmap"
            style="width: 100%; height: 100%"
          ></div>
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
                  @change="updateRenderRelated('xAxis')"
                  aria-placeholder="Show Time"
                  :options="showTimeOptions"
                  size="small"
                ></a-select>
                <a-select
                  v-if="bandsType === 'Time Series'"
                  v-model:value="barnsTimeStep"
                  style="width: 100px"
                  @change="updateRenderBarnsTime('xAxis')"
                  aria-placeholder="Show Time"
                  :options="showTimeOptions"
                  size="small"
                ></a-select>
              </a-space>
            </div>
          </div>
          <div
            id="absolute"
            v-if="bandsType === 'Absolute Power'"
            style="width: 100%; height: 100%"
          ></div>
          <div
            id="related"
            v-if="bandsType === 'Related Power'"
            style="width: 100%; height: 100%"
          ></div>
          <div
            id="barnsTime"
            v-if="bandsType === 'Time Series'"
            style="width: 100%; height: 100%"
          ></div>
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

import { HighchartsKey } from "../../types";
import { CustomBluetooth } from "../../utils/bluetooth";
let grid: echarts.EChartOption.Grid[] = [];
let xAxis: echarts.EChartOption.XAxis[] = [];
let yAxis: echarts.EChartOption.YAxis[] = [];
let series: echarts.EChartOption.Series[] = [];
let pkgSourceData: any = [];
let pkgDataList: any = [];
let pkgMaxTime = 30;
const EEGTimeGap = 4; // 采样间隔
let colors: string[] = ["#8FDCFE", "#B3B3B3"];
let bluetooth = new CustomBluetooth();
const seriesStep = ref(30);
const seriesMaxStep = 30;
let isRenderTimer: any = null;
const spectrumShowTime = ref(5);
const relatedStep = ref(30);
const barnsTimeStep = ref(30);
const barnsTimeMaxStep = 30;
const minTimeGap = 250; //渲染间隔 （最小只能设置40ms，每个包10个EEG，对这10个eeg是一起渲染的。再小没意义），并且发送数据是40ms
const timeGap = Math.round(1000 / minTimeGap);
const isRender = ref(false);
const channel = ref(["Fp1", "Fp2"]);
const psdChannel = ref(["Fp1", "Fp2"]);
const heatmapChannel = ref("Fp1");
const bandsChannel = ref("Fp1");
const maxFreq = ref(256);
const packetLossRate = ref(0);
const packetLossNum = ref(0);
const relatedChannel = ref("Typical");
const spectrumType = ref("PSD");
const bandsType = ref("Absolute Power");
import * as echarts from "echarts";
import { CustomDatabase } from "../../utils/db";
import { useIndexStore } from "../../store/index";
import { storeToRefs } from "pinia";
import { Item } from "ant-design-vue/es/menu";
const indexStore = useIndexStore();
const { play, recordId, playIndex, isDragSlider, isConnect,configData } =
  storeToRefs(indexStore);
const db = new CustomDatabase();
let sourceData;
let timerPlay, timer, realTimer;

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
  {
    value: 30,
    label: "30 sec",
  },
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
    value: 51,
    label: "25Hz",
  },
  {
    value: 102,
    label: "50Hz",
  },
  {
    value: 154,
    label: "75Hz",
  },
  {
    value: 205,
    label: "100Hz",
  },
  {
    value: 256,
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

let seriesChart,
  psdChart,
  heatmapChart,
  absoluteChart,
  relatedChart,
  barnsTimeChart;

watch(
  play,
  (newValue) => {
    if (newValue) {
      timerPlay = setInterval(() => {
        if (pkgSourceData.length) {
          if (
            playIndex.value * minTimeGap >=
            pkgSourceData[pkgSourceData.length - 1].time_mark
          ) {
            timerPlay && clearInterval(timerPlay);
            return;
          }
          pkgDataList = joinPkgList();
          renderData();
        }
      }, minTimeGap);
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
    // handleOldData();
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

onMounted(function () {
  initialize();
  // const { proxy } = getCurrentInstance() as ComponentInternalInstance;
  // const bluetooth = new CustomBluetooth();
  // bluetooth.addNotice((data) => {});
});

onBeforeUnmount(() => {
  bluetooth.removeNotice(bluetoothNotice);
  timer && clearInterval(timer);
  timerPlay && clearInterval(timerPlay);
  realTimer && clearInterval(realTimer);
  isRenderTimer && clearTimeout(isRenderTimer);
});

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
const joinPkgList = () => {
  let tempPkgDataList: any = [];
  if (!pkgSourceData.length) {
    return [];
  }
  for (let index = 0; index < pkgSourceData.length; index++) {
    const item = pkgSourceData[index];
    if (
      item.time_mark - pkgSourceData[0].time_mark <=
        playIndex.value * minTimeGap &&
      item.pkg_type === 1
    ) {
      tempPkgDataList.push(item);
    }
  }
  return tempPkgDataList;
};

// 渲染
const renderData = () => {
  updateRenderRealSeriesData();
  if (spectrumType.value === "PSD") {
    undateRenderPsd();
  }
  if (spectrumType.value === "Heatmap") {
    undateRenderPsdMap();
  }
  if (bandsType.value === "Absolute Power") {
    undateRenderAbsoule();
  }
  if (bandsType.value === "Related Power") {
    updateRenderRelated();
  }
  if (bandsType.value === "Time Series") {
    updateRenderBarnsTime();
  }
};

const initialize = () => {
  pkgSourceData = [];

  if (!recordId.value) {
    bluetooth.addNotice(bluetoothNotice);
  } else {
    bluetooth.removeNotice(bluetoothNotice);
    db.get(`select sourceData from record where id = ${recordId.value}`).then(
      (res) => {
        pkgSourceData = JSON.parse(res.sourceData);
      }
    );
  }
  nextTick(() => {
    initSeries();
    initPSD();
    initAbsolute();
  });
};

const initSeries = () => {
  seriesChart = echarts.init(document.getElementById("series"));
  generateSeries();
};
const initHeatmap = () => {
  let xData: number[] = [];
  for (let i = 0; i < spectrumShowTime.value * timeGap; i++) {
    xData.push(i);
  }
  heatmapChart = echarts.init(document.getElementById("heatmap"));
  heatmapChart && heatmapChart.clear();
  heatmapChart.setOption({
    animation: false,
    tooltip: {
      show: false,
    },
    xAxis: {
      type: "category",
    },
    yAxis: {
      type: "category",
      data: [],
    },
    grid: {
      top: "4%",
      left: "8%",
      right: "4%",
      bottom: "4%",
      containLabel: true,
    },
    visualMap: {
      min: -300,
      max: 300,
      calculable: true,
      realtime: false,
      inRange: {
        color: [
          "#313695",
          "#4575b4",
          "#74add1",
          "#abd9e9",
          "#e0f3f8",
          "#ffffbf",
          "#fee090",
          "#fdae61",
          "#f46d43",
          "#d73027",
          "#a50026",
        ],
      },
    },
    series: [
      {
        name: "Gaussian",
        type: "heatmap",
        data: [],
        emphasis: {
          itemStyle: {
            borderColor: "#333",
            borderWidth: 1,
          },
        },
        progressive: 0,
        animation: false,
      },
    ],
  });
};
const initPSD = () => {
  let XAxisData: number[] = [];
  for (let i = 0; i <= maxFreq.value; i += 1) {
    XAxisData.push(i);
  }
  psdChart = echarts.init(document.getElementById("psd"));
  psdChart && psdChart.clear();
  psdChart &&
    psdChart.setOption({
      animation: false,
      legend: {
        // 设置图例不可选择
        selectedMode: false,
        left: "center",
        top: 5,
        data: psdChannel.value,
        icon: "circle",
        itemHeight: 12,
        itemWidth: 12,
        textStyle: {
          fontSize: 12,
        },
      },
      grid: {
        top: "12%",
        left: "5%",
        right: "4%",
        bottom: "9%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        axisTick: {
          length: 3,
          show: true,
        },
        axisLabel: {
          formatter: function (value, index) {
            return Math.round(value / 2.056);
          },
        },
        boundaryGap: false,
        data: XAxisData,
        name: "frequency(Hz)",
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: {
          fontSize: 12, // 字体大小
          fontWeight: "bold", // 字体加粗
        },
      },
      yAxis: {
        type: "value",
        // type: "log",
        name: "dBμV^2",
        axisTick: {
          length: 3,
          show: true,
        },
        minorTick: {
          length: 1,
          show: true,
        },
        minorSplitLine: {
          show: true,
        },
        // min: 0.1,
        // min: 0,
        // max: 500,
        nameRotate: 90, // 旋转角度
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: {
          fontSize: 12, // 字体大小
          fontWeight: "bold", // 字体加粗
          verticalAlign: "bottom", // 文字垂直对齐方式
        },
        axisLine: {
          show: true, // 显示y轴线
        },
      },
      series: psdChannel.value.map((item) => {
        return {
          name: item,
          type: "line",
          symbol: "none",
          data: [],
        };
      }),
    });
};
const initAbsolute = () => {
  absoluteChart = echarts.init(document.getElementById("absolute"));
  absoluteChart && absoluteChart.clear();
  absoluteChart.setOption({
    animation: false,
    grid: {
      top: "4%",
      left: "6%",
      right: "4%",
      bottom: "9%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      axisTick: {
        show: false,
      },

      data: ["DELTA", "THETA", "ALPHA", "BETA", "GAMMA"],
      name: "EEG Power Bands",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: {
        fontSize: 12, // 字体大小
        fontWeight: "bold", // 字体加粗
      },
    },
    yAxis: {
      // type: "log",
      axisTick: {
        length: 3,
        show: true,
      },
      minorTick: {
        length: 1,
        show: true,
      },
      minorSplitLine: {
        show: true,
      },
      max: 100,
      name: "μV^2",
      nameRotate: 90, // 旋转角度
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: {
        fontSize: 12, // 字体大小
        fontWeight: "bold", // 字体加粗
        verticalAlign: "bottom", // 文字垂直对齐方式
      },
      axisLine: {
        show: true, // 显示y轴线
      },
    },
    series: [
      {
        data: [],
        type: "bar",
        barCategoryGap: "2%",
      },
    ],
  });
};
const initRelated = () => {
  relatedChart = echarts.init(document.getElementById("related"));
  relatedChart && relatedChart.clear();
  relatedChart.setOption({
    animation: false,
    color: ["#E4CDFF","#A19CFF", "#7A83FF", "#4C68FF","#0721E6"],

    legend: {
      // 0，1，2，3，4
      // DELTA（δ）、THETA（θ）、ALPHA （α）、BETA （β）、GAMMA （γ）
      data: ["γ wave", "β wave", "α wave", "θ wave", "δ wave"],
      top: 5,
      icon: "circle",
      itemHeight: 12,
      itemWidth: 12,
      textStyle: {
        fontSize: 12,
      },
    },

    grid: {
      top: "12%",
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "time",
        max: relatedStep.value * 1000,
        boundaryGap: false,
        axisLabel: {
          color: "#666666",
          formatter: function (value, index) {
            return echarts.format.formatTime("s", value);
          },
          showMaxLabel: true,
          showMinLabel: true,
        },
      },
    ],
    yAxis: [
      {
        max: 100,
        type: "value",
        name: "Each Band Power Ratio (%)",
        nameRotate: 90, // 旋转角度
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: {
          fontSize: 12, // 字体大小
          fontWeight: "bold", // 字体加粗
          verticalAlign: "bottom", // 文字垂直对齐方式
        },
      },
    ],
    series: [
    {
        name: "δ wave",
        type: "line",
        stack: "Total",
        emphasis: {
          disabled: true,
        },
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        label: {
          show: true,
          position: "top",
        },
        areaStyle: {},
        data: [],
      },
  
      {
        name: "θ wave",
        type: "line",
        stack: "Total",
        emphasis: {
          disabled: true,
        },
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {},
        data: [],
      },
    
      {
        name: "α wave",
        type: "line",
        stack: "Total",
        emphasis: {
          disabled: true,
        },
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {},
        data: [],
      },
      {
        name: "β wave",
        type: "line",
        stack: "Total",
        emphasis: {
          disabled: true,
        },
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {},
        data: [],
      },

      {
        name: "γ wave",
        type: "line",
        stack: "Total",
        smooth: true,
        lineStyle: {
          width: 0,
        },
        emphasis: {
          disabled: true,
        },
        showSymbol: false,
        areaStyle: {},
        data: [],
      },

    ],
  });
};
const initBarnsTime = () => {
  barnsTimeChart = echarts.init(document.getElementById("barnsTime"));
  barnsTimeChart && barnsTimeChart.clear();
  barnsTimeChart.setOption({
    animation: false,
    color: ["#737373", "#D5D5D6", "#A4A4FF", "#7BFFFF", "#FF72FF", "#E6E689"],
    // legend: {
    //   top: 80,
    //   left: "0",
    //   data: ['EEG',"DELTA", "THETA", "ALPHA", "BETA", "GAMMA"],
    //   icon: "circle",
    //   orient: "vertical",
    //   itemGap: 100,
    //   itemHeight: 12,
    //   itemWidth: 12,
    //   textStyle: {
    //     fontSize: 12,
    //   },
    // },
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        let result = "";
        params.forEach(function (item) {
          // item 是每一个系列的数据信息
          const seriesName = item.seriesName; // 系列名称
          const value = item.value; // 数据值
          const marker = item.marker; // 标志图形
          result += `${marker}${seriesName}:${value[0]}: ${value[1]}<br/>`;
        });
        return result;
      },
    },
    xAxis: [
      {
        type: "time",
        show: false,
        max: barnsTimeStep.value * 1000,
        boundaryGap: false,
        gridIndex: 0,
      },
      {
        type: "time",
        show: false,
        max: barnsTimeStep.value * 1000,
        boundaryGap: false,
        gridIndex: 1,
      },
      {
        type: "time",
        show: false,
        max: barnsTimeStep.value * 1000,
        boundaryGap: false,
        gridIndex: 2,
      },
      {
        type: "time",
        show: false,
        max: barnsTimeStep.value * 1000,
        boundaryGap: false,
        gridIndex: 3,
      },
      {
        type: "time",
        show: false,
        max: barnsTimeStep.value * 1000,
        boundaryGap: false,
        gridIndex: 4,
      },
      {
        type: "time",
        boundaryGap: false,
        show: true,
        gridIndex: 5,
        max: barnsTimeStep.value * 1000,
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
      },
    ],
    grid: [
      {
        show: false,
        left: "13%",
        right: "4%",
        top: "0%",
        bottom: "83.34%",
        containLabel: false,
      },
      {
        show: false,
        left: "13%",
        right: "4%",
        top: "16.66%",
        bottom: "66.64%",
        containLabel: false,
      },
      {
        show: false,
        left: "13%",
        right: "4%",
        top: "33.36%",
        bottom: "49.98%",
        containLabel: false,
      },
      {
        show: false,
        left: "13%",
        right: "4%",
        top: "50.02%",
        bottom: "33.32%",
        containLabel: false,
      },
      {
        show: false,
        left: "13%",
        right: "4%",
        top: "66.68%",
        bottom: "16.66%",
        containLabel: false,
      },
      {
        show: false,
        left: "13%",
        right: "4%",
        top: "83.34%",
        bottom: 0,
        containLabel: false,
      },
    ],
    yAxis: [
      {
        show: true,
        axisLine: {
          show: true, // 显示y轴线
        },
        axisLabel: {
          //坐标轴刻度标签
          show: false,
        },
        axisTick: {
          show: false, // 可取消y轴刻度线
        },
        splitLine: {
          show: false, // 去除网格线
        },
        nameRotate: 0,
        name: "EEG",
        nameLocation: "middle",
        nameTextStyle: {
          fontSize: 12,
          fontWeight: "bold",
        },
        type: "value",
        gridIndex: 0,
      },
      {
        show: true,
        axisLine: {
          show: true,
        },
        axisLabel: {
          show: true,
        },
        axisTick: {
          show: true,
        },
        splitLine: {
          show: true,
        },
        nameRotate: 0,
        name: "DELTA",
        nameLocation: "middle",
        nameTextStyle: {
          fontSize: 11,
          fontWeight: "bold",
        },
        type: "value",
        gridIndex: 1,
      },
      {
        show: true,
        axisLine: {
          show: true,
        },
        axisLabel: {
          show: true,
        },
        axisTick: {
          show: true,
        },
        splitLine: {
          show: true,
        },
        nameRotate: 0,
        name: "THETA",
        nameLocation: "middle",
        nameTextStyle: {
          fontSize: 11,
          fontWeight: "bold",
        },
        type: "value",
        gridIndex: 2,
      },
      {
        show: true,
        axisLine: {
          show: true,
        },
        axisLabel: {
          show: true,
        },
        axisTick: {
          show: true,
        },
        splitLine: {
          show: true,
        },
        nameRotate: 0,
        name: "ALPHA",
        nameLocation: "middle",
        nameTextStyle: {
          fontSize: 11,
          fontWeight: "bold",
        },
        type: "value",
        gridIndex: 3,
      },
      {
        show: true,
        axisLine: {
          show: true,
        },
        axisLabel: {
          show: true,
        },
        axisTick: {
          show: true,
        },
        splitLine: {
          show: true,
        },
        nameRotate: 0,
        name: "BETA",
        nameLocation: "middle",
        nameTextStyle: {
          fontSize: 11,
          fontWeight: "bold",
        },
        type: "value",
        gridIndex: 4,
      },
      {
        show: true,
        axisLine: {
          show: true,
        },
        axisLabel: {
          show: true,
        },
        axisTick: {
          show: true,
        },
        splitLine: {
          show: true,
        },
        nameRotate: 0,
        name: "GAMMA",
        nameLocation: "middle",
        nameTextStyle: {
          fontSize: 11,
          fontWeight: "bold",
        },
        type: "value",
        gridIndex: 5,
      },
    ],

    series: [
      {
        data: [],
        type: "line",
        name: "EEG",
        symbol: "none",
        lineStyle: {
          width: 1,
        },
        emphasis: {
          disabled: true,
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
        xAxisIndex: 0,
        yAxisIndex: 0,
      },
      {
        data: [],
        type: "line",
        symbol: "none",
        name: "DELTA",
        lineStyle: {
          width: 1,
        },
        emphasis: {
          disabled: true,
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
        xAxisIndex: 1,
        yAxisIndex: 1,
      },
      {
        data: [],
        type: "line",
        symbol: "none",
        name: "THETA",
        lineStyle: {
          width: 1,
        },
        emphasis: {
          disabled: true,
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
        xAxisIndex: 2,
        yAxisIndex: 2,
      },
      {
        data: [],
        type: "line",
        symbol: "none",
        name: "ALPHA",
        lineStyle: {
          width: 1,
        },
        emphasis: {
          disabled: true,
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
        xAxisIndex: 3,
        yAxisIndex: 3,
      },
      {
        data: [],
        type: "line",
        symbol: "none",
        name: "BETA",
        lineStyle: {
          width: 1,
        },
        emphasis: {
          disabled: true,
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
        xAxisIndex: 4,
        yAxisIndex: 4,
      },
      {
        data: [],
        type: "line",
        symbol: "none",
        name: "GAMMA",
        lineStyle: {
          width: 1,
        },
        emphasis: {
          disabled: true,
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
        xAxisIndex: 5,
        yAxisIndex: 5,
      },
    ],
  });
};

const handleChangeSpectrumType = () => {
  nextTick(() => {
    if (spectrumType.value === "PSD") {
      initPSD();
      undateRenderPsd();
    }
    if (spectrumType.value === "Heatmap") {
      initHeatmap();
      undateRenderPsdMap();
    }
  });
};

const handleChangeBandsType = () => {
  nextTick(() => {
    if (bandsType.value === "Absolute Power") {
      initAbsolute();
      undateRenderAbsoule();
    }
    if (bandsType.value === "Related Power") {
      initRelated();
      updateRenderRelated();
    }
    if (bandsType.value === "Time Series") {
      initBarnsTime();
      updateRenderBarnsTime();
    }
  });
};

// 生成--series
const generateSeries = () => {
  seriesChart && seriesChart.clear();
  grid = [];
  xAxis = [];
  yAxis = [];
  series = [];
  channel.value.forEach((item, index) => {
    grid.push({
      show: false,
      left: "6%", // 10%
      right: "4%",
      top: (100 / channel.value.length) * index + 5 + "%",
      bottom: 110 - (100 / channel.value.length) * (index + 1) + "%",
      containLabel: false,
    });
    xAxis.push({
      type: "time",
      show: true,
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
    });
    yAxis.push({
      show: true,
      axisLine: {
        show: true, // 显示y轴线
      },
      axisLabel: {
        //坐标轴刻度标签
        show: true,
      },
      max: seriesForm.max === "" ? undefined : seriesForm.max,
      min: seriesForm.min === "" ? undefined : seriesForm.min,
      axisTick: {
        show: true, // 可取消y轴刻度线
      },
      splitLine: {
        show: false, // 去除网格线
      },
      nameRotate: 0,
      name: item,
      nameLocation: "middle",
      nameTextStyle: {
        fontSize: 12,
        padding: 30, // 设置与坐标轴的距离，单位为像素
        fontWeight: "bold",
      },
      type: "value",
      gridIndex: index,
    });
    series.push({
      data: conversionPkgtoSeriesData(item, seriesStep.value),
      type: "line",
      name: item,
      symbol: "none",
      lineStyle: {
        color: colors[index],
        width: 1,
      },
      xAxisIndex: index,
      yAxisIndex: index,
    });
  });

  seriesChart &&
    seriesChart.setOption({
      animation: false,
      color: colors,
      grid: grid,
      xAxis: xAxis,
      yAxis: yAxis,
      series: series,
    });
};

// 更新渲染--seriesData
const updateRenderRealSeriesData = (type?: string) => {
  if (!seriesChart) return;
  switch (type) {
    case "yAxis":
      seriesChart.setOption({
        yAxis: channel.value.map((item) => ({
          name: item,
          max: seriesForm.max === "" ? undefined : seriesForm.max,
          min: seriesForm.min === "" ? undefined : seriesForm.min,
        })),
      });
      break;
    case "channel":
      seriesChart.setOption({
        yAxis: channel.value.map((item) => ({
          name: item,
          max: seriesForm.max === "" ? undefined : seriesForm.max,
          min: seriesForm.min === "" ? undefined : seriesForm.min,
        })),
        xAxis: channel.value.map((item, index) => ({
          gridIndex: index,
          splitNumber: seriesStep.value,
          max: seriesStep.value * 1000,
        })),
      });
      break;
  }
  seriesChart.setOption(
    {
      series: channel.value.map((item) => ({
        name: item,
        data: conversionPkgtoSeriesData(item, seriesStep.value),
      })),
    },
    {
      lazyUpdate: true,
    }
  );
};
// 更新渲染--psd
const undateRenderPsd = () => {
  psdChart &&
    psdChart.setOption(
      {
        series: [
          {
            name: "Fp1",
            data: conversionPkgtoPsd("Fp1"),
          },
          {
            name: "Fp2",
            data: conversionPkgtoPsd("Fp2"),
          },
        ],
      },
      {
        lazyUpdate: true,
      }
    );
};

// 更新渲染-- psdMap
const undateRenderPsdMap = () => {
  let xData: number[] = [];
  let yData: number[] = [];

  for (
    let i = 0;
    i < spectrumShowTime.value * Math.round(1000 / calculateMinTimeGap());
    i++
  ) {
    xData.push(i);
  }
  for (let i = 0; i < pkgDataList[0].psd_s[0].length; i++) {
    yData.push(i);
  }
  heatmapChart &&
    heatmapChart.setOption(
      {
        xAxis: {
          data: xData,
        },
        yAxis: {
          data: yData,
        },
        series: [
          {
            data: conversionPkgtoPsdMap(
              heatmapChannel.value,
              spectrumShowTime.value
            ),
          },
        ],
      }
      // {
      //   lazyUpdate: true,
      // }
    );
};

// 更新渲染-- absoule
const undateRenderAbsoule = () => {
  absoluteChart &&
    absoluteChart.setOption(
      {
        series: [
          {
            data: [
              {
                value: conversionPkgtoAbsolute(bandsChannel.value, 0),
                itemStyle: {
                  color: "rgb(255, 67, 72, 0.8)",
                },
              },
              {
                value: conversionPkgtoAbsolute(bandsChannel.value, 1),
                itemStyle: {
                  color: "rgb(241, 189, 0, 0.8)",
                },
              },
              {
                value: conversionPkgtoAbsolute(bandsChannel.value, 2),
                itemStyle: {
                  color: "rgb(37, 146, 121, 0.8)",
                },
              },
              {
                value: conversionPkgtoAbsolute(bandsChannel.value, 3),
                itemStyle: {
                  color: "rgb(78, 123, 187, 0.8)",
                },
              },
              {
                value: conversionPkgtoAbsolute(bandsChannel.value, 4),
                itemStyle: {
                  color: "rgb(165, 107, 172, 0.8)",
                },
              },
            ],
          },
        ],
      },
      {
        lazyUpdate: true,
      }
    );
};

// 更新渲染--related
const updateRenderRelated = (type?: string) => {
  switch (type) {
    case "xAxis":
      relatedChart.setOption({
        xAxis: [
          {
            splitNumber: relatedStep.value,
            max: relatedStep.value * 1000,
          },
        ],
      });
      break;
  }

  relatedChart &&
    relatedChart.setOption(
      {
        series: [
        {
            name: "δ wave",
            stack: "Total",
            data: conversionPkgtoBarnsTimeOrRelated(
              "psd_relative_percent_s",
              bandsChannel.value,
              0,
              relatedStep.value
            ),
          },
          {
            name: "θ wave",
            stack: "Total",
            data: conversionPkgtoBarnsTimeOrRelated(
              "psd_relative_percent_s",
              bandsChannel.value,
              1,
              relatedStep.value
            ),
          },
         
         
          {
            name: "α wave",
            stack: "Total",
            data: conversionPkgtoBarnsTimeOrRelated(
              "psd_relative_percent_s",
              bandsChannel.value,
              2,
              relatedStep.value
            ),
          },
          {
            name: "β wave",
            stack: "Total",
            data: conversionPkgtoBarnsTimeOrRelated(
              "psd_relative_percent_s",
              bandsChannel.value,
              3,
              relatedStep.value
            ),
          },
          {
            name: "γ wave",
            stack: "Total",
            data: conversionPkgtoBarnsTimeOrRelated(
              "psd_relative_percent_s",
              bandsChannel.value,
              4,
              relatedStep.value
            ),
          },
        ],
      },
      {
        lazyUpdate: true,
      }
    );
};

// 更新渲染--barns
const updateRenderBarnsTime = (type?: string) => {
  if (!barnsTimeChart) return;
  switch (type) {
    case "xAxis":
      barnsTimeChart.setOption({
        xAxis: [
          {
            splitNumber: barnsTimeStep.value,
            max: barnsTimeStep.value * 1000,
            gridIndex: 0,
          },
          {
            splitNumber: barnsTimeStep.value,
            max: barnsTimeStep.value * 1000,
            gridIndex: 1,
          },
          {
            splitNumber: barnsTimeStep.value,
            max: barnsTimeStep.value * 1000,
            gridIndex: 2,
          },
          {
            splitNumber: barnsTimeStep.value,
            max: barnsTimeStep.value * 1000,
            gridIndex: 3,
          },
          {
            splitNumber: barnsTimeStep.value,
            max: barnsTimeStep.value * 1000,
            gridIndex: 4,
          },
          {
            splitNumber: barnsTimeStep.value,
            max: barnsTimeStep.value * 1000,
            gridIndex: 5,
          },
        ],
      });
      break;
  }

  barnsTimeChart.setOption(
    {
      series: [
        {
          name: "EEG",
          data: conversionPkgtoSeriesData("F1", barnsTimeStep.value),
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
    },
    {
      lazyUpdate: true,
    }
  );
};

// 现在只取EEG最后一个数据进行渲染,太卡了
const conversionPkgtoPsdMap = (typeChannel, step) => {
  if (pkgDataList.length < 1) return 0;
  let maxTimer = pkgDataList[pkgDataList.length - 1].time_mark;
  let minTime = maxTimer - step * 1000;
  let sliceData = pkgDataList.filter(
    (item) => item.time_mark >= minTime && item.time_mark <= maxTimer
  );
  let psdMapData: number[][] = [];
  let baseTime = 0;
  sliceData.forEach((item, sliceIndex) => {
    if (sliceIndex !== 0) {
      baseTime += item.time_mark - sliceData[sliceIndex - 1].time_mark;
    }
    item.psd_s[parseChannel(typeChannel)].forEach((value, y) => {
      psdMapData.push([baseTime / calculateMinTimeGap(), y, value]);
    });
  });
  return psdMapData;
};

// const conversionPkgtoPsdMap = (typeChannel, step) => {
//   if (pkgDataList.length < 1) return 0;
//   let maxTimer = pkgDataList[pkgDataList.length - 1].time_mark;
//   let minTime = maxTimer - step * 1000;
//   let sliceData = pkgDataList.filter(
//     (item) => item.time_mark >= minTime && item.time_mark <= maxTimer
//   );
//   let psdMapData: number[][] = [];
//   let baseTime = 0;

//   for (let sliceIndex = 0; sliceIndex < sliceData.length; sliceIndex++) {
//     const item = sliceData[sliceIndex];
//     if (sliceIndex !== 0) {
//       baseTime += item.time_mark - sliceData[sliceIndex - 1].time_mark;
//     }
//     let dataList = item.psd_s_multiple;
//     for (let dataIndex = 0; dataIndex < dataList.length; dataIndex++) {
//       dataList[dataIndex][parseChannel(typeChannel)].forEach((value, y) => {
//         psdMapData.push([(baseTime + dataIndex * EEGTimeGap) / calculateMinTimeGap(), y, value]);
//       });
//     }
//   }
//   console.log(psdMapData);

//   return psdMapData;
// };

const conversionPkgtoPsd = (typeChannel) => {
  if (pkgDataList.length < 1) return 0;
  return pkgDataList[pkgDataList.length - 1].psd_s[parseChannel(typeChannel)];
};

const conversionPkgtoAbsolute = (typeChannel, index) => {
  if (pkgDataList.length < 1) return [];
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
  initPSD();
  undateRenderPsd();
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
const changeConfig = () => {
  ipcRenderer.send("change-config",configData);
}
</script>
<style scoped></style>
