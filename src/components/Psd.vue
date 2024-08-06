<template>
  <div
    style="width: 100%; height: 100%; font-size: 0px"
    ref="Psd"
    id="Psd"
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
const Psd = ref<HTMLElement | null>(null);
let maxFreq = 125;
let canvasP5: any;
let channel = ["Fp1", "Fp2"];
let channelBars: any;
let sketch: any = null;
let timer: any = null;
let canvasWidth = 0;
let canvasHeight = 0;
const leftPadding = 60;
const rightPadding = 10;
const topPadding = 10;
const middlePadding = 30;
const bottomPadding = 50;
const colors = {
  Fp1: "#7497CA",
  Fp2: "#93CB78",
};

// 实例
class ChannelBar {
  x: number;
  y: number;
  w: number;
  h: number;
  plot: any;

  autoscaleMax: number = 100;
  autoscaleMin: number = -100;
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
    this.plot.setXLim(0, maxFreq);
    this.plot.setMar(0, 0, 0, 0);
    this.plot.setLineColor(colors.Fp1);
    this.plot.setLineWidth(2.3);
    this.plot.setYLim(this.autoscaleMin, this.autoscaleMax);
    this.plot.getXAxis().setLineColor("#DDDDDD");
    this.plot.getYAxis().setLineColor("#6E7079");
    this.plot.getXAxis().setFontColor("#787878");
    this.plot.getYAxis().setFontColor("#787878");
    this.plot.getYAxis().getAxisLabel().setText("dBμV^2");
    this.plot.getYAxis().setTickLabelOffset(2.8);
    this.plot.getXAxis().setAxisLabelText("Frequency (Hz)");
    this.plot.drawGridLines(window.GPlot.BOTH);
    // 第二条线
    this.plot.addLayer("Fp2", []);
    this.plot.getLayer("Fp2").setLineColor(colors.Fp2);
    this.plot.getLayer("Fp2").setLineWidth(2.3);
  }

  updateSeries(name, series) {
    if(!series || !series.length) {
      return
    }
    let points: any = [];
    for (var i = 0; i < series.length; i++) {
      if (series[i] > this.autoscaleMax) {
        this.autoscaleMax = series[i];
      }
      if (series[i] < this.autoscaleMin) {
        this.autoscaleMin = series[i];
      }
      points[i] = new window.GPoint(i / 2.056, series[i]);
    }
    this.setYLim();
    if (name === "Fp2") {
      this.plot.getLayer("Fp2").setPoints(points);
    } else {
      this.plot.setPoints(points);
    }
  }

  clearPoints() {
    this.plot.setPoints([]);
    this.plot.getLayer("Fp2").setPoints([]);
  }

  updateXAxis(maxFreq) {
    maxFreq = maxFreq;
    this.plot.setXLim(0, maxFreq);
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
    this.plot.drawGridLines(window.GPlot.BOTH);
    // this.plot.drawBox();
    this.plot.drawLines();
    this.plot.endDraw();
  }
}

// 获取高度
const getWH = () => {
  if (Psd.value) {
    canvasWidth = Psd.value.clientWidth;
    canvasHeight = Psd.value.clientHeight;
  }
};

// 更新配置/数据
const setOption = (option) => {
  if (option.channel) {
    channelBars.clearPoints();
    channel = option.channel;
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
        option.series[currentChannel].data
      );
    }
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
  sketch = new window.p5((p) => defaultPlotSketch(p), "Psd");
  window.addEventListener("resize", resizeing);
});

onBeforeUnmount(() => {
  sketch.remove();
  sketch.remove = null;
  sketch = null;
  window.p5.prototype._registeredMethods.remove = []
  canvasP5 = null
  channelBars = null;
  timer && clearInterval(timer);
  window.removeEventListener("resize", resizeing);
});

defineExpose({
  setOption,
});
</script>
<style scoped></style>
