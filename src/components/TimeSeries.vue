<template>
  <div
    style="width: 100%; height: 100%; font-size: 0px"
    ref="TimeSeries"
    id="TimeSeries"
  ></div>
</template>

<script setup lang="ts">
import { CustomBluetooth } from "../utils/bluetooth";
import {
  onMounted,
  ref,
  reactive,
  nextTick,
  onBeforeUnmount,
  watch,
} from "vue";
const TimeSeries = ref<HTMLElement | null>(null);
const props = defineProps({
  numSeconds: String,
});

let numSeconds = props.numSeconds;
let maxSeconds = 20;

let canvasP5: any;
// 自定义绘制
let customCanvas: any;
let customCtx: any;
let offscreenCanvas: any;
let offscreenCtx: any;
let channel = ["Fp1", "Fp2"];
let channelBars: ChannelBar[] = [];
let sketch: any = null;
let timer: any = null;
let canvasWidth = 0;
let canvasHeight = 0;
const leftPadding = 80;
const rightPadding = 20;
const topPadding = 18;
const middlePadding = 30;
const bottomPadding = 30;
const minGap = 0.001;
const colors = {
  Fp1: "#8FDCFE",
  Fp2: "#B3B3B3",
};

// 实例
class ChannelBar {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  lineColor: string;
  channelIndex: number;
  plot: any;

  autoscaleMax: number = 1;
  autoscaleMin: number = 0;
  yMax: number | undefined;
  yMin: number | undefined;
  constructor(_channelIndex, _x, _y, _w, _h, _name, _lineColor) {
    this.x = _x;
    this.y = _y;
    this.w = _w;
    this.h = _h;
    this.name = _name;
    this.lineColor = _lineColor;
    this.channelIndex = _channelIndex;
    this.setup();
  }

  setup() {
    this.plot = new window.GPlot(canvasP5);
    this.plot.setPos(this.x, this.y);
    this.plot.setDim(this.w, this.h);
    this.plot.setXLim(0, numSeconds);
    this.plot.setMar(0, 0, 0, 0);
    this.plot.setLineColor(this.lineColor);
    // this.plot.setLineWidth(0.8);
    this.plot.setYLim(this.autoscaleMin, this.autoscaleMax);
    this.plot.getXAxis().setLineColor("#DDDDDD");
    this.plot.getYAxis().setLineColor("#6E7079");
    this.plot.getXAxis().setFontColor("#787878");
    this.plot.getYAxis().setFontColor("#787878");
    this.plot.getYAxis().setAxisLabelText(this.name);
    this.plot.getYAxis().getAxisLabel().setOffset(50);
    this.plot.getYAxis().setTickLabelOffset(2.5);
    // this.plot.getYAxis().setRotate(false);
    offscreenCtx.lineWidth = 1;
  }

  updateSeries(series) {
    if(!series || !series.length) {
      return
    }
    let points: any = [];
    if (this.yMin === undefined) {
      this.autoscaleMin = Number.MAX_VALUE;
    }
    if (this.yMax === undefined) {
      this.autoscaleMax = -Number.MAX_VALUE;
    }
    for (var i = 0; i < series.length; i++) {
      if (series[i].value[1] > this.autoscaleMax) {
        this.autoscaleMax = series[i].value[1];
      }
      if (series[i].value[1] < this.autoscaleMin) {
        this.autoscaleMin = series[i].value[1];
      }

      points[i] = new window.GPoint(
        series[i].value[0] / 1000,
        series[i].value[1]
      );
    }
    this.setYLim();
    this.plot.setPoints(points);
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
    if(min == Number.MAX_VALUE || max == Number.MIN_VALUE){
      return
    }
    min = Number(min);
    max = Number(max);
   
    
    if (min == max) {
      max += minGap;
    }
    this.plot.setYLim(min, max);
  }

  customLines() {
    let plot = this.plot;

    let plotPoints = plot.mainLayer.plotPoints;
    if (plotPoints.length > 0) {
      offscreenCtx.save();
      offscreenCtx.strokeStyle = this.lineColor;
      offscreenCtx.translate(
        plot.pos[0] + plot.mar[1],
        plot.pos[1] + plot.mar[2] + plot.dim[1]
      );
      offscreenCtx.beginPath();
      offscreenCtx.rect(0, -this.h, this.w, this.h);
      offscreenCtx.clip();
      offscreenCtx.beginPath();
      offscreenCtx.moveTo(plotPoints[0].x, plotPoints[0].y);
      for (var i = 0; i < plotPoints.length; i++) {
        offscreenCtx.lineTo(plotPoints[i].x, plotPoints[i].y);
      }
      offscreenCtx.stroke();
      offscreenCtx.restore();
    }
  }

  draw() {
    this.plot.beginDraw();
    this.plot.drawXAxis();
    this.plot.drawYAxis();
    // this.plot.drawBox();
    // this.plot.drawLines();
    // 自定义画线
    this.customLines();
    this.plot.endDraw();
  }
}

// 获取高度
const getWH = () => {
  if (TimeSeries.value) {
    canvasWidth = TimeSeries.value.clientWidth;
    canvasHeight = TimeSeries.value.clientHeight;
  }
};

// 更新配置/数据
const setOption = (option) => {
  if (option.channel) {
    channel = option.channel;
    updatelayout();
  }

  for (
    var currentChannel = 0;
    currentChannel < channel.length;
    currentChannel++
  ) {
    if (option.yAxis) {
      channelBars[currentChannel].updateYAxis(
        option.yAxis[currentChannel].min,
        option.yAxis[currentChannel].max
      );
    }
    if (option.xAxis) {
      channelBars[currentChannel].updateXAxis(option.xAxis[currentChannel].max);
    }
    if (option.series) {
      channelBars[currentChannel].updateSeries(
        option.series[currentChannel].data
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
      channel[i],
      colors[channel[i]]
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
      .getElementById("TimeSeries")
      ?.querySelector("canvas");
    customCtx = customCanvas.getContext("2d");
    offscreenCanvas = document.createElement("canvas");
    offscreenCtx = offscreenCanvas.getContext("2d");
    updatelayout();
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

onMounted(() => {
  sketch && sketch.remove();
  sketch = new window.p5((p) => defaultPlotSketch(p), "TimeSeries");
  window.addEventListener("resize", resizeing);
});

onBeforeUnmount(() => {
  sketch.remove();
  sketch = null;
  channelBars = [];
  timer && clearInterval(timer);
  window.removeEventListener("resize", resizeing);
});

defineExpose({
  setOption,
});
</script>
<style scoped></style>
