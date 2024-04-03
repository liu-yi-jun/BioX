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
                v-model:value="showTime"
                style="width: 100px"
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
          <div v-if="spectrumType === 'PSD'" id="psd" style="width: 100%; height: 100%"></div>
          <div v-if="spectrumType === 'Heatmap'" id="heatmap" style="width: 100%; height: 100%"></div>
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
                  v-model:value="showTime"
                  style="width: 100px"
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

    <record></record>
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
} from "vue";
import type { SelectProps } from "ant-design-vue";
import record from "../../components/record.vue";

import { HighchartsKey } from "../../types";

const showTime = ref("5 sec");
const spectrumShowTime = ref("5 sec");
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
HeatMap(Highcharts);
const showTimeOptionsData = [
  {
    value: "5 sec",
    label: "5 sec",
  },
  {
    value: "10 sec",
    label: "10 sec",
  },
  {
    value: "30 sec",
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

onMounted(function () {
  // const { proxy } = getCurrentInstance() as ComponentInternalInstance;

  nextTick(() => {
    // initHeatmap();
    initSeries();
    initPSD();
    // initRelated();
    initAbsolute();
    // initBarnsTime();
  });

  // Highcharts.chart("chart-container", {
  //   chart: {
  //     type: "line",
  //   },
  //   title: {
  //     text: "My Chart",
  //   },
  //   series: [
  //     {
  //       data: [1, 2, 3, 4, 5, 6, 7],
  //     },
  //   ],
  // });
});
const initSeries = () => {
  var myChart = echarts.init(document.getElementById("series"));
  myChart.setOption({
    color: ["#8FDCFE", "#B3B3B3"],
    legend: {
      top: 80,
      left: "0",
      data: ["chan1", "chan2"],
      icon: "circle",
      orient: "vertical",
      itemGap: 100,
      itemHeight: 12,
      itemWidth: 12,
      textStyle: {
        fontSize: 12,
      },
    },
    xAxis: [
      {
        type: "category",
        show: false,
        boundaryGap: false,
        gridIndex: 0,
        data: [1, 2, 3, 4, 5, 6, 7],
      },
      {
        type: "category",
        boundaryGap: false,
        gridIndex: 1,
        data: [1, 2, 3, 4, 5, 6, 7],

        axisLabel: {
          color: "#666666",
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
        show: false,

        type: "value",
        gridIndex: 0,
      },
      {
        show: false,
        type: "value",
        gridIndex: 1,
      },
    ],

    series: [
      {
        data: [150, 230, 224, 218, 135, 147, 260],
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
        data: [150, 230, 224, 218, 135, 147, 260],
        type: "line",
        symbol: "none",
        lineStyle: {
          color: "#B3B3B3",
          width: 1,
        },
        name: "chan2",
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
  var myChart = echarts.init(document.getElementById("psd"));
  myChart.setOption({
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
      // type: "value",
      type: "log",
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
      min: 0.1,
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
        data: [0.1, 32, 1, 34, 90, 30, 10],
      },
      {
        name: "F3",
        type: "line",
        symbol: "none",
        data: [0.1, 82, 91, 34, 90, 30, 30],
      },
      {
        name: "P7",
        type: "line",
        symbol: "none",
        data: [0.1, 32, 1, 54, 90, 30, 40],
      },
      {
        name: "F7",
        type: "line",
        symbol: "none",
        data: [0.1, 32, 31, 34, 30, 30, 30],
      },
      {
        name: "AF4",
        type: "line",
        symbol: "none",
        data: [0.1, 32, 91, 93, 10, 10, 20],
      },
    ],
  });
};
const initAbsolute = () => {
  var myChart = echarts.init(document.getElementById("absolute"));
  myChart.setOption({
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
        data: [
          {
            value: 99,
            itemStyle: {
              color: "rgb(255, 67, 72, 0.8)",
            },
          },
          {
            value: 99,
            itemStyle: {
              color: "rgb(241, 189, 0, 0.8)",
            },
          },
          {
            value: 99,
            itemStyle: {
              color: "rgb(37, 146, 121, 0.8)",
            },
          },
          {
            value: 99,
            itemStyle: {
              color: "rgb(78, 123, 187, 0.8)",
            },
          },
          {
            value: 99,
            itemStyle: {
              color: "rgb(165, 107, 172, 0.8)",
            },
          },
        ],
        type: "bar",
        barCategoryGap: "2%",
      },
    ],
  });
};
const initRelated = () => {
  var myChart = echarts.init(document.getElementById("related"));
  myChart.setOption({
    color: ["#E4CDFF", "#A19CFF", "#7A83FF", "#4C68FF", "#0721E6"],

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
        type: "category",
        boundaryGap: false,
        data: ["0", "4", "8", "12", "16", "20", "24"],
      },
    ],
    yAxis: [
      {
        // max: 900,
        type: "value",
      },
    ],
    series: [
      {
        name: "γ wave",
        type: "line",
        stack: "Total",
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: "#E4CDFF",
        },
        data: [140, 232, 101, 264, 90, 340, 250],
      },
      {
        name: "β wave",
        type: "line",
        stack: "Total",
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: "#A19CFF",
        },
        data: [120, 282, 111, 234, 220, 340, 310],
      },
      {
        name: "α wave",
        type: "line",
        stack: "Total",
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: "#7A83FF",
        },
        data: [320, 132, 201, 334, 190, 130, 220],
      },
      {
        name: "θ wave",
        type: "line",
        stack: "Total",
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: "#4C68FF",
        },
        data: [220, 402, 231, 134, 190, 230, 120],
      },
      {
        name: "δ wave",
        type: "line",
        stack: "Total",
        smooth: true,
        lineStyle: {
          width: 0,
        },
        showSymbol: false,
        label: {
          show: true,
          position: "top",
        },
        areaStyle: {
          opacity: 0.8,
          color: "#0721E6",
        },
        data: [220, 302, 181, 234, 210, 290, 150],
      },
    ],
  });
};
const initBarnsTime = () => {
  var myChart = echarts.init(document.getElementById("barnsTime"));
  myChart.setOption({
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
        type: "category",
        show: false,
        boundaryGap: false,
        gridIndex: 0,
        data: [1, 2, 3, 4, 5, 6, 7],
      },
      {
        type: "category",
        show: false,
        boundaryGap: false,
        gridIndex: 1,
        data: [1, 2, 3, 4, 5, 6, 7],
      },
      {
        type: "category",
        show: false,
        boundaryGap: false,
        gridIndex: 2,
        data: [1, 2, 3, 4, 5, 6, 7],
      },
      {
        type: "category",
        show: false,
        boundaryGap: false,
        gridIndex: 3,
        data: [1, 2, 3, 4, 5, 6, 7],
      },
      {
        type: "category",
        show: false,
        boundaryGap: false,
        gridIndex: 4,
        data: [1, 2, 3, 4, 5, 6, 7],
      },
      {
        type: "category",
        boundaryGap: false,
        gridIndex: 5,
        data: [1, 2, 3, 4, 5, 6, 7],
        axisLabel: {
          color: "#666666",
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
        left: "10%",
        right: "4%",
        top: "0%",
        bottom: "83.34%",
        containLabel: false,
      },
      {
        show: false,
        left: "10%",
        right: "4%",
        top: "16.66%",
        bottom: "66.64%",
        containLabel: false,
      },
      {
        show: false,
        left: "10%",
        right: "4%",
        top: "33.36%",
        bottom: "49.98%",
        containLabel: false,
      },
      {
        show: false,
        left: "10%",
        right: "4%",
        top: "50.02%",
        bottom: "33.32%",
        containLabel: false,
      },
      {
        show: false,
        left: "10%",
        right: "4%",
        top: "66.68%",
        bottom: "16.66%",
        containLabel: false,
      },
      {
        show: false,
        left: "10%",
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
        data: [150, 230, 224, 218, 135, 147, 260],
        type: "line",
        name: "EEG",
        symbol: "none",
        lineStyle: {
          width: 1,
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
        data: [150, 230, 224, 218, 135, 147, 260],
        type: "line",
        symbol: "none",
        name: "DELTA",
        lineStyle: {
          width: 1,
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
        data: [150, 230, 224, 218, 135, 147, 260],
        type: "line",
        symbol: "none",
        name: "THETA",
        lineStyle: {
          width: 1,
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
        data: [150, 230, 224, 218, 135, 147, 260],
        type: "line",
        symbol: "none",
        name: "ALPHA",
        lineStyle: {
          width: 1,
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
        data: [150, 230, 224, 218, 135, 147, 260],
        type: "line",
        symbol: "none",
        name: "BETA",
        lineStyle: {
          width: 1,
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
        data: [150, 230, 224, 218, 135, 147, 260],
        type: "line",
        symbol: "none",
        name: "GAMMA",
        lineStyle: {
          width: 1,
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
</script>
<style scoped></style>
