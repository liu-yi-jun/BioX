import { defineStore } from "pinia";
export const useIndexStore = defineStore({
  id: "Index",
  state: () => ({
    // 是否播放
    play: false,
    // 是否在录制状态,
    recordProgress: false,
    // 播放的id
    recordId: 0,
    // 是否连接
    isConnect: false,
    // 播放的时刻 index * 40
    playIndex: 0,
    // 播放间隔
    playGap: 40,
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
      // 脑电配置
      eegFilter: {
        isDCRemove: true,
        isNotch: true,
        isBandPass: true,
        fl: 0.1,
        fh: 100,
        bpType: 1,
        sample_rate: 250,
        // minndfulness,restfulness步长
        mindRestStep: 250 * 1,  //mindRestStep=step_time*sample_rate 等于1秒更新一次
        eeg_channel_count: 2,
        eegBands: {
          delta: {
            min: 0.5,
            max: 4,
          },
          theta: {
            min: 4,
            max: 8,
          },
          alpha: {
            min: 8,
            max: 13,
          },
          beta: {
            min: 13,
            max: 32,
          },
          gamma: {
            min: 32,
            max: 100,
          },
          min: 0,
          max: 100,
        },
      },
      // 经红外配置
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
        irStep: 50 * 1,  //irStep=step_time*sample_rate 等于1秒更新一次
        ir_sample_rate: 50,
        two_ir_sample_rate: 50,
        three_ir_sample_rate: 25,
        ir_channel_count: 16,
      },
      // Marker配置
      markerFilter: {
        mk_channel_count: 1,
      },
      // 心率配置
      hrv: {
        current_channel: 1,
        isAnalysis:false,
      },
      // 实验数据流配置
      lsl: {
        isEeg: true,
        isIr: true,
        isMotion: true,
        isOutLet: false,
        handOutLet: false, //手动启动lsl
        isInlet: false,
        isMarker: true, //lsl的开启标记
        streamName: "BioMulti Lite",
      },
      // 串口配置
      serialPort: {
        isConnect: false,
        portName: "COM3",
      },
    },
    socketConfig: {
      port: 9000,
    },
    isEegClear: false,
    isIrClear: false,
    // 是否开始标记（软件）
    isMarker: false,
    markerList: [
      {
        type: undefined,
        description: "",
      },
    ],
    // 是否软件正常断开蓝牙连接
    isNormalClose: false,
    // 是否设备正常断开连接
    isDeviceClose: false,
    // 是否超过3次重连失败
    isManyReconnect: false,
  }),
  actions: {},
});
