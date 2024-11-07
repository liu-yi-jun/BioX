<template>
  <!-- eig-column -->
  <div class="analysis">
    <div class="pdf-page-box" ref="pdf">
      <div class="pdf-page">
        <p class="pdf-title">BioMulti EEG-FNIRS Lite 心灵之旅报告</p>
        <p class="pdf-subtitle">基础信息</p>
        <ul class="pdf-base-info">
          <li>
            <span>姓名：</span>
            <span>刘奕俊</span>
          </li>
          <li>
            <span>年龄：</span>
            <span>18</span>
          </li>
          <li>
            <span>性别：</span>
            <span>男</span>
          </li>
          <li>
            <span>检查时间：</span>
            <span>2022-01-01</span>
          </li>
          <li>
            <span>检查号：</span>
            <span>0001</span>
          </li>
        </ul>
        <div class="pdf-line"></div>
        <p class="pdf-subtitle">脑电时域指标</p>
        <div class="pdf-section">
          <div class="pdf-label">Fp1</div>
          <p class="pdf-section-title">时域波形</p>
          <div class="pdf-chart-box" style="height: 170px">
            <lineChart
              id="eegSeriesTimeFp1Chart"
              ref="eegSeriesTimeFp1Chart"
              :channel="eegSeriesTimeFp1Channel"
              :numSeconds="numSeconds"
              :isAutoScaleY="true"
              :isShowName="false"
              :colors="heartRateColors"
              :yMax="1"
              :scale="0.8"
              :pixelRatio="2"
              :autoDraw="false"
              :yMin="0"
              style="width: 100%; height: 100%"
            ></lineChart>
          </div>
          <p class="pdf-section-title">节律波形</p>
          <div class="pdf-chart-box" style="height: 380px">
            <lineChart
              id="eegBandsTimeFp1Chart"
              ref="eegBandsTimeFp1Chart"
              :channel="eegBandsTimeFp1Channel"
              :numSeconds="numSeconds"
              :isAutoScaleY="true"
              :colors="bandsTimeColors"
              :yMax="1"
              :scale="0.8"
              :grid="{
                left: 70,
                right: 10,
                middle: 10,
                top: 10,
                bottom: 30,
              }"
              :pixelRatio="2"
              :autoDraw="false"
              :yMin="0"
              style="width: 100%; height: 100%"
            ></lineChart>
          </div>
        </div>
        <div class="pdf-section">
          <div class="pdf-label">Fp2</div>
          <p class="pdf-section-title">时域波形</p>
          <div class="pdf-chart-box" style="height: 170px">
            <lineChart
              id="eegSeriesTimeFp2Chart"
              ref="eegSeriesTimeFp2Chart"
              :channel="eegSeriesTimeFp1Channel"
              :numSeconds="numSeconds"
              :isAutoScaleY="true"
              :isShowName="false"
              :colors="heartRateColors"
              :yMax="1"
              :scale="0.8"
              :pixelRatio="2"
              :autoDraw="false"
              :yMin="0"
              style="width: 100%; height: 100%"
            ></lineChart>
          </div>
          <p class="pdf-section-title">节律波形</p>
          <div class="pdf-chart-box" style="height: 380px">
            <lineChart
              id="eegBandsTimeFp2Chart"
              ref="eegBandsTimeFp2Chart"
              :channel="eegBandsTimeFp1Channel"
              :numSeconds="numSeconds"
              :isAutoScaleY="true"
              :colors="bandsTimeColors"
              :yMax="1"
              :scale="0.8"
              :grid="{
                left: 70,
                right: 10,
                middle: 10,
                top: 10,
                bottom: 30,
              }"
              :pixelRatio="2"
              :autoDraw="false"
              :yMin="0"
              style="width: 100%; height: 100%"
            ></lineChart>
          </div>
        </div>
      </div>
      <div class="pdf-page">
        <div class="pdf-line"></div>
        <p class="pdf-subtitle">脑电频域指标</p>
        <div class="pdf-section">
          <div class="pdf-label">Fp1</div>
          <p class="pdf-section-title">脑电功率谱</p>
          <div class="pdf-chart-box" style="height: 230px">
            <lineChart
              id="1"
              ref="1"
              :channel="eegSeriesTimeFp1Channel"
              :numSeconds="numSeconds"
              :isAutoScaleY="true"
              :isShowName="false"
              :colors="heartRateColors"
              :yMax="1"
              :scale="0.8"
              :pixelRatio="2"
              :autoDraw="false"
              :yMin="0"
              style="width: 100%; height: 100%"
            ></lineChart>
          </div>
          <p class="pdf-section-title">脑电节律能量</p>
          <div class="pdf-chart-box" style="height: 240px">
            <lineChart
              id="2"
              ref="2"
              :channel="eegBandsTimeFp1Channel"
              :numSeconds="numSeconds"
              :isAutoScaleY="true"
              :colors="bandsTimeColors"
              :yMax="1"
              :scale="0.8"
              :grid="{
                left: 70,
                right: 10,
                middle: 10,
                top: 10,
                bottom: 30,
              }"
              :pixelRatio="2"
              :autoDraw="false"
              :yMin="0"
              style="width: 100%; height: 100%"
            ></lineChart>
          </div>
        </div>
        <div class="pdf-section">
          <div class="pdf-label">Fp2</div>
          <p class="pdf-section-title">脑电功率谱</p>
          <div class="pdf-chart-box" style="height: 230px">
            <lineChart
              id="3"
              ref="3"
              :channel="eegSeriesTimeFp1Channel"
              :numSeconds="numSeconds"
              :isAutoScaleY="true"
              :isShowName="false"
              :colors="heartRateColors"
              :yMax="1"
              :scale="0.8"
              :pixelRatio="2"
              :autoDraw="false"
              :yMin="0"
              style="width: 100%; height: 100%"
            ></lineChart>
          </div>
          <p class="pdf-section-title">脑电节律能量</p>
          <div class="pdf-chart-box" style="height: 240px">
            <lineChart
              id="4"
              ref="4"
              :channel="eegBandsTimeFp1Channel"
              :numSeconds="numSeconds"
              :isAutoScaleY="true"
              :colors="bandsTimeColors"
              :yMax="1"
              :scale="0.8"
              :grid="{
                left: 70,
                right: 10,
                middle: 10,
                top: 10,
                bottom: 30,
              }"
              :pixelRatio="2"
              :autoDraw="false"
              :yMin="0"
              style="width: 100%; height: 100%"
            ></lineChart>
          </div>
        </div>
        <div class="pdf-line" style="margin-top: 0"></div>
        <p class="pdf-subtitle">脑电专注力/放松度指标</p>
        <div class="pdf-chart-box" style="height: 200px">
          <lineChart
            id="5"
            ref="5"
            :numSeconds="numSeconds"
            :channel="concentrationChannel"
            :colors="concentrationColors"
            :isShowName="false"
            :yMax="1"
            :autoDraw="false"
            :yMin="0"
            style="width: 100%; height: 100%"
          ></lineChart>
        </div>
      </div>
      <div class="pdf-page">
        <div class="pdf-line"></div>
        <p class="pdf-subtitle">近红外时域指标</p>
        <div class="pdf-chart-box" style="height: 600px">
          <lineChart
            id="6"
            ref="6"
            :numSeconds="numSeconds"
            :channel="concentrationChannel"
            :colors="concentrationColors"
            :isShowName="false"
            :yMax="1"
            :autoDraw="false"
            :yMin="0"
            style="width: 100%; height: 100%"
          ></lineChart>
        </div>
        <div class="pdf-line" style="margin-top: 0"></div>
        <p class="pdf-subtitle">HRV指标</p>
        <p class="pdf-section-title">心率变化图</p>
        <div class="pdf-chart-box" style="height: 200px">
          <lineChart
            id="7"
            ref="7"
            :numSeconds="numSeconds"
            :channel="concentrationChannel"
            :colors="concentrationColors"
            :isShowName="false"
            :yMax="1"
            :autoDraw="false"
            :yMin="0"
            style="width: 100%; height: 100%"
          ></lineChart>
        </div>
        <p class="pdf-section-title">时域指标</p>
      </div>
    </div>

    <div class="eig-filter">
      <div class="filter-left">
        <a-select
          v-model:value="stateValue"
          style="width: 140px"
          placeholder="State"
          :disabled="isStart"
          :options="channelOptions"
        ></a-select>
      </div>
      <div class="filter-right">
        <a-button v-if="!isStart" type="primary" @click="changeStatus"
          >Start</a-button
        >
        <a-button danger type="primary" v-else @click="changeStatus"
          >Stop</a-button
        >
      </div>
    </div>
    <div class="eig-flex analysis-container">1</div>
    <div class="eig-shrink analysis-footer" style="height: 300px">
      <div>
        <p class="card-title">Concentration</p>
        <lineChart
          id="lineChart1"
          ref="lineChart1"
          :numSeconds="numSeconds"
          :channel="concentrationChannel"
          :colors="concentrationColors"
          :isShowName="false"
          :yMax="1"
          :autoDraw="false"
          :yMin="0"
          style="width: 100%; height: 100%"
        ></lineChart>
      </div>
      <div>
        <p class="card-title">HeartRate</p>
        <lineChart
          id="lineChart2"
          ref="lineChart2"
          :channel="heartRateChannel"
          :numSeconds="numSeconds"
          :isAutoScaleY="true"
          :autoDraw="false"
          :isShowName="false"
          :colors="heartRateColors"
          :yMax="1"
          :yMin="0"
          style="width: 100%; height: 100%"
        ></lineChart>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";
const isStart = ref(false);
const stateValue = ref<string>("Concentration");
import lineChart from "../../../components/lineChart.vue";
import type { SelectProps } from "ant-design-vue";
import { CustomBluetooth } from "../../../utils/bluetooth";
import { CustomDatabase } from "../../../utils/db";
import { useIndexStore } from "../../../store/index";
import { storeToRefs } from "pinia";
const ipcRenderer = require("electron").ipcRenderer;
const numSeconds = ref(3 * 60);
let pkgSourceData: any = [];

let db = new CustomDatabase();
let pkgMaxTime = numSeconds.value + 1;
let bluetooth = new CustomBluetooth();
const indexStore = useIndexStore();
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
const {
  play,
  recordId,
  playIndex,
  isEegClear,
  isDragSlider,
  isConnect,
  playGap,
  configData,
} = storeToRefs(indexStore);
let eegPkgDataList: any = [];
let irPkgDataList: any = [];
const eegSeriesTimeFp1Chart = ref<any>(null);
const eegSeriesTimeFp2Chart = ref<any>(null);
const eegBandsTimeFp1Chart = ref<any>(null);
const eegBandsTimeFp2Chart = ref<any>(null);
const lineChart1 = ref<any>(null);
const lineChart2 = ref<any>(null);
const pdf = ref<any>(null);
const eegSeriesTimeFp1Channel = ref(["Fp1"]);
const eegBandsTimeFp1Channel = ref([
  "EEG",
  "DELTA",
  "THETA",
  "ALPHA",
  "BETA",
  "GAMMA",
]);
const concentrationChannel = ref(["Fp1"]);
const heartRateChannel = ref(["Fp1"]);
const EEGTimeGap = 1000 / configData.value.eegFilter.sample_rate; // 采样间隔
let mindRestList: any = [];
let heartRateList: any = [];
const concentrationColors = ref({
  Fp1: "#8FDCFE",
});
const heartRateColors = ref({
  Fp1: "#8FDCFE",
});
const bandsTimeColors = ref({
  EEG: "#737373",
  DELTA: "#D5D5D6",
  THETA: "#A4A4FF",
  ALPHA: "#7BFFFF",
  BETA: "#FF72FF",
  GAMMA: "#E6E689",
});

const stateOptionsData = [
  {
    value: "Concentration",
    label: "Concentration",
  },
  {
    value: "Relaxation",
    label: "Relaxation",
  },
];
const channelOptions = ref<SelectProps["options"]>(stateOptionsData);

const changeStatus = () => {
  isStart.value = !isStart.value;
  exportPdf();
};

watch(isConnect, (newValue) => {
  if (newValue) {
    eegPkgDataList = [];
  }
});

onMounted(function () {
  initialize();
});

// 初始化
const initialize = () => {
  pkgSourceData = [];
  eegPkgDataList = [];
  // 正常模式
  bluetooth.addNotice(bluetoothNotice);
};

// 蓝牙数据通知
const bluetoothNotice = (data) => {
  handlePkgList(data);
};

// 数据包处理
const handlePkgList = (data) => {
  if (data.pkg_type === 1) {
    if (eegPkgDataList.length) {
      let gapTime =
        eegPkgDataList[eegPkgDataList.length - 1].time_mark -
        eegPkgDataList[0].time_mark;
      if (gapTime <= numSeconds.value * 1000) {
        mindRestList.push({
          value: [
            gapTime,
            (data.mindfulness_restfulness_s[0][parseState(stateValue.value)] +
              data.mindfulness_restfulness_s[1][parseState(stateValue.value)]) /
              2,
          ],
        });
        undatelineChart1("series");
        eegPkgDataList.push(data);
      }
    } else {
      eegPkgDataList.push(data);
    }
  } else if (data.pkg_type === 2) {
    if (irPkgDataList.length) {
      let gapTime =
        irPkgDataList[irPkgDataList.length - 1].time_mark -
        irPkgDataList[0].time_mark;

      if (gapTime <= numSeconds.value * 1000) {
        heartRateList.push({
          value: [gapTime, data.heart_rate],
        });
        undatelineChart2("series");
        irPkgDataList.push(data);
      }
    } else {
      irPkgDataList.push(data);
    }
  }
};

const undatelineChart1 = (type) => {
  switch (type) {
    case "series":
      lineChart1.value.setOption({
        series: [
          {
            name: concentrationChannel.value[0],
            data: mindRestList,
          },
        ],
      });
      break;
  }
};
const undatelineChart2 = (type) => {
  switch (type) {
    case "series":
      lineChart2.value.setOption({
        series: [
          {
            name: heartRateChannel.value[0],
            data: heartRateList,
          },
        ],
      });
      break;
  }
};

const parseState = (state: string) => {
  switch (state) {
    case "Concentration":
      return 0;
    case "Relaxation":
      return 1;
  }
  return 0;
};

const exportPdf = () => {
  if (isStart.value) {
    lineChart1.value.drawChart();
    downloadPDF(pdf.value);
  }
};

const downloadPDF = (page) => {
  html2canvas(page, {
    useCORS: true, //允许canvas画布内 可以跨域请求外部链接图片, 允许跨域请求。
    allowTaint: true, //允许跨域
    scale: 4, //设置放大倍数
    backgroundColor: "#ffffff", //背景色
  }).then((canvas) => {
    canvas2PDF(canvas);
  });
};

const canvas2PDF = (canvas) => {
  // 新建JsPDF对象
  const PDF = new jsPDF({
    orientation: "p", //参数： l：横向  p：纵向
    unit: "mm", //参数：测量单位（"pt"，"mm", "cm", "m", "in" or "px"）
    format: "a4", //A4纸
  });
  const ctx = canvas.getContext("2d");
  const a4w = 190;
  const a4h = 277; //A4大小，210mm x 297mm，四边各保留10mm *1.5的边距，显示区域190x277
  const imgHeight = Math.floor((a4h * canvas.width) / a4w); //按A4显示比例换算一页图像的像素高度
  let renderedHeight = 0;

  while (renderedHeight < canvas.height) {
    let page = document.createElement("canvas");
    page.width = canvas.width;
    page.height = Math.min(imgHeight, canvas.height - renderedHeight); //可能内容不足一页

    //用getImageData剪裁指定区域，并画到前面创建的canvas对象中
    page
      .getContext("2d")
      ?.putImageData(
        ctx.getImageData(
          0,
          renderedHeight,
          canvas.width,
          Math.min(imgHeight, canvas.height - renderedHeight)
        ),
        0,
        0
      );

    // canvas转图片数据保留10mm边距
    PDF.addImage(
      page.toDataURL("image/jpeg", 0.2),
      "JPEG",
      10,
      10,
      a4w,
      Math.min(a4h, (a4w * page.height) / page.width)
    );

    renderedHeight += imgHeight;

    //判断是否分页，如果后面还有内容，添加一个空页
    if (renderedHeight < canvas.height) {
      PDF.addPage();
    }
  }

  PDF.save("导出.pdf");
};

onBeforeUnmount(() => {
  bluetooth.removeNotice(bluetoothNotice);
  pkgSourceData = [];
  bluetooth = null;
  db = null;
});
</script>
<style scoped></style>
