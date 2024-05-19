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
                @change="generateSeries"
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
import { CustomBluetooth } from "../../utils/bluetooth";
let grid: echarts.EChartOption.Grid[] = [];
let xAxis: echarts.EChartOption.XAxis[] = [];
let yAxis: echarts.EChartOption.YAxis[] = [];
let series: echarts.EChartOption.Series[] = [];
let colors: string[] = ["#8FDCFE", "#B3B3B3"];
let bluetooth = new CustomBluetooth();
const seriesStep = ref(30);
const seriesMaxStep = 30;
const spectrumShowTime = ref(30);
const relatedStep = ref(30);
const relatedMaxStep = 30;
const barnsTimeStep = ref(30);
const barnsTimeMaxStep = 30;
const psdMapMaxStep = 30;
const psdRelativeMaxStep = 1;
const minTime = 250;
const timeGap = Math.round(1000 / minTime);
const channel = ref(["Fp1", "Fp2"]);
const psdChannel = ref(["Fp1", "Fp2"]);
const heatmapChannel = ref("Fp1");
const bandsChannel = ref("Fp1");
const maxFreq = ref(250);
const relatedChannel = ref("Typical");
const spectrumType = ref("PSD");
const bandsType = ref("Absolute Power");
import * as echarts from "echarts";
import { CustomDatabase } from "../../utils/db";
import { useIndexStore } from "../../store/index";
import { storeToRefs } from "pinia";
const indexStore = useIndexStore();
const { play, recordId, playIndex, isDragSlider } = storeToRefs(indexStore);
const db = new CustomDatabase();
let sourceData;
let timerPlay, timer;

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
const maxFreqOptions = ref<SelectProps["options"]>([
  {
    value: 50,
    label: "50Hz",
  },
  {
    value: 100,
    label: "100Hz",
  },
  {
    value: 150,
    label: "150Hz",
  },
  {
    value: 200,
    label: "200Hz",
  },
  {
    value: 250,
    label: "250Hz",
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

let seriesChart,
  psdChart,
  heatmapChart,
  absoluteChart,
  relatedChart,
  barnsTimeChart;

let psd_s_out: any[] = [];
let psd_relative_s_out: any[] = [];
let psd_relative_percent_s_out: any[] = [];
let time_e_s_out: any[] = [];
const channelNum: number = 2;

// Series data
let seriesObj: any = {
    Fp1: [],
    Fp2: [],
  },
  psdObj: any = {};

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
            psd_s: sourceData[playIndex.value].psd_s,
            absolute: sourceData[playIndex.value].absolute,
            psd_relative_s: sourceData[playIndex.value].psd_relative_s,
            psd_relative_percent_s:
              sourceData[playIndex.value].psd_relative_percent_s,
            time_e_s: sourceData[playIndex.value].time_e_s,
          });
        }
      }, minTime);
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

watch(recordId, (value) => {
  if (value !== undefined) {
    initialize();
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
});

// 蓝牙数据通知
const bluetoothNotice = (data) => {
  handleRealTimeData(blueToothdataMapping(data));
};

// 将蓝牙数据进行映射
const blueToothdataMapping = (data) => {
  // console.log(data, "blueToothdataMapping");

  let psdF1: number[] = [];
  let psdF2: number[] = [];
  for (let i = 0; i < maxFreq.value; i += 50) {
    psdF1.push(Math.random() * 100);
    psdF2.push(Math.random() * 100);
  }

  return {
    series: {
      Fp1: data.brain_elec_channel[0],
      Fp2: data.brain_elec_channel[1],
    },
    psd: {
      Fp1: data.psd_s[0],
      Fp2: data.psd_s[1],
    },
    psd_s: data.psd_s,
    psd_relative_s: data.psd_relative_s,
    psd_relative_percent_s: data.psd_relative_percent_s,
    time_e_s: data.time_e_s,

  };
};

const clearData = (obj) => {
  for (const key in obj) {
    obj[key] = [];
  }
};

const initialize = () => {
  clearData(seriesObj);
  clearData(psdObj);
  clearOldData();
  sourceData = [];
  if (!recordId.value) {
    bluetooth.addNotice(bluetoothNotice);
  } else {
    bluetooth.removeNotice(bluetoothNotice);
    db.get(`select sourceData from record where id = ${recordId.value}`).then(
      (res) => {
        sourceData = JSON.parse(res.sourceData).map((item) => {
          return blueToothdataMapping(item);
        });
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

const clearOldData = () => {
  psd_s_out = [];
  psd_relative_s_out = [];
  psd_relative_percent_s_out = [];
  time_e_s_out = [];
};

// 处理之前数据-1
const handleOldData = () => {
  clearOldData();
  let tempPlayIndex = playIndex.value;
  handleBeforeData({
    seriesArr: sourceData
      .slice(0, tempPlayIndex)
      .slice(-seriesMaxStep * timeGap)
      .map((item) => item.series),
    psd: sourceData[tempPlayIndex]?sourceData[tempPlayIndex].psd:{
      Fp1: 0,
      Fp2: 0,
    },
    psdMapArr: sourceData
      .slice(0, tempPlayIndex)
      .slice(-psdMapMaxStep * timeGap)
      .map((item) => item.psd_s),
    // absolute: sourceData[tempPlayIndex].absolute,
    psdRelativeArr: sourceData
      .slice(0, tempPlayIndex)
      .slice(-psdRelativeMaxStep * timeGap)
      .map((item) => item.psd_relative_s),
    relatedArr: sourceData
      .slice(0, tempPlayIndex)
      .slice(-relatedMaxStep * timeGap)
      .map((item) => item.psd_relative_percent_s),
    barnsTimeArr: sourceData
      .slice(0, tempPlayIndex)
      .slice(-barnsTimeMaxStep * timeGap)
      .map((item) => item.time_e_s),
  });
  updateRenderRealSeriesData();
  undateRenderPsd();
  undateRenderPsdMap();
  undateRenderAbsoule();
  updateRenderRelated();
  updateRenderBarnsTime();
};
// 处理之前数据-2
const handleBeforeData = (obj) => {
  // series
  seriesObj.Fp1 = [];
  seriesObj.Fp2 = [];
  obj.seriesArr.map((item) => {
    seriesObj.Fp1.push({
      value: [(seriesObj.Fp1.length + 1) * minTime, item.Fp1],
    });
    seriesObj.Fp2.push({
      value: [(seriesObj.Fp2.length + 1) * minTime, item.Fp2],
    });
  });
  // psd
  psdObj = obj.psd;
  // psdMap
  obj.psdMapArr.forEach((item) => {
    processingData(item, psd_s_out, channelNum, psdMapMaxStep);
  });
  // absolute
  // absoluteObj = obj.absolute;
  obj.psdRelativeArr.forEach((item) => {
    processingData(item, psd_relative_s_out, channelNum, psdRelativeMaxStep);
  });
  // related
  obj.relatedArr.forEach((item) => {
    processingData(
      item,
      psd_relative_percent_s_out,
      channelNum,
      relatedMaxStep
    );
  });

  // barnsTime
  obj.barnsTimeArr.forEach((item) => {
    processingData(item, time_e_s_out, channelNum, barnsTimeMaxStep);
  });

};
// 处理实时数据
const handleRealTimeData = (obj) => {
  // series

  seriesObj.Fp1.push({
    value: [(seriesObj.Fp1.length + 1) * minTime, obj.series.Fp1],
  });
  seriesObj.Fp2.push({
    value: [(seriesObj.Fp2.length + 1) * minTime, obj.series.Fp2],
  });

  updateRenderRealSeriesData();

  // psd
  psdObj = obj.psd;
  undateRenderPsd();
  // psdMap
  processingData(obj.psd_s, psd_s_out, channelNum, psdMapMaxStep);
  undateRenderPsdMap();
  // absolute

  processingData(
    obj.psd_relative_s,
    psd_relative_s_out,
    channelNum,
    psdRelativeMaxStep
  );

  undateRenderAbsoule();
  //related
  processingData(
    obj.psd_relative_percent_s,
    psd_relative_percent_s_out,
    channelNum,
    barnsTimeMaxStep
  );

  updateRenderRelated();

  // barnsTime

  processingData(obj.time_e_s, time_e_s_out, channelNum, barnsTimeMaxStep);

  updateRenderBarnsTime();
};

const initSeries = () => {
  seriesChart = echarts.init(document.getElementById("series"));
  generateSeries();
};
const initHeatmap = () => {
  function getNoiseHelper() {
    class Grad {
      x: number;
      y: number;
      z: number;
      constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
      }

      dot2(x: number, y: number) {
        return this.x * x + this.y * y;
      }

      dot3(x: number, y: number, z: number) {
        return this.x * x + this.y * y + this.z * z;
      }
    }

    const grad3 = [
      new Grad(1, 1, 0),
      new Grad(-1, 1, 0),
      new Grad(1, -1, 0),
      new Grad(-1, -1, 0),
      new Grad(1, 0, 1),
      new Grad(-1, 0, 1),
      new Grad(1, 0, -1),
      new Grad(-1, 0, -1),
      new Grad(0, 1, 1),
      new Grad(0, -1, 1),
      new Grad(0, 1, -1),
      new Grad(0, -1, -1),
    ];
    const p = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
      140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247,
      120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177,
      33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165,
      71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211,
      133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25,
      63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
      135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217,
      226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206,
      59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248,
      152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22,
      39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218,
      246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
      81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
      184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
      222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
    ];
    // To remove the need for index wrapping, double the permutation table length
    let perm = new Array(512);
    let gradP = new Array(512);
    // This isn't a very good seeding function, but it works ok. It supports 2^16
    // different seed values. Write something better if you need more seeds.
    function seed(seed: number) {
      if (seed > 0 && seed < 1) {
        // Scale the seed out
        seed *= 65536;
      }
      seed = Math.floor(seed);
      if (seed < 256) {
        seed |= seed << 8;
      }
      for (let i = 0; i < 256; i++) {
        let v;
        if (i & 1) {
          v = p[i] ^ (seed & 255);
        } else {
          v = p[i] ^ ((seed >> 8) & 255);
        }
        perm[i] = perm[i + 256] = v;
        gradP[i] = gradP[i + 256] = grad3[v % 12];
      }
    }
    seed(0);
    // ##### Perlin noise stuff
    function fade(t: number) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }
    function lerp(a: number, b: number, t: number) {
      return (1 - t) * a + t * b;
    }
    // 2D Perlin Noise
    function perlin2(x: number, y: number) {
      // Find unit grid cell containing point
      let X = Math.floor(x),
        Y = Math.floor(y);
      // Get relative xy coordinates of point within that cell
      x = x - X;
      y = y - Y;
      // Wrap the integer cells at 255 (smaller integer period can be introduced here)
      X = X & 255;
      Y = Y & 255;
      // Calculate noise contributions from each of the four corners
      let n00 = gradP[X + perm[Y]].dot2(x, y);
      let n01 = gradP[X + perm[Y + 1]].dot2(x, y - 1);
      let n10 = gradP[X + 1 + perm[Y]].dot2(x - 1, y);
      let n11 = gradP[X + 1 + perm[Y + 1]].dot2(x - 1, y - 1);
      // Compute the fade curve value for x
      let u = fade(x);
      // Interpolate the four results
      return lerp(lerp(n00, n10, u), lerp(n01, n11, u), fade(y));
    }

    return {
      seed,
      perlin2,
    };
  }

  // let noise = getNoiseHelper();
  // let xData: number[] = [];
  // let yData: number[] = [];
  // noise.seed(Math.random());
  function generateData(theta: number, min: number, max: number) {
    let data: number[][] = [];
    for (let i = 0; i <= 200; i++) {
      for (let j = 0; j <= 100; j++) {
        // let x = (max - min) * i / 200 + min;
        // let y = (max - min) * j / 100 + min;
        data.push([i, j, noise.perlin2(i / 40, j / 20) + 0.5]);
        // data.push([i, j, normalDist(theta, x) * normalDist(theta, y)]);
      }
      xData.push(i);
    }
    for (let j = 0; j < 100; j++) {
      yData.push(j);
    }
    return data;
  }
  // setInterval(() => {
  //   for (let j = 0; j <= 100; j++) {
  //     data.pop();
  //     data.unshift([
  //       0,
  //       j,
  //       noise.perlin2(Math.floor(Math.random() * 201) / 40, j / 20) + 0.5,
  //     ]);
  //   }
  //   for (let i = 0; i <= 200; i++) {
  //     for (let j = 0; j <= 100; j++) {
  //       if (i * 101 + j >= data.length) {
  //         return;
  //       }
  //       data[i * 101 + j][0] = i;
  //       data[i * 101 + j][1] = j;
  //     }
  //   }
  //   heatmapChart.setOption({
  //     series: [
  //       {
  //         data: data,
  //       },
  //     ],
  //   });
  // }, 1000);

  // let data = generateData(2, -5, 5);
  // console.log(xData, "xData");
  // console.log(yData, "yData");
  // console.log(data, "data");
  let xData: number[] = [];
  let yData: number[] = [];
  for (let i = 0; i < spectrumShowTime.value * timeGap; i++) {
    xData.push(i);
  }
  for (let i = 0; i < 5; i++) {
    yData.push(i);
  }
  heatmapChart = echarts.init(document.getElementById("heatmap"));
  heatmapChart.setOption({
    animation: false,
    tooltip: {
      show: false,
    },
    xAxis: {
      type: "category",
      data: xData,
    },
    yAxis: {
      type: "category",
      data: yData,
    },
    visualMap: {
      min: 0,
      max: 150,
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
        progressive: 10000,
        animation: false,
      },
    ],
  });
};
const initPSD = () => {
  let XAxisData: number[] = [];
  for (let i = 50; i <= maxFreq.value; i += 50) {
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
        bottom: 5,
        data: psdChannel.value,
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
        min: 0,
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
          data: psdObj[item],
        };
      }),
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
        data: conversionData(
          psd_relative_percent_s_out,
          bandsChannel.value,
          0,
          barnsTimeMaxStep
        ),
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
        data: conversionData(
          psd_relative_percent_s_out,
          bandsChannel.value,
          1,
          barnsTimeMaxStep
        ),
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
        data: conversionData(
          psd_relative_percent_s_out,
          bandsChannel.value,
          2,
          barnsTimeMaxStep
        ),
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
        data: conversionData(
          psd_relative_percent_s_out,
          bandsChannel.value,
          3,
          barnsTimeMaxStep
        ),
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
        data: conversionData(
          psd_relative_percent_s_out,
          bandsChannel.value,
          4,
          barnsTimeMaxStep
        ),
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
      formatter: function (params) {
        let result = "";
        params.forEach(function (item) {
          // item 是每一个系列的数据信息
          const seriesName = item.seriesName; // 系列名称
          const value = item.value; // 数据值
          const marker = item.marker; // 标志图形
          result += `${marker}${seriesName}: ${value[1]}<br/>`;
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
        show: false,
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
        data: seriesObj[bandsChannel.value],
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
        data: conversionData(
          time_e_s_out,
          bandsChannel.value,
          0,
          barnsTimeStep.value
        ),
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
        data: conversionData(
          time_e_s_out,
          bandsChannel.value,
          1,
          barnsTimeStep.value
        ),
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
        data: conversionData(
          time_e_s_out,
          bandsChannel.value,
          2,
          barnsTimeStep.value
        ),
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
        data: conversionData(
          time_e_s_out,
          bandsChannel.value,
          3,
          barnsTimeStep.value
        ),
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
        data: conversionData(
          time_e_s_out,
          bandsChannel.value,
          4,
          barnsTimeStep.value
        ),
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
      left: "10%",
      right: "4%",
      top: (100 / channel.value.length) * index + "%",
      bottom: 100 - (100 / channel.value.length) * (index + 1) + "%",
      containLabel: false,
    });
    xAxis.push({
      type: "time",
      show: index === channel.value.length - 1,
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
      name: item,
      nameLocation: "middle",
      nameTextStyle: {
        fontSize: 12,
        fontWeight: "bold",
      },
      type: "value",
      gridIndex: index,
    });
    series.push({
      data: seriesObj[item],
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
const updateRenderRealSeriesData = () => {
  if (seriesObj.Fp1.length > seriesMaxStep * timeGap) {
    seriesObj.Fp1.shift();
    seriesObj.Fp2.shift();
  }
  let tempSeriesObj: any = {
    Fp1: [],
    Fp2: [],
  };
  seriesObj.Fp1.forEach((item, index) => {
    tempSeriesObj.Fp1 = Object.assign(
      [],
      seriesObj.Fp1.slice(-seriesStep.value * timeGap)
    );
    tempSeriesObj.Fp2 = Object.assign(
      [],
      seriesObj.Fp2.slice(-seriesStep.value * timeGap)
    );
  });
  tempSeriesObj.Fp1.forEach((item, index) => {
    tempSeriesObj.Fp1[index].value[0] = (index + 1) * minTime;
    tempSeriesObj.Fp2[index].value[0] = (index + 1) * minTime;
  });

  seriesChart &&
    seriesChart.setOption({
      xAxis: channel.value.map((item, index) => ({
        gridIndex: index,
        splitNumber: seriesStep.value,
        max: seriesStep.value * 1000,
      })),
      series: channel.value.map((item) => ({
        name: item,
        data: tempSeriesObj[item],
      })),
    });
};
// 更新渲染--psd
const undateRenderPsd = () => {
  psdChart &&
    psdChart.setOption({
      series: [
        {
          name: "Fp1",
          data: psdObj.Fp1,
        },
        {
          name: "Fp2",
          data: psdObj.Fp2,
        },
      ],
    });
};

// 更新渲染-- psdMap
const undateRenderPsdMap = () => {
  let xData: number[] = [];
  let yData: number[] = [];
  for (let i = 0; i < spectrumShowTime.value * timeGap; i++) {
    xData.push(i);
  }
  for (let i = 0; i < 5; i++) {
    yData.push(i);
  }

  let tempPsdMap: number[][][] = [];
  for (let i = 0; i < channelNum; i++) {
    tempPsdMap.push([]);
  }

  for (let i = 0; i < channelNum; i++) {
    psd_s_out[i] &&
      psd_s_out[i].forEach((item, index) => {
        tempPsdMap[i].push(item.value[1]);
      });
  }

  heatmapChart &&
    heatmapChart.setOption({
      xAxis: {
        data: xData,
      },
      yAxis: {
        data: yData,
      },
      series: [
        {
          data: conversionPsdMapData(
            tempPsdMap,
            heatmapChannel.value,
            spectrumShowTime.value
          ),
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
              value: conversionData(
                psd_relative_s_out,
                bandsChannel.value,
                0,
                psdRelativeMaxStep / timeGap
              )[0].value[1],
              itemStyle: {
                color: "rgb(255, 67, 72, 0.8)",
              },
            },
            {
              value: conversionData(
                psd_relative_s_out,
                bandsChannel.value,
                1,
                psdRelativeMaxStep / timeGap
              )[0].value[1],
              itemStyle: {
                color: "rgb(241, 189, 0, 0.8)",
              },
            },
            {
              value: conversionData(
                psd_relative_s_out,
                bandsChannel.value,
                2,
                psdRelativeMaxStep / timeGap
              )[0].value[1],
              itemStyle: {
                color: "rgb(37, 146, 121, 0.8)",
              },
            },
            {
              value: conversionData(
                psd_relative_s_out,
                bandsChannel.value,
                3,
                psdRelativeMaxStep / timeGap
              )[0].value[1],
              itemStyle: {
                color: "rgb(78, 123, 187, 0.8)",
              },
            },
            {
              value: conversionData(
                psd_relative_s_out,
                bandsChannel.value,
                4,
                psdRelativeMaxStep
              )[0].value[1],
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

  relatedChart &&
    relatedChart.setOption({
      series: [
        {
          name: "γ wave",
          data: conversionData(
            psd_relative_percent_s_out,
            bandsChannel.value,
            0,
            barnsTimeMaxStep
          ),
        },
        {
          name: "β wave",
          data: conversionData(
            psd_relative_percent_s_out,
            bandsChannel.value,
            1,
            barnsTimeMaxStep
          ),
        },
        {
          name: "α wave",
          data: conversionData(
            psd_relative_percent_s_out,
            bandsChannel.value,
            2,
            barnsTimeMaxStep
          ),
        },
        {
          name: "θ wave",
          data: conversionData(
            psd_relative_percent_s_out,
            bandsChannel.value,
            3,
            barnsTimeMaxStep
          ),
        },
        {
          name: "δ wave",
          data: conversionData(
            psd_relative_percent_s_out,
            bandsChannel.value,
            4,
            barnsTimeMaxStep
          ),
        },
      ],
    });
};

// 更新渲染--barns
const updateRenderBarnsTime = () => {

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
          data: seriesObj[bandsChannel.value],
        },
        {
          name: "DELTA",
          data: conversionData(
            time_e_s_out,
            bandsChannel.value,
            0,
            barnsTimeStep.value
          ),
        },
        {
          name: "THETA",
          data: conversionData(
            time_e_s_out,
            bandsChannel.value,
            1,
            barnsTimeStep.value
          ),
        },
        {
          name: "ALPHA",
          data: conversionData(
            time_e_s_out,
            bandsChannel.value,
            2,
            barnsTimeStep.value
          ),
        },
        {
          name: "BETA",
          data: conversionData(
            time_e_s_out,
            bandsChannel.value,
            3,
            barnsTimeStep.value
          ),
        },
        {
          name: "GAMMA",
          data: conversionData(
            time_e_s_out,
            bandsChannel.value,
            4,
            barnsTimeStep.value
          ),
        },
      ],
    });
};

// 处理数据
const processingData = (
  inputDataList: any, //psd_relative_s
  outDataList: any, //psd_relative_s_out
  channel,
  maxStep
) => {
  if (!outDataList.length) {
    for (let i = 0; i < channel; i++) {
      outDataList.push([]);
    }
  }
  for (let i = 0; i < channel; i++) {
    outDataList[i].push({
      value: [0, inputDataList[i]],
    });
    if (outDataList[i].length > maxStep * timeGap) {
      outDataList[i].shift();
    }
  }
  for (let i = 0; i < channel; i++) {
    outDataList[i].forEach((item, index) => {
      outDataList[i][index].value[0] = (index + 1) * minTime;
    });
  }
};

const conversionData = (outDataList, typeChannel, index, step) => {
  if (!outDataList.length) {
    return [{ value: [0, 0] }];
  }
  let tempOutDataList: any = [];
  for (let i = 0; i < outDataList.length; i++) {
    tempOutDataList.push(outDataList[i].slice(-step * timeGap));
  }
  return tempOutDataList[parseChannel(typeChannel)]
    ? tempOutDataList[parseChannel(typeChannel)].map((item, xIndex) => ({
        value: [(xIndex + 1) * minTime, item.value[1][index]],
      }))
    : [];
};

const conversionPsdMapData = (outDataList, typeChannel, step) => {
  let tempPsdMapList: any = [];
  for (let i = 0; i < outDataList.length; i++) {
    tempPsdMapList.push(outDataList[i].slice(-step * timeGap));
  }
  let psdMapData: number[][] = [];
  for (let x = 0; x < tempPsdMapList[parseChannel(typeChannel)].length; x++) {
    let psdItems = tempPsdMapList[parseChannel(typeChannel)][x];
    psdItems.forEach((value, y) => {
      psdMapData.push([x, y, value]);
    });
  }
  return psdMapData;
};

const handleChangePsdChannel = () => {
  initPSD();
};
const handleChangeSeriesStep = () => {
  updateRenderRealSeriesData();
};
const handleChangeBarnsTimeStep = () => {
  updateRenderBarnsTime();
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
