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

const PKG = Struct({
  pkglen: ref.types.int16,
  pkgnum: ref.types.int32,
  time_mark: ref.types.int32,
  // brain_elec_channel: ArrayType(ref.types.float, 2),
  brain_elec_channel1: ArrayType(ref.types.float, 10), //EEG通道1的10个数据
  brain_elec_channel2: ArrayType(ref.types.float, 10), //EEG通道2的10个数据
  near_infrared_channel_1_wavelength_1: ArrayType(ref.types.float, 4), // IR第1通道第1个波长
  near_infrared_channel_1_wavelength_2: ArrayType(ref.types.float, 4), // IR第1通道第2个波长
  near_infrared_channel_1_wavelength_13: ArrayType(ref.types.float, 4), // IR第1通道λ3，（与λ1同时采集）
  near_infrared_channel_1_wavelength_23: ArrayType(ref.types.float, 4), // IR第1通道λ3，（与λ2同时采集）
  near_infrared_channel_2_wavelength_1: ArrayType(ref.types.float, 4), // IR第2通道第1个波长
  near_infrared_channel_2_wavelength_2: ArrayType(ref.types.float, 4), // IR第2通道第2个波长
  near_infrared_channel_2_wavelength_13: ArrayType(ref.types.float, 4), // IR第2通道λ3，（与λ1同时采集）
  near_infrared_channel_2_wavelength_23: ArrayType(ref.types.float, 4), // IR第2通道λ3，（与λ2同时采集）
  acceleration_x: ref.types.float,
  acceleration_y: ref.types.float,
  acceleration_z: ref.types.float,
  temperature: ref.types.float, //额温
  Battery_State: ref.types.float, //电池剩余电量
  fall_off: ref.types.int32, //电极脱落状态，Lead-Off Detection status  (32)  int32
  error_state: ref.types.int32, //错误状态
  EEG_DATA: ref.types.bool, //EEG数据标志位
  ELSE_DATA: ref.types.bool, //其他数据标志位
  pkg: ArrayType(ref.types.uint8, 300),
});

// 加载DLL
// 解析数据
var pkg_decode_path = join(_product_path, "/dll/pkg_decode(9).dll");

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
});

let test_i = 0;
let packetLossRate = 0; //数据包丢失率
let packetLossNum = 0; //数据包丢失总数
let baseAdjustedTimestamps = 0;
let priorPkgnum = 0; //上一个包的包号
// const isTestPkg = false;

// 初始化参数
const window = 512; //fft 窗长  实际应用中，为了保证计算精度，fft窗长至少为512,需为2的幂次
const step = 10; //fft 步长
const sample_rate = 250;
const EEGNumber = 10; // eeg数据量
const d = new DoubleArray(2);
const e1 = new DoubleArray(2); //Delta频段各通道时域数据数组
const e2 = new DoubleArray(2); //Theta频段各通道时域数据数组
const e3 = new DoubleArray(2); //Alpha频段各通道时域数据数组
const e4 = new DoubleArray(2); //Beta频段各通道时域数据数组
const e5 = new DoubleArray(2); //Gamma频段各通道时域数据数组
const channel = 2;
const ps = new DoubleArray(window / 2 + 1); //频谱数组，长度为window/2+1，存储每个频率能量，单位为dB
const psd = new DoubleArray(window / 2 + 1); //频谱密度数组，长度为window/2+1，存储每个频率，能量单位为dB
const psd_relative = new DoubleArray(5); //频段频谱密度数组，长度为5，存储每个频段能量，单位为dB
const psd_relative_percent = new DoubleArray(5); //相对频谱密度数组，长度为5，存储每个频段能量百分比，单位为%
const timeGap = 40; //包时间间隔，单位ms

const time_e_s: any = [0, 0];
const ps_s: any = [0, 0];
const psd_s: any = [0, 0];
const psd_relative_s: any = [0, 0];
const psd_relative_percent_s: any = [0, 0];
const time_e_s_multiple: any = [];
const ps_s_multiple: any = [];
const psd_s_multiple: any = [];
const psd_relative_s_multiple: any = [];
const psd_relative_percent_s_multiple: any = [];

let losspkg = false;
let lossNum = 0; // 当前丢包数
let orderGap = 1; // 包序号间隔

const arrayToHexString = (array: any) => {
  let hexString = "";
  for (let i = 0; i < array.length; i++) {
    const hexValue = array[i].toString(16).padStart(2, "0"); // 确保每个值都是两位数
    hexString = hexString + " " + hexValue;
  }
  return hexString;
};

const adjustTimestamps = (timestamp: number): number => {
  const remainder = timestamp % 1000;
  return timestamp - remainder;
};

// 接收消息
process.on("message", async function ({ type, data }) {
  if (type === "filter-init") {
    signalProcess.init_filter(sample_rate, channel);
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

      // 计算丢包率
      let adjustedTimestamps = adjustTimestamps(pkg.time_mark);

      if (baseAdjustedTimestamps !== adjustedTimestamps) {
        baseAdjustedTimestamps = adjustedTimestamps;
        packetLossRate = 0;
      }
      if (
        pkg.time_mark >= baseAdjustedTimestamps &&
        pkg.time_mark < baseAdjustedTimestamps + 1000
      ) {
        // 1秒内丢包计算
        if (priorPkgnum !== 0 && pkg.pkgnum - priorPkgnum > orderGap) {
          packetLossRate = pkg.pkgnum - priorPkgnum + packetLossRate - orderGap;
          packetLossNum = pkg.pkgnum - priorPkgnum + packetLossNum - orderGap;
        }
      }
      // 当前是否丢包
      if (priorPkgnum !== 0 && pkg.pkgnum - priorPkgnum > orderGap) {
        lossNum = pkg.pkgnum - priorPkgnum - orderGap;
        losspkg = true;
      } else {
        losspkg = false;
        lossNum = 0;
      }
      priorPkgnum = pkg.pkgnum;

      // 打印
      // console.log(
      //   "pkglen,pkgnum,time_mark,error_state,EEG_DATA,ELSE_DATA,packetLossRate",
      //   pkg.pkglen,
      //   pkg.pkgnum,
      //   pkg.time_mark,
      //   pkg.error_state,
      //   pkg.EEG_DATA,
      //   pkg.ELSE_DATA,
      //   packetLossRate,
      //   packetLossNum
      // );
      // console.log(pkg, "pkg");

      if (losspkg && isFilter) {
        //丢包插值暂时只支持开启滤波的工作模式
        for (let i = lossNum; i >= 1; i--) {
          // 复制包
          const newPkg = JSON.parse(JSON.stringify(pkg));
          newPkg.pkgnum = pkg.pkgnum - orderGap * i;
          newPkg.time_mark = pkg.time_mark - timeGap * i;
          newPkg.color = "red";
          console.log("复制的包", newPkg.pkgnum, newPkg.time_mark);
          console.log("当前的包", pkg.pkgnum, pkg.time_mark);
          processSend(newPkg, hexString);
          test_i++;
        }
      }
      losspkg = false;
      processSend(pkg, hexString);
      test_i++;

      // 释放内存
      pkgDecode.pkgbuffer_pop();
    }
  }

  if (type === "bluetooth-scan") {
    console.log("bluetooth-scan");
  }
});

function processSend(pkg: any, hexString: any) {
  // 有EEG数据标志位
  if (pkg.EEG_DATA) {
    // 循环EEG数据
    for (let i = 0; i < EEGNumber; i++) {
      if (isFilter) {
        // 滤波处理
        signalProcess.run_pre_process_filter(
          channel,
          new FloatArray([
            pkg.brain_elec_channel1[i],
            pkg.brain_elec_channel2[i],
          ]),
          d,
          losspkg
        );
        pkg.brain_elec_channel1[i] = d[0];
        pkg.brain_elec_channel2[i] = d[1];
      } else {
        // 不滤波
        d[0] = pkg.brain_elec_channel1[i];
        d[1] = pkg.brain_elec_channel2[i];
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
          ps,
          psd,
          psd_relative,
          psd_relative_percent
        ); //计算功率谱：假设d1为上述存储的最终滤波后数组,当函数返回值为true,输出频域数组ps,psd,psd_relative,psd_relative_percent会更新，此时需要将ps,psd,psd_relative,psd_relative_percent画图显示

        // ps_s[current_channel] = ps;
        psd_s[current_channel] = psd;
        psd_relative_s[current_channel] = psd_relative;
        psd_relative_percent_s[current_channel] = psd_relative_percent;
      }
      time_e_s_multiple[i] = time_e_s;
      // ps_s_multiple[i] = ps_s;
      psd_s_multiple[i] = psd_s;
      psd_relative_s_multiple[i] = psd_relative_s;
      psd_relative_percent_s_multiple[i] = psd_relative_percent_s;
    }
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
      packetLossRate,
      packetLossNum,
    },
  });
}

// new DoubleArray数据转普通数组
function doubleArrayToArray(data: any) {
  return Array.from({ length: data.buffer.length / 8 }, (_, i) =>
    data.buffer.readDoubleLE(i * 8)
  );
}
