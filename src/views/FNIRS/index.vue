<template>
  <div class="charts-wrap fnirs-wrap">
    <p class="eig-nav-title">FNIRS</p>
    <div class="eig-card card-top">
      <p class="card-title">Time Series</p>
      <div
        style="width: 100%; height: 100%"
        class="time-series"
        id="series"
      ></div>
    </div>
    <div class="card-bottom">
      <div class="eig-card">
        <p class="card-title">Channel Selection</p>
        <div class="selection-box-wrap">
          <div class="selection" id="selection"> 
          <div class="selection-box">
            <div class="S1-D5 round-line" :style="`width: calc((${selectionHeight / 2}px + 50%) / 2);`">
              <div class="S1 round"></div>
              <div
                class="S1-D5 line-box"
                @click="channelLineClick(1)"
                :class="{ active: channels.includes(1) }"
              >
                <span class="line"></span>
              </div>
              <div class="D5 round" @click="channelLineClick(1)">
                <span class="D5-text text">D5</span>
              </div>
            </div>
            <div class="S1-D7 round-line"  :style="`width: calc((${selectionHeight / 2}px + 50%) / 2);`">
              <div
                class="S1 round"
                @click="channelLineClick([1, 2, 3, 4])"
              ></div>
              <span class="S1-text text">S1</span>
              <div
                class="S1-D7 line-box"
                @click="channelLineClick(3)"
                :class="{ active: channels.includes(3) }"
              >
                <span class="line"></span>
              </div>
              <div class="D7 round" @click="channelLineClick(3)">
                <span class="D7-text text">D7</span>
              </div>
            </div>
            <div class="D8 round" @click="channelLineClick(4)">
              <span class="D8-text text">D8</span>
            </div>
            <div class="D6 round" @click="channelLineClick(2)">
              <span class="D6-text text">D6</span>
            </div>
            <div
              class="S1-D8 line-box"
              :class="{ active: channels.includes(4) }"
            >
              <svg
                class="S1-D8-SVG"
                width="100%"
                @click="channelLineClick(4)"
                height="25"
                viewBox="0 0 220 25"  
                preserveAspectRatio="none"
              >
                <path
                  d="M0,25 Q110,-20, 220,25"
                  :stroke="channels.includes(4) ? '#00D008' : '#848484'"
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
                @click="channelLineClick(2)"
                height="16"
                viewBox="0 0 220 16"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,0 Q110,16, 220,0"
                  :stroke="channels.includes(2) ? '#00D008' : '#848484'"
                  fill="transparent"
                  stroke-width="3"
                />
              </svg>
            </div>
          </div>
          <div class="selection-box selection-box-right">
            <div class="S1-D5 round-line"  :style="`width: calc((${selectionHeight / 2}px + 50%) / 2);`">
              <div class="D5 round" @click="channelLineClick(5)">
                <span class="D5-text text">D1</span>
              </div>
              <div
                @click="channelLineClick(5)"
                :class="{ active: channels.includes(5) }"
                class="S1-D5 line-box"
              >
                <span class="line"></span>
              </div>
              <div class="S1 round"></div>
            </div>
            <div class="S1-D7 round-line"  :style="`width: calc((${selectionHeight / 2}px + 50%) / 2);`">
              <div class="D7 round" @click="channelLineClick(7)">
                <span class="D7-text text">D3</span>
              </div>
              <div
                class="S1-D7 line-box"
                @click="channelLineClick(7)"
                :class="{ active: channels.includes(7) }"
              >
                <span class="line"></span>
              </div>
              <div class="S1 round" @click="channelLineClick([5, 6, 7, 8])">
                <span class="S1-text text">S2</span>
              </div>
            </div>
            <div class="D8 round" @click="channelLineClick(8)">
              <span class="D8-text text">D4</span>
            </div>
            <div class="D6 round" @click="channelLineClick(6)">
              <span class="D6-text text">D2</span>
            </div>
            <div
              class="S1-D8 line-box"
              :class="{ active: channels.includes(8) }"
            >
              <svg
                class="S1-D8-SVG"
                width="100%"
                @click="channelLineClick(8)"
                height="25"
                viewBox="0 0 220 25"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,25 Q110,-20, 220,25"
                  :stroke="channels.includes(8) ? '#00D008' : '#848484'"
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
                @click="channelLineClick(6)"
                height="16"
                viewBox="0 0 220 16"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,0 Q110,16, 220,0"
                  :stroke="channels.includes(6) ? '#00D008' : '#848484'"
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
          <p class="card-title">Plot Type</p>
          <div class="view-setting">
            <div class="view-setting-radio">
              <a-radio-group @change="handleChange" v-model:value="radioValue">
                <a-radio :style="radioStyle" :value="1">Raw Data</a-radio>
                <a-radio :style="radioStyle" :value="2"
                  >Optical Density</a-radio
                >
                <a-radio :style="radioStyle" :value="3">Concentration</a-radio>
              </a-radio-group>
            </div>
            <div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  onMounted,
  nextTick,
  watch,
  onBeforeUnmount,
} from "vue";
// import { CustomDatabase } from "../../utils/db";
import * as echarts from "echarts";
const radioValue = ref<number>(1);
const checkboxValue1 = ref(["1"]);
const checkboxValue2 = ref(["1"]);
const selectionHeight = ref(0);
const selectionWidth = ref(0);
const seriesStep = ref(30);
const seriesMaxStep = 30;
const channels = ref([1, 2, 3, 4, 5, 6, 7, 8]);
import { CustomDatabase } from "../../utils/db";
import { useIndexStore } from "../../store/index";
import { CustomBluetooth } from "../../utils/bluetooth";
import { storeToRefs } from "pinia";
const indexStore = useIndexStore();
const { play, recordId, playIndex, isDragSlider } = storeToRefs(indexStore);
const db = new CustomDatabase();
let sourceData;
let seriesData: any = [];
let bluetooth = new CustomBluetooth();
let myChart: echarts.EChartsType;
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
  "S1D5.λ1",
  "S1D5.λ2",
  "S1D5.λ3",
  "S1D6.λ1",
  "S1D6.λ2",
  "S1D6.λ3",
  "S1D7.λ1",
  "S1D7.λ2",
  "S1D7.λ3",
  "S1D8.λ1",
  "S1D8.λ2",
  "S1D8.λ3",
  "S2D1.λ1",
  "S2D1.λ2",
  "S2D1.λ3",
  "S2D2.λ1",
  "S2D2.λ2",
  "S2D2.λ3",
  "S2D3.λ1",
  "S2D3.λ2",
  "S2D3.λ3",
  "S2D4.λ1",
  "S2D4.λ2",
  "S2D4.λ3",
];
const seriesODNames = [
  "S1D5.λ1",
  "S1D5.λ2",
  "S1D5.λ3",
  "S1D6.λ1",
  "S1D6.λ2",
  "S1D6.λ3",
  "S1D7.λ1",
  "S1D7.λ2",
  "S1D7.λ3",
  "S1D8.λ1",
  "S1D8.λ2",
  "S1D8.λ3",
  "S2D1.λ1",
  "S2D1.λ2",
  "S2D1.λ3",
  "S2D2.λ1",
  "S2D2.λ2",
  "S2D2.λ3",
  "S2D3.λ1",
  "S2D3.λ2",
  "S2D3.λ3",
  "S2D4.λ1",
  "S2D4.λ2",
  "S2D4.λ3",
];
const seriesConcNames = [
  "S1D5.HbO",
  "S1D5.HbR",
  "S1D5.HbT",
  "S1D6.HbO",
  "S1D6.HbR",
  "S1D6.HbT",
  "S1D7.HbO",
  "S1D7.HbR",
  "S1D7.HbT",
  "S1D8.HbO",
  "S1D8.HbR",
  "S1D8.HbT",
  "S2D1.HbO",
  "S2D1.HbR",
  "S2D1.HbT",
  "S2D2.HbO",
  "S2D2.HbR",
  "S2D2.HbT",
  "S2D3.HbO",
  "S2D3.HbR",
  "S2D3.HbT",
  "S2D4.HbO",
  "S2D4.HbR",
  "S2D4.HbT",
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

let xAxisArr = reactive<echarts.EChartOption.XAxis[]>([]);
let yAxisArr = reactive<echarts.EChartOption.YAxis[]>([]);
let seriesArr = reactive<echarts.EChartOption.Series[]>([]);
let gridArr = reactive<echarts.EChartOption.Grid[]>([]);

let seriesRDNameObj: showSeriesDataType[];
let seriesODNameObj: showSeriesDataType[];

let seriesConcNameObj: showSeriesDataType[];
const radioStyle = reactive({
  display: "flex",
  height: "30px",
  lineHeight: "30px",
});

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
            RD: sourceData[playIndex.value].RD,
            OD: sourceData[playIndex.value].OD,
            Conc: sourceData[playIndex.value].Conc,
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
  // var sq = new CustomDatabase()
  // console.log(sq,"sq");
  nextTick(() => {
    getSelectionHeight();
  });
  initialize();
});

onBeforeUnmount(() => {
  bluetooth.removeNotice(bluetoothNotice);
  timer && clearInterval(timer);
  timerPlay && clearInterval(timerPlay);
});

// 获取元素高度
const getSelectionHeight = () => {
  selectionHeight.value =
    document.getElementById("selection")?.clientHeight || 0;
  selectionWidth.value =
    document.getElementById("selection")?.clientWidth || 0;
};

// 蓝牙数据通知
const bluetoothNotice = (data) => {
  handleRealTimeData(blueToothdataMapping(data));
};

// 将蓝牙数据进行映射
const blueToothdataMapping = (data) => {
  let RD: number[] = [],
    OD: number[] = [],
    Conc: number[] = [];
  for (let i = 0; i < 8 * 3; i++) {
    RD.push(Math.round(Math.random() * 20 + 30));
    OD.push(Math.round(Math.random() * 20 + 30));
    Conc.push(Math.round(Math.random() * 20 + 30));
  }
  RD[0] = data.near_infrared_channel[0];
  RD[1] = data.near_infrared_channel[1];
  RD[2] = data.near_infrared_channel[2];
  RD[3] = data.near_infrared_channel[3];
  RD[4] = data.near_infrared_channel[4];
  RD[5] = data.near_infrared_channel[5];
  return {
    RD,
    OD,
    Conc,
  };
};

const initialize = () => {
  sourceData = [];
  seriesData = [];
  if (!recordId.value) {
    bluetooth.addNotice(bluetoothNotice);
    // timer && clearInterval(timer);
    // timer = setInterval(() => {
    //   // [通道1-735nm，通道1-805nm，通道1-850nm，通道2...]
    //   let RD: number[] = [],
    //     OD: number[] = [],
    //     Conc: number[] = [];
    //   for (let i = 0; i < 8 * 3; i++) {
    //     RD.push(Math.round(Math.random() * 20 + 30));
    //     OD.push(Math.round(Math.random() * 20 + 30));
    //     Conc.push(Math.round(Math.random() * 20 + 30));
    //   }
    //   handleRealTimeData({
    //     RD,
    //     OD,
    //     Conc,
    //   });
    // }, 250);
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

  initData();
  nextTick(() => {
    myChart = echarts.init(document.getElementById("series"));
    initSeries();
  });
};

// 处理之前数据
const handleOldData = () => {
  let tempPlayIndex = playIndex.value;
  seriesData = sourceData
    .map((item) => {
      return {
        RD: item.RD,
        OD: item.OD,
        Conc: item.Conc,
      };
    })
    .slice(0, tempPlayIndex)
    .slice(-seriesMaxStep * 4);
  generateSeries();
  initSeries();
};

// 处理实时数据
const handleRealTimeData = (data: any) => {
  seriesData.push(data);
  if (seriesData.length > seriesMaxStep * 4) {
    seriesData.shift();
  }

  generateSeries();
  initSeries();
};

// 配置改变
const handleChange = () => {
  myChart.clear();
  generateShowSeriesData();
  initSeries();
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

  generateXAxisArr();
  generateYAxisArr();
  generateGrid();
  generateSeries();
};

// 生成X轴
const generateXAxisArr = () => {
  xAxisArr = showSeriesData.map((item, index) => {
    return {
      type: "time",
      show: index === showSeriesData.length - 1,
      boundaryGap: false,
      gridIndex: index,
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
      name: item.name,
      nameLocation: "middle",
      nameTextStyle: {
        fontSize: 12,
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
      left: "10%",
      right: "4%",
      top: (100 / showSeriesData.length) * index + "%",
      bottom: 100 - (100 / showSeriesData.length) * (index + 1) + "%",
      containLabel: false,
    };
  });
};

// 生成series
const generateSeries = () => {
  let tempSeriesData;
  tempSeriesData = Object.assign([], seriesData.slice(-seriesStep.value * 4));

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

    tempSeriesData.forEach((j, i) => {
      if (item.type === "RD") {
        tempObj.RD.push({
          value: [
            (tempObj.RD.length + 1) * 250,
            j.RD[(item.chanIndex - 1) * 3 + item.radioIndex - 1],
          ],
          "j.RD": j.RD,
          index: (item.chanIndex - 1) * 3 + item.radioIndex - 1,
        });
      }
      if (item.type === "OD") {
        tempObj.OD.push({
          value: [
            (tempObj.OD.length + 1) * 250,
            j.OD[(item.chanIndex - 1) * 3 + item.radioIndex - 1],
          ],
        });
      }
      if (item.type === "Conc") {
        tempObj.Conc.push({
          value: [
            (tempObj.Conc.length + 1) * 250,
            j.Conc[(item.chanIndex - 1) * 3 + item.radioIndex - 1],
          ],
        });
      }
    });

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
        data: [{ xAxis: 3 }],
      },
      xAxisIndex: index,
      yAxisIndex: index,
    };
  });
};

// 渲染图表
const initSeries = () => {
  myChart?.setOption({
    animation: false,
    xAxis: xAxisArr,
    grid: gridArr,
    yAxis: yAxisArr,
    series: seriesArr,
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
</script>
<style scoped></style>
