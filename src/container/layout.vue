<template>
  <div class="eig-container">
    <div class="eig-header">
      <of-header></of-header>
    </div>
    <div class="eig-body">
      <div class="eig-menu">
        <of-menu></of-menu>
      </div>
      <div class="eig-content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import OfMenu from "./menu.vue";
import OfHeader from "./header.vue";
import { ref, reactive } from "vue";
</script>
<style scoped></style>
