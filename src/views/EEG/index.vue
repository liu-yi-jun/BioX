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

const barnsTimeStep = ref(30);
const barnsTimeMaxStep = 30;
const channel = ref(["Fp1", "Fp2"]);
const psdChannel = ref(["Fp1", "Fp2"]);
const heatmapChannel = ref("Fp1");
const bandsChannel = ref("Fp1");
const maxFreq = ref(50);
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

// Series data
let seriesObj: any = {
    Fp1: [],
    Fp2: [],
  },
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
  let psdF1: number[] = [];
  let psdF2: number[] = [];
  for (let i = 0; i <= maxFreq.value; i += 10) {
    psdF1.push(Math.random() * 100);
    psdF2.push(Math.random() * 100);
  }
  return {
    series: {
      Fp1: data.brain_elec_channel[0],
      Fp2: data.brain_elec_channel[1],
    },
    psd: {
      Fp1: psdF1,
      Fp2: psdF2,
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
  clearData(relatedObj);
  clearData(barnsTimeObj);
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
  seriesObj.Fp1 = [];
  seriesObj.Fp2 = [];
  obj.seriesArr.map((item) => {
    seriesObj.Fp1.push({
      value: [(seriesObj.Fp1.length + 1) * 250, item.Fp1],
    });
    seriesObj.Fp2.push({
      value: [(seriesObj.Fp2.length + 1) * 250, item.Fp2],
    });
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

  seriesObj.Fp1.push({
    value: [(seriesObj.Fp1.length + 1) * 250, obj.series.Fp1],
  });
  seriesObj.Fp2.push({
    value: [(seriesObj.Fp2.length + 1) * 250, obj.series.Fp2],
  });

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

  let noise = getNoiseHelper();
  let xData: number[] = [];
  let yData: number[] = [];
  noise.seed(Math.random());
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
  setInterval(() => {
    for (let j = 0; j <= 100; j++) {
      data.pop();
      data.unshift([
        0,
        j,
        noise.perlin2(Math.floor(Math.random() * 201) / 40, j / 20) + 0.5,
      ]);
    }
    for (let i = 0; i <= 200; i++) {
      for (let j = 0; j <= 100; j++) {
        if (i * 101 + j >= data.length) {
          return;
        }
        data[i * 101 + j][0] = i;
        data[i * 101 + j][1] = j;
      }
    }
    heatmapChart.setOption({
      series: [
        {
          data: data,
        },
      ],
    });
  }, 1000);
  let data = generateData(2, -5, 5);
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
      max: 1,
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
        data: data,
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
  for (let i = 0; i <= maxFreq.value; i += 10) {
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
  if (seriesObj.Fp1.length > seriesMaxStep * 4) {
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
      seriesObj.Fp1.slice(-seriesStep.value * 4)
    );
    tempSeriesObj.Fp2 = Object.assign(
      [],
      seriesObj.Fp2.slice(-seriesStep.value * 4)
    );
  });
  tempSeriesObj.Fp1.forEach((item, index) => {
    tempSeriesObj.Fp1[index].value[0] = (index + 1) * 250;
    tempSeriesObj.Fp2[index].value[0] = (index + 1) * 250;
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

const handleChangePsdChannel = () => {
  initPSD();
};
const handleChangeSeriesStep = () => {
  updateRenderRealSeriesData();
};
const handleChangeBarnsTimeStep = () => {
  updateRenderBarnsTime();
};
</script>
<style scoped></style>
