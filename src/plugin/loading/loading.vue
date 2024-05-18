<template>
  <div v-if="loading" class="loading">
    <div class="loading-box">
      <Spin :tip="tip" size="large" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Spin } from "ant-design-vue";
const loading = ref(false);
const tip = ref("加载中...");

const show = (text: string | undefined) => {
  if (text) {
    tip.value = text;
  } else {
    tip.value = "加载中...";
  }
  loading.value = true;
  console.log("show方法执行了");
};

const hide = () => {
  loading.value = false;
  console.log("hide方法执行了");
};

defineExpose({
  show,
  hide,
});
</script>

<style scoped>
.loading {
  position: fixed;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  z-index: 999;
}
</style>
