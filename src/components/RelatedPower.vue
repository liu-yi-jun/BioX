<template>
  <div
    style="width: 100%; height: 100%; font-size: 0px"
    ref="RelatedPower"
    id="RelatedPower"
  ></div>
</template>

<script setup lang="ts">
import {
  onMounted,
  ref,
  reactive,
  nextTick,
  onBeforeUnmount,
  watch,
} from "vue";
const RelatedPower = ref<HTMLElement | null>(null);
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
let channel = ["γ wave", "β wave", "α wave", "θ wave", "δ wave"];
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
const colors = {
  "γ wave": "rgba(7, 33, 230, 0.8)",
  "β wave": "rgba(76, 104, 255, 0.6)",
  "α wave": "rgba(122, 131, 255, 0.6)",
  "θ wave": "rgba(161, 156, 255, 0.6)",
  "δ wave": "rgba(228, 205, 255, 0.6",
};

// 实例
class ChannelBar {
  x: number;
  y: number;
  w: number;
  h: number;
  plot: any;

  autoscaleMax: number = 100;
  autoscaleMin: number = 0;
  yMax: number | undefined;
  yMin: number | undefined;

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
    this.plot.getYAxis().setTickLabelOffset(2.8);
    this.plot.getYAxis().setFontColor("#787878");
    this.plot.getYAxis().getAxisLabel().setText("Each Band Power Ratio (%)");
    this.plot.drawGridLines(window.GPlot.BOTH);
    for (var i = 0; i < channel.length; i++) {
      this.plot.addLayer(channel[i], []);
    }
  }

  updateSeries(name, series, allSeries, currentChannel) {
    if (!series || !series.length) {
      return;
    }
    let points: any = [];
    for (var i = 0; i < series.length; i++) {
      // if (series[i] > this.autoscaleMax) {
      //   this.autoscaleMax = series[i].value[1];
      // }
      // if (series[i] < this.autoscaleMin) {
      //   this.autoscaleMin = series[i].value[1];
      // }
      let value = series[i].value[1];
      for (let j = currentChannel + 1; j < channel.length; j++) {
        value = value + allSeries[j].data[i].value[1];
      }
      points[i] = new window.GPoint(series[i].value[0] / 1000, value);
    }
    this.plot.getLayer(name).setPoints(points);
  }

  clearPoints() {
    for (let i = 0; i < channel.length; i++) {
      this.plot.getLayer(channel[i]).setPoints([]);
    }
  }

  updateXAxis(second) {
    numSeconds = second;
    this.plot.setXLim(0, numSeconds);
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
    for (
      var currentChannel = 0;
      currentChannel < channel.length;
      currentChannel++
    ) {
      let plotPoints = plot.getLayer(channel[currentChannel]).plotPoints;
      if (plotPoints.length > 0) {
        offscreenCtx.save();
        offscreenCtx.translate(
          plot.pos[0] + plot.mar[1],
          plot.pos[1] + plot.mar[2] + plot.dim[1]
        );
        // offscreenCtx.rect(0, -this.h, this.w, this.h);
        // offscreenCtx.clip();
        offscreenCtx.beginPath();
        offscreenCtx.moveTo(0, 0);
        for (var i = 0; i < plotPoints.length; i++) {
          offscreenCtx.lineTo(plotPoints[i].x, plotPoints[i].y);
        }
        offscreenCtx.lineTo(plotPoints[plotPoints.length - 1].x, 0);
        offscreenCtx.fillStyle = colors[channel[currentChannel]];
        offscreenCtx.closePath();
        offscreenCtx.fill();
        offscreenCtx.restore();
      }
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

// 获取高度
const getWH = () => {
  if (RelatedPower.value) {
    canvasWidth = RelatedPower.value.clientWidth;
    canvasHeight = RelatedPower.value.clientHeight;
  }
};

// 更新配置/数据
const setOption = (option) => {
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
    for (
      var currentChannel = 0;
      currentChannel < channel.length;
      currentChannel++
    ) {
      channelBars.updateSeries(
        option.series[currentChannel].name,
        option.series[currentChannel].data,
        option.series,
        currentChannel
      );
    }
  }
};

// 更新布局
const updatelayout = () => {
  getWH();
  canvasP5.createCanvas(canvasWidth, canvasHeight);
  offscreenCanvas.width = canvasWidth;
  offscreenCanvas.height = canvasHeight;
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
    customCanvas = document
      .getElementById("RelatedPower")
      ?.querySelector("canvas");
    customCtx = customCanvas.getContext("2d");
    offscreenCanvas = document.createElement("canvas");
    offscreenCtx = offscreenCanvas.getContext("2d");
    updatelayout();
  };
  p.draw = function () {
    p.background(255);
    offscreenCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    channelBars.draw();
    customCtx.drawImage(offscreenCanvas, 0, 0, canvasWidth, canvasHeight);
  };
};

onMounted(() => {
  sketch && sketch.remove();
  sketch = new window.p5((p) => defaultPlotSketch(p), "RelatedPower");
  window.addEventListener("resize", resizeing);
});

onBeforeUnmount(() => {
  sketch.remove();
  sketch.remove = null;
  sketch = null;
  window.p5.prototype._registeredMethods.remove = []
  channelBars = null;
  customCanvas = null;
  customCtx = null;
  canvasP5 = null
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
