<template>
  <div
    style="width: 100%; height: 100%; font-size: 0px"
    ref="AbsolutePower"
    id="AbsolutePower"
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
const AbsolutePower = ref<HTMLElement | null>(null);
let numMax = 5;
let canvasP5: any;
let channelBars: any;
let sketch: any = null;
let timer: any = null;
let canvasWidth = 0;
let canvasHeight = 0;
const leftPadding = 60;
const rightPadding = 10;
const topPadding = 20;
const middlePadding = 30;
const bottomPadding = 50;
const labelNmae = [
  "DELTA\n0.5-4Hz",
  "THETA\n4-8Hz",
  "ALPHA\n8-12Hz",
  "BETA\n12-25Hz",
  "GAMMA\n25-45Hz",
];

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

  autoscaleMax: number = 50000;
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
    // this.plot.setLogScale("y");
    this.plot.setXLim(0, numMax);
    this.plot.setMar(0, 0, 0, 0);
    this.plot.setYLim(this.autoscaleMin, this.autoscaleMax);
    this.plot.getXAxis().setLineColor("#DDDDDD");
    this.plot.getYAxis().setLineColor("#6E7079");
    this.plot.getXAxis().setFontColor("#787878");
    this.plot.getYAxis().setFontColor("#787878");
    this.plot.getYAxis().getAxisLabel().setText("uV^2/Hz");
    this.plot.getXAxis().setNTicks(0);
    this.plot.getYAxis().setTickLabelOffset(4);
    this.plot.getXAxis().setAxisLabelText("EEG Power Bands");
    this.plot.startHistograms(window.GPlot.VERTICAL);
    this.plot.getHistogram().setDrawLabels(true);
    this.plot.drawGridLines(window.GPlot.BOTH);
    this.plot
      .getHistogram()
      .setLineColors([
        canvasP5.color(245),
        canvasP5.color(245),
        canvasP5.color(245),
        canvasP5.color(245),
        canvasP5.color(245),
      ]);
    this.plot
      .getHistogram()
      .setBgColors([
        canvasP5.color(255, 67, 72, 200),
        canvasP5.color(241, 189, 0, 200),
        canvasP5.color(37, 146, 121, 200),
        canvasP5.color(78, 123, 187, 200),
        canvasP5.color(165, 107, 172, 200),
      ]);
    let points: any = [];
    for (var i = 0; i < 5; i++) {
      points[i] = new window.GPoint(i + 0.5, 0.1, labelNmae[i]);
    }
    this.plot.setPoints(points);
  }

  updateSeries(series) {
    if (!series || !series.length) {
      return;
    }
    if (series[0] == undefined) {
      return;
    }
    let points: any = [];
    for (var i = 0; i < series.length; i++) {
      points[i] = new window.GPoint(i + 0.5, series[i] || 0.1, labelNmae[i]);
    }

    this.plot.setPoints(points);
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
    this.plot.drawYAxis();
    this.plot.drawXAxis();
    this.plot.drawGridLines(window.GPlot.BOTH);
    this.plot.drawHistograms();
    this.plot.endDraw();
  }
}

// 获取高度
const getWH = () => {
  if (AbsolutePower.value) {
    canvasWidth = AbsolutePower.value.clientWidth;
    canvasHeight = AbsolutePower.value.clientHeight;
  }
};

// 更新配置/数据
const setOption = (option) => {
  if (option.series) {
    channelBars.updateSeries(option.series);
  }
};

// 更新布局
const updatelayout = () => {
  getWH();
  canvasP5.createCanvas(canvasWidth, canvasHeight);
  channelBars = new ChannelBar(
    leftPadding,
    topPadding,
    canvasWidth - leftPadding - rightPadding,
    canvasHeight - topPadding - bottomPadding
  );
};

// 窗口改变
const resizeing = () => {
  // updatelayout();
};

// 创建p5
const defaultPlotSketch = (p) => {
  p.setup = function () {
    p.frameRate(5);
    canvasP5 = p;
    updatelayout();
  };
  p.draw = function () {
    let fps = p.frameRate();
    p.background(255);
    channelBars.draw();
  };
};

onMounted(() => {
  sketch && sketch.remove();
  sketch = new window.p5((p) => defaultPlotSketch(p), "AbsolutePower");
  window.addEventListener("resize", resizeing);
});

onBeforeUnmount(() => {
  sketch.remove();
  sketch.remove = null;
  sketch = null;
  window.p5.prototype._registeredMethods.remove = []
  canvasP5 = null;
  channelBars = null;
  timer && clearInterval(timer);
  window.removeEventListener("resize", resizeing);
});

defineExpose({
  setOption,
});
</script>
<style scoped></style>
