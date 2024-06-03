var ref = require("ref-napi");
var ffi = require("ffi-napi");
import { join } from "path";
const Struct = require("ref-struct-napi");
var ArrayType = require("ref-array-napi");
let __static = process.argv[2];
let _product_path = process.argv[3];
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
  run_pre_process_filter: ["void", [Int, FloatArray, DoubleArray]], //滤除100HZ;x[channel]是各个通道当前接收到数据的数组，d[channel]是各个通道滤波后数据的数组，为最终拿去做fft的数据，
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
      Float,
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

// 初始化参数
const window = 512; //fft 窗长  实际应用中，为了保证计算精度，fft窗长至少为512,需为2的幂次
const step = 10; //fft 步长
const sample_rate = 250;
const EEGNumber = 10; // eeg数据量
const isFilter = false;
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

const arrayToHexString = (array: any) => {
  let hexString = "";
  for (let i = 0; i < array.length; i++) {
    const hexValue = array[i].toString(16).padStart(2, "0"); // 确保每个值都是两位数
    hexString = hexString + " " + hexValue;
  }
  return hexString;
};

// 接收消息
process.on("message", async function ({ type, data }) {
  if (type === "filter-init") {
    signalProcess.init_filter(sample_rate, channel);
  }
  if (type === "start-data-decode") {
    pkgDecode.pkg_recv();
    
    // 测试数据包
    // if (buffers.length < 178) {
    //   return;
    // }
    // let recvBuffer = Buffer.from(buffers[test_i % 178]);

    let recvBuffer = Buffer.from(data.data);


    for (let i = 0; i < recvBuffer.length; i++) {
      pkgDecode.push_to_databuffer(recvBuffer[i]);
    }

    if (pkgDecode.get_pkg_buffer_length()) {
      // 返回一个指针
      const ptrpkg = pkgDecode.decode();
      // 获取值
      const pkg = ptrpkg.deref();

      // 原始数据转16位
      let hexString = arrayToHexString(pkg.pkg);

      console.log(
        "pkglen,pkgnum,time_mark,error_state",
        pkg.pkglen,
        pkg.pkgnum,
        pkg.time_mark,
        pkg.error_state,
        pkg.EEG_DATA,
        pkg.ELSE_DATA
      );

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
              d
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

      test_i++;

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
        },
      });

      // console.log(e,'111');

      pkgDecode.pkgbuffer_pop();
    }
  }

  if (type === "bluetooth-scan") {
    console.log("bluetooth-scan");
  }
});

// new DoubleArray数据转普通数组
function doubleArrayToArray(data: any) {
  return Array.from({ length: data.buffer.length / 8 }, (_, i) =>
    data.buffer.readDoubleLE(i * 8)
  );
}

// //计算功率谱、计算功率谱密度、计算相对功率谱

// function calculatePowerSpectrum(d: number) {
//   // let psState = signalProcess.fft_ps(d, step, window, y); //计算功率谱：假设d1为上述存储的最终滤波后数组,当fft_ps（d1[i],step,window,y）返回值为true,fft输出频域数组y[]会更新，此时需要将y[]画图显示；单位为db
//   let psdState = signalProcess.fft_psd(d, sample_rate, step, window, y); //计算功率谱密度：假设d1为上述存储的最终滤波后数组,当fft_psd（d1[i],step,window,y）返回值为true,fft输出频域数组y[]会更新，此时需要将y[]画图显示；单位为db
//   // let relatedState = signalProcess.fft_psd_relative(
//   //   d,
//   //   sample_rate,
//   //   step,
//   //   window,
//   //   y2
//   // ); //计算相对功率谱：假设d1为上述存储的最终滤波后数组,当fft_psd_relative（d1[i],sample_rate,step,window,y）返回值为true,数组y2[]会更新，此时需要将y[]画图显示,y2[]为相对频谱密度数组，长度为7，存储每个频段能量百分比单位为%单位为%

//   return {
//     // psState: psState,
//     // ps: Array.from({ length: y.buffer.length / 8 }, (_, i) =>
//     //   y.buffer.readDoubleLE(i * 8)
//     // ),
//     psdState: psdState,
//     psd: Array.from({ length: y.buffer.length / 8 }, (_, i) =>
//       y.buffer.readDoubleLE(i * 8)
//     ),
//     relatedState: true,
//     related: [0, 0, 0, 0, 0, 0, 0],
//     // relatedState: relatedState,
//     // related: Array.from({ length: y2.buffer.length / 8 }, (_, i) =>
//     //   y2.buffer.readDoubleLE(i * 8)
//     // ),
//   };
// }
