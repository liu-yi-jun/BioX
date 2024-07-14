<template>
  <div style="padding: 20px">
    <a-form size="small" layout="inline">
      <a-form-item label="tow">
        <a-input-number
          size="small"
          v-model:value="configData.irFilter.two_ir_sample_rate"
          :min="0"
          :step="0.1"
        ></a-input-number>
      </a-form-item>
      <a-form-item label="three">
        <a-input-number
          size="small"
          v-model:value="configData.irFilter.three_ir_sample_rate"
          :min="0"
          :step="0.1"
        ></a-input-number>
      </a-form-item>
      <a-button @click="changewava">保存</a-button>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useIndexStore } from "../../store/index";
import { storeToRefs } from "pinia";
const indexStore = useIndexStore();
const { isConnect, bluetoothATConfig, configData } = storeToRefs(indexStore);
const ipcRenderer = require("electron").ipcRenderer;
import { CustomDatabase } from "../../utils/db";
import { message } from "ant-design-vue";
const db = new CustomDatabase();
const changewava = () => {
  ipcRenderer.send(
    "change-config-field",
    JSON.stringify({
      field: "filterConfig",
      config: configData.value,
    })
  );
  db.all(`select * from config`).then((list) => {
    if (list.length > 0) {
      let copeConfigData = JSON.parse(list[0].configData);
      copeConfigData.irFilter.two_ir_sample_rate =
        configData.value.irFilter.two_ir_sample_rate;
      copeConfigData.irFilter.three_ir_sample_rate =
        configData.value.irFilter.three_ir_sample_rate;
      copeConfigData.irFilter.ir_sample_rate =
        configData.value.irFilter.two_ir_sample_rate;
      db.update(
        "config",
        {
          configData: JSON.stringify(copeConfigData),
        },
        {
          id: list[0].id,
        }
      );
      message.success("保存成功");
    }
  });
};
</script>
<style scoped></style>
