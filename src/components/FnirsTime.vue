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
const props = defineProps({
  numSeconds: String,
});

let numSeconds = props.numSeconds;
let maxSeconds = 20;
let setChannel = false;
const sampleRate = 250;
let canvasP5: any;
// 自定义绘制
let customCanvas: any;
let customCtx: any;
let offscreenCanvas: any;
let offscreenCtx: any;
let channel: any = [];
let channelBars: ChannelBar[] = [];
let sketch: any = null;
let timer: any = null;
let canvasWidth = 0;
let canvasHeight = 0;
const leftPadding = 100;
const rightPadding = 20;
const topPadding = 18;
let middlePadding = 10;
const bottomPadding = 30;

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
  autoscaleMin: number = -1;
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

    this.plot.getYAxis().lab.setRotate(false);
    this.plot.getYAxis().setAxisLabelText(this.name);
    // this.plot.getYAxis().setRotate(false);
    // this.plot.getYAxis().setDrawTickLabels(false)
    offscreenCtx.lineWidth = 1;
  }

  updateSeries(series) {
    let points: any = [];
    if (this.yMin === undefined) {
      this.autoscaleMin = 0;
    }
    if (this.yMax === undefined) {
      this.autoscaleMax = 0;
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
    if (this.yMin === undefined && this.autoscaleMin > 0) {
      this.autoscaleMin = 0;
    }
    if (this.yMax === undefined && this.autoscaleMax < 0) {
      this.autoscaleMax = 0;
    }
    this.setYLim();
    this.plot.setPoints(points);
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
      offscreenCtx.moveTo(plotPoints[0].x, plotPoints[1].y);
      for (var i = 0; i < plotPoints.length; i++) {
        offscreenCtx.lineTo(plotPoints[i].x, plotPoints[i].y);
      }
      offscreenCtx.stroke();
      offscreenCtx.restore();
    }
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
    this.plot.endDraw();
  }
}

// 获取高度
const getWH = () => {
  console.log("FnirsTime.value", FnirsTime.value);

  if (FnirsTime.value) {
    canvasWidth = FnirsTime.value.clientWidth;
    canvasHeight = FnirsTime.value.clientHeight;
  }
};

// 更新配置/数据
const setOption = (option) => {
  if (option.channel) {
    channel = option.channel;
    if (channel.length > 8) {
      middlePadding = 0;
    } else {
      middlePadding = 10;
    }

    updatelayout();
    for (
      var currentChannel = 0;
      currentChannel < channel.length;
      currentChannel++
    ) {
      if (channel.length > 8) {
        channelBars[currentChannel] &&
          channelBars[currentChannel].plot.getYAxis().setDrawTickLabels(false);
        channelBars[currentChannel] &&
          channelBars[currentChannel].plot.getYAxis().setDrawPlotTicks(false);
      } else {
        channelBars[currentChannel] &&
          channelBars[currentChannel].plot.getYAxis().setDrawTickLabels(true);
        channelBars[currentChannel] &&
          channelBars[currentChannel].plot.getYAxis().setDrawPlotTicks(true);
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
      channel[i].color
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

onMounted(() => {
  sketch && sketch.remove();
  sketch = new window.p5((p) => defaultPlotSketch(p), "FnirsTime");
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
