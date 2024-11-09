<template>
  <div
    style="width: 100%; height: 100%; font-size: 0px"
    ref="LineChart"
    :id="id"
  ></div>
</template>

<script setup lang="ts">
import { CustomBluetooth } from "../utils/bluetooth";
import { useIndexStore } from "../store/index";
import { storeToRefs } from "pinia";
const indexStore = useIndexStore();
const { isMarker, markerList } = storeToRefs(indexStore);
const ipcRenderer = require("electron").ipcRenderer;
import {
  onMounted,
  ref,
  reactive,
  nextTick,
  onBeforeUnmount,
  watch,
} from "vue";
const LineChart = ref<HTMLElement | null>(null);
interface gridType {
  left: number;
  right: number;
  middle: number;
  top: number;
  bottom: number;
}
const props = defineProps({
  numSeconds: {
    type: Number,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  isAutoScaleY: {
    type: Boolean,
    default: false,
  }, // 是否自动缩放 y 轴
  yMax: {
    type: Number,
    default: 1,
  },
  yMin: {
    type: Number,
    default: 0,
  },
  channel: {
    type: Array as () => Array<string>,
    required: true,
    default: () => ["#"],
  },
  colors: {
    type: Object,
    required: true,
  },
  isShowName: {
    type: Boolean,
    default: true,
  },
  // 图像的缩放
  scale: {
    type: Number,
    default: 1,
  },
  //清晰度
  pixelRatio: {
    type: Number,
    default: 1,
  },
  autoDraw: {
    type: Boolean,
    default: true,
  },
  grid: {
    type: Object as () => gridType,
    default: () => ({
      left: 60,
      right: 20,
      middle: 30,
      top: 18,
      bottom: 30,
    }),
  },
  isMerge: {
    // 是否合并，线都在一个图表中
    type: Boolean,
    default: false,
  },
  seriesChannel: {
    type: Array as () => Array<string>,
    default: () => [],
  },
});

let numSeconds = props.numSeconds;
const id = ref<string>(props.id);
let maxSeconds = 20;

let canvasP5: any;
// 自定义绘制
let customCanvas: any;
let customCtx: any;
let offscreenCanvas: any;
let offscreenCtx: any;
let channel = props.channel;
let seriesChannel = props.seriesChannel;
let channelBars: any = [];
let sketch: any = null;
let timer: any = null;
let canvasWidth = 0;
let canvasHeight = 0;
const leftPadding = props.grid.left;
const rightPadding = props.grid.right;
const topPadding = props.grid.top;
const middlePadding = props.grid.middle;
const bottomPadding = props.grid.bottom;
const minGap = 0.001;
const colors = props.colors;

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
  series: any[] = [];

  autoscaleMax: number = props.yMax;
  autoscaleMin: number = props.yMin;
  yMax: number | undefined;
  yMin: number | undefined;
  xScalingFactor: number = 1;
  yScalingFactor: number = 1;
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
    if (this.lineColor) {
      this.plot.setLineColor(this.lineColor);
    }
    // this.plot.setLineWidth(0.8);
    this.plot.setYLim(this.autoscaleMin, this.autoscaleMax);
    // this.plot.getXAxis().setLineColor("#DDDDDD");
    // this.plot.getYAxis().setLineColor("#6E7079");
    // this.plot.getXAxis().setFontColor("#787878");
    // this.plot.getYAxis().setFontColor("#787878");
    this.plot.getXAxis().setLineColor("#000");
    this.plot.getYAxis().setLineColor("#000");
    this.plot.getXAxis().setFontColor("#000");
    this.plot.getYAxis().setFontColor("#000");
    if (props.isShowName) {
      this.plot.getYAxis().setAxisLabelText(this.name);
    }
    this.plot.getYAxis().getAxisLabel().setOffset(50);
    this.plot.getYAxis().setTickLabelOffset(2.5);
    this.calcScaling();
    // this.plot.getYAxis().setRotate(false);
    offscreenCtx.lineWidth = 1;
    if (props.isMerge) {
      for (var i = 0; i < seriesChannel.length; i++) {
        this.plot.addLayer(seriesChannel[i], []);
      }
    }
  }

  updateSeries(name, series) {
    if (!series || !series.length) {
      return;
    }
    this.series = series;
    let points: any = [];
    if (props.isAutoScaleY) {
      if (this.yMin === undefined) {
        this.autoscaleMin = Number.MAX_VALUE;
      }
      if (this.yMax === undefined) {
        this.autoscaleMax = -Number.MAX_VALUE;
      }
    }

    for (var i = 0; i < series.length; i++) {
      if (props.isAutoScaleY) {
        if (series[i][1] > this.autoscaleMax) {
          this.autoscaleMax = series[i][1];
        }
        if (series[i][1] < this.autoscaleMin) {
          this.autoscaleMin = series[i][1];
        }
      }

      points[i] = new window.GPoint(series[i][0] / 1000, series[i][1]);
    }
    if (props.isAutoScaleY) {
      this.setYLim();
    }
    if (props.isMerge) {
      this.plot.getLayer(name).setPoints(points);
    } else {
      this.plot.setPoints(points);
    }
  }

  clearPoints() {
    for (let i = 0; i < seriesChannel.length; i++) {
      this.plot.getLayer(seriesChannel[i]).setPoints([]);
    }
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
    if (!props.isMerge) {
      let plotPoints = this.plot.mainLayer.plotPoints;
      this.handleCustomLines(plotPoints, this.lineColor);
    } else {
      for (var i = 0; i < seriesChannel.length; i++) {
        let plotPoints = this.plot.getLayer(seriesChannel[i]).plotPoints;
        this.handleCustomLines(plotPoints, colors[seriesChannel[i]]);
      }
    }
  }

  handleCustomLines(plotPoints, lineColor) {
    if (plotPoints.length > 0) {
      offscreenCtx.save();
      offscreenCtx.scale(props.pixelRatio, props.pixelRatio); //画笔缩放
      offscreenCtx.strokeStyle = lineColor;
      offscreenCtx.translate(
        this.plot.pos[0] + this.plot.mar[1],
        this.plot.pos[1] + this.plot.mar[2] + this.plot.dim[1]
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
  if (LineChart.value) {
    // 图像缩放props.scale
    canvasWidth = (LineChart.value.clientWidth * 1) / props.scale;
    canvasHeight = (LineChart.value.clientHeight * 1) / props.scale;
  }
};

// 更新配置/数据
const setOption = (option) => {
  if (option.channel) {
    if (props.isMerge) {
      channelBars.clearPoints();
    } else {
      channel = option.channel;
      updatelayout();
    }
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
      if (props.isMerge) {
        for (var i = 0; i < seriesChannel.length; i++) {
          channelBars[currentChannel].updateSeries(
            option.series[currentChannel][i].name,
            option.series[currentChannel][i].data
          );
        }
      } else {
        channelBars[currentChannel].updateSeries(
          option.series[currentChannel].name,
          option.series[currentChannel].data
        );
      }
    }
  }
};

// 更新布局
const updatelayout = () => {
  getWH();
  // 画布缩放props.pixelRatio
  canvasP5.createCanvas(
    canvasWidth * props.pixelRatio,
    canvasHeight * props.pixelRatio
  );
  offscreenCanvas.width = canvasWidth * props.pixelRatio;
  offscreenCanvas.height = canvasHeight * props.pixelRatio;
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
    customCanvas = document.getElementById(id.value)?.querySelector("canvas");

    customCtx = customCanvas.getContext("2d");
    offscreenCanvas = document.createElement("canvas");
    offscreenCtx = offscreenCanvas.getContext("2d");

    updatelayout();
    customCanvas.style.width = "100%";
    customCanvas.style.height = "100%";
    if (!props.autoDraw) {
      p.noLoop();
    }
  };

  p.draw = function () {
    p.background(255);
    canvasP5.scale(props.pixelRatio); //画笔缩放
    offscreenCtx.clearRect(
      0,
      0,
      canvasWidth * props.pixelRatio,
      canvasHeight * props.pixelRatio
    );

    let fps = p.frameRate();
    p.text("FPS: " + fps.toFixed(2), canvasWidth - 85, 10);
    for (var i = 0; i < channel.length; i++) {
      channelBars[i].draw();
    }
    customCtx.drawImage(offscreenCanvas, 0, 0, canvasWidth, canvasHeight);
  };
};

const drawChart = () => {
  canvasP5.background(255);
  offscreenCtx.clearRect(
    0,
    0,
    canvasWidth * props.pixelRatio,
    canvasHeight * props.pixelRatio
  );
  for (var i = 0; i < channel.length; i++) {
    channelBars[i].draw();
  }
  customCtx.drawImage(offscreenCanvas, 0, 0, canvasWidth, canvasHeight);
};

onMounted(() => {
  sketch && sketch.remove();
  sketch = new window.p5((p) => defaultPlotSketch(p), id.value);
  window.addEventListener("resize", resizeing);
});

onBeforeUnmount(() => {
  sketch.remove();
  sketch.remove = null;
  sketch = null;
  window.p5.prototype._registeredMethods.remove = [];
  channelBars = null;
  customCanvas = null;
  customCtx = null;
  offscreenCanvas = null;
  offscreenCtx = null;
  canvasP5 = null;
  timer && clearInterval(timer);
  window.removeEventListener("resize", resizeing);
});

defineExpose({
  setOption,
  drawChart,
});
</script>
<style scoped></style>
