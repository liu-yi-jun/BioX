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
              <RedoOutlined  :style="{ color: 'rgba(0, 0, 0, 0.45)' }" />
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
import { ref, reactive, onMounted } from "vue";
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
const router = useRouter();
const indexStore = useIndexStore();
const { play, recordId } = storeToRefs(indexStore);
const db = new CustomDatabase();
import { message } from "ant-design-vue";
interface DataItem {
  id: number;
  name: string;
  recoredCreateTime: number;
  recoredTotalTime: number;
  recoredEndTime: number;
  describe: string;
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
    `select id,instanceID,name,recoredCreateTime,recoredTotalTime,recoredEndTime,describe from record where  '${searchValue.value}' = '' or name Like '%${searchValue.value}%'  or instanceID Like '%${searchValue.value}%'`
  );
};


const onRefresh = async () => {
  await getDate();
  message.success('已刷新！');
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
    },
  });
};

const exportCsv = async (record: DataItem) => {
  let csvContent = ""
  
  // 列值
  const metaDataKeys = columns.map(column => column.dataIndex);
  metaDataKeys.forEach(element => {
      csvContent = csvContent + element+":"+record[element]
    });

  csvContent += "\n"

  // 获取记录的数据，非基本信息
  const res = await db.get(`select sourceData from record where id = ${record.id}`);
  const sourceData = JSON.parse(res.sourceData);
  console.log(sourceData)
  // 检查sourceData是否是数组以及是否有数据
  if (!Array.isArray(sourceData) || sourceData.length === 0) {
    alert("记录的数据异常！");
    return;
  }
  // 列值
  const sourceDataKeys = Object.keys(sourceData[0])
  console.log(sourceDataKeys)
  // 转换数据到CSV格式
  sourceData.forEach(sd => {
    console.log(typeof sd)
    sd.forEach(element => {
      csvContent = csvContent + sd[element]+","
    });
    csvContent += "\n"
  }
  )
  console.log(csvContent)

  // 创建一个Blob对象
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // 创建一个临时的URL对象
  const url = window.URL.createObjectURL(blob);

  // 创建一个a标签模拟点击进行下载
  const a = document.createElement('a');
  a.href = url;
  a.download = record.name+'.csv'; // 设置下载的文件名
  document.body.appendChild(a);
  a.click();

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
