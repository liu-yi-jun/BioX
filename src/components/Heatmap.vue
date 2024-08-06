<template>
  <div
    style="width: 100%; height: 100%; font-size: 0px"
    ref="Heatmap"
    id="Heatmap"
  ></div>
</template>

<script setup lang="ts">
import { number } from "echarts";
import {
  onMounted,
  ref,
  reactive,
  nextTick,
  onBeforeUnmount,
  watch,
} from "vue";
import { useIndexStore } from "../store/index";
import { storeToRefs } from "pinia";
const indexStore = useIndexStore();
const { configData } = storeToRefs(indexStore);
const Heatmap = ref<HTMLElement | null>(null);
const props = defineProps({
  numSeconds: String,
});
let numSeconds = props.numSeconds;
let canvasP5: any;
// 自定义绘制
let customCanvas: any;
let customCtx: any;
let offscreenCanvas: any;
let offscreenCtx: any;
let channelBars: any;
let sketch: any = null;
let timer: any = null;
let canvasWidth = 0;
let canvasHeight = 0;
const leftPadding = 60;
const rightPadding = 10;
const topPadding = 10;
const middlePadding = 30;
const bottomPadding = 30;
const EEGTimeGap = 1000 / configData.value.eegFilter.sample_rate; // 采样间隔
const maxValue = 300;
const minValue = -300;
const range = maxValue - minValue;
const colorArray = [
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
];
let xNum = 0;
// 实例
class ChannelBar {
  x: number;
  y: number;
  w: number;
  h: number;
  plot: any;

  autoscaleMax: number = 125;
  autoscaleMin: number = 0;
  offAutoscaleMax: number = 257;
  yMax: number | undefined;
  yMin: number | undefined;
  series: any = [];
  xScalingFactor: number = 1;
  yScalingFactor: number = 1;
  bufferData: any = [];
  xNum: number = 0;

  constructor(_x, _y, _w, _h) {
    this.x = _x;
    this.y = _y;
    this.w = _w;
    this.h = _h;
    this.setup();
  }

  setup() {
    this.plot = new window.GPlot(canvasP5);
    this.plot.setPos(this.x, this.y);
    this.plot.setDim(this.w, this.h);
    this.plot.setXLim(0, numSeconds);
    this.plot.setMar(0, 0, 0, 0);
    this.plot.setYLim(this.autoscaleMin, this.autoscaleMax);
    this.plot.getXAxis().setLineColor("#DDDDDD");
    this.plot.getYAxis().setLineColor("#6E7079");
    this.plot.getXAxis().setFontColor("#787878");
    this.plot.getYAxis().setFontColor("#787878");
    this.plot.getYAxis().setTickLabelOffset(2.8);
    this.plot.getYAxis().getAxisLabel().setText("Frequency (Hz)");
    this.plot.drawGridLines(window.GPlot.BOTH);
    this.xScalingFactor =
      this.plot.dim[0] / (this.plot.xLim[1] - this.plot.xLim[0]);
    this.yScalingFactor =
      -this.plot.dim[1] / (this.plot.yLim[1] - this.plot.yLim[0]);
    this.setBufferData();
  }

  setBufferData() {
    this.xNum = (1000 / EEGTimeGap) * parseInt(numSeconds!);
    offscreenCanvas.width = this.xNum;
    offscreenCanvas.height = this.offAutoscaleMax;
    let bufferData = offscreenCtx.createImageData(
      this.xNum,
      this.offAutoscaleMax
    );
    // let bufferData = offscreenCtx.createImageData(
    //   (parseInt(numSeconds!) * 1000) / 40,
    //   this.autoscaleMax
    // );
    for (let i = 0; i < bufferData.data.length; i += 4) {
      bufferData.data[i + 0] = 49; // 红色
      bufferData.data[i + 1] = 54; // 绿色
      bufferData.data[i + 2] = 159; // 蓝色
      bufferData.data[i + 3] = 0; // 透明度（alpha），255 表示完全不透明
    }
    this.bufferData = bufferData;
  }

  updateSeries(series) {
    if (!series || !series.length) {
      return;
    }
    for (var i = 0; i < series.length; i++) {
      if (series[i][1] > this.autoscaleMax) {
        this.autoscaleMax = series[i][1];
      }
      if (series[i][1] < this.autoscaleMin) {
        this.autoscaleMin = series[i][1];
      }
    }
    this.series = series;
  }

  clearPoints() {
    this.plot.series = [];
  }

  updateXAxis(second) {
    numSeconds = second;
    this.plot.setXLim(0, numSeconds);
    this.xScalingFactor =
      this.plot.dim[0] / (this.plot.xLim[1] - this.plot.xLim[0]);
    this.yScalingFactor =
      -this.plot.dim[1] / (this.plot.yLim[1] - this.plot.yLim[0]);
    this.setBufferData();
  }

  updateYAxis(min?, max?) {
    if (min > 0) {
      min = 0;
    }
    if (max < 0) {
      max = 0;
    }
    this.yMin = min;
    this.yMax = max;
    this.setYLim();
  }

  updatePosDim(x, y, w, h) {
    this.plot.setPos(x, y);
    this.plot.setDim(w, h);
  }

  setYLim() {
    this.plot.setYLim(
      this.yMin === undefined ? this.autoscaleMin : this.yMin,
      this.yMax === undefined ? this.autoscaleMax : this.yMax
    );
  }

  customFill() {
    let plot = this.plot;

    let series = this.series;
    if (series.length > 0) {
      offscreenCtx.save();
      // offscreenCtx.translate(
      //   plot.pos[0] + plot.mar[1],
      //   plot.pos[1] + plot.mar[2] + plot.dim[1]
      // );
      let data = this.bufferData.data;

      let index, x, color;
      for (let i = 0; i < series.length; i++) {
        // let index = (y * width + x) * 4;
        x = Math.round(series[i][0] / EEGTimeGap);
        if (x < this.xNum && x >= 0) {
          index = (series[i][1] * this.xNum + x) * 4;
          color = mapValueToGradientColor(series[i][2]);
          data[index] = color[0];
          data[index + 1] = color[1];
          data[index + 2] = color[2];
          data[index + 3] = 255;
        }
      }
      offscreenCtx.putImageData(this.bufferData, 0, 0);
      offscreenCtx.restore();
    }
  }

  draw() {
    this.plot.beginDraw();
    this.plot.drawXAxis();
    this.plot.drawYAxis();
    this.plot.drawGridLines(window.GPlot.HORIZONTAL);
    this.customFill();
    // this.plot.drawFilledContours(window.GPlot.HORIZONTAL, 0.05);
    // this.plot.drawBox();
    // this.plot.drawLines();
    this.plot.endDraw();
  }
}

const mapValueToGradientColor = (value) => {
  const normalizedValue = Math.max(0, Math.min(1, (value - minValue) / range));
  const colorIndex = normalizedValue * (colorArray.length - 1);
  const startColorIndex = Math.floor(colorIndex);
  const endColorIndex = Math.min(startColorIndex + 1, colorArray.length - 1);
  const ratio = colorIndex - startColorIndex;

  const startColor = hexToRgb(colorArray[startColorIndex]);
  const endColor = hexToRgb(colorArray[endColorIndex]);

  const red = Math.round((1 - ratio) * startColor.r + ratio * endColor.r);
  const green = Math.round((1 - ratio) * startColor.g + ratio * endColor.g);
  const blue = Math.round((1 - ratio) * startColor.b + ratio * endColor.b);

  return [red, green, blue];
};

const hexToRgb = (hex) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

// 获取高度
const getWH = () => {
  if (Heatmap.value) {
    canvasWidth = Heatmap.value.clientWidth;
    canvasHeight = Heatmap.value.clientHeight;
  }
};

// 更新配置/数据
const setOption = (option: any) => {
  if (option.channel) {
    channelBars.clearPoints();
  }
  if (option.yAxis) {
    channelBars.updateYAxis(option.yAxis.min, option.yAxis.max);
  }
  if (option.xAxis) {
    channelBars.updateXAxis(option.xAxis.max);
  }
  if (option.series) {
    channelBars.updateSeries(option.series.data);
  }
};

// 更新布局
const updatelayout = () => {
  getWH();
  canvasP5.createCanvas(canvasWidth, canvasHeight);
  // offscreenCanvas.width = canvasWidth;
  // offscreenCanvas.height = canvasHeight;
  channelBars = new ChannelBar(
    leftPadding,
    topPadding,
    canvasWidth - leftPadding - rightPadding,
    canvasHeight - topPadding - bottomPadding
  );
};

// 窗口改变
const resizeing = () => {
  //   updatelayout();
};

// 创建p5
const defaultPlotSketch = (p) => {
  p.setup = function () {
    // p.frameRate(15);
    canvasP5 = p;
    customCanvas = document.getElementById("Heatmap")?.querySelector("canvas");
    customCtx = customCanvas.getContext("2d");
    offscreenCanvas = document.createElement("canvas");
    offscreenCtx = offscreenCanvas.getContext("2d");

    updatelayout();
  };
  p.draw = function () {
    p.background(255);
    offscreenCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    channelBars.draw();
    // 缩放绘制
    customCtx.drawImage(
      offscreenCanvas,
      channelBars.plot.pos[0] + channelBars.plot.mar[1],
      channelBars.plot.pos[1] + channelBars.plot.mar[2],
      channelBars.plot.dim[0],
      channelBars.plot.dim[1]
    );
  };
};

onMounted(() => {
  sketch && sketch.remove();
  sketch = new window.p5((p) => defaultPlotSketch(p), "Heatmap");
  window.addEventListener("resize", resizeing);
 
});

onBeforeUnmount(() => {
  sketch.remove();
  sketch.remove = null;
  sketch = null;
  window.p5.prototype._registeredMethods.remove = []
  channelBars = null;
  customCanvas = null;
  canvasP5 = null
  customCtx = null;
  offscreenCanvas = null;
  offscreenCtx = null;
  timer && clearInterval(timer);
  window.removeEventListener("resize", resizeing);
});

defineExpose({
  setOption,
});
</script>
<style scoped></style>
