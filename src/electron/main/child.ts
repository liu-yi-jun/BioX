var ref = require("ref-napi");
var ffi = require("ffi-napi");
import { join } from "path";
const Struct = require("ref-struct-napi");
var ArrayType = require("ref-array-napi");
const Processing = require("./processing");

let __static = process.argv[2];
let _product_path = process.argv[3];
const processing: any = new Processing(
  join(_product_path, "/dll/signal_process.dll"),
  process.argv[4] // 加载配置项
);

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
const max__wave_channel = 4;

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
  near_infrared: ArrayType(
    ArrayType(ref.types.float, max__wave_channel),
    max__ir_channel
  ), // 8个通道的近红外数据，依次为S1，PD1；S1，PD2；S1，PD3；S1，PD4；S2，PD1；S2，PD2；S2，PD3；S2，PD4；；每个通道内数据依次为λ1 λ31 λ2 λ32
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
  // pkg: ArrayType(ref.types.uint8, 300),
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

// 接收消息
process.on("message", async function ({ type, data }) {
  if (type === "filter-init") {
    processing.init();
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
      let dataList = processing.processData(pkg);
      dataList.forEach((item: any) => {
        process.send!({
          type: "end-data-decode",
          data: item,
        });
      });
      // 释放内存
      pkgDecode.pkgbuffer_pop();
    }
  }

  if (type === "bluetooth-scan") {
    console.log("bluetooth-scan");
  }
  if (type === "change-config") {
    processing.setConfig(JSON.parse(data));
    process.send!({
      type: "change-config-success",
      data: true,
    });
  }
  if (type === "change-config-field") {
    processing.setConfig(JSON.parse(data).config);
    let field = JSON.parse(data).field;
    if (field === "filterConfig" || field === "plotType") {
      processing.setInit();
    }

    process.send!({
      type: "change-config-field-success",
      data: {
        field: field,
        status: true,
      },
    });
  }
});
