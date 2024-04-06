<template>
  <div class="eig-column">
    <div class="eig-filter">
      <div class="filter-right">
        <a-input-search
          v-model:value="value"
          placeholder="input search text"
          style="width: 200px"
          @search="onSearch"
        />
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
                  <a Href="javascript:;" @click="lookRecord(record.id)">{{
                    text || " "
                  }}</a>
                  <edit-outlined
                    class="editable-cell-icon"
                    @click="edit(record.id, column.dataIndex)"
                  />
                </p>
                <p v-if="column.dataIndex === 'name'">
                  <span>{{ record.recoredCreateTime }}</span>
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
            <a>导出</a>
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
import { formatTimestamp, tipFormatter } from "../../utils/common";
const value = ref<string>("");
import { cloneDeep } from "lodash-es";
import { message } from "ant-design-vue";
import { CheckOutlined, EditOutlined } from "@ant-design/icons-vue";
import { CustomDatabase } from "../../utils/db";
import { Modal } from "ant-design-vue";
import { storeToRefs } from "pinia";
import { useIndexStore } from "../../store/index";
const router = useRouter();
const indexStore = useIndexStore();
const { play, recordId } = storeToRefs(indexStore);
const db = new CustomDatabase();
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

onMounted(async () => {
  recordList.value = await db.all(`select * from record`);
});

const deleteRow = (record: DataItem) => {
  Modal.warning({
    title: "确认删除数据？",
    content: `确认要删除数据：${record.name}吗？`,
    onOk() {
      db.delete("record", { id: record.id }).then(() => {
        recordList.value = recordList.value.filter(
          (item) => item.id !== record.id
        );
      });
    },
  });
};

const onSearch = (searchValue: string) => {
  console.log("use value", searchValue);
  console.log("or use this.value", value.value);
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
  router.push('/EEG');
};
</script>

<style scoped></style>
