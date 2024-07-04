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
    // 播放的时刻 index * 40
    playIndex: 0,
    // 是否拖拽进度条
    isDragSlider: false,
    // 蓝牙配置
    bluetoothATConfig: {
      IRMODE: {
        operate: "=",
        value: 0,
      },
    },
    // 配置数据
    configData: {
      age: 25,
      isFilter: false,
      isBaseline: false,
    },
  }),
  actions: {},
});
