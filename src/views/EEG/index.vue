<template>
  <div class="charts-wrap eeg-wrap">
    <p class="eig-nav-title">EEG</p>
    <div class="eig-card card-top">
      <p class="card-title">Time Series</p>
      <div class="time-series">
        <div class="eig-filter eig-select-wrap">
          <div class="filter-right">
            <a-space>
              <a-select
                v-model:value="seriesStep"
                style="width: 100px"
                @change="handleChangeSeriesStep"
                aria-placeholder="Show Time"
                :options="showTimeOptions"
                size="small"
              ></a-select>
              <a-select
                v-model:value="channel"
                mode="multiple"
                :style="{ 'min-width': '100px' }"
                placeholder="Channels"
                :options="channelOptions"
                size="small"
                @change="handleChange"
              ></a-select>
            </a-space>
          </div>
        </div>
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
                  aria-placeholder="Show Time"
                  :options="spectrumShowTimeOptions"
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
                  @change="handleChange"
                ></a-select>
                <a-select
                  v-if="spectrumType === 'Heatmap'"
                  v-model:value="heatmapChannel"
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
                  aria-placeholder="Show Time"
                  :options="bandsChannelOptions"
                  size="small"
                ></a-select>
                <a-select
                  v-if="bandsType !== 'Time Series'"
                  v-model:value="relatedChannel"
                  style="width: 100px"
                  aria-placeholder="Show Time"
                  :options="relatedChannelOptions"
                  size="small"
                ></a-select>
                <a-select
                  v-if="bandsType === 'Time Series'"
                  v-model:value="barnsTimeStep"
                  style="width: 100px"
                  @change="handleChangeBarnsTimeStep"
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

import { HighchartsKey } from "../../types";

const seriesStep = ref(30);
const seriesMaxStep = 30;
const spectrumShowTime = ref(30);
const relatedStep = ref(30);

const barnsTimeStep = ref(30);
const barnsTimeMaxStep = 30;
const channel = ref(["chan1"]);
const psdChannel = ref(["chan1"]);
const heatmapChannel = ref("chan1");
const bandsChannel = ref("chan1");
const relatedChannel = ref("Typical");
const spectrumType = ref("PSD");
const bandsType = ref("Absolute Power");
import * as echarts from "echarts";
const Highcharts = inject(HighchartsKey);
import HeatMap from "highcharts/modules/heatmap";
import { CustomBluetooth } from "../../utils/bluetooth";
import { CustomDatabase } from "../../utils/db";
import { useIndexStore } from "../../store/index";
import { storeToRefs } from "pinia";
const indexStore = useIndexStore();
const { play, recordId, playIndex, isDragSlider } = storeToRefs(indexStore);
const db = new CustomDatabase();
let sourceData;
let timerPlay, timer;
HeatMap(Highcharts);
const showTimeOptionsData = [
  {
    value: 5,
    label: "5 sec",
  },
  {
    value: 10,
    label: "10 sec",
  },
  {
    value: 30,
    label: "30 sec",
  },
];
const chanOptionsData = [
  {
    value: "chan1",
    label: "chan1",
  },
  {
    value: "chan2",
    label: "chan2",
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
const handleChange = (value: string[]) => {
  console.log(`selected ${value}`);
};

let seriesChart, psdChart, absoluteChart, relatedChart, barnsTimeChart;

// Series data
let seriesData: any[] = [],
  psdObj: any = {},
  absoluteObj: any = {},
  relatedObj: any = {
    γ: [],
    β: [],
    α: [],
    θ: [],
    δ: [],
  },
  barnsTimeObj: any = {
    EEG: [],
    DELTA: [],
    THETA: [],
    ALPHA: [],
    BETA: [],
    GAMMA: [],
  };

watch(
  play,
  (newValue) => {
    if (newValue) {
      timerPlay = setInterval(() => {
        if (sourceData) {
          if (playIndex.value >= sourceData.length) {
            timerPlay && clearInterval(timerPlay);
            return;
          }
          handleRealTimeData({
            series: sourceData[playIndex.value].series,
            psd: sourceData[playIndex.value].psd,
            absolute: sourceData[playIndex.value].absolute,
            related: sourceData[playIndex.value].related,
            barnsTime: sourceData[playIndex.value].barnsTime,
          });
        }
      }, 250);
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
    handleOldData();
  }
});



watch(
  recordId,
  (value) => {
    if (value !== undefined) {
      initialize();
    }
  },
);

onMounted(function () {
  initialize();
  // const { proxy } = getCurrentInstance() as ComponentInternalInstance;
  // const bluetooth = new CustomBluetooth();
  // bluetooth.addNotice((data) => {});
});

onBeforeUnmount(() => {
  timer && clearInterval(timer);
  timerPlay && clearInterval(timerPlay);
});

const initialize = () => {
  sourceData = [];
  seriesData = [];
  if (!recordId.value) {
    timer && clearInterval(timer);
    timer = setInterval(() => {
      handleRealTimeData({
        series: Math.random() * 150,
        psd: {
          AF3: [
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
          ],
          F3: [
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
          ],
          P7: [
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
          ],
          F7: [
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
          ],
          AF4: [
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
            Math.random() * 100,
          ],
        },
        absolute: {
          0: Math.random() * 20 + 80,
          1: Math.random() * 20 + 80,
          2: Math.random() * 20 + 80,
          3: Math.random() * 20 + 80,
          4: Math.random() * 20 + 80,
        },
        related: {
          γ: 100,
          β: Math.random() * 20 + 60,
          α: Math.random() * 20 + 40,
          θ: Math.random() * 20 + 20,
          δ: Math.random() * 20 + 0,
        },
        barnsTime: {
          EEG: Math.random() * 20 + 80,
          DELTA: Math.random() * 20 + 80,
          THETA: Math.random() * 20 + 80,
          ALPHA: Math.random() * 20 + 80,
          BETA: Math.random() * 20 + 80,
          GAMMA: Math.random() * 20 + 80,
        },
      });
    }, 250);
  } else {
    db.get(`select sourceData from record where id = ${recordId.value}`).then(
      (res) => {
        sourceData = JSON.parse(res.sourceData);
        if (playIndex.value > 0) {
          // X轴与时间相关的才需要把之前的数据加进去
          handleOldData();
        }
      }
    );
  }
  nextTick(() => {
    // initHeatmap();
    initSeries();
    initPSD();
    // initRelated();
    initAbsolute();
    // initBarnsTime();
  });
};

// 处理之前数据-1
const handleOldData = () => {
  let tempPlayIndex = playIndex.value;
  handleBeforeData({
    seriesArr: sourceData
      .slice(0, tempPlayIndex)
      .slice(-seriesMaxStep * 4)
      .map((item) => item.series),
    psd: sourceData[tempPlayIndex].psd,
    absolute: sourceData[tempPlayIndex].absolute,
    relatedArr: sourceData
      .slice(0, tempPlayIndex)
      .slice(-relatedStep.value * 4)
      .map((item) => item.related),
    barnsTimeArr: sourceData
      .slice(0, tempPlayIndex)
      .slice(-barnsTimeMaxStep * 4)
      .map((item) => item.barnsTime),
  });
  updateRenderRealSeriesData();
  undateRenderPsd();
  undateRenderAbsoule();
  updateRenderRelated();
  updateRenderBarnsTime();
};
// 处理之前数据-2
const handleBeforeData = (obj) => {
  // series
  seriesData = [];
  seriesData = obj.seriesArr.map((item) => {
    return {
      value: [(seriesData.length + 1) * 250, item],
    };
  });
  relatedObj.γ = [];
  relatedObj.β = [];
  relatedObj.α = [];
  relatedObj.θ = [];
  relatedObj.δ = [];
  // psd
  psdObj = obj.psd;
  // absolute
  absoluteObj = obj.absolute;
  // related
  obj.relatedArr.forEach((item) => {
    relatedObj.γ.push({
      value: [(relatedObj.γ.length + 1) * 250, item.γ],
    });
    relatedObj.β.push({
      value: [(relatedObj.β.length + 1) * 250, item.β],
    });
    relatedObj.α.push({
      value: [(relatedObj.α.length + 1) * 250, item.α],
    });
    relatedObj.θ.push({
      value: [(relatedObj.θ.length + 1) * 250, item.θ],
    });
    relatedObj.δ.push({
      value: [(relatedObj.δ.length + 1) * 250, item.δ],
    });
  });
  // barnsTime
  barnsTimeObj.EEG = [];
  barnsTimeObj.DELTA = [];
  barnsTimeObj.THETA = [];
  barnsTimeObj.ALPHA = [];
  barnsTimeObj.BETA = [];
  barnsTimeObj.GAMMA = [];
  obj.barnsTimeArr.forEach((item) => {
    barnsTimeObj.EEG.push({
      value: [(barnsTimeObj.EEG.length + 1) * 250, item.EEG],
    });
    barnsTimeObj.DELTA.push({
      value: [(barnsTimeObj.DELTA.length + 1) * 250, item.DELTA],
    });
    barnsTimeObj.THETA.push({
      value: [(barnsTimeObj.THETA.length + 1) * 250, item.THETA],
    });
    barnsTimeObj.ALPHA.push({
      value: [(barnsTimeObj.ALPHA.length + 1) * 250, item.ALPHA],
    });
    barnsTimeObj.BETA.push({
      value: [(barnsTimeObj.BETA.length + 1) * 250, item.BETA],
    });
    barnsTimeObj.GAMMA.push({
      value: [(barnsTimeObj.GAMMA.length + 1) * 250, item.GAMMA],
    });
  });
};
// 处理实时数据
const handleRealTimeData = (obj) => {
  // series

  seriesData.push({
    value: [(seriesData.length + 1) * 250, obj.series],
  });
  if (seriesData.length > seriesMaxStep * 4) {
    seriesData.shift();
  }
  updateRenderRealSeriesData();

  // psd
  psdObj = obj.psd;
  undateRenderPsd();
  // absolute
  absoluteObj = obj.absolute;
  undateRenderAbsoule();
  //related
  relatedObj.γ.push({
    value: [(relatedObj.γ.length + 1) * 250, obj.related.γ],
  });
  relatedObj.β.push({
    value: [(relatedObj.β.length + 1) * 250, obj.related.β],
  });
  relatedObj.α.push({
    value: [(relatedObj.α.length + 1) * 250, obj.related.α],
  });
  relatedObj.θ.push({
    value: [(relatedObj.θ.length + 1) * 250, obj.related.θ],
  });
  relatedObj.δ.push({
    value: [(relatedObj.δ.length + 1) * 250, obj.related.δ],
  });

  updateRenderRelated();

  // barnsTime
  barnsTimeObj.EEG.push({
    value: [(barnsTimeObj.EEG.length + 1) * 250, obj.barnsTime.EEG],
  });
  barnsTimeObj.DELTA.push({
    value: [(barnsTimeObj.DELTA.length + 1) * 250, obj.barnsTime.DELTA],
  });
  barnsTimeObj.THETA.push({
    value: [(barnsTimeObj.THETA.length + 1) * 250, obj.barnsTime.THETA],
  });
  barnsTimeObj.ALPHA.push({
    value: [(barnsTimeObj.ALPHA.length + 1) * 250, obj.barnsTime.ALPHA],
  });
  barnsTimeObj.BETA.push({
    value: [(barnsTimeObj.BETA.length + 1) * 250, obj.barnsTime.BETA],
  });
  barnsTimeObj.GAMMA.push({
    value: [(barnsTimeObj.GAMMA.length + 1) * 250, obj.barnsTime.GAMMA],
  });

  updateRenderBarnsTime();
};

const initSeries = () => {
  seriesChart = echarts.init(document.getElementById("series"));
  seriesChart.setOption({
    animation: false,
    color: ["#8FDCFE", "#B3B3B3"],
    // legend: {
    //   top: 80,
    //   left: "0",
    //   data: ["chan1", "chan2"],
    //   icon: "circle",
    //   orient: "vertical",
    //   itemGap: 100,
    //   itemHeight: 12,
    //   itemWidth: 12,
    //   textStyle: {
    //     fontSize: 12,
    //   },
    // },
    xAxis: [
      {
        type: "time",
        show: false,
        max: seriesStep.value * 1000,
        gridIndex: 0,
      },
      {
        type: "time",
        gridIndex: 1,
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
      },
    ],
    grid: [
      {
        show: false,
        left: "6%",
        right: "4%",
        top: 40,
        bottom: "51%",
        containLabel: false,
      },
      {
        show: false,
        left: "6%",
        right: "4%",
        top: "51%",
        bottom: 40,
        containLabel: false,
      },
    ],
    yAxis: [
      {
        show: true,
        axisLine: {
          show: false, // 显示y轴线
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
        name: "chan1",
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
          show: false, // 显示y轴线
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
        name: "chan2",
        nameLocation: "middle",
        nameTextStyle: {
          fontSize: 12,
          fontWeight: "bold",
        },
        type: "value",
        gridIndex: 1,
      },
    ],
    series: [
      {
        data: seriesData,
        type: "line",
        name: "chan1",
        symbol: "none",
        lineStyle: {
          color: "#8FDCFE",
          width: 1,
        },
        xAxisIndex: 0,
        yAxisIndex: 0,
      },
      {
        data: seriesData,
        type: "line",
        name: "chan2",
        symbol: "none",
        lineStyle: {
          color: "#B3B3B3",
          width: 1,
        },
        xAxisIndex: 1,
        yAxisIndex: 1,
      },
    ],
  });
};
const initHeatmap = () => {
  let seriesData: Array<number>[] = [],
    time = new Date().getTime();

  for (let i = -1000; i <= 0; i += 1) {
    for (let j = 0; j <= 23; j += 1) {
      seriesData.push([time + i * 1000, j, Math.round(Math.random() * 10)]);
    }
  }

  Highcharts.chart("heatmap", {
    title: {
      text: null,
    },
    chart: {
      type: "heatmap",
      events: {
        // load: function () {
        //   // set up the updating of the chart each second
        //   const series = this.series[0];
        //   setInterval(function () {
        //     const x = new Date().getTime(), // current time
        //       y = Math.round(Math.random() * 80);
        //     seriesData = seriesData.slice(24);
        //     for (let j = 0; j <= 23; j++) {
        //       seriesData.push([x, j, y]);
        //     }
        //     series.setData(seriesData, true,false,);
        //     // series.redraw();
        //   }, 1000);
        // },
      },
    },

    xAxis: {
      type: "datetime",
      // min: Date.UTC(2017, 0, 1),
      // max: Date.UTC(2017, 11, 31, 23, 59, 59),
      // labels: {
      //   align: "left",
      //   x: 5,
      //   y: 14,
      //   format: "{value:%B}", // long month
      // },
      // showLastLabel: false,
      // tickLength: 16,
      minPadding: 0,
      maxPadding: 0,
    },

    yAxis: {
      title: {
        text: null,
      },
      labels: {
        format: "{value}",
      },
      minPadding: 0,
      maxPadding: 0,
      tickPositions: [0, 6, 12, 18, 24],
      tickWidth: 1,
      min: 0,
      max: 23,
    },
    time: {
      useUTC: false,
    },

    colorAxis: {
      stops: [
        [0, "#3060cf"],
        [0.5, "#fffbbc"],
        [0.9, "#c4463a"],
        [1, "#c4463a"],
      ],
      min: 0,
      max: 99,
      startOnTick: false,
      endOnTick: false,
      labels: {
        format: "{value}℃",
      },
    },

    series: [
      {
        boostThreshold: 100,
        borderWidth: 0,
        nullColor: "#3060cf",
        colsize: 1000, // one day
        data: seriesData,
        turboThreshold: Number.MAX_VALUE, // #3404, remove after 4.0.5 release
      },
    ],
  });
};
const initPSD = () => {
  psdChart = echarts.init(document.getElementById("psd"));
  psdChart.setOption({
    animation: false,
    legend: {
      left: "center",
      bottom: 5,
      data: ["AF3", "F3", "P7", "F7", "AF4"],
      icon: "circle",
      itemHeight: 12,
      itemWidth: 12,
      textStyle: {
        fontSize: 12,
      },
    },
    grid: {
      top: "3%",
      left: "4%",
      right: "4%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      axisTick: {
        length: 3,
        show: true,
      },
      boundaryGap: false,
      data: ["0", "10", "20", "30", "40", "50", "60"],
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
      min: 0,
      max: 100,
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
        name: "AF3",
        type: "line",
        symbol: "none",
        data: psdObj.AF3,
      },
      {
        name: "F3",
        type: "line",
        symbol: "none",
        data: psdObj.F3,
      },
      {
        name: "P7",
        type: "line",
        symbol: "none",
        data: psdObj.P7,
      },
      {
        name: "F7",
        type: "line",
        symbol: "none",
        data: psdObj.F7,
      },
      {
        name: "AF4",
        type: "line",
        symbol: "none",
        data: psdObj.AF4,
      },
    ],
  });
};
const initAbsolute = () => {
  absoluteChart = echarts.init(document.getElementById("absolute"));

  absoluteChart.setOption({
    animation: false,
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
      min: 0,
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
  relatedChart.setOption({
    animation: false,
    color: ["#0721E6", "#4C68FF", "#7A83FF", "#A19CFF", "#E4CDFF"],

    legend: {
      data: ["γ wave", "β wave", "α wave", "θ wave", "δ wave"],
      top: 15,
      icon: "circle",
      itemHeight: 12,
      itemWidth: 12,
      textStyle: {
        fontSize: 12,
      },
    },

    grid: {
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
        name: "γ wave",
        type: "line",

        smooth: true,
        lineStyle: {
          width: 0,
        },
        emphasis: {
          disabled: true,
        },
        showSymbol: false,
        areaStyle: {},
        data: relatedObj.γ,
      },
      {
        name: "β wave",
        type: "line",
        emphasis: {
          disabled: true,
        },
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {},
        data: relatedObj.β,
      },
      {
        name: "α wave",
        type: "line",
        emphasis: {
          disabled: true,
        },
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {},
        data: relatedObj.α,
      },
      {
        name: "θ wave",
        type: "line",
        emphasis: {
          disabled: true,
        },
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {},
        data: relatedObj.θ,
      },
      {
        name: "δ wave",
        type: "line",
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
        data: relatedObj.δ,
      },
    ],
  });
};
const initBarnsTime = () => {
  barnsTimeChart = echarts.init(document.getElementById("barnsTime"));
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
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
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
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
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
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
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
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
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
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
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
        data: barnsTimeObj.EEG,
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
          data: [{ xAxis: 3 }],
        },
        xAxisIndex: 0,
        yAxisIndex: 0,
      },
      {
        data: barnsTimeObj.DELTA,
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
          data: [{ xAxis: 3 }],
        },
        xAxisIndex: 1,
        yAxisIndex: 1,
      },
      {
        data: barnsTimeObj.THETA,
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
          data: [{ xAxis: 3 }],
        },
        xAxisIndex: 2,
        yAxisIndex: 2,
      },
      {
        data: barnsTimeObj.ALPHA,
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
          data: [{ xAxis: 3 }],
        },
        xAxisIndex: 3,
        yAxisIndex: 3,
      },
      {
        data: barnsTimeObj.BETA,
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
          data: [{ xAxis: 3 }],
        },
        xAxisIndex: 4,
        yAxisIndex: 4,
      },
      {
        data: barnsTimeObj.GAMMA,
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
          data: [{ xAxis: 3 }],
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
    }
    if (spectrumType.value === "Heatmap") {
      initHeatmap();
    }
  });
};

const handleChangeBandsType = () => {
  nextTick(() => {
    if (bandsType.value === "Absolute Power") {
      initAbsolute();
    }
    if (bandsType.value === "Related Power") {
      initRelated();
    }
    if (bandsType.value === "Time Series") {
      initBarnsTime();
    }
  });
};

// 更新渲染--seriesData
const updateRenderRealSeriesData = () => {
  let tempSeriesData;
  tempSeriesData = Object.assign([], seriesData.slice(-seriesStep.value * 4));
  tempSeriesData.forEach((item, index) => {
    item.value[0] = (index + 1) * 250;
  });
  seriesChart &&
    seriesChart.setOption({
      xAxis: [
        {
          gridIndex: 0,
          splitNumber: seriesStep.value,
          max: seriesStep.value * 1000,
        },
        {
          gridIndex: 1,
          splitNumber: seriesStep.value,
          max: seriesStep.value * 1000,
        },
      ],
      series: [
        { name: "chan1", data: tempSeriesData },
        { name: "chan2", data: tempSeriesData },
      ],
    });
};
// 更新渲染--psd
const undateRenderPsd = () => {
  psdChart &&
    psdChart.setOption({
      series: [
        {
          name: "AF3",
          data: psdObj.AF3,
        },
        {
          name: "F3",
          data: psdObj.F3,
        },
        {
          name: "P7",
          data: psdObj.P7,
        },
        {
          name: "F7",
          data: psdObj.F7,
        },
        {
          name: "AF4",
          data: psdObj.AF4,
        },
      ],
    });
};

// 更新渲染-- absoule
const undateRenderAbsoule = () => {
  absoluteChart &&
    absoluteChart.setOption({
      series: [
        {
          data: [
            {
              value: absoluteObj[0],
              itemStyle: {
                color: "rgb(255, 67, 72, 0.8)",
              },
            },
            {
              value: absoluteObj[1],
              itemStyle: {
                color: "rgb(241, 189, 0, 0.8)",
              },
            },
            {
              value: absoluteObj[2],
              itemStyle: {
                color: "rgb(37, 146, 121, 0.8)",
              },
            },
            {
              value: absoluteObj[3],
              itemStyle: {
                color: "rgb(78, 123, 187, 0.8)",
              },
            },
            {
              value: absoluteObj[4],
              itemStyle: {
                color: "rgb(165, 107, 172, 0.8)",
              },
            },
          ],
        },
      ],
    });
};

// 更新渲染--related
const updateRenderRelated = () => {
  if (relatedObj.γ.length > relatedStep.value * 4) {
    relatedObj.γ = relatedObj.γ.slice(
      relatedObj.γ.length - relatedStep.value * 4
    );
    relatedObj.β = relatedObj.β.slice(
      relatedObj.β.length - relatedStep.value * 4
    );
    relatedObj.α = relatedObj.α.slice(
      relatedObj.α.length - relatedStep.value * 4
    );
    relatedObj.θ = relatedObj.θ.slice(
      relatedObj.θ.length - relatedStep.value * 4
    );
    relatedObj.δ = relatedObj.δ.slice(
      relatedObj.δ.length - relatedStep.value * 4
    );
    relatedObj.γ.forEach((item, index) => {
      relatedObj.γ[index].value[0] = (index + 1) * 250;
      relatedObj.β[index].value[0] = (index + 1) * 250;
      relatedObj.α[index].value[0] = (index + 1) * 250;
      relatedObj.θ[index].value[0] = (index + 1) * 250;
      relatedObj.δ[index].value[0] = (index + 1) * 250;
    });
  }
  relatedChart &&
    relatedChart.setOption({
      series: [
        {
          name: "γ wave",
          data: relatedObj.γ,
        },
        {
          name: "β wave",
          data: relatedObj.β,
        },
        {
          name: "α wave",
          data: relatedObj.α,
        },
        {
          name: "θ wave",
          data: relatedObj.θ,
        },
        {
          name: "δ wave",
          data: relatedObj.δ,
        },
      ],
    });
};

// 更新渲染--barns
const updateRenderBarnsTime = () => {
  if (barnsTimeObj.EEG.length > barnsTimeMaxStep * 4) {
    barnsTimeObj.EEG.shift();
    barnsTimeObj.DELTA.shift();
    barnsTimeObj.THETA.shift();
    barnsTimeObj.ALPHA.shift();
    barnsTimeObj.BETA.shift();
    barnsTimeObj.GAMMA.shift();
  }
  let tempBarnsTimeObj: any = {
    EEG: [],
    DELTA: [],
    THETA: [],
    ALPHA: [],
    BETA: [],
    GAMMA: [],
  };
  barnsTimeObj.EEG.forEach((item, index) => {
    tempBarnsTimeObj.EEG = Object.assign(
      [],
      barnsTimeObj.EEG.slice(-barnsTimeStep.value * 4)
    );
    tempBarnsTimeObj.DELTA = Object.assign(
      [],
      barnsTimeObj.DELTA.slice(-barnsTimeStep.value * 4)
    );
    tempBarnsTimeObj.THETA = Object.assign(
      [],
      barnsTimeObj.THETA.slice(-barnsTimeStep.value * 4)
    );
    tempBarnsTimeObj.ALPHA = Object.assign(
      [],
      barnsTimeObj.ALPHA.slice(-barnsTimeStep.value * 4)
    );
    tempBarnsTimeObj.BETA = Object.assign(
      [],
      barnsTimeObj.BETA.slice(-barnsTimeStep.value * 4)
    );
    tempBarnsTimeObj.GAMMA = Object.assign(
      [],
      barnsTimeObj.GAMMA.slice(-barnsTimeStep.value * 4)
    );
  });
  tempBarnsTimeObj.EEG.forEach((item, index) => {
    tempBarnsTimeObj.EEG[index].value[0] = (index + 1) * 250;
    tempBarnsTimeObj.DELTA[index].value[0] = (index + 1) * 250;
    tempBarnsTimeObj.THETA[index].value[0] = (index + 1) * 250;
    tempBarnsTimeObj.ALPHA[index].value[0] = (index + 1) * 250;
    tempBarnsTimeObj.BETA[index].value[0] = (index + 1) * 250;
    tempBarnsTimeObj.GAMMA[index].value[0] = (index + 1) * 250;
  });
  barnsTimeChart &&
    barnsTimeChart.setOption({
      xAxis: [
        {
          max: barnsTimeStep.value * 1000,
          gridIndex: 0,
        },
        {
          max: barnsTimeStep.value * 1000,
          gridIndex: 1,
        },
        {
          max: barnsTimeStep.value * 1000,
          gridIndex: 2,
        },
        {
          max: barnsTimeStep.value * 1000,
          gridIndex: 3,
        },
        {
          max: barnsTimeStep.value * 1000,
          gridIndex: 4,
        },
        {
          max: barnsTimeStep.value * 1000,
          gridIndex: 5,
        },
      ],
      series: [
        {
          name: "EEG",
          data: tempBarnsTimeObj.EEG,
        },
        {
          name: "DELTA",
          data: tempBarnsTimeObj.DELTA,
        },
        {
          name: "THETA",
          data: tempBarnsTimeObj.THETA,
        },
        {
          name: "ALPHA",
          data: tempBarnsTimeObj.ALPHA,
        },
        {
          name: "BETA",
          data: tempBarnsTimeObj.BETA,
        },
        {
          name: "GAMMA",
          data: tempBarnsTimeObj.GAMMA,
        },
      ],
    });
};

const handleChangeSeriesStep = () => {
  nextTick(() => {
    updateRenderRealSeriesData();
  });
};
const handleChangeBarnsTimeStep = () => {
  nextTick(() => {
    updateRenderBarnsTime();
  });
};
</script>
<style scoped></style>
