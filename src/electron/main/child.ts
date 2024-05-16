var ref = require("ref-napi");
var ffi = require("ffi-napi");
import { join } from "path";
const Struct = require("ref-struct-napi");
var ArrayType = require("ref-array-napi");
let __static = process.argv[2];
let _product_path = process.argv[3];
// 定义指针类型
// 定义用于映射DLL内结构体的结构
const PKG = Struct({
  pkglen: ref.types.int16,
  time_mark: ref.types.int32,
  brain_elec_channel: ArrayType(ref.types.int32, 8),
  near_infrared_channel: ArrayType(ref.types.int32, 6),
  acceleration_x: ref.types.uint16,
  acceleration_y: ref.types.uint16,
  acceleration_z: ref.types.uint16,
  temperature: ref.types.int16,
  fall_off: ref.types.uint8,
  error_state: ref.types.int16,
});

// 加载DLL
// 解析数据
var pkg_decode_path = join(_product_path, "/dll/pkg_decode.dll");
// var bluetooth_lib_path = join(_product_path, "/so/cpython.so");
// var mymodule = join(_product_path, "/pyd/mymodule.pyd");

// const bluetoothDecode = ffi.Library(bluetooth_lib_path, {
//   get_devices: ["void", []],
// });

// const bluetoothDecode = ffi.Library(mymodule, {
//   'my_function': ['int', ['int', 'int']]
// });

const pkgDecode = ffi.Library(pkg_decode_path, {
  get_pkg_buffer_length: ["int", []],
  push_to_databuffer: ["void", ["uint8"]],
  pkgbuffer_pop: ["void", []],
  pkg_recv: ["void", []],
  // ref.refType(PKG)定义一个PKG类型的指针
  decode: [ref.refType(PKG), []],
});

// 滤波、功率谱计算
var signal_process_path = join(_product_path, "/dll/signal_process(2).dll");
// 定义类型
const Float = ref.types.float;
const Int = ref.types.int;
const Bool = ref.types.bool;
const Double = ref.types.double;
const DoubleArray = ArrayType(ref.types.double);
// 加载库
const signalProcess = ffi.Library(signal_process_path, {
  init_hp_filter: ["void", [Int]],
  run_hp_filter: [Double, [Double]],
  init_lp_filter: ["void", [Int]],
  run_lp_filter: [Double, [Double]],
  init_notch_filter1: ["void", [Int]],
  run_notch_filter1: [Double, [Double]],
  init_notch_filter2: ["void", [Int]],
  run_notch_filter2: [Double, [Double]],
  init_bp_filter: ["void", [Int, Int, Int]],
  run_bp_filter: [Double, [Double]],
  fft_ps: [Bool, [Float, Int, Int, DoubleArray]],
  fft_psd: [Bool, [Float, Int, Int, Int, DoubleArray]],
  fft_psd_relative: [Bool, [Float, Int, Int, Int, DoubleArray]],
});

let test_i = 0;

// 初始化参数
const window = 8; //fft 窗长  实际应用中，为了保证计算精度，fft窗长至少为500
const step = 2; //fft 步长
const y = new DoubleArray(window / 2 + 1);
const y2 = new DoubleArray(7); // 相对频谱密度数组，长度为7，存储每个频段能量百分比单位为%
const sample_rate = 500;
// 接收消息
process.on("message", async function ({ type, data }) {
  if (type === "filter-init") {
    // 滤波器初始化
    filterInit();
    bpFilterInit(3, 10);
  }
  if (type === "start-data-decode") {
    pkgDecode.pkg_recv();
    let recvBuffer = Buffer.from(data.data);
    for (let i = 0; i < recvBuffer.length; i++) {
      pkgDecode.push_to_databuffer(recvBuffer[i]);
    }

    if (pkgDecode.get_pkg_buffer_length()) {
      // 返回一个指针
      const ptrpkg = pkgDecode.decode();
      // 获取值
      const pkg = ptrpkg.deref();
      // console.log('pkg.pkglen',pkg.pkglen);
      // console.log('pkg.time_mark',pkg.time_mark);
      // console.log('brain_elec_channel.0',pkg.brain_elec_channel[0]);
      // console.log('brain_elec_channel.1',pkg.brain_elec_channel[1]);
      // console.log('brain_elec_channel.1',pkg.brain_elec_channel[0],Array.from({ length: pkg.brain_elec_channel.buffer.length / 4 }, (_, i) => pkg.brain_elec_channel.buffer.readInt32LE(i * 4)));
      // console.log('near_infrared_channel.0',pkg.near_infrared_channel[0]); 1-1
      // console.log('near_infrared_channel.1',pkg.near_infrared_channel[1]); 1-2
      // console.log('near_infrared_channel.2',pkg.near_infrared_channel[2]); 1-3
      // console.log('near_infrared_channel.3',pkg.near_infrared_channel[3]); 2-1
      // console.log('near_infrared_channel.4',pkg.near_infrared_channel[4]); 2-2
      // console.log('near_infrared_channel.5',pkg.near_infrared_channel[5]); 2-3
      // console.log('acceleration_x',pkg.acceleration_x);
      // console.log('acceleration_y',pkg.acceleration_y);
      // console.log('acceleration_z',pkg.acceleration_z);
      // console.log('temperature',pkg.temperature);
      // console.log('fall_off',pkg.fall_off);
      // console.log('error_state',pkg.error_state);

      let d1 = filterProcess(pkg.brain_elec_channel[0]); // 滤波处理 第一通道
      let bp1 = bpFilterProcess(d1);
      // (test_i + 1) % 32
      let psdFp1 = calculatePowerSpectrum(d1); // 功率谱计算 第一通道
      // test_i++;

      // let d2 = filterProcess(pkg.brain_elec_channel[1]); // 滤波处理 第二通道
      // let bp2 = bpFilterProcess(d2);
      // let psdFp2 = calculatePowerSpectrum( d2); // 功率谱计算 第二通道
      process.send!({
        type: "end-data-decode",
        data: {
          pkg,
          psdFp1,
          barnsTimeFp1: {
            DELTA: 0,
            THETA: 0,
            ALPHA: 0,
            BETA: bp1,
            GAMMA: 0,
          },
          psdFp2: [],
          barnsTimeFp2: {
            BETA: [],
          },
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

// 滤波器初始化
function filterInit() {
  signalProcess.init_notch_filter1(sample_rate); //初始化陷波滤波器1
  signalProcess.init_notch_filter2(sample_rate); //初始化陷波滤波器2
  signalProcess.init_lp_filter(sample_rate); //初始化低通滤波器
  signalProcess.init_hp_filter(sample_rate); //初始化高通滤波器
}

// 滤波处理
function filterProcess(x: number) {
  let a = signalProcess.run_hp_filter(x); //1HZ高通
  let b = signalProcess.run_lp_filter(a); //100HZ低通
  let c = signalProcess.run_notch_filter1(b); //滤除50HZ；
  let d = signalProcess.run_notch_filter2(c); //滤除100HZ;d为最终拿去做fft的数据，需要存入一个数组
  return d;
}

// 带通滤波器初始化
function bpFilterInit(band_fl: number, band_fh: number) {
  //带通下限,带通上限
  signalProcess.init_bp_filter(sample_rate, band_fl, band_fh);
}

// 带通处理
function bpFilterProcess(d: number) {
  let e = signalProcess.run_bp_filter(d);
  return e;
}

//计算功率谱、计算功率谱密度、计算相对功率谱

function calculatePowerSpectrum(d: number) {
  // let psState = signalProcess.fft_ps(d, step, window, y); //计算功率谱：假设d1为上述存储的最终滤波后数组,当fft_ps（d1[i],step,window,y）返回值为true,fft输出频域数组y[]会更新，此时需要将y[]画图显示；单位为db
  let psdState = signalProcess.fft_psd(d, sample_rate, step, window, y); //计算功率谱密度：假设d1为上述存储的最终滤波后数组,当fft_psd（d1[i],step,window,y）返回值为true,fft输出频域数组y[]会更新，此时需要将y[]画图显示；单位为db
  // let relatedState = signalProcess.fft_psd_relative(
  //   d,
  //   sample_rate,
  //   step,
  //   window,
  //   y2
  // ); //计算相对功率谱：假设d1为上述存储的最终滤波后数组,当fft_psd_relative（d1[i],sample_rate,step,window,y）返回值为true,数组y2[]会更新，此时需要将y[]画图显示,y2[]为相对频谱密度数组，长度为7，存储每个频段能量百分比单位为%单位为%

  return {
    // psState: psState,
    // ps: Array.from({ length: y.buffer.length / 8 }, (_, i) =>
    //   y.buffer.readDoubleLE(i * 8)
    // ),
    psdState: psdState,
    psd: Array.from({ length: y.buffer.length / 8 }, (_, i) =>
      y.buffer.readDoubleLE(i * 8)
    ),
    relatedState:true,
    related:[0,0,0,0,0,0,0]
    // relatedState: relatedState,
    // related: Array.from({ length: y2.buffer.length / 8 }, (_, i) =>
    //   y2.buffer.readDoubleLE(i * 8)
    // ),
  };
}
