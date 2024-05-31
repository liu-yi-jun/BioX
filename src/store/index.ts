import { defineStore } from "pinia";

export const useIndexStore = defineStore({
  id: "Index",
  state: () => ({
    play: false,
    recordId: 0,
    isConnect: false,
    // 播放的时刻 index * 250
    playIndex: 0,
    isDragSlider:false
  }),
  actions: {
  },
});
