<template>
  <div class="eig-column">
    <div class="eig-filter">
      <div class="filter-right">
        <a-space>
          <a-input-search
            v-model:value="searchValue"
            placeholder="input search text"
            style="width: 200px"
            @search="onSearch"
          />
          <a-button class="eig-icon-btn" @click="onRefresh">
            <template #icon>
              <RedoOutlined :style="{ color: 'rgba(0, 0, 0, 0.45)' }" />
            </template>
          </a-button>
        </a-space>
      </div>
    </div>
    <div class="eig-table">
      <a-table
        :columns="columns"
        :data-source="recordList"
        :scroll="{ y: 'calc(100vh - 220px' }"
      >
        <template #bodyCell="{ column, text, record }">
          <template
            v-if="
              column.dataIndex === 'name' || column.dataIndex === 'describe'
            "
          >
            <div class="editable-cell">
              <div
                v-if="editableData[`${record.id}_${column.dataIndex}`]"
                class="editable-cell-input-wrapper"
              >
                <a-input
                  v-if="column.dataIndex === 'name'"
                  v-model:value="
                    editableData[`${record.id}_${column.dataIndex}`].name
                  "
                  ref="input_name"
                  style="width: 120px"
                  size="small"
                  @pressEnter="save(record.id, column.dataIndex)"
                  @blur="save(record.id, column.dataIndex)"
                />

                <a-input
                  v-if="column.dataIndex === 'describe'"
                  v-model:value="
                    editableData[`${record.id}_${column.dataIndex}`].describe
                  "
                  size="small"
                  ref="input_describe"
                  @pressEnter="save(record.id, column.dataIndex)"
                  @blur="save(record.id, column.dataIndex)"
                />
              </div>
              <div v-else class="editable-cell-text-wrapper">
                <p>
                  <a
                    v-if="column.dataIndex === 'name'"
                    Href="javascript:;"
                    @click="lookRecord(record.id)"
                    >{{ text || " " }}</a
                  >
                  <span v-else>
                    {{ text || " " }}
                  </span>
                  <edit-outlined
                    class="editable-cell-icon"
                    @click="edit(record.id, column.dataIndex)"
                  />
                </p>
                <p v-if="column.dataIndex === 'name'">
                  <span>{{ record.instanceID }}</span>
                </p>
              </div>
            </div>
          </template>
          <template v-if="column.dataIndex === 'recoredCreateTime'">
            <span>{{
              formatTimestamp(text, "yyyy-MM-dd HH:mm:ss", true)
            }}</span>
          </template>
          <template v-if="column.dataIndex === 'recoredTotalTime'">
            <span>{{ tipFormatter(text) }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'operation'">
            <a @click="deleteRow(record)">删除</a>
            <a-divider type="vertical" />
            <a @click="exportCsv(record)">导出</a>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted, nextTick, getCurrentInstance } from "vue";
import type { Ref, UnwrapRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import { RedoOutlined } from "@ant-design/icons-vue";
import { formatTimestamp, tipFormatter } from "../../utils/common";
const searchValue = ref<string>("");
import { cloneDeep } from "lodash-es";
import { CheckOutlined, EditOutlined } from "@ant-design/icons-vue";
import { CustomDatabase } from "../../utils/db";
import { Modal } from "ant-design-vue";
import { storeToRefs } from "pinia";
import { useIndexStore } from "../../store/index";
const app = getCurrentInstance();
const router = useRouter();
const indexStore = useIndexStore();
const { play, recordId } = storeToRefs(indexStore);
const input_name = ref();
const input_describe = ref();
const db = new CustomDatabase();
import { message } from "ant-design-vue";
interface DataItem {
  id: number;
  name: string;
  recoredCreateTime: number;
  recoredTotalTime: number;
  recoredEndTime: number;
  describe: string;
  eegInputMarkerList: string;
  irInputMarkerList: string;
}
const recordList = ref<DataItem[]>([]);

const columns = [
  {
    title: "名称/ID",
    dataIndex: "name",
  },
  {
    title: "创建时间",
    dataIndex: "recoredCreateTime",
  },
  {
    title: "总时长",
    dataIndex: "recoredTotalTime",
  },
  {
    title: "描述",
    dataIndex: "describe",
  },
  {
    title: "操作",
    dataIndex: "operation",
  },
];

onMounted(() => {
  getDate();
});

const getDate = async () => {
  recordList.value = await db.all(
    `select id,instanceID,name,recoredCreateTime,recoredTotalTime,recoredEndTime,describe,eegInputMarkerList,irInputMarkerList from record where  '${searchValue.value}' = '' or name Like '%${searchValue.value}%'  or instanceID Like '%${searchValue.value}%'`
  );
};

const onRefresh = async () => {
  await getDate();
  message.success("已刷新！");
};

const deleteRow = (record: DataItem) => {
  Modal.confirm({
    title: "确认删除数据？",
    content: `确认要删除数据：${record.name}吗？`,
    okText: "确认",
    cancelText: "取消",
    onOk() {
      db.delete("record", { id: record.id }).then(() => {
        recordList.value = recordList.value.filter(
          (item) => item.id !== record.id
        );
      });
      db.delete("source", { recordId: record.id });
    },
  });
};

const exportCsv = async (record: DataItem) => {
  let eegInputMarkerList = JSON.parse(record.eegInputMarkerList);
  let irInputMarkerList = JSON.parse(record.irInputMarkerList);
  console.log(eegInputMarkerList, irInputMarkerList);

  let csvContent = "";
  let eegChannel = 1;
  let irChannel = 1;
  let eegDataNum = 1;
  app?.proxy?.loading.show("导出中...");
  // 第一行的值
  const metaDataKeys = ref([
    "ID",
    "NAME",
    "DESCRIPTION",
    "RECORDCREATETIME",
    "RECORDTOTALTIME",
    "DEVICE TYPE",
    "DEVICE SERIAL",
    "DEVICE FIRMWARE",
    "EEG CHANNELS",
    "EEG SAMPLING RATE",
    "IR CHANNELS",
    "IR WAVELENGTHS",
    "IR SAMPLING RATE",
  ]);
  csvContent = csvContent + metaDataKeys.value.join(",") + "\n";
  // 保存record的信息
  csvContent +=
    record.id +
    "," +
    record.name +
    "," +
    record.describe +
    "," +
    record.recoredCreateTime +
    "," +
    record.recoredTotalTime +
    ",";
  // Device TYPE
  csvContent += "" + ",";
  // Device SERIAL
  csvContent += "" + ",";
  // DEVICE FIRMWARE
  csvContent += "" + ",";
  // 获取记录的数据
  // const res = await db.get(`select sourceData from record where id = ${record.id}`);
  const res = await db.all(
    `select * from source where recordId = ${record.id}`
  );
  console.log(res);

  const sourceData = res
    .map((item) => {
      return JSON.parse(item.data);
    })
    .flat();
  console.log(sourceData.length);

  // 检查sourceData是否是数组以及是否有数据
  if (!Array.isArray(sourceData) || sourceData.length === 0) {
    alert("记录的数据异常！");
    app?.proxy?.loading.hide();
    return;
  }
  let firstPKGData = sourceData[0];
  let firstEntries = Object.entries(firstPKGData);
  // EEG CHANNELS
  let keyToFind = "eeg_channel";
  let valueForKey = (
    firstEntries.find(([key]) => key === keyToFind) as
      | [string, number]
      | undefined
  )?.[1];
  if (valueForKey != undefined) {
    csvContent += valueForKey + ",";
    eegChannel = valueForKey;
  } else {
    csvContent += "" + ",";
  }
  // EEG SAMPLING RATE
  csvContent += "" + ",";
  // IR CHANNELS
  keyToFind = "ir_channel";
  valueForKey = (
    firstEntries.find(([key]) => key === keyToFind) as
      | [string, number]
      | undefined
  )?.[1];
  if (valueForKey != undefined) {
    csvContent += valueForKey + ",";
    irChannel = valueForKey;
  } else {
    csvContent += "" + ",";
  }
  // IR WAVELENGTHS
  csvContent += "" + ",";
  // IR SAMPLING RATE
  csvContent += "" + "\n";

  // 获取eeg data num
  keyToFind = "eeg_data_num";
  valueForKey = (
    firstEntries.find(([key]) => key === keyToFind) as
      | [string, number]
      | undefined
  )?.[1];
  if (valueForKey != undefined) {
    eegDataNum = valueForKey;
  } else {
    console.log("未获取到eeg_data_num");
  }

  // 第三行的值
  let thirdRowList = ref(["TIMESTAMP"]);
  thirdRowList.value.push("EEG.COUNTER");
  for (let index = 1; index < eegChannel + 1; index++) {
    thirdRowList.value.push("EEG.FP" + index);
  }

  thirdRowList.value.push("FNIRS.COUNTER");

  const str =
    "FNIRS.S1D1.735 FNIRS.S1D1.805 FNIRS.S1D1.850 FNIRS.S1D1.805 FNIRS.S1D2.735 FNIRS.S1D2.805 FNIRS.S1D2.850 FNIRS.S1D2.805 FNIRS.S1D3.735 FNIRS.S1D3.805 FNIRS.S1D3.850 FNIRS.S1D3.805 FNIRS.S1D4.735 FNIRS.S1D4.805 FNIRS.S1D4.850 FNIRS.S1D4.805 FNIRS.S2D1.735 FNIRS.S2D1.805 FNIRS.S2D1.850 FNIRS.S2D1.805 FNIRS.S2D2.735 FNIRS.S2D2.805 FNIRS.S2D2.850 FNIRS.S2D2.805 FNIRS.S2D3.735 FNIRS.S2D3.805 FNIRS.S2D3.850 FNIRS.S2D3.805 FNIRS.S2D4.735 FNIRS.S2D4.805 FNIRS.S2D4.850 FNIRS.S2D4.805";
  const items = str.split(" "); // 假设字段是由制表符分隔的
  items.forEach((item) => {
    thirdRowList.value.push(item);
  });
  csvContent += thirdRowList.value.join(",") + "\n";

  let eegCounter = 0;
  let fnirsCounter = 0;
  let valueArrayArrayForKey;
  // 转换数据到CSV格式
  sourceData.forEach((pkgData) => {
    const entries = Object.entries(pkgData);
    keyToFind = "pkg_type";
    valueForKey = (
      entries.find(([key]) => key === keyToFind) as [string, number] | undefined
    )?.[1];
    if (valueForKey == 1) {
      // EEG Data
      keyToFind = "brain_elec_channel";
      valueArrayArrayForKey = (
        entries.find(([key]) => key === keyToFind) as
          | [string, number[][]]
          | undefined
      )?.[1];
      if (Array.isArray(valueArrayArrayForKey)) {
        // 处理二维数组
        // console.log('Found array:', valueArrayArrayForKey);
        for (let col = 0; col < eegDataNum; col++) {
          csvContent += "" + (pkgData.time_stamp + col * (1000 / 250)) + ",";
          //增加eeg counter
          csvContent += "" + eegCounter + ",";
          eegCounter += 1;
          if (eegCounter >= 256) {
            eegCounter = 0;
          }
          for (let row = 0; row < eegChannel; row++) {
            const element = valueArrayArrayForKey[row];
            csvContent += "" + element[col] + ",";
          }
          // 之后的近红外数据应该都是空的
          for (let index = 0; index < items.length; index++) {
            csvContent += ",";
          }
          csvContent += "\n";
        }
      } else {
        // 找不到数据，这行都是空的
        for (let index = 0; index < eegChannel + items.length + 1; index++) {
          csvContent += ",";
        }
        csvContent += "\n";
        console.log("Key not found or value is not an array.");
      }
    } else if (valueForKey == 2) {
      // 近红外数据
      // EEG 数据应该是空的，所以空起来
      csvContent += "" + pkgData.time_stamp + ",";
      for (let index = 0; index < eegChannel + 1; index++) {
        csvContent += ",";
      }
      csvContent += "" + fnirsCounter + ",";
      fnirsCounter += 1;
      if (fnirsCounter >= 256) {
        fnirsCounter = 0;
      }
      // 近红外 Data
      keyToFind = "near_infrared";
      valueArrayArrayForKey = (
        entries.find(([key]) => key === keyToFind) as
          | [string, number[][]]
          | undefined
      )?.[1];
      if (Array.isArray(valueArrayArrayForKey)) {
        let neadInfrared = valueArrayArrayForKey?.flat();
        for (let index = 0; index < items.length; index++) {
          if (index == items.length - 1) {
            csvContent += "" + neadInfrared[index] + "\n";
          } else {
            csvContent += "" + neadInfrared[index] + ",";
          }
        }
      } else {
        // 找不到数据，这行都是空的
        for (let index = 0; index < eegChannel + items.length + 1; index++) {
          csvContent += ",";
        }
        csvContent += "\n";
      }
    }
  });
  debugger;
  // 创建一个Blob对象
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // 创建一个临时的URL对象
  const url = window.URL.createObjectURL(blob);

  // 创建一个a标签模拟点击进行下载
  const a = document.createElement("a");
  a.href = url;
  a.download = record.name + ".csv"; // 设置下载的文件名
  document.body.appendChild(a);
  a.click();

  app?.proxy?.loading.hide();

  // 清理并释放URL对象
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const onSearch = (searchValue: string) => {
  getDate();
};

const editableData: UnwrapRef<Record<string, DataItem>> = reactive({});

const edit = (id: number, dataIndex) => {
  editableData[`${id}_${dataIndex}`] = cloneDeep(
    recordList.value.filter((item) => id === item.id)[0]
  );
  nextTick(() => {
    if (dataIndex === "name") {
      input_name.value.focus();
    }
    if (dataIndex === "describe") {
      input_describe.value.focus();
    }
  });
};
const save = (id: number, dataIndex) => {
  Object.assign(
    recordList.value.filter((item) => id === item.id)[0],
    editableData[`${id}_${dataIndex}`]
  );
  db.update("record", editableData[`${id}_${dataIndex}`], { id }).then(() => {
    message.success("修改成功");
    delete editableData[`${id}_${dataIndex}`];
  });
};

const lookRecord = (id) => {
  indexStore.playIndex = 0;
  indexStore.recordId = id;
  router.push("/EEG");
};
</script>

<style scoped></style>
