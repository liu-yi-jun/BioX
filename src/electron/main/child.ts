var ref = require("ref-napi");
var ffi = require("ffi-napi");
import { join } from "path";
const Struct = require("ref-struct-napi");
var ArrayType = require("ref-array-napi");
let __static = process.argv[2];
let _product_path = process.argv[3];
// 加载配置项
// 是否开启滤波
const isFilter = JSON.parse(process.argv[4]).isFilter;
console.log("isFilter", isFilter);

// 定义指针类型
// 定义用于映射DLL内结构体的结构

// 测试数据包
// import * as fs from "fs";
// import * as readline from "readline";
// const fileStream = fs.createReadStream("LOG.txt");
// const rl = readline.createInterface({
//   input: fileStream,
//   crlfDelay: Infinity,
// });

// let buffers: Buffer[] = [];
// rl.on("line", (line: any) => {
//   // 去除时间戳和箭头
//   line = line.replace(/^[\d:.]+\s+->\s+/, "").replace(/\s+/g, "");

//   // 将十六进制字符串转换为字节数组
//   const byteArray = line.match(/.{2}/g).map((byte: any) => parseInt(byte, 16));

//   // 将字节数组转换为Buffer对象
//   const buffer = Buffer.from(byteArray);

//   // 将Buffer对象添加到数组中
//   buffers.push(buffer);
//   // console.log("buffer", buffer);
// });

const max_channel = 16;
const max_eeg_group_num = 256;
const max__ir_channel = 256;

const PKG = Struct({
  pkglen: ref.types.int16,
  pkgnum: ref.types.int32,
  time_mark: ref.types.int32,
  pkg_type: ref.types.uint8,
  eeg_channel: ref.types.uint8, //eeg通道数
  eeg_data_num: ref.types.uint8, //每个通道的eeg数据个数
  ir_channel: ref.types.uint8, //红外通道数
  brain_elec_channel: ArrayType(
    ArrayType(ref.types.float, max_eeg_group_num),
    max_channel
  ), //最高支持16个EEG通道的256个连续数据
  near_infrared: ArrayType(ArrayType(ref.types.float, 4), max__ir_channel), // 8个通道的近红外数据，依次为S1，PD1；S1，PD2；S1，PD3；S1，PD4；S2，PD1；S2，PD2；S2，PD3；S2，PD4；；每个通道内数据依次为λ1 λ31 λ2 λ32
  // brain_elec_channel1: ArrayType(ref.types.float, 10), //EEG通道1的10个数据
  // brain_elec_channel2: ArrayType(ref.types.float, 10), //EEG通道2的10个数据
  // near_infrared_channel_1_wavelength_1: ArrayType(ref.types.float, 4), // IR第1通道第1个波长
  // near_infrared_channel_1_wavelength_2: ArrayType(ref.types.float, 4), // IR第1通道第2个波长
  // near_infrared_channel_1_wavelength_13: ArrayType(ref.types.float, 4), // IR第1通道λ3，（与λ1同时采集）
  // near_infrared_channel_1_wavelength_23: ArrayType(ref.types.float, 4), // IR第1通道λ3，（与λ2同时采集）
  // near_infrared_channel_2_wavelength_1: ArrayType(ref.types.float, 4), // IR第2通道第1个波长
  // near_infrared_channel_2_wavelength_2: ArrayType(ref.types.float, 4), // IR第2通道第2个波长
  // near_infrared_channel_2_wavelength_13: ArrayType(ref.types.float, 4), // IR第2通道λ3，（与λ1同时采集）
  // near_infrared_channel_2_wavelength_23: ArrayType(ref.types.float, 4), // IR第2通道λ3，（与λ2同时采集）
  acceleration_x: ref.types.float,
  acceleration_y: ref.types.float,
  acceleration_z: ref.types.float,
  temperature: ref.types.float, //额温
  Battery_State: ref.types.float, //电池剩余电量
  fall_off: ref.types.int32, //电极脱落状态，Lead-Off Detection status  (32)  int32
  error_state: ref.types.int32, //错误状态
  // EEG_DATA: ref.types.bool, //EEG数据标志位
  // ELSE_DATA: ref.types.bool, //其他数据标志位
  pkg: ArrayType(ref.types.uint8, 300),
});

// 加载DLL
// 解析数据
var pkg_decode_path = join(_product_path, "/dll/pkg_decode.dll");

const pkgDecode = ffi.Library(pkg_decode_path, {
  get_pkg_buffer_length: ["int", []],
  push_to_databuffer: ["void", ["uint8"]],
  pkgbuffer_pop: ["void", []],
  pkg_recv: ["void", []],
  // ref.refType(PKG)定义一个PKG类型的指针
  decode: [ref.refType(PKG), []],
});

// 滤波、功率谱计算
var signal_process_path = join(_product_path, "/dll/signal_process.dll");
// 定义类型
const Float = ref.types.float;
const Int = ref.types.int;
const Bool = ref.types.bool;
const Double = ref.types.double;
const DoubleArray = ArrayType(Double);
const FloatArray = ArrayType(Float);
// 加载库
const signalProcess = ffi.Library(signal_process_path, {
  init_filter: ["void", [Int, Int]],
  init_bp_filter: ["void", [Int, Int]],
  run_pre_process_filter: ["void", [Int, FloatArray, DoubleArray, Bool]], //滤除100HZ;x[channel]是各个通道当前接收到数据的数组，d[channel]是各个通道滤波后数据的数组，为最终拿去做fft的数据，
  run_bp_filter: [
    "void",
    [
      Int,
      DoubleArray,
      DoubleArray,
      DoubleArray,
      DoubleArray,
      DoubleArray,
      DoubleArray,
    ],
  ],
  fft_ps: [
    Bool,
    [
      Int,
      Int,
      Double,
      Int,
      Int,
      DoubleArray,
      DoubleArray,
      DoubleArray,
      DoubleArray,
    ],
  ],
  //初始化ir滤波器
  init_irbp_filter: ["void", [Double, Int, Double, Double]], //sample_rate:采样率，total_channel:总通道数；fl:下截至频率；fh：上截止频率
  run_irbp_filter: ["void", [Int, Int, DoubleArray, DoubleArray]], //filter_type:字符型变量，“Butterworth”，“ChebyshevI”，“ChebyshevII”，channel:当前通道，input:输入数据，为数组首地址；output:输出数据（滤波后数据），为数组首地址
  //基线归零
  clear_baseline: ["void", []],
  //计算光密度
  calc_od: [Bool, [Int, Double, Int, Int, DoubleArray, DoubleArray]], //channel:当前通道数（每个通道包含λ1，λ31，λ2，λ32四个波长数据）；sample_rate，int：采样率；base_line_time：用于计算基线的时间长度，单位为秒;step:滑窗步长，单位为点数；input:输入数据，为数组首地址；output:输出数据（各通道光密度），为数组首地址
});

let test_i = 0;
// const isTestPkg = false;

// 初始化参数
const window = 512; //fft 窗长  实际应用中，为了保证计算精度，fft窗长至少为512,需为2的幂次
const step = 10; //fft 步长
const sample_rate = 250;

const channel = 2;

const timeGap = 40; //包时间间隔，单位ms

const time_e_s: any = [0, 0];
const time_e_s_multiple: any = [];
const ps_s_multiple: any = [];
const psd_s_multiple: any = [];
const psd_relative_s_multiple: any = [];
const psd_relative_percent_s_multiple: any = [];

// 这部分不能乱改，dll里面控制着
const ps_s = [new DoubleArray(window / 2 + 1), new DoubleArray(window / 2 + 1)]; //频谱数组，长度为window/2+1，存储每个频率能量，单位为dB
const psd_s = [
  new DoubleArray(window / 2 + 1),
  new DoubleArray(window / 2 + 1),
]; //频谱密度数组，长度为window/2+1，存储每个频率，能量单位为dB
const psd_relative_s = [new DoubleArray(5), new DoubleArray(5)]; //频段频谱密度数组，长度为5，存储每个频段能量，单位为dB
const psd_relative_percent_s = [new DoubleArray(5), new DoubleArray(5)]; //相对频谱密度数组，长度为5，存储每个频段能量百分比，单位为%

// 近红外部分
const ir_sample_rate = 12.5;
const baseline_time = 10;
const ir_channel = 8;
const ir_step = 2;
const fl = 0.01; //fl 下截至频率
const fh = 0.5; //fh 上截止频率
const ir_od_date: any = [];

let lossDataTemplate = {
  baseAdjustedTimestamps: 0, //基础某秒时间戳
  priorPkgnum: 0, //上一个包的包号
  packetLossRate: 0, //数据包丢失率
  packetLossNum: 0, //数据包丢失总数
  isLosspkg: false, //是否丢包
  lossNum: 0, // 当前丢包数
  orderGap: 1, // 包序号间隔
};

let lossDataInfo = {
  EEG: JSON.parse(JSON.stringify(lossDataTemplate)),
  IR: JSON.parse(JSON.stringify(lossDataTemplate)),
  ELSE: JSON.parse(JSON.stringify(lossDataTemplate)),
};

// 转换为十六进制
const arrayToHexString = (array: any) => {
  let hexString = "";
  for (let i = 0; i < array.length; i++) {
    const hexValue = array[i].toString(16).padStart(2, "0"); // 确保每个值都是两位数
    hexString = hexString + " " + hexValue;
  }
  return hexString;
};

// 时间戳计算
const adjustTimestamps = (timestamp: number): number => {
  const remainder = timestamp % 1000;
  return timestamp - remainder;
};

// 映射数据类型
function mapLossDataInfo(pkg_type: number) {
  switch (pkg_type) {
    case 1:
      return lossDataInfo.EEG;
    case 2:
      return lossDataInfo.IR;
    default:
      return lossDataInfo.ELSE;
  }
}

// 计算丢包
function calculatePacketLoss(pkg: any) {
  let LDInfoEl = mapLossDataInfo(pkg.pkg_type);
  let adjustedTimestamps = adjustTimestamps(pkg.time_mark);
  if (LDInfoEl.baseAdjustedTimestamps !== adjustedTimestamps) {
    LDInfoEl.baseAdjustedTimestamps = adjustedTimestamps;
    LDInfoEl.packetLossRate = 0;
  }
  if (
    pkg.time_mark >= LDInfoEl.baseAdjustedTimestamps &&
    pkg.time_mark < LDInfoEl.baseAdjustedTimestamps + 1000
  ) {
    // 1秒内丢包计算
    if (
      LDInfoEl.priorPkgnum !== 0 &&
      pkg.pkgnum - LDInfoEl.priorPkgnum > LDInfoEl.orderGap
    ) {
      // console.log(
      //   "丢包",
      //   LDInfoEl,
      //   pkg.pkgnum,
      //   LDInfoEl.priorPkgnum,
      //   pkg.pkgnum - LDInfoEl.priorPkgnum > LDInfoEl.orderGap
      // );

      LDInfoEl.packetLossRate =
        pkg.pkgnum -
        LDInfoEl.priorPkgnum +
        LDInfoEl.packetLossRate -
        LDInfoEl.orderGap;
      LDInfoEl.packetLossNum =
        pkg.pkgnum -
        LDInfoEl.priorPkgnum +
        LDInfoEl.packetLossNum -
        LDInfoEl.orderGap;
    }
  }
  // 当前是否丢包
  if (
    LDInfoEl.priorPkgnum !== 0 &&
    pkg.pkgnum - LDInfoEl.priorPkgnum > LDInfoEl.orderGap
  ) {
    LDInfoEl.lossNum = pkg.pkgnum - LDInfoEl.priorPkgnum - LDInfoEl.orderGap;
    LDInfoEl.isLosspkg = true;
  } else {
    LDInfoEl.isLosspkg = false;
    LDInfoEl.lossNum = 0;
  }
  LDInfoEl.priorPkgnum = pkg.pkgnum;
}

// 接收消息
process.on("message", async function ({ type, data }) {
  if (type === "filter-init") {
    signalProcess.init_filter(sample_rate, channel);
    signalProcess.clear_baseline();
    signalProcess.init_irbp_filter(ir_sample_rate, ir_channel, fl, fh);
  }
  if (type === "start-data-decode") {
    pkgDecode.pkg_recv();

    let recvBuffer = Buffer.from(data.data);

    // if (isTestPkg) {
    //   // 测试数据包
    //   if (buffers.length < 178) {
    //     return;
    //   }
    //   recvBuffer = Buffer.from(buffers[test_i % 178]);
    // }

    for (let i = 0; i < recvBuffer.length; i++) {
      pkgDecode.push_to_databuffer(recvBuffer[i]);
    }

    if (pkgDecode.get_pkg_buffer_length()) {
      // 返回一个指针

      const ptrpkg = pkgDecode.decode();
      // 获取值

      const pkg = ptrpkg.deref();

      //  测试数据包时间戳调整
      // if (isTestPkg) {
      //   pkg.time_mark = test_i * 40;
      // }

      // 原始数据转16位
      let hexString = arrayToHexString(pkg.pkg);

      // 假设丢包
      // if (pkg.pkgnum && pkg.pkgnum % 77 === 0) {
      //   console.log("假设丢包", pkg.pkgnum);
      //   pkgDecode.pkgbuffer_pop();
      //   return;
      // }

      // 计算丢包
      calculatePacketLoss(pkg);

      // 打印
      // console.log(
      //   "pkglen,pkgnum,time_mark,pkg_type,eeg_channel,ir_channel,eeg_data_num,error_state",
      //   pkg.pkglen,
      //   pkg.pkgnum,
      //   pkg.time_mark,
      //   pkg.pkg_type,
      //   pkg.eeg_channel,
      //   pkg.ir_channel,
      //   pkg.eeg_data_num,
      //   pkg.error_state
      // );

      let LDInfoEl = mapLossDataInfo(pkg.pkg_type);
      // pkg.pkg_type === 1  && LDInfoEl.isLosspkg && isFilter
      if (pkg.pkg_type === 1 && LDInfoEl.isLosspkg && isFilter) {
        //丢包插值暂时只支持开启滤波的工作模式
        for (let i = LDInfoEl.lossNum; i >= 1; i--) {
          // 复制包
          const newPkg = JSON.parse(JSON.stringify(pkg));
          newPkg.pkgnum = pkg.pkgnum - LDInfoEl.orderGap * i;
          newPkg.time_mark = pkg.time_mark - timeGap * i;
          newPkg.color = "red";
          processSend(newPkg, LDInfoEl, hexString);
          test_i++;
        }
      }
      LDInfoEl.isLosspkg = false;
      processSend(pkg, LDInfoEl, hexString);
      test_i++;

      // 释放内存
      pkgDecode.pkgbuffer_pop();
    }
  }

  if (type === "bluetooth-scan") {
    console.log("bluetooth-scan");
  }
});

// 发送数据到渲染进程
function processSend(
  pkg: any,
  LDInfoEl: typeof lossDataTemplate,
  hexString: any
) {
  // 有EEG数据标志位
  if (pkg.pkg_type === 1) {
    // 循环EEG数据

    for (let i = 0; i < pkg.eeg_data_num; i++) {
      let inputData = [];
      let d = new DoubleArray(channel);
      let e1 = new DoubleArray(channel); //Delta频段各通道时域数据数组
      let e2 = new DoubleArray(channel); //Theta频段各通道时域数据数组
      let e3 = new DoubleArray(channel); //Alpha频段各通道时域数据数组
      let e4 = new DoubleArray(channel); //Beta频段各通道时域数据数组
      let e5 = new DoubleArray(channel); //Gamma频段各通道时域数据数组

      if (isFilter) {
        // 滤波处理
        for (
          let current_channel = 0;
          current_channel < channel;
          current_channel++
        ) {
          inputData[current_channel] =
            pkg.brain_elec_channel[current_channel][i];
        }
        signalProcess.run_pre_process_filter(
          channel,
          new FloatArray(inputData),
          d,
          LDInfoEl.isLosspkg
        );
      }

      for (
        let current_channel = 0;
        current_channel < channel;
        current_channel++
      ) {
        if (isFilter) {
          // 滤波后数据赋值
          // d[0] = Math.random() * 100;
          pkg.brain_elec_channel[current_channel][i] = d[current_channel];
        } else {
          // 不滤波
          d[current_channel] = pkg.brain_elec_channel[current_channel][i];
        }
      }

      signalProcess.run_bp_filter(channel, d, e1, e2, e3, e4, e5);

      //计算频谱数组、频谱密度数组、频段频谱密度数组、相对频谱密度数组
      for (
        let current_channel = 0;
        current_channel < channel;
        current_channel++
      ) {
        time_e_s[current_channel] = [
          e1[current_channel],
          e2[current_channel],
          e3[current_channel],
          e4[current_channel],
          e5[current_channel],
        ];

        signalProcess.fft_ps(
          current_channel,
          sample_rate,
          d[current_channel], //(test_i + 1) % 32
          step,
          window,
          ps_s[current_channel],
          psd_s[current_channel],
          psd_relative_s[current_channel],
          psd_relative_percent_s[current_channel]
        ); //计算功率谱：假设d1为上述存储的最终滤波后数组,当函数返回值为true,输出频域数组ps,psd,psd_relative,psd_relative_percent会更新，此时需要将ps,psd,psd_relative,psd_relative_percent画图显示
      }
      time_e_s_multiple[i] = JSON.parse(JSON.stringify(time_e_s));
      // ps_s_multiple[i] = ps_s;
      psd_s_multiple[i] = JSON.parse(JSON.stringify(psd_s));
      psd_relative_s_multiple[i] = JSON.parse(JSON.stringify(psd_relative_s));
      psd_relative_percent_s_multiple[i] = JSON.parse(
        JSON.stringify(psd_relative_percent_s)
      );
      d = null;
      e1 = null;
      e2 = null;
      e3 = null;
      e4 = null;
      e5 = null;
    }
  }
  // 有IR数据标志位
  if (pkg.pkg_type === 2) {
    for (
      let current_channel = 0;
      current_channel < pkg.ir_channel;
      current_channel++
    ) {
      let ir_od = new DoubleArray(4);
      let ir_filter = new DoubleArray(4);
      // 将float数组转换为double数组,float数组直接传不行
      let ir_input = new DoubleArray(
        arrayToJs(pkg.near_infrared[current_channel])
      );
      let state = signalProcess.calc_od(
        current_channel,
        ir_sample_rate,
        baseline_time,
        ir_step,
        ir_input,
        ir_od
      ); //state 返回为ture时可以读取OD数据
      // console.log('state',state);

      if (isFilter) {
        signalProcess.run_irbp_filter(1, current_channel, ir_od, ir_filter);
        ir_od_date[current_channel] = JSON.parse(JSON.stringify(ir_filter));
      } else {
        ir_od_date[current_channel] = JSON.parse(JSON.stringify(ir_od));
      }

      ir_od = null;
      ir_filter = null;
    }
    // console.log('ir_od_date',ir_od_date);
    // console.log('ir_filter_date',ir_filter_date);
  }

  process.send!({
    type: "end-data-decode",
    data: {
      hexString: hexString,
      pkg,
      // ps_s,
      psd_s,
      psd_relative_s,
      // psd_relative_percent_s,
      time_e_s,
      // ps_s_multiple,
      psd_s_multiple,
      psd_relative_s_multiple,
      psd_relative_percent_s_multiple,
      time_e_s_multiple,
      ir_od_date,
      LDInfoEl,
    },
  });
}

// new DoubleArray数据转普通数组
function doubleArrayToArray(data: any) {
  return Array.from({ length: data.buffer.length / 8 }, (_, i) =>
    data.buffer.readDoubleLE(i * 8)
  );
}

function arrayToJs(array: any) {
  let newArray = [];
  for (let i = 0; i < array.length; i++) {
    newArray[i] = array[i];
  }
  return newArray;
}
