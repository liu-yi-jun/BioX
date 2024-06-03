import { defineStore } from "pinia";

export const useIndexStore = defineStore({
  id: "Index",
  state: () => ({
    // 是否播放
    play: false,
    // 播放的id
    recordId: 0,
    // 是否连接
    isConnect: false,
    // 播放的时刻 index * 250
    playIndex: 0,
    // 是否拖拽进度条
    isDragSlider:false,
    // 配置数据
    configData: {
      isFilter:false,
    },
  }),
  actions: {
  },
});
