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
        :data-source="data"
        :scroll="{ y: 'calc(100vh - 220px' }"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'name'">
            <div class="editable-cell">
              <div
                v-if="editableData[record.key]"
                class="editable-cell-input-wrapper"
              >
                <a-input
                  v-model:value="editableData[record.key].name"
                  @pressEnter="save(record.key)"
                />
                <check-outlined
                  class="editable-cell-icon-check"
                  @click="save(record.key)"
                />
              </div>
              <div v-else class="editable-cell-text-wrapper">
                {{ text || " " }}
                <edit-outlined
                  class="editable-cell-icon"
                  @click="edit(record.key)"
                />
              </div>
            </div>
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
import { ref, reactive } from "vue";
import type { Ref, UnwrapRef } from "vue";
const value = ref<string>("");
import { cloneDeep } from "lodash-es";
import { CheckOutlined, EditOutlined } from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";

interface DataItem {
  key: string;
  name: string;
  age: number;
  address: string;
}

const columns = [
  {
    title: "名称/ID",
    dataIndex: "name",
    width: 200,
  },
  {
    title: "创建时间",
    dataIndex: "age",
    width: 150,
  },
  {
    title: "总时长",
    dataIndex: "address",
  },
  {
    title: "描述",
    dataIndex: "address",
  },
  {
    title: "操作",
    dataIndex: "operation",
  },
];

const data = ref(
  [...Array(100)].map((_, i) => ({
    key: i + "",
    name: `Edward King ${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`,
  }))
);

const deleteRow = (record: DataItem) => {
  Modal.warning({
    title: "确认删除数据？",
    content: `确认要删除数据：${record.name}吗？`,
  });
};

const onSearch = (searchValue: string) => {
  console.log("use value", searchValue);
  console.log("or use this.value", value.value);
};

const editableData: UnwrapRef<Record<string, DataItem>> = reactive({});

const edit = (key: string) => {
  editableData[key] = cloneDeep(
    data.value.filter((item) => key === item.key)[0]
  );
};
const save = (key: string) => {
  Object.assign(
    data.value.filter((item) => key === item.key)[0],
    editableData[key]
  );
  delete editableData[key];
};
</script>

<style scoped></style>
