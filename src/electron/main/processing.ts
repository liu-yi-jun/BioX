// 滤波、功率谱计算
var ref = require("ref-napi");
var ffi = require("ffi-napi");
var ArrayType = require("ref-array-napi");
// 定义类型
const Float = ref.types.float;
const Int = ref.types.int;
const Bool = ref.types.bool;
const Double = ref.types.double;
const DoubleArray = ArrayType(Double);
const FloatArray = ArrayType(Float);
// 初始化参数
const fftWindow = 512; //fft 窗长  实际应用中，为了保证计算精度，fft窗长至少为512,需为2的幂次
const step = 10; //fft 步长
const sample_rate = 250;
const channel = 2;
const timeGap = 40; //包时间间隔，单位ms
// 近红外部分
const ir_sample_rate = 12.5;
const baseline_time = 10;
const ir_channel = 8;
const ir_step = 2;
const fl = 0.01; //fl 下截至频率
const fh = 0.5; //fh 上截止频率

let lossDataTemplate = {
  baseAdjustedTimestamps: 0, //基础某秒时间戳
  priorPkgnum: 0, //上一个包的包号
  priorTimeMark: 0, //上一个包的时间戳
  packetLossRate: 0, //数据包丢失率
  packetLossNum: 0, //数据包丢失总数
  isLosspkg: false, //是否丢包
  lossNum: 0, // 当前丢包数
  orderGap: 1, // 包序号间隔
};

function Processing(this: any, path: string, config: any) {
  this.config = config;
  this.ir_od_date = [];
  this.concentration_date = [];
  this.lossDataInfo = {
    EEG: JSON.parse(JSON.stringify(lossDataTemplate)),
    IR: JSON.parse(JSON.stringify(lossDataTemplate)),
    ELSE: JSON.parse(JSON.stringify(lossDataTemplate)),
  };

  this.time_e_s = [0, 0];
  this.time_e_s_multiple = [];
  this.ps_s_multiple = [];
  this.psd_s_multiple = [];
  this.psd_relative_s_multiple = [];
  this.psd_relative_percent_s_multiple = [];
  this.baseline_ok = false;

  // 这部分不能乱改，dll里面控制着
  this.ps_s = [
    new DoubleArray(fftWindow / 2 + 1),
    new DoubleArray(fftWindow / 2 + 1),
  ]; //频谱数组，长度为window/2+1，存储每个频率能量，单位为dB
  this.psd_s = [
    new DoubleArray(fftWindow / 2 + 1),
    new DoubleArray(fftWindow / 2 + 1),
  ]; //频谱密度数组，长度为window/2+1，存储每个频率，能量单位为dB
  this.psd_relative_s = [new DoubleArray(5), new DoubleArray(5)]; //频段频谱密度数组，长度为5，存储每个频段能量，单位为dB
  this.psd_relative_percent_s = [new DoubleArray(5), new DoubleArray(5)]; //相对频谱密度数组，长度为5，存储每个频段能量百分比，单位为%
  this.signalProcess = ffi.Library(path, {
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
    //基线归零（od里面的）
    clear_baseline: ["void", []],
    // 原始数据计算基线
    calc_baseline: [Bool, [Int, Double, Int, Int, DoubleArray, DoubleArray]],
    //计算光密度
    calc_od: [Bool, [Int, Double, Int, Int, DoubleArray, DoubleArray]], //channel:当前通道数（每个通道包含λ1，λ31，λ2，λ32四个波长数据）；sample_rate，int：采样率；base_line_time：用于计算基线的时间长度，单位为秒;step:滑窗步长，单位为点数；input:输入数据，为数组首地址；output:输出数据（各通道光密度），为数组首地址
    //age:受试者年龄，input：0D数据数组，包含4个波长数据；Output:输出浓度数组，顺序为[hbo,hb,hbt],hbo:氧合血红蛋白浓度，hb：脱氧血红蛋白浓度，hbt：血红蛋白总浓度
    calc_hb_2wave: [Bool, [Int, DoubleArray, DoubleArray]],
  });
}
Processing.prototype.init = function (this: any) {
  this.signalProcess.init_filter(sample_rate, channel);
  this.signalProcess.clear_baseline();
  this.baseline_ok = false;
  this.signalProcess.init_irbp_filter(ir_sample_rate, ir_channel, fl, fh);
};
Processing.prototype.processData = function (this: any, pkg: any) {
  let dataList: any = [];
  //  测试数据包时间戳调整
  // if (isTestPkg) {
  //   pkg.time_mark = test_i * 40;
  // }

  // 原始数据转16位
  // let hexString = arrayToHexString(pkg.pkg);

  // 假设丢包
  // if (pkg.pkgnum && pkg.pkgnum % 77 === 0) {
  //   console.log("假设丢包", pkg.pkgnum);
  //   pkgDecode.pkgbuffer_pop();
  //   return;
  // }

  // 计算丢包
  calculatePacketLoss.call(this, pkg);

  let LDInfoEl = mapLossDataInfo.call(this, pkg.pkg_type);

  // 打印
  const isDev = process.env.npm_lifecycle_event === "app:dev" ? true : false;
  if (!isDev) {
    console.log(
      "pkglen,pkgnum,time_mark,pkg_type,eeg_channel,ir_channel,brain_elec_channel,error_state,isLosspkg,pkg_type",
      pkg.pkglen,
      pkg.pkgnum,
      pkg.time_mark,
      pkg.pkg_type,
      pkg.eeg_channel,
      pkg.ir_channel,
      pkg.brain_elec_channel[0][0],
      pkg.brain_elec_channel[1][0],
      pkg.error_state,
      LDInfoEl.isLosspkg,
      pkg.pkg_type
    );
  }

  // pkg.pkg_type === 1  && LDInfoEl.isLosspkg && isFilter
  if (pkg.pkg_type === 1 && LDInfoEl.isLosspkg && this.config.isFilter) {
    //丢包插值暂时只支持开启滤波的工作模式
    for (let i = LDInfoEl.lossNum; i >= 1; i--) {
      // 复制包
      const newPkg = JSON.parse(JSON.stringify(pkg));
      newPkg.pkgnum = pkg.pkgnum - LDInfoEl.orderGap * i;
      newPkg.time_mark =
        pkg.time_mark -
        ((pkg.time_mark - LDInfoEl.priorTimeMark) /
          (pkg.pkgnum - LDInfoEl.priorPkgnum)) *
          i;
      newPkg.color = "red";
      dataList.push(processSend.call(this, newPkg, LDInfoEl));
    }
  }
  LDInfoEl.isLosspkg = false;
  dataList.push(processSend.call(this, pkg, LDInfoEl));
  LDInfoEl.priorPkgnum = pkg.pkgnum;
  LDInfoEl.priorTimeMark = pkg.time_mark;
  return dataList;
};

Processing.prototype.setConfig = function (this: any, config: any) {
  this.config = config;
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
function mapLossDataInfo(this: any, pkg_type: number) {
  switch (pkg_type) {
    case 1:
      return this.lossDataInfo.EEG;
    case 2:
      return this.lossDataInfo.IR;
    default:
      return this.lossDataInfo.ELSE;
  }
}

// 计算丢包
function calculatePacketLoss(this: any, pkg: any) {
  let LDInfoEl = mapLossDataInfo.call(this, pkg.pkg_type);
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
}

function processSend(this: any, pkg: any, LDInfoEl: typeof lossDataTemplate) {
  // 有EEG数据标志位
  if (pkg.pkg_type === 1) {
    // 循环EEG数据

    for (let i = 0; i < pkg.eeg_data_num; i++) {
      let inputData: any = [];
      let d = new DoubleArray(channel);
      let e1 = new DoubleArray(channel); //Delta频段各通道时域数据数组
      let e2 = new DoubleArray(channel); //Theta频段各通道时域数据数组
      let e3 = new DoubleArray(channel); //Alpha频段各通道时域数据数组
      let e4 = new DoubleArray(channel); //Beta频段各通道时域数据数组
      let e5 = new DoubleArray(channel); //Gamma频段各通道时域数据数组

      if (this.config.isFilter) {
        // 滤波处理
        for (
          let current_channel = 0;
          current_channel < channel;
          current_channel++
        ) {
          inputData[current_channel] =
            pkg.brain_elec_channel[current_channel][i];
        }
        this.signalProcess.run_pre_process_filter(
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
        if (this.config.isFilter) {
          // 滤波后数据赋值
          // d[0] = Math.random() * 100;
          pkg.brain_elec_channel[current_channel][i] = d[current_channel];
        } else {
          // 不滤波
          d[current_channel] = pkg.brain_elec_channel[current_channel][i];
        }
      }

      this.signalProcess.run_bp_filter(channel, d, e1, e2, e3, e4, e5);

      //计算频谱数组、频谱密度数组、频段频谱密度数组、相对频谱密度数组
      for (
        let current_channel = 0;
        current_channel < channel;
        current_channel++
      ) {
        this.time_e_s[current_channel] = [
          e1[current_channel],
          e2[current_channel],
          e3[current_channel],
          e4[current_channel],
          e5[current_channel],
        ];

        this.signalProcess.fft_ps(
          current_channel,
          sample_rate,
          d[current_channel], //(test_i + 1) % 32
          step,
          fftWindow,
          this.ps_s[current_channel],
          this.psd_s[current_channel],
          this.psd_relative_s[current_channel],
          this.psd_relative_percent_s[current_channel]
        ); //计算功率谱：假设d1为上述存储的最终滤波后数组,当函数返回值为true,输出频域数组ps,psd,psd_relative,psd_relative_percent会更新，此时需要将ps,psd,psd_relative,psd_relative_percent画图显示
      }
      this.time_e_s_multiple[i] = JSON.parse(JSON.stringify(this.time_e_s));
      // ps_s_multiple[i] = ps_s;
      this.psd_s_multiple[i] = JSON.parse(JSON.stringify(this.psd_s));
      this.psd_relative_s_multiple[i] = JSON.parse(
        JSON.stringify(this.psd_relative_s)
      );
      this.psd_relative_percent_s_multiple[i] = JSON.parse(
        JSON.stringify(this.psd_relative_percent_s)
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
      let ir_date_remove = new DoubleArray(4);
      let concentration = new DoubleArray(3); ///顺序为hbo,hb,hbt
      // 将float数组转换为double数组,float数组直接传不行

      let ir_input = new DoubleArray(
        arrayToJs(pkg.near_infrared[current_channel])
      );

      // 基线
      let state = this.signalProcess.calc_baseline(
        current_channel,
        ir_sample_rate,
        baseline_time,
        ir_step,
        ir_input,
        ir_date_remove
      );

      if (this.config.isBaseline) {
        pkg.near_infrared[current_channel] = arrayToJs(ir_date_remove);
      }

      if (state) {
        this.baseline_ok = true;
      }
      

      if (this.baseline_ok) {

        this.signalProcess.calc_od(
          current_channel,
          ir_sample_rate,
          baseline_time,
          ir_step,
          ir_input,
          ir_od
        );

        this.signalProcess.calc_hb_2wave(this.config.age, ir_od, concentration);
      }

      // od滤波
      // this.signalProcess.run_irbp_filter(1, current_channel, ir_od, ir_filter);

      this.ir_od_date[current_channel] = JSON.parse(JSON.stringify(ir_od));

      // hbo,hb,hbt
      this.concentration_date[current_channel] = JSON.parse(
        JSON.stringify(concentration)
      );

      ir_od = null;
      concentration = null;
      ir_filter = null;
    }
    // console.log('ir_od_date',ir_od_date);
    // console.log('ir_filter_date',ir_filter_date);
  }

  return {
    pkg,
    // ps_s,
    psd_s: this.psd_s,
    psd_relative_s: this.psd_relative_s,
    // psd_relative_percent_s,
    time_e_s: this.time_e_s,
    // ps_s_multiple,
    psd_s_multiple: this.psd_s_multiple,
    psd_relative_s_multiple: this.psd_relative_s_multiple,
    psd_relative_percent_s_multiple: this.psd_relative_percent_s_multiple,
    time_e_s_multiple: this.time_e_s_multiple,
    ir_od_date: this.ir_od_date,
    concentration_date: this.concentration_date,
    loss_data_info_el: LDInfoEl,
  };
}

function arrayToJs(array: any) {
  let newArray: any = [];
  for (let i = 0; i < array.length; i++) {
    newArray[i] = array[i];
  }
  return newArray;
}

module.exports = Processing;
