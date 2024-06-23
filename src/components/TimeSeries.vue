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
let numSeconds = 20;
const sampleRate = 250;
let canvasP5: any;
let channel = ["Fp1", "Fp2"];
let channelBars: ChannelBar[] = [];
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
    this.plot.setLineWidth(1.5);
    this.plot.setYLim(this.autoscaleMin, this.autoscaleMax);
    this.plot.getXAxis().setLineColor("#6E7079");
    this.plot.getYAxis().setLineColor("#6E7079");
    this.plot.getXAxis().setFontColor("#6E7079");
    this.plot.getYAxis().setFontColor("#6E7079");
    this.plot.getYAxis().setAxisLabelText(this.name);
  }

  updateSeries(series) {
    let points: any = [];
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

  draw() {
    this.plot.beginDraw();
    this.plot.drawXAxis();
    this.plot.drawYAxis();

    // this.plot.drawBox();
    this.plot.drawLines();
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
  updatelayout();
};

// 创建p5
const defaultPlotSketch = (p) => {
  p.setup = function () {
    canvasP5 = p;
    updatelayout();
  };
  p.draw = function () {
    let fps = p.frameRate();
    p.background(255);
    p.text("FPS: " + fps.toFixed(2), 10, 10);
    for (var i = 0; i < channel.length; i++) {
      channelBars[i].draw();
    }
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
  timer && clearInterval(timer);
  window.removeEventListener("resize", resizeing);
});

defineExpose({
  setOption,
});
</script>
<style scoped></style>
