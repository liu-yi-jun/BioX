<template>
  <div
    style="width: 100%; height: 100%; font-size: 0px"
    ref="FnirsTime"
    id="FnirsTime"
  ></div>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, nextTick } from "vue";
const FnirsTime = ref<HTMLElement | null>(null);
import { useIndexStore } from "../store/index";
import { storeToRefs } from "pinia";
const indexStore = useIndexStore();
const { isMarker, markerList } = storeToRefs(indexStore);
const props = defineProps({
  numSeconds: String,
});

let numSeconds = props.numSeconds;
let maxSeconds = 20;
let setChannel = false;
let canvasP5: any;
// 自定义绘制
let customCanvas: any;
let customCtx: any;
let offscreenCanvas: any;
let offscreenCtx: any;
let channel: any = [];
let channelBars: any = [];
let sketch: any = null;
let timer: any = null;
let canvasWidth = 0;
let canvasHeight = 0;
const leftPadding = 100;
const rightPadding = 20;
const topPadding = 10;
let middlePadding = 3;
const bottomPadding = 24;
const minGap = 0.001;
const colors = {
  1: "#ff0101",
  2: "#ffba01",
  3: "#0073ff",
};

import { irInputMarkerList } from "../global";

// 实例
class ChannelBar {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  lineSeries: any;
  channelIndex: number;
  plot: any;
  series: any = [];

  autoscaleMax: number = 1;
  autoscaleMin: number = 0;
  yMax: number | undefined;
  yMin: number | undefined;
  xScalingFactor: number = 1;
  yScalingFactor: number = 1;
  constructor(_channelIndex, _x, _y, _w, _h, _name, _lineSeries) {
    this.x = _x;
    this.y = _y;
    this.w = _w;
    this.h = _h;
    this.name = _name;
    this.lineSeries = _lineSeries;
    this.channelIndex = _channelIndex;
    this.setup();
  }

  setup() {
    this.plot = new window.GPlot(canvasP5);
    this.plot.setPos(this.x, this.y);
    this.plot.setDim(this.w, this.h);
    this.plot.setXLim(0, numSeconds);
    this.plot.setMar(0, 0, 0, 0);
    for (var i = 0; i < this.lineSeries.length; i++) {
      this.plot.addLayer(this.lineSeries[i].name, []);
      this.lineSeries[i].layer = this.plot.getLayer(this.lineSeries[i].name);
      this.lineSeries[i].layer.setLineColor(this.lineSeries[i].color);
    }

    // this.plot.setLineWidth(0.8);
    this.plot.setYLim(this.autoscaleMin, this.autoscaleMax);
    this.plot.getXAxis().setLineColor("#DDDDDD");
    this.plot.getYAxis().setLineColor("#6E7079");
    this.plot.getXAxis().setFontColor("#787878");
    this.plot.getYAxis().setFontColor("#787878");

    this.plot.getYAxis().lab.setRotate(false);
    this.plot.getYAxis().setAxisLabelText(this.name);
    this.plot.getYAxis().setShowLastTick(false);
    this.plot.getYAxis().setFontSize(9);
    this.plot.getYAxis().getAxisLabel().setOffset(50);
    this.plot.getYAxis().setTickLabelOffset(2.5);
    this.calcScaling();
    // this.plot.getYAxis().setRotate(false);
    // this.plot.getYAxis().setDrawTickLabels(false)
    offscreenCtx.lineWidth = 1;
  }

  updateSeries(series) {
    if (!series || (!series.radioRows && !series.radioRows.length)) {
      return;
    }
    this.series = series;
    if (this.yMin === undefined) {
      this.autoscaleMin = Number.MAX_VALUE;
    }
    if (this.yMax === undefined) {
      this.autoscaleMax = -Number.MAX_VALUE;
    }

    for (var i = 0; i < series.radioRows.length; i++) {
      let points: any = [];
      for (let j = 0; j < series.radioRows[i].length; j++) {
        if (series.radioRows[i][j].value[1] > this.autoscaleMax) {
          this.autoscaleMax = series.radioRows[i][j].value[1];
        }
        if (series.radioRows[i][j].value[1] < this.autoscaleMin) {
          this.autoscaleMin = series.radioRows[i][j].value[1];
        }
        points[j] = new window.GPoint(
          series.radioRows[i][j].value[0] / 1000,
          series.radioRows[i][j].value[1]
        );
      }
      this.lineSeries[i].layer.setPoints(points);
    }

    this.setYLim();
  }

  updateXAxis(second) {
    numSeconds = second;
    this.plot.setXLim(0, numSeconds);
  }

  updateYAxis(min?, max?) {
    this.yMin = min;
    this.yMax = max;
    this.setYLim();
  }

  updatePosDim(x, y, w, h) {
    this.plot.setPos(x, y);
    this.plot.setDim(w, h);
  }

  setYLim() {
    let min = this.yMin === undefined ? this.autoscaleMin : this.yMin;
    let max = this.yMax === undefined ? this.autoscaleMax : this.yMax;
    if (min == Number.MAX_VALUE || max == Number.MIN_VALUE) {
      return;
    }
    min = Number(min);
    max = Number(max);
    if (min == max) {
      max += minGap;
    }
    this.plot.setYLim(min, max);
    this.calcScaling();
  }

  calcScaling() {
    this.xScalingFactor =
      this.plot.dim[0] / (this.plot.xLim[1] - this.plot.xLim[0]);
    this.yScalingFactor =
      -this.plot.dim[1] / (this.plot.yLim[1] - this.plot.yLim[0]);
  }

  customLines() {
    let plot = this.plot;
    for (let i = 0; i < this.lineSeries.length; i++) {
      let plotPoints = this.lineSeries[i].layer.plotPoints;
      if (plotPoints.length > 0) {
        offscreenCtx.save();
        offscreenCtx.strokeStyle = colors[this.lineSeries[i].radioIndex];
        offscreenCtx.translate(
          plot.pos[0] + plot.mar[1],
          plot.pos[1] + plot.mar[2] + plot.dim[1]
        );
        offscreenCtx.beginPath();
        offscreenCtx.rect(0, -this.h, this.w, this.h);
        offscreenCtx.clip();
        offscreenCtx.beginPath();
        offscreenCtx.moveTo(plotPoints[0].x, plotPoints[0].y);
        for (var j = 0; j < plotPoints.length; j++) {
          offscreenCtx.lineTo(plotPoints[j].x, plotPoints[j].y);
        }
        offscreenCtx.stroke();
        offscreenCtx.restore();
      }
    }
  }

  customMarker() {
    let plot = this.plot;
    if (!this.lineSeries[0]) return;
    let plotPoints = this.lineSeries[0].layer.plotPoints;
    if (!plotPoints[0]) return;
    offscreenCtx.save();
    offscreenCtx.strokeStyle = "#ff4d4f";
    offscreenCtx.textAlign = "center";
    offscreenCtx.textBaseline = "top";
    offscreenCtx.fillStyle = "#ff4d4f";
    offscreenCtx.translate(plot.pos[0] + plot.mar[1], 0);

    irInputMarkerList.forEach((item) => {
      offscreenCtx.beginPath();
      offscreenCtx.rect(
        0,
        topPadding,
        this.w,
        this.h * channel.length +
          topPadding +
          middlePadding * (channel.length - 1)
      );
      offscreenCtx.clip();
      offscreenCtx.beginPath();

      let ors_time_mark = -1;
      for (
        let index = this.series.radioRows[0].length - 1;
        index >= 0;
        index--
      ) {
        const sItem = this.series.radioRows[0][index];
        if (sItem.value[2] <= item.time_stamp) {
          ors_time_mark = sItem.value[0] / 1000;
          break;
        }
      }
      let x = (ors_time_mark - this.plot.xLim[0]) * this.xScalingFactor;
      offscreenCtx.fillText(item.type, x, topPadding);
      offscreenCtx.moveTo(x, topPadding + 10);
      offscreenCtx.lineTo(
        x,
        this.h * channel.length +
          topPadding +
          middlePadding * (channel.length - 1)
      );

      offscreenCtx.stroke();
    });
    offscreenCtx.restore();
  }

  draw() {
    this.plot.beginDraw();
    if (this.channelIndex == channel.length - 1) {
      this.plot.drawXAxis();
    }
    this.plot.drawYAxis();
    // this.plot.drawBox();
    // this.plot.drawLines();
    // 自定义画线
    this.customLines();
    if (this.channelIndex == channel.length - 1) {
      this.customMarker();
    }
    this.plot.endDraw();
  }
}

// 获取高度
const getWH = () => {
  if (FnirsTime.value) {
    canvasWidth = FnirsTime.value.clientWidth;
    canvasHeight = FnirsTime.value.clientHeight;
  }
};

// 更新配置/数据
const setOption = (option) => {
  if (option.channel) {
    channel = option.channel;
    if (channel.length >= 8) {
      middlePadding = 3;
    } else {
      middlePadding = 10;
    }

    updatelayout();
    for (
      var currentChannel = 0;
      currentChannel < channel.length;
      currentChannel++
    ) {
      if (channel.length >= 8) {
        channelBars[currentChannel].plot.getYAxis().setShowLastTick(false);
        // channelBars[currentChannel].plot.getYAxis().setDrawTickLabels(false);
        // channelBars[currentChannel].plot.getYAxis().setDrawPlotTicks(false);
      } else {
        channelBars[currentChannel].plot.getYAxis().setShowLastTick(true);
        // channelBars[currentChannel].plot.getYAxis().setDrawTickLabels(true);
        // channelBars[currentChannel].plot.getYAxis().setDrawPlotTicks(true);
      }
    }
  }

  for (
    var currentChannel = 0;
    currentChannel < channel.length;
    currentChannel++
  ) {
    if (option.yAxis) {
      channelBars[currentChannel] &&
        channelBars[currentChannel].updateYAxis(
          option.yAxis[currentChannel].min,
          option.yAxis[currentChannel].max
        );
    }
    if (option.xAxis) {
      channelBars[currentChannel] &&
        channelBars[currentChannel].updateXAxis(
          option.xAxis[currentChannel].max
        );
    }
    if (option.series) {
      channelBars[currentChannel] &&
        channelBars[currentChannel].updateSeries(option.series[currentChannel]);
    }
  }
};

// 更新布局
const updatelayout = () => {
  getWH();
  canvasP5.createCanvas(canvasWidth, canvasHeight);
  offscreenCanvas.width = canvasWidth;
  offscreenCanvas.height = canvasHeight;
  let h =
    (canvasHeight -
      (topPadding + (channel.length - 1) * middlePadding + bottomPadding)) /
    channel.length;
  for (var i = 0; i < channel.length; i++) {
    channelBars[i] = new ChannelBar(
      i,
      leftPadding,
      i * (middlePadding + h) + topPadding,
      canvasWidth - leftPadding - rightPadding,
      h,
      channel[i].name,
      channel[i].radioRows
    );
  }
};

// 窗口改变
const resizeing = () => {
  // updatelayout();
};

// 创建p5
const defaultPlotSketch = (p) => {
  p.setup = function () {
    canvasP5 = p;
    // p.frameRate(15);
    customCanvas = document
      .getElementById("FnirsTime")
      ?.querySelector("canvas");
    customCtx = customCanvas.getContext("2d");
    offscreenCanvas = document.createElement("canvas");
    offscreenCtx = offscreenCanvas.getContext("2d");
    // updatelayout();
    // canvasP5.noLoop();
  };
  p.draw = function () {
    p.background(255);
    offscreenCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    let fps = p.frameRate();
    p.text("FPS: " + fps.toFixed(2), canvasWidth - 85, 10);
    for (var i = 0; i < channel.length; i++) {
      channelBars[i].draw();
    }
    customCtx.drawImage(offscreenCanvas, 0, 0, canvasWidth, canvasHeight);
  };
};

const handleKeydown = (e) => {
  if (isMarker.value) {
    let findItem = markerList.value.find((item) => {
      return item.type === e.key;
    });
    if (findItem) {
      irInputMarkerList.push({
        time_stamp: new Date().getTime(),
        type: findItem.type,
      });
    }
  }
};

onMounted(() => {
  sketch && sketch.remove();
  sketch = new window.p5((p) => defaultPlotSketch(p), "FnirsTime");
  window.addEventListener("resize", resizeing);
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  sketch.remove();
  sketch.remove = null;
  sketch = null;
  window.p5.prototype._registeredMethods.remove = []
  channelBars = null;
  customCanvas = null;
  customCtx = null;
  offscreenCanvas = null;
  offscreenCtx = null;
  canvasP5 = null
  channel = [];
  timer && clearInterval(timer);
  window.removeEventListener("resize", resizeing);
  window.removeEventListener("keydown", handleKeydown);
});

defineExpose({
  setOption,
});
</script>
<style scoped></style>
