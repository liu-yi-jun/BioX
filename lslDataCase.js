// 一开始的配置
startConfig = {
  eegFilter: {
    isDCRemove: true,
    isNotch: true,
    isBandPass: true,
    fl: 0.1,
    fh: 100,
    bpType: 1,
    sample_rate: 250,
    eeg_channel_count: 2,
  },
  irFilter: {
    isDCRemove: true,
    isBandPass: true,
    is2wave: false,
    is3wave: true,
    age: 25,
    fl: 0.01,
    fh: 5,
    bpType: 1,
    plotType: 1,
    ir_sample_rate: 25,
    two_ir_sample_rate: 50,
    three_ir_sample_rate: 25,
    ir_channel_count: 24, // 这个改了，之前是32。现在2波长是16，3波长是24
  },
  markerFilter: { mk_channel_count: 1 }, //新增marker通道数（有需要可以用，基本都是1）
  hrv: { current_channel: 1 },
  lsl: {
    isEeg: true,
    isIr: true,
    isMotion: true,
    isOutLet: true,
    handOutLet: true,
    isInlet: false,
    isMarker: true, // 增加是否启动标记
    streamName: "BioMulti Lite",
  },
  serialPort: { isConnect: false, portName: "COM3" },
};

// 脑电eeg数据
eeg = {
  pkglen: 93,
  pkgnum: 87642,
  time_mark: 4605085,
  pkg_type: 1,
  eeg_channel: 2,
  eeg_data_num: 10,
  ir_channel: 8,
  brain_elec_channel: [
    [500.5, 500.5, 500.5, 500.5, 500.5, 500.5, 500.5, 500.5, 500.5, 500.5],
    [500.5, 500.5, 500.5, 500.5, 500.5, 500.5, 500.5, 500.5, 500.5, 500.5],
  ],
  near_infrared: [],
  acceleration_x: 0,
  acceleration_y: 0,
  acceleration_z: 0,
  temperature: 0,
  Battery_State: 0,
  fall_off: 0,
  error_state: 0,
  time_utc: 1728808890148,
  ir_data_num: 2,
  isLosspkg: false,
};

// 近红外ir数据
ir = {
  pkglen: 141,
  pkgnum: 87631,
  time_mark: 4605068,
  pkg_type: 2,
  eeg_channel: 2,
  eeg_data_num: 10,
  ir_channel: 8,
  brain_elec_channel: [],
  near_infrared: [
    [300.29998779296875, 300.29998779296875],
    [300.29998779296875, 300.29998779296875],
    [300.29998779296875, 300.29998779296875],
    [300.29998779296875, 300.29998779296875],
    [300.29998779296875, 300.29998779296875],
    [300.29998779296875, 300.29998779296875],
    [300.29998779296875, 300.29998779296875],
    [300.29998779296875, 300.29998779296875],
  ], //这个改了，之前是8 * 4，现在2波长是8*2(取原来数组的0,2)，3波长是8*3(取原来数组的0,1,2)
  acceleration_x: 0,
  acceleration_y: 0,
  acceleration_z: 0,
  temperature: 0,
  Battery_State: 0,
  fall_off: 0,
  error_state: 0,
  time_utc: 1728808890153,
  ir_data_num: 2, //新增这个，2波长是2，3波长是3(有需要可以使用)
  isLosspkg: true,
};

//  marker数据(新增)
marker = {
  pkg_type: 4, // 包类型
  time_stamp: 1728809626506, //  时间戳
  type: "A", //  marker类型
  description: "测试1",   //  marker描述
};
