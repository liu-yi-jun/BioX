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
      eegFilter: {
        isDCRemove: true,
        isNotch: true,
        isBandPass: true,
        fl: 0.1,
        fh: 100,
        bpType: 1,
        sample_rate: 250,
      },
      irFilter: {
        isDCRemove: true,
        isBandPass: true,
        is2wave: true,
        is3wave: false,
        age: 25,
        fl: 0.01,
        fh: 5,
        bpType: 1,
        plotType: 1, 
        ir_sample_rate: 12.5,
      },
    },
    isEegClear: false,
    isIrClear: false,
  }),
  actions: {},
});
