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
        <div class="selection" id="selection">
          <div class="selection-box">
            <div class="S1-D5 round-line">
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
            <div class="S1-D7 round-line">
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
            <div class="D6 round">
              <span class="D6-text text">D6</span>
            </div>
            <div
              class="S1-D8 line-box"
              @click="channelLineClick(4)"
              :class="{ active: channels.includes(4) }"
            >
              <span class="line"></span>
            </div>
          </div>
          <div class="selection-box selection-box-right">
            <div class="S1-D5 round-line">
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
            <div class="S1-D7 round-line">
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
            <div class="D6 round">
              <span class="D6-text text">D2</span>
            </div>
            <div
              class="S1-D8 line-box"
              @click="channelLineClick(8)"
              :class="{ active: channels.includes(8) }"
            >
              <span class="line"></span>
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
import { ref, reactive, onMounted, nextTick } from "vue";
import * as echarts from "echarts";
const radioValue = ref<number>(1);
const checkboxValue1 = ref(["1"]);
const checkboxValue2 = ref(["1"]);
const channels = ref([1, 2, 3, 4, 5, 6, 7, 8]);
let myChart: echarts.EChartsType;
interface showSeriesDataType {
  chanIndex: number;
  index: number;
  radioIndex: number;
  name: string;
  color: string;
}
let showSeriesData: showSeriesDataType[] = [];
const seriesRDNames = [
  "chan1-735 nm",
  "chan1-805 nm",
  "chan1-850 nm",
  "chan2-735 nm",
  "chan2-805 nm",
  "chan2-850 nm",
  "chan3-735 nm",
  "chan3-805 nm",
  "chan3-850 nm",
  "chan4-735 nm",
  "chan4-805 nm",
  "chan4-850 nm",
  "chan5-735 nm",
  "chan5-805 nm",
  "chan5-850 nm",
  "chan6-735 nm",
  "chan6-805 nm",
  "chan6-850 nm",
  "chan7-735 nm",
  "chan7-805 nm",
  "chan7-850 nm",
  "chan8-735 nm",
  "chan8-805 nm",
  "chan8-850 nm",
];
const seriesODNames = [
  "chan1-735 nm",
  "chan1-805 nm",
  "chan1-850 nm",
  "chan2-735 nm",
  "chan2-805 nm",
  "chan2-850 nm",
  "chan3-735 nm",
  "chan3-805 nm",
  "chan3-850 nm",
  "chan4-735 nm",
  "chan4-805 nm",
  "chan4-850 nm",
  "chan5-735 nm",
  "chan5-805 nm",
  "chan5-850 nm",
  "chan6-735 nm",
  "chan6-805 nm",
  "chan6-850 nm",
  "chan7-735 nm",
  "chan7-805 nm",
  "chan7-850 nm",
  "chan8-735 nm",
  "chan8-805 nm",
  "chan8-850 nm",
];
const seriesConcNames = [
  "chan1-HbO",
  "chan1-HbR",
  "chan1-HbT",
  "chan2-HbO",
  "chan2-HbR",
  "chan2-HbT",
  "chan3-HbO",
  "chan3-HbR",
  "chan3-HbT",
  "chan4-HbO",
  "chan4-HbR",
  "chan4-HbT",
  "chan5-HbO",
  "chan5-HbR",
  "chan5-HbT",
  "chan6-HbO",
  "chan6-HbR",
  "chan6-HbT",
  "chan7-HbO",
  "chan7-HbR",
  "chan7-HbT",
  "chan8-HbO",
  "chan8-HbR",
  "chan8-HbT",
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

onMounted(function () {
  initData();
  nextTick(() => {
    myChart = echarts.init(document.getElementById("series"));
    initSeries();
  });
});

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
  generateXAxisArr();
  generateYAxisArr();
  generateGrid();
  generateSeries();
};

// 生成X轴
const generateXAxisArr = () => {
  xAxisArr = showSeriesData.map((item, index) => {
    return {
      type: "category",
      show: index === showSeriesData.length - 1,
      boundaryGap: false,
      gridIndex: index,
      data: [1, 2, 3, 4, 5, 6, 7],
      axisLabel: {
        color: "#666666",
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

// 生成series
const generateSeries = () => {
  seriesArr = showSeriesData.map((item, index) => {
    return {
      data: [150, 230, 224, 218, 135, 147, 260],
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

// 渲染图表
const initSeries = () => {
  myChart?.setOption({
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
