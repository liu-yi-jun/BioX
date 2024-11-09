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
              :channel="eegTimeSeriesFp1Channel"
              :numSeconds="numSeconds"
              :isAutoScaleY="true"
              :isShowName="false"
              :colors="eegTimeSeriesColors"
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
              :channel="eegBandsTimeChannel"
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
              :channel="eegSeriesTimeFp2Channel"
              :numSeconds="numSeconds"
              :isAutoScaleY="true"
              :isShowName="false"
              :colors="eegTimeSeriesColors"
              :yMax="1"
              :scale="0.8"
              :pixelRatio="2"
              :autoDraw="false"
              :yMin="0"
              style="width: 100%; height: 100%"
            ></lineChart>
          </div>
          <p class="pdf-section-title">节律波形</p>
          <div class="pdf-chart-box" style="height: 380px; margin-bottom: 0">
            <lineChart
              id="eegBandsTimeFp2Chart"
              ref="eegBandsTimeFp2Chart"
              :channel="eegBandsTimeChannel"
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
        <div class="pdf-line" style="margin-top: 0"></div>
        <p class="pdf-subtitle">脑电频域指标</p>
        <div class="pdf-section">
          <div class="pdf-label">Fp1</div>
          <p class="pdf-section-title">脑电功率谱</p>
          <div class="pdf-chart-box" style="height: 210px">
            <lineChart
              id="eegPsdFp1Chart"
              ref="eegPsdFp1Chart"
              :channel="eegPsdFp1Channel"
              :numSeconds="eegPsdMaxFreq"
              :isAutoScaleY="false"
              :isShowName="false"
              :colors="eegPsdColors"
              :yMax="100"
              :yMin="-60"
              :scale="0.8"
              :pixelRatio="2"
              :autoDraw="false"
              style="width: 100%; height: 100%"
            ></lineChart>
          </div>
          <p class="pdf-section-title">脑电节律能量</p>
          <div class="pdf-chart-box" style="height: 240px">
            <lineChart
              id="eegRelatedPowerFp1Chart"
              ref="eegRelatedPowerFp1Chart"
              :channel="['Fp1']"
              :isShowName="false"
              :isMerge="true"
              :seriesChannel="eegRelatedPowerChannel"
              :numSeconds="numSeconds"
              :isAutoScaleY="true"
              :colors="relatedPowerColors"
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
          <div class="pdf-chart-box" style="height: 210px">
            <lineChart
              id="eegPsdFp2Chart"
              ref="eegPsdFp2Chart"
              :channel="eegPsdFp2Channel"
              :numSeconds="eegPsdMaxFreq"
              :isAutoScaleY="false"
              :isShowName="false"
              :colors="eegPsdColors"
              :yMax="100"
              :yMin="-60"
              :scale="0.8"
              :pixelRatio="2"
              :autoDraw="false"
              style="width: 100%; height: 100%"
            ></lineChart>
          </div>
          <p class="pdf-section-title">脑电节律能量</p>
          <div class="pdf-chart-box" style="height: 240px">
            <lineChart
              id="eegRelatedPowerFp2Chart"
              ref="eegRelatedPowerFp2Chart"
              :channel="['Fp2']"
              :isMerge="true"
              :seriesChannel="eegRelatedPowerChannel"
              :numSeconds="numSeconds"
              :isAutoScaleY="true"
              :isShowName="false"
              :colors="relatedPowerColors"
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
        <div class="pdf-chart-box" style="height: 200px; margin-bottom: 0">
          <lineChart
            id="mindRestChart"
            ref="mindRestChart"
            :numSeconds="numSeconds"
            :channel="concentrationChannel"
            :colors="concentrationColors"
            :isShowName="false"
            :scale="0.8"
            :pixelRatio="2"
            :yMax="1"
            :autoDraw="false"
            :yMin="0"
            style="width: 100%; height: 100%"
          ></lineChart>
        </div>
      </div>
      <div class="pdf-page">
        <div class="pdf-line" style="margin-top: 0"></div>
        <p class="pdf-subtitle">近红外时域指标</p>
        <div class="pdf-chart-box" style="height: 600px">
          <lineChart
            id="irTimeSerie"
            ref="irTimeSerie"
            :isMerge="true"
            :seriesChannel="irTimeSerieChannel"
            :channel="irTimeChannel"
            :numSeconds="numSeconds"
            :colors="irTimeColors"
            :isAutoScaleY="true"
            :autoDraw="false"
            :isShowName="true"
            :grid="{
              left: 70,
              right: 10,
              middle: 10,
              top: 10,
              bottom: 30,
            }"
            :scale="0.8"
            :pixelRatio="2"
            :yMax="1"
            :yMin="0"
            style="width: 100%; height: 100%"
          ></lineChart>
        </div>
        <div class="pdf-line" style="margin-top: 0"></div>
        <p class="pdf-subtitle">HRV指标</p>
        <p class="pdf-section-title">心率变化图</p>
        <div class="pdf-chart-box" style="height: 200px">
          <lineChart
            id="HeartRateChart"
            ref="HeartRateChart"
            :numSeconds="numSeconds"
            :channel="concentrationChannel"
            :colors="concentrationColors"
            :isShowName="false"
            :scale="0.8"
            :pixelRatio="2"
            :yMax="200"
            :autoDraw="false"
            :yMin="0"
            style="width: 100%; height: 100%"
          ></lineChart>
        </div>
        <p class="pdf-section-title">时域指标</p>
        <a-table
          class="time-indicator-table"
          :columns="timeIndicatorTableColumns"
          :data-source="timeIndicatorTable"
          bordered
          :pagination="false"
        >
        </a-table>
      </div>
      <div class="pdf-page">
        <p class="pdf-section-title">频域指标</p>
        <a-table
          class="time-indicator-table"
          :columns="frequencyIndicatorTableColumns"
          :data-source="frequencyIndicatorTable"
          bordered
          :pagination="false"
        >
        </a-table>
        <p class="pdf-section-title" style="margin-top: 15px">
          频域指标频带划分
        </p>
        <a-table
          class="time-indicator-table"
          :columns="frequencyIndicatorBandTableColumns"
          :data-source="frequencyIndicatorBandTable"
          bordered
          :pagination="false"
        >
        </a-table>
      </div>
    </div>

    <div class="eig-filter">
      <div class="filter-left">
        <a-select
          v-model:value="stateValue"
          style="width: 140px"
          placeholder="State"
          :disabled="configData.hrv.isAnalysis"
          :options="channelOptions"
        ></a-select>
      </div>
      <div class="filter-right">
        <a-button type="primary" @click="drawChart">drawChart</a-button>
        <a-button type="primary" @click="calculate">calculate</a-button>
        <a-button
          v-if="!configData.hrv.isAnalysis"
          type="primary"
          @click="changeStatus"
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
          :autoDraw="true"
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
          :isAutoScaleY="false"
          :autoDraw="true"
          :isShowName="false"
          :colors="heartRateColors"
          :yMax="200"
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
const stateValue = ref<string>("Concentration");
import lineChart from "../../../components/lineChart.vue";
import type { SelectProps } from "ant-design-vue";
import { CustomBluetooth } from "../../../utils/bluetooth";
import { CustomDatabase } from "../../../utils/db";
import { useIndexStore } from "../../../store/index";
import { storeToRefs } from "pinia";
const ipcRenderer = require("electron").ipcRenderer;
const numSeconds = ref(30);
const eegPsdMaxFreq = ref(125);
let pkgSourceData: any = [];
let hrvResult: any = {};

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
const eegPsdFp1Chart = ref<any>(null);
const eegPsdFp2Chart = ref<any>(null);
const eegRelatedPowerFp1Chart = ref<any>(null);
const eegRelatedPowerFp2Chart = ref<any>(null);
const lineChart1 = ref<any>(null);
const lineChart2 = ref<any>(null);
const mindRestChart = ref<any>(null);
const HeartRateChart = ref<any>(null);
const irTimeSerie = ref<any>(null);
const pdf = ref<any>(null);
const eegTimeSeriesFp1Channel = ref(["Fp1"]);
const eegSeriesTimeFp2Channel = ref(["Fp2"]);
import { message } from "ant-design-vue";
const eegBandsTimeChannel = ref([
  "EEG",
  "DELTA",
  "THETA",
  "ALPHA",
  "BETA",
  "GAMMA",
]);
const eegRelatedPowerChannel = ref([
  "γ wave",
  "β wave",
  "α wave",
  "θ wave",
  "δ wave",
]);
const eegPsdFp1Channel = ref(["Fp1"]);
const eegPsdFp2Channel = ref(["Fp2"]);

const concentrationChannel = ref(["Fp1"]);
const heartRateChannel = ref(["Fp1"]);
const EEGTimeGap = 1000 / configData.value.eegFilter.sample_rate; // 采样间隔
let mindRestList: any = [];
let heartRateList: any = [];
const eegTimeSeriesColors = ref({
  Fp1: "#8FDCFE",
  Fp2: "#8FDCFE",
});

const eegPsdColors = ref({
  Fp1: "#8FDCFE",
  Fp2: "#8FDCFE",
});

const relatedPowerColors = ref({
  "γ wave": "rgba(7, 33, 230, 0.8)",
  "β wave": "rgba(76, 104, 255, 0.6)",
  "α wave": "rgba(122, 131, 255, 0.6)",
  "θ wave": "rgba(161, 156, 255, 0.6)",
  "δ wave": "rgba(228, 205, 255, 0.6",
});

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

const irTimeSerieChannel = ref(["HbO", "HbR", "HbT"]);
const irTimeChannel = ref([
  "S1D1",
  "S1D2",
  "S1D3",
  "S1D4",
  "S2D5",
  "S2D6",
  "S2D7",
  "S2D8",
]);

const irTimeColors = ref({
  HbO: "#ff0101",
  HbR: "#ffba01",
  HbT: "#0073ff",
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

// 时域指标表格
interface indicatorTableType {
  key: number;
  parame1: string;
  value1: string;
  unit1: string;
  parame2: string;
  value2: string;
  unit2: string;
}
const timeIndicatorTable = ref<indicatorTableType[]>([]);
const timeIndicatorTableSharedOnCell = (_, index) => {
  if (index === 0 || index === 6 || index === 9) {
    return {
      colSpan: 0,
    };
  }
};
const timeIndicatorTableColumns = [
  {
    title: "参数",
    dataIndex: "parame1",
    customCell: (_, index) => {
      if (index === 0 || index === 6 || index === 9) {
        return {
          colSpan: 6,
        };
      } else {
        return {
          colSpan: 1,
        };
      }
    },
  },
  {
    title: "数值",
    dataIndex: "value1",
    customCell: timeIndicatorTableSharedOnCell,
  },
  {
    title: "单位",
    dataIndex: "unit1",
    customCell: timeIndicatorTableSharedOnCell,
  },
  {
    title: "参数",
    dataIndex: "parame2",
    customCell: timeIndicatorTableSharedOnCell,
  },
  {
    title: "数值",
    dataIndex: "value2",
    customCell: timeIndicatorTableSharedOnCell,
  },
  {
    title: "单位",
    dataIndex: "unit2",
    customCell: timeIndicatorTableSharedOnCell,
  },
];

// 频域指标表格
const frequencyIndicatorTable = ref<indicatorTableType[]>([]);
const frequencyIndicatorTableSharedOnCell = (_, index) => {
  if (index === 0 || index === 3 || index === 7 || index === 10) {
    return {
      colSpan: 0,
    };
  }
};
const frequencyIndicatorTableColumns = [
  {
    title: "参数",
    dataIndex: "parame1",
    customCell: (_, index) => {
      if (index === 0 || index === 3 || index === 7 || index === 10) {
        return {
          colSpan: 6,
        };
      } else {
        return {
          colSpan: 1,
        };
      }
    },
  },
  {
    title: "数值",
    dataIndex: "value1",
    customCell: frequencyIndicatorTableSharedOnCell,
  },
  {
    title: "单位",
    dataIndex: "unit1",
    customCell: frequencyIndicatorTableSharedOnCell,
  },
  {
    title: "参数",
    dataIndex: "parame2",
    customCell: frequencyIndicatorTableSharedOnCell,
  },
  {
    title: "数值",
    dataIndex: "value2",
    customCell: frequencyIndicatorTableSharedOnCell,
  },
  {
    title: "单位",
    dataIndex: "unit2",
    customCell: frequencyIndicatorTableSharedOnCell,
  },
];

//频域指标频带划分
const frequencyIndicatorBandTable = ref<indicatorTableType[]>([]);
const frequencyIndicatorBandTableSharedOnCell = (_, index) => {
  if (index === 0) {
    return {
      colSpan: 0,
    };
  }
};
const frequencyIndicatorBandTableColumns = [
  {
    title: "参数",
    dataIndex: "parame1",
    customCell: (_, index) => {
      if (index === 0) {
        return {
          colSpan: 6,
        };
      } else {
        return {
          colSpan: 1,
        };
      }
    },
  },
  {
    title: "数值",
    dataIndex: "value1",
    customCell: frequencyIndicatorBandTableSharedOnCell,
  },
  {
    title: "单位",
    dataIndex: "unit1",
    customCell: frequencyIndicatorBandTableSharedOnCell,
  },
  {
    title: "参数",
    dataIndex: "parame2",
    customCell: frequencyIndicatorBandTableSharedOnCell,
  },
  {
    title: "数值",
    dataIndex: "value2",
    customCell: frequencyIndicatorBandTableSharedOnCell,
  },
  {
    title: "单位",
    dataIndex: "unit2",
    customCell: frequencyIndicatorBandTableSharedOnCell,
  },
];

// 初始化频域指标频带划分
const initFrequencyIndicatorBandTable = () => {
  let parameList1 = ["频带划分", "ULF", "LF"];
  let unitList = ["", "Hz", "Hz"];
  let valueList1 = ["", "0-0.0033", "0.040-0.150"];
  let parameList2 = ["", "VLF", "HF"];
  let valueList2 = ["", "0.000-0.040", "0.150-0.400"];

  for (let i = 0; i < parameList1.length; i++) {
    frequencyIndicatorBandTable.value.push({
      key: i,
      parame1: parameList1[i],
      unit1: unitList[i],
      value1: valueList1[i],
      parame2: parameList2[i],
      unit2: unitList[i],
      value2: valueList2[i],
    });
  }
};

// 初始化时域指标
const initTimeIndicatorTable = () => {
  let parameList1 = [
    "NNI参数",
    "RR间隔数量（NNI）",
    "平均RR间隔时间（NNI_Average）",
    "RR间隔最小值(NNI_Min)",
    "RR间隔最大值(NNI_Max)",
    "SDNN",
    "NNI间隔参数",
    "相邻RR间隔平均值(Delta_NNI)",
    "相邻RR间隔最大值(Delta_NNI_Max)",
    "心率HR参数",
    "心率平均值(HR_Average)",
    "心率最大值(HR_Max)",
  ];
  let unitList1 = [
    "",
    "-",
    "ms",
    "ms",
    "ms",
    "ms",
    "",
    "ms",
    "ms",
    "",
    "bpm",
    "bpm",
  ];
  let parameList2 = [
    "",
    "RMSSD",
    "NN20",
    "NN50",
    "PNN20",
    "PNN50",
    "",
    "相邻RR间隔最小值(Delta_NNI_Min)",
    "相邻RR间隔标准差(SD_Delta_NNI)",
    "",
    "心率最小值(HR_Min)",
    "心率标准差(SD_HR)",
  ];
  let unitList2 = [
    "",
    "ms",
    "-",
    "-",
    "-",
    "-",
    "",
    "ms",
    "ms",
    "",
    "bpm",
    "bpm",
  ];

  for (let i = 0; i < parameList1.length; i++) {
    timeIndicatorTable.value.push({
      key: i,
      parame1: parameList1[i],
      unit1: unitList1[i],
      value1: hrvResult.timeIndicatorValue1[i],
      parame2: parameList2[i],
      unit2: unitList2[i],
      value2: hrvResult.timeIndicatorValue2[i],
    });
  }
};

// 初始化频域指标
const initFrequencyIndicatorTable = () => {
  let parameList1 = [
    "功率最大频率点",
    "ULF",
    "LF",
    "绝对功率参数",
    "ULF",
    "LF",
    "TP",
    "相对功率参数",
    "ULF",
    "LF",
    "对数功率参数",
    "ULF",
    "LF",
  ];
  let unitList1 = [
    "",
    "Hz",
    "Hz",
    "",
    "ms^2",
    "ms^2",
    "ms^2",
    "",
    "%",
    "%",
    "",
    "-",
    "-",
  ];
  let parameList2 = [
    "",
    "VLF",
    "HF",
    "",
    "VLF",
    "HE",
    "LF/HF Ration",
    "",
    "VLF",
    "HF",
    "",
    "VLF",
    "HF",
  ];
  let unitList2 = [
    "",
    "Hz",
    "Hz",
    "",
    "ms^2",
    "ms^2",
    "-",
    "",
    "%",
    "%",
    "",
    "-",
    "-",
  ];

  for (let i = 0; i < parameList1.length; i++) {
    frequencyIndicatorTable.value.push({
      key: i,
      parame1: parameList1[i],
      unit1: unitList1[i],
      value1: hrvResult.frequencyIndicatorValue1[i],
      parame2: parameList2[i],
      unit2: unitList2[i],
      value2: hrvResult.frequencyIndicatorValue2[i],
    });
  }
};

const changeStatus = () => {
  if (!isConnect.value) {
    return message.error("请先连接蓝牙");
  }
  configData.value.hrv.isAnalysis = !configData.value.hrv.isAnalysis;
  ipcRenderer.send(
    "change-config-field",
    JSON.stringify({
      field: "hrv-start-analysis",
      config: configData.value,
    })
  );
  // exportPdf();
};

watch(isConnect, (newValue) => {
  if (newValue) {
    eegPkgDataList = [];
  }
});

onMounted(() => {
  ipcRenderer.on("calculate-hrv-result", calculateHrvResult);

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
  if (configData.value.hrv.isAnalysis) {
    handlePkgList(data);
  }
};

// 数据包处理
const handlePkgList = (data) => {
  if (data.pkg_type === 1) {
    if (eegPkgDataList.length) {
      let gapTime =
        eegPkgDataList[eegPkgDataList.length - 1].time_mark -
        eegPkgDataList[0].time_mark;
      if (gapTime <= numSeconds.value * 1000) {
        mindRestList.push([
          gapTime,
          (data.mindfulness_restfulness_s[0][parseState(stateValue.value)] +
            data.mindfulness_restfulness_s[1][parseState(stateValue.value)]) /
            2,
        ]);
        undatelineChart(
          lineChart1,
          concentrationChannel.value[0],
          mindRestList
        );
        eegPkgDataList.push(data);
      }
    } else {
      eegPkgDataList.push(data);
    }
    // undateEegTimeSerie();
  } else if (data.pkg_type === 2) {
    if (irPkgDataList.length) {
      let gapTime =
        irPkgDataList[irPkgDataList.length - 1].time_mark -
        irPkgDataList[0].time_mark;
      if (gapTime <= numSeconds.value * 1000) {
        if (heartRateList.length > 2) {
          heartRateList.unshift();
        }
        heartRateList.push([gapTime, data.heart_rate]);
        undatelineChart(lineChart2, heartRateChannel.value[0], heartRateList);
        irPkgDataList.push(data);
      }
    } else {
      irPkgDataList.push(data);
    }
  }
};

const calculateHrvResult = (event, data) => {
  console.log("calculateHrvResult", data);

  let NNI = data.timedomain_NNI;
  // NNI 参数：RR间隔数量（NNI）、平均RR间隔时间(NNI_Average)、RR间隔最小值(NNI_Min)、RR间隔最大值(NNI_Max)、SDNN
  // RMSSD、NN20、NN50、pNN20、pNN50
  let DIFF = data.timedomain_NNI_diff;
  //NNI差值参数：相邻RR间隔平均值、相邻RR间隔最小值、相邻RR间隔最大值、相邻RR间隔标准差
  let HR = data.timedomain_HR;
  //HR参数：HR平均值、HR最小值、HR最大值、HR标准差
  hrvResult.timeIndicatorValue1 = [
    "",
    NNI[0],
    NNI[1],
    NNI[2],
    NNI[3],
    NNI[4],
    "",
    DIFF[0],
    DIFF[2],
    "",
    HR[0],
    HR[2],
  ];
  hrvResult.timeIndicatorValue2 = [
    "",
    NNI[5],
    NNI[6],
    NNI[7],
    NNI[8],
    NNI[9],
    "",
    DIFF[1],
    DIFF[3],
    "",
    HR[1],
    HR[3],
  ];
  initTimeIndicatorTable();
  //-------------------------------------------------------------------
  let max_f = data.hrv_fdomain_max_f; //功率最大频率点：ULF、VLF、LF、HF
  let spec = data.hrv_fdomain_spec; //绝对ULF、VLF、LF、HF，TP、LF/HF，
  let percent = data.hrv_fdomain_percent; //相对功率：ULF、VLF、LF、HF
  let spec_db = data.hrv_fdomain_spec_db; //对数功率：ULF、VLF、LF、HF、TP

  hrvResult.frequencyIndicatorValue1 = [
    "",
    max_f[0],
    max_f[2],
    "",
    spec[0],
    spec[2],
    spec[4],
    "",
    percent[0],
    percent[2],
    "",
    spec_db[0],
    spec_db[2],
  ];
  hrvResult.frequencyIndicatorValue2 = [
    "",
    max_f[1],
    max_f[3],
    "",
    spec[1],
    spec[3],
    spec[5],
    "",
    percent[1],
    percent[3],
    "",
    spec_db[1],
    spec_db[3],
  ];
  initFrequencyIndicatorTable();
  //-------------------------------------------------------------------
  initFrequencyIndicatorBandTable();
};

const undatelineChart = (refName, name, data, isDraw = false) => {
  refName.value.setOption({
    series: [
      {
        name,
        data: data,
      },
    ],
  });
  isDraw && refName.value.drawChart();
};

// 更新eeg时域波形数据
const undateEegTimeSerie = () => {
  eegSeriesTimeFp1Chart.value.setOption({
    series: [
      {
        name: "Fp1",
        data: conversionPkgtoSeriesData("Fp1", numSeconds.value),
      },
    ],
  });
  eegSeriesTimeFp2Chart.value.setOption({
    series: [
      {
        name: "Fp2",
        data: conversionPkgtoSeriesData("Fp2", numSeconds.value),
      },
    ],
  });
  eegSeriesTimeFp1Chart.value.drawChart();
  eegSeriesTimeFp2Chart.value.drawChart();
};

// 更新eeg节律波形数据
const undateEegBandsTime = () => {
  eegBandsTimeFp1Chart.value.setOption({
    series: [
      {
        name: "EEG",
        data: conversionPkgtoSeriesData("F1", numSeconds.value),
      },
      {
        name: "DELTA",
        data: conversionPkgtoBarnsTimeOrRelated(
          "time_e_s",
          "F1",
          0,
          numSeconds.value
        ),
      },
      {
        name: "THETA",
        data: conversionPkgtoBarnsTimeOrRelated(
          "time_e_s",
          "F1",
          1,
          numSeconds.value
        ),
      },
      {
        name: "ALPHA",
        data: conversionPkgtoBarnsTimeOrRelated(
          "time_e_s",
          "F1",
          2,
          numSeconds.value
        ),
      },
      {
        name: "BETA",
        data: conversionPkgtoBarnsTimeOrRelated(
          "time_e_s",
          "F1",
          3,
          numSeconds.value
        ),
      },
      {
        name: "GAMMA",
        data: conversionPkgtoBarnsTimeOrRelated(
          "time_e_s",
          "F1",
          4,
          numSeconds.value
        ),
      },
    ],
  });

  eegBandsTimeFp2Chart.value.setOption({
    series: [
      {
        name: "EEG",
        data: conversionPkgtoSeriesData("F2", numSeconds.value),
      },
      {
        name: "DELTA",
        data: conversionPkgtoBarnsTimeOrRelated(
          "time_e_s",
          "F2",
          0,
          numSeconds.value
        ),
      },
      {
        name: "THETA",
        data: conversionPkgtoBarnsTimeOrRelated(
          "time_e_s",
          "F2",
          1,
          numSeconds.value
        ),
      },
      {
        name: "ALPHA",
        data: conversionPkgtoBarnsTimeOrRelated(
          "time_e_s",
          "F2",
          2,
          numSeconds.value
        ),
      },
      {
        name: "BETA",
        data: conversionPkgtoBarnsTimeOrRelated(
          "time_e_s",
          "F2",
          3,
          numSeconds.value
        ),
      },
      {
        name: "GAMMA",
        data: conversionPkgtoBarnsTimeOrRelated(
          "time_e_s",
          "F2",
          4,
          numSeconds.value
        ),
      },
    ],
  });
  eegBandsTimeFp1Chart.value.drawChart();
  eegBandsTimeFp2Chart.value.drawChart();
};

// 更新eeg脑电功率谱数据
const undateEegPsd = () => {
  eegPsdFp1Chart.value.setOption({
    series: [
      {
        name: eegPsdFp1Channel.value[0],
        data: conversionPkgtoPsd(eegPsdFp1Channel.value[0]),
      },
    ],
  });
  eegPsdFp2Chart.value.setOption({
    series: [
      {
        name: eegPsdFp2Channel.value[0],
        data: conversionPkgtoPsd(eegPsdFp2Channel.value[0]),
      },
    ],
  });
  eegPsdFp1Chart.value.drawChart();
  eegPsdFp2Chart.value.drawChart();
};
// 更新eeg脑电节律能量数据
const undateRelatedPower = () => {
  eegRelatedPowerFp1Chart.value.setOption({
    series: [
      [
        {
          name: "γ wave",
          data: conversionPkgtoBarnsTimeOrRelated(
            "psd_relative_percent_s",
            "Fp1",
            4,
            numSeconds.value
          ),
        },
        {
          name: "β wave",
          data: conversionPkgtoBarnsTimeOrRelated(
            "psd_relative_percent_s",
            "Fp1",
            3,
            numSeconds.value
          ),
        },
        {
          name: "α wave",
          data: conversionPkgtoBarnsTimeOrRelated(
            "psd_relative_percent_s",
            "Fp1",
            2,
            numSeconds.value
          ),
        },
        {
          name: "θ wave",
          data: conversionPkgtoBarnsTimeOrRelated(
            "psd_relative_percent_s",
            "Fp1",
            1,
            numSeconds.value
          ),
        },
        {
          name: "δ wave",
          data: conversionPkgtoBarnsTimeOrRelated(
            "psd_relative_percent_s",
            "Fp1",
            0,
            numSeconds.value
          ),
        },
      ],
    ],
  });
  eegRelatedPowerFp2Chart.value.setOption({
    series: [
      [
        {
          name: "γ wave",
          data: conversionPkgtoBarnsTimeOrRelated(
            "psd_relative_percent_s",
            "Fp2",
            4,
            numSeconds.value
          ),
        },
        {
          name: "β wave",
          data: conversionPkgtoBarnsTimeOrRelated(
            "psd_relative_percent_s",
            "Fp2",
            3,
            numSeconds.value
          ),
        },
        {
          name: "α wave",
          data: conversionPkgtoBarnsTimeOrRelated(
            "psd_relative_percent_s",
            "Fp2",
            2,
            numSeconds.value
          ),
        },
        {
          name: "θ wave",
          data: conversionPkgtoBarnsTimeOrRelated(
            "psd_relative_percent_s",
            "Fp2",
            1,
            numSeconds.value
          ),
        },
        {
          name: "δ wave",
          data: conversionPkgtoBarnsTimeOrRelated(
            "psd_relative_percent_s",
            "Fp2",
            0,
            numSeconds.value
          ),
        },
      ],
    ],
  });
  eegRelatedPowerFp1Chart.value.drawChart();
  eegRelatedPowerFp2Chart.value.drawChart();
};
// 更新ir近红外时域指标数据
const undateIrTimeSerie = () => {
  let groupSeriesData: any = [];

  for (let i = 1; i <= 8; i++) {
    let seriesName;
    if (i >= 5) {
      seriesName = `S2D${i}`;
    } else {
      seriesName = `S1D${i}`;
    }
    const radioRows: any = [];

    for (let j = 0; j < 3; j++) {
      const suffix = ["O", "R", "T"][j];
      radioRows.push({
        chanIndex: i,
        name: `Hb${suffix}`,
        radioIndex: j + 1,
      });
    }

    groupSeriesData.push({
      name: seriesName,
      radioRows,
    });
  }

  irTimeSerie.value.setOption({
    series: groupSeriesData.map((groupItem, index) => {
      return groupItem.radioRows.map((item) => {
        return conversionPkgtoTimeSeries(
          "concentration_date",
          mapChanToField(item.chanIndex),
          mapRadioToField(item.radioIndex),
          item.name,
          numSeconds.value
        );
      });
    }),
  });
  irTimeSerie.value.drawChart();
};

const mapRadioToField = (index) => {
  switch (
    index // 波形索引
  ) {
    case 1:
      return 0;
    case 2:
      return 1;
    case 3:
      return 2;
    default:
      return 0;
  }
};

const mapChanToField = (index) => {
  return index - 1;
};

const conversionPkgtoTimeSeries = (field, channel, index, name, step) => {
  if (irPkgDataList.length < 1) return [];
  let maxTimer = irPkgDataList[irPkgDataList.length - 1].time_mark;
  let minTime = maxTimer - step * 1000;
  let sliceData = irPkgDataList.filter(
    (item) => item.time_mark >= minTime && item.time_mark <= maxTimer
  );
  let baseTime = 0;
  return {
    name: name,
    data: sliceData.map((item, sliceIndex) => {
      if (sliceIndex !== 0) {
        baseTime += item.time_mark - sliceData[sliceIndex - 1].time_mark;
      }
      return [baseTime, item[field][channel][index]];
    }),
  };
};

const conversionPkgtoPsd = (typeChannel) => {
  if (eegPkgDataList.length < 1) return 0;
  return eegPkgDataList[eegPkgDataList.length - 1].psd_s[
    parseChannel(typeChannel)
  ].map((item, index) => {
    return [(index * 1000) / 2.056, item]; //* 1000 / 2.056
  });
};

const conversionPkgtoSeriesData = (typeChannel, step) => {
  if (eegPkgDataList.length < 1) return [];
  let maxTimer = eegPkgDataList[eegPkgDataList.length - 1].time_mark;
  let minTime = maxTimer - step * 1000;
  let sliceData = eegPkgDataList.filter(
    (item) => item.time_mark >= minTime && item.time_mark <= maxTimer
  );
  let baseTime = 0;

  let tempSliceData: any = [];
  for (let sliceIndex = 0; sliceIndex < sliceData.length; sliceIndex++) {
    const item = sliceData[sliceIndex];
    if (sliceIndex !== 0) {
      baseTime += item.time_mark - sliceData[sliceIndex - 1].time_mark;
    }
    let brain_elec_channel = item.brain_elec_channel[parseChannel(typeChannel)];
    if (item.isLosspkg && sliceIndex !== sliceData.length - 1) {
      // 补包的情况下自己算间隔，因为丢包后的时间戳不太对
      let TimeGap =
        (sliceData[sliceIndex + 1].time_mark - item.time_mark) /
        item.eeg_data_num;
      for (let brainIndex = 0; brainIndex < item.eeg_data_num; brainIndex++) {
        tempSliceData.push([
          baseTime + brainIndex * TimeGap,
          brain_elec_channel[brainIndex],
          item.time_stamp + brainIndex * TimeGap,
        ]);
      }
    } else {
      for (let brainIndex = 0; brainIndex < item.eeg_data_num; brainIndex++) {
        tempSliceData.push([
          baseTime + brainIndex * EEGTimeGap,
          brain_elec_channel[brainIndex],
          item.time_stamp + brainIndex * EEGTimeGap,
        ]);
      }
    }
  }
  return tempSliceData;
};

const conversionPkgtoBarnsTimeOrRelated = (field, typeChannel, index, step) => {
  if (eegPkgDataList.length < 1) return [];
  let maxTimer = eegPkgDataList[eegPkgDataList.length - 1].time_mark;
  let minTime = maxTimer - step * 1000;
  let sliceData = eegPkgDataList.filter(
    (item) => item.time_mark >= minTime && item.time_mark <= maxTimer
  );
  let baseTime = 0;
  let tempSliceData: any = [];
  for (let sliceIndex = 0; sliceIndex < sliceData.length; sliceIndex++) {
    const item = sliceData[sliceIndex];
    if (sliceIndex !== 0) {
      baseTime += item.time_mark - sliceData[sliceIndex - 1].time_mark;
    }
    let fieldDataList = item[field + "_multiple"];
    if (item.isLosspkg && sliceIndex !== sliceData.length - 1) {
      // 补包的情况下自己算间隔，因为丢包后的时间戳不太对
      let TimeGap =
        (sliceData[sliceIndex + 1].time_mark - item.time_mark) /
        item.eeg_data_num;
      for (
        let fieldIndex = 0;
        fieldIndex < fieldDataList.length;
        fieldIndex++
      ) {
        tempSliceData.push([
          baseTime + fieldIndex * TimeGap,
          fieldDataList[fieldIndex][parseChannel(typeChannel)][index],
        ]);
      }
    } else {
      for (
        let fieldIndex = 0;
        fieldIndex < fieldDataList.length;
        fieldIndex++
      ) {
        tempSliceData.push([
          baseTime + fieldIndex * EEGTimeGap,
          fieldDataList[fieldIndex][parseChannel(typeChannel)][index],
        ]);
      }
    }
  }
  return tempSliceData;
};

const parseChannel = (channel: string) => {
  switch (channel) {
    case "Fp1":
      return 0;
    case "Fp2":
      return 1;
  }
  return 0;
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

const drawChart = () => {
  undateEegTimeSerie();
  undateEegBandsTime();
  undateEegPsd();
  undateRelatedPower();
  undatelineChart(
    mindRestChart,
    concentrationChannel.value[0],
    mindRestList,
    true
  );
  undateIrTimeSerie();
  undatelineChart(
    HeartRateChart,
    heartRateChannel.value[0],
    heartRateList,
    true
  );
};

const calculate = () => {
  configData.value.hrv.isAnalysis = false;
  ipcRenderer.send(
    "change-config-field",
    JSON.stringify({
      field: "hrv-end-analysis",
      config: configData.value,
    })
  );
  ipcRenderer.send("calculate-hrv");
};

const exportPdf = () => {
  if (configData.value.hrv.isAnalysis) {
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
  ipcRenderer.removeListener("calculate-hrv-result", calculateHrvResult);
  bluetooth.removeNotice(bluetoothNotice);
  pkgSourceData = [];
  bluetooth = null;
  db = null;
});
</script>
<style scoped></style>
