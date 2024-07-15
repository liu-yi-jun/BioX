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
let sample_rate = 250;
const channel = 2;
const timeGap = 40; //包时间间隔，单位ms
// 近红外部分
const baseline_time = 10;
const ir_channel = 8;
const ir_step = 2;
const fl = 0.01; //fl 下截至频率
const fh = 0.5; //fh 上截止频率

const L = [3.182, 2.515, 2.515, 0.795, 3.182, 2.515, 2.515, 0.795];

let lossDataTemplate = {
  baseAdjustedTimestamps: 0, //基础某秒时间戳
  priorPkgnum: 0, //上一个包的包号
  priorTimeMark: 0, //上一个包的时间戳
  packetLossRate: 0, //数据包丢失率
  packetLossNum: 0, //数据包丢失总数
  isLosspkg: false, //是否丢包
  lossNum: 0, // 当前丢包数
  orderGap: 1, // 包序号间隔
  oldPkg: null, //上一个包
};

function Processing(this: any, path: string, config: any) {
  console.log("config", config);

  this.config = JSON.parse(config);
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
  //流程网站https://backoqdkrcv.feishu.cn/docx/ChsEdEvc4ohGMYxdy7ccMCmTngd
  this.signalProcess = ffi.Library(path, {
    // 脑电部分
    // init_filter: ["void", [Int, Int]],
    // init_bp_filter: ["void", [Int, Int]],
    init_notch_filter: ["void", [Int, Int]], //初始化50Hz,100Hz Notch滤波器
    run_notch_filter_50Hz: ["void", [Int, DoubleArray, DoubleArray]], //运行50Hz Notch滤波器,channel:EEG总通道数，input:输入数组首地址，output：输出数组首地址
    run_notch_filter_100Hz: ["void", [Int, DoubleArray, DoubleArray]], //运行100Hz Notch滤波器
    run_dc_remove_eeg: ["void", [Int, DoubleArray, DoubleArray]], //运行EEG去基线
    init_eegbp_filter_eegbands: ["void", [Int, Int]], //初始化用于脑电节律显示的带通滤波器
    run_eegbp_filter_eegbands: [
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
    ], //运行用于脑电节律显示的带通滤波器
    init_eegbp_filter_draw: ["void", [Int, Int, Double, Double]], //初始化用于主画图时域视窗的带通滤波器 	//sample_rate:采样率，channel:总通道数；fl:下截至频率；fh：上截止频率
    run_eegbp_filter_draw: ["void", [Int, Int, DoubleArray, DoubleArray]], //运行用于主画图时域视窗的带通滤波器 //filter_type:int型变量，1:“Butterworth”，2:“ChebyshevI”，3:“ChebyshevII”，channel:当前通道，input:输入数据，为数组首地址；output:输出数据（滤波后数据），为数组首地址
    // run_pre_process_filter: ["void", [Int, FloatArray, DoubleArray, Bool]], //滤除100HZ;x[channel]是各个通道当前接收到数据的数组，d[channel]是各个通道滤波后数据的数组，为最终拿去做fft的数据，
    // run_bp_filter: [
    //   "void",
    //   [
    //     Int,
    //     DoubleArray,
    //     DoubleArray,
    //     DoubleArray,
    //     DoubleArray,
    //     DoubleArray,
    //     DoubleArray,
    //   ],
    // ],

    fft_ps: [Bool, [Int, Int, Double, Int, Int, DoubleArray, DoubleArray]],
    fft_ps_eegbands: [
      Bool,
      [Int, Int, Double, Int, Int, DoubleArray, DoubleArray],
    ],

    // 近红外部分
    //初始化ir滤波器
    init_irbp_filter: ["void", [Double, Int, Double, Double]], //sample_rate:采样率，total_channel:总通道数；fl:下截至频率；fh：上截止频率
    run_irbp_filter: ["void", [Int, Int, DoubleArray, DoubleArray]], //filter_type:字符型变量，“Butterworth”，“ChebyshevI”，“ChebyshevII”，channel:当前通道，input:输入数据，为数组首地址；output:输出数据（滤波后数据），为数组首地址
    //基线归零
    clear_baseline: ["void", []],
    // 原始数据计算基线
    calc_baseline: [Bool, [Int, Double, Int, Int, DoubleArray, DoubleArray]],
    //计算光密度
    calc_od: [Bool, [Int, Double, Int, Int, DoubleArray, DoubleArray]], //channel:当前通道数（每个通道包含λ1，λ31，λ2，λ32四个波长数据）；sample_rate，int：采样率；base_line_time：用于计算基线的时间长度，单位为秒;step:滑窗步长，单位为点数；input:输入数据，为数组首地址；output:输出数据（各通道光密度），为数组首地址
    //age:受试者年龄，input：0D数据数组，包含4个波长数据；L:发射到输出的距离(CM);Output:输出浓度数组，顺序为[hbo,hb,hbt],hbo:氧合血红蛋白浓度，hb：脱氧血红蛋白浓度，hbt：血红蛋白总浓度
    calc_hb_2wave: [Bool, [Int, Double, DoubleArray, DoubleArray]],
    //age:受试者年龄，input：0D数据数组，包含4个波长数据；L:发射到输出的距离(CM);Output:输出浓度数组，顺序为[hbo,hb,hbt],hbo:氧合血红蛋白浓度，hb：脱氧血红蛋白浓度，hbt：血红蛋白总浓度
    calc_hb_3wave: [Bool, [Int, Double, DoubleArray, DoubleArray]],
  });
}
Processing.prototype.init = function (this: any) {
  // this.signalProcess.init_filter(sample_rate, channel);
  // 脑电初始化
  this.signalProcess.init_notch_filter(sample_rate, channel);
  this.signalProcess.init_eegbp_filter_eegbands(sample_rate, channel);
  this.signalProcess.init_eegbp_filter_draw(
    sample_rate,
    channel,
    this.config.eegFilter.fl,
    this.config.eegFilter.fh
  );

  // 近红外初始化
  this.signalProcess.clear_baseline();
  this.baseline_ok = false;
  this.signalProcess.init_irbp_filter(
    this.config.irFilter.ir_sample_rate,
    ir_channel,
    this.config.irFilter.fl,
    this.config.irFilter.fh
  );
};
Processing.prototype.setInit = function (this: any) {
  console.log("setInit", this.config.irFilter.ir_sample_rate);

  this.signalProcess.init_irbp_filter(
    this.config.irFilter.ir_sample_rate,
    ir_channel,
    this.config.irFilter.fl,
    this.config.irFilter.fh
  );
  this.signalProcess.clear_baseline();
  this.signalProcess.init_eegbp_filter_draw(
    sample_rate,
    channel,
    this.config.eegFilter.fl,
    this.config.eegFilter.fh
  );
  this.baseline_ok = false;
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
  let copePkg = JSON.parse(JSON.stringify(pkg));
  if (LDInfoEl.isLosspkg) {
    for (let i = LDInfoEl.lossNum; i >= 1; i--) {
      // 复制包
      if (LDInfoEl.oldPkg) {
        const newPkg = JSON.parse(JSON.stringify(LDInfoEl.oldPkg));
        newPkg.pkgnum = pkg.pkgnum - LDInfoEl.orderGap * i;
        newPkg.time_mark =
          pkg.time_mark -
          ((pkg.time_mark - LDInfoEl.priorTimeMark) /
            (pkg.pkgnum - LDInfoEl.priorPkgnum)) *
            i;
        if (newPkg.pkg_type == 1) {
          // 用最后一个数据去补充
          for (let i = 0; i < newPkg.eeg_data_num - 1; i++) {
            for (
              let current_channel = 0;
              current_channel < channel;
              current_channel++
            ) {
              newPkg.brain_elec_channel[current_channel][i] =
                newPkg.brain_elec_channel[current_channel][
                  newPkg.eeg_data_num - 1
                ];
            }
          }
        }
        dataList.push(processSend.call(this, newPkg, LDInfoEl));
      }
    }
  }
  LDInfoEl.isLosspkg = false;
  dataList.push(processSend.call(this, pkg, LDInfoEl));
  LDInfoEl.priorPkgnum = pkg.pkgnum;
  LDInfoEl.priorTimeMark = pkg.time_mark;
  LDInfoEl.oldPkg = JSON.parse(JSON.stringify(copePkg));

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
  let copy_brain_elec_channel = JSON.parse(
    JSON.stringify(pkg.brain_elec_channel)
  );
  let copy_near_infrared = JSON.parse(JSON.stringify(pkg.near_infrared));
  if (pkg.pkg_type === 1) {
    // 循环EEG数据
    for (let i = 0; i < pkg.eeg_data_num; i++) {
      let brain_data = new DoubleArray(channel);
      //所有流程都有去基线，先存起来
      let remove_output = new DoubleArray(channel);
      let notch_50_output: any = new DoubleArray(channel);
      let notch_100_output: any = new DoubleArray(channel);
      let bp_output: any = new DoubleArray(channel);
      let e1 = new DoubleArray(channel); //Delta频段各通道时域数据数组
      let e2 = new DoubleArray(channel); //Theta频段各通道时域数据数组
      let e3 = new DoubleArray(channel); //Alpha频段各通道时域数据数组
      let e4 = new DoubleArray(channel); //Beta频段各通道时域数据数组
      let e5 = new DoubleArray(channel); //Gamma频段各通道时域数据数组
      for (
        let current_channel = 0;
        current_channel < channel;
        current_channel++
      ) {
        brain_data[current_channel] =
          pkg.brain_elec_channel[current_channel][i];
      }

      // 运行去基线
      if (this.config.eegFilter.isDCRemove) {
        this.signalProcess.run_dc_remove_eeg(
          channel,
          brain_data,
          remove_output
        );
        for (
          let current_channel = 0;
          current_channel < channel;
          current_channel++
        ) {
          brain_data[current_channel] = remove_output[current_channel];
        }
      }

      // 开启Notch
      if (this.config.eegFilter.isNotch) {
        this.signalProcess.run_notch_filter_50Hz(
          channel,
          brain_data,
          notch_50_output
        );
        brain_data = arrayToJs(notch_50_output);
        this.signalProcess.run_notch_filter_100Hz(
          channel,
          brain_data,
          notch_100_output
        );
        brain_data = arrayToJs(notch_100_output);
      }
      // 开启BP
      if (this.config.eegFilter.isBandPass) {
        this.signalProcess.run_eegbp_filter_draw(
          this.config.eegFilter.bpType,
          channel,
          brain_data,
          bp_output
        );
        brain_data = arrayToJs(bp_output);
      }
      // fft_ps_eegbands 用于EEG Bands视图
      this.signalProcess.run_eegbp_filter_eegbands(
        channel,
        remove_output,
        e1,
        e2,
        e3,
        e4,
        e5
      );
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
        // 计算fft_ps 用于Spectrum视图
        this.signalProcess.fft_ps(
          current_channel,
          sample_rate,
          brain_data[current_channel],
          step,
          fftWindow,
          this.ps_s[current_channel],
          this.psd_s[current_channel]
        );
        // fft_ps_eegbands 用于EEG Bands视图
        this.signalProcess.fft_ps_eegbands(
          current_channel,
          sample_rate,
          remove_output[current_channel],
          step,
          fftWindow,
          this.psd_relative_s[current_channel],
          this.psd_relative_percent_s[current_channel]
        );
      }

      // 开启DC Remove（去基线），或者开启Notch 或者开启BP
      if (
        this.config.eegFilter.isDCRemove ||
        this.config.eegFilter.isNotch ||
        this.config.eegFilter.isBandPass
      ) {
        for (
          let current_channel = 0;
          current_channel < channel;
          current_channel++
        ) {
          pkg.brain_elec_channel[current_channel][i] =
            brain_data[current_channel];
        }
      }
      this.time_e_s_multiple[i] = JSON.parse(JSON.stringify(this.time_e_s));
      this.psd_s_multiple[i] = JSON.parse(JSON.stringify(this.psd_s));
      this.psd_relative_s_multiple[i] = JSON.parse(
        JSON.stringify(this.psd_relative_s)
      );
      this.psd_relative_percent_s_multiple[i] = JSON.parse(
        JSON.stringify(this.psd_relative_percent_s)
      );
      brain_data = null;
      remove_output = null;
      notch_50_output = null;
      notch_100_output = null;
      bp_output = null;
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
      let ir_data = new DoubleArray(4);
      let ir_od = new DoubleArray(4);
      let ir_raw_filter = new DoubleArray(4);
      let ir_od_filter = new DoubleArray(4);
      let ir_conc_filter = new DoubleArray(4);
      let ir_date_remove = new DoubleArray(4);
      let ir_conc = new DoubleArray(3); ///顺序为hbo,hb,hbt
      // 将float数组转换为double数组,float数组直接传不行

      ir_data = new DoubleArray(arrayToJs(pkg.near_infrared[current_channel]));

      // 基线
      this.baseline_ok = this.signalProcess.calc_baseline(
        current_channel,
        this.config.irFilter.ir_sample_rate,
        baseline_time,
        ir_step,
        ir_data,
        ir_date_remove
      );

      // ir_data = arrayToJs(ir_date_remove)

      // if (state) {
      //   this.baseline_ok = true;
      // }

      if (this.baseline_ok) {
        this.signalProcess.calc_od(
          current_channel,
          this.config.irFilter.ir_sample_rate,
          baseline_time,
          ir_step,
          ir_data,
          ir_od
        );
        if (this.config.irFilter.is3wave) {
          this.signalProcess.calc_hb_3wave(
            this.config.irFilter.age,
            L[current_channel],
            ir_od,
            ir_conc
          );
        }
        if (this.config.irFilter.is2wave) {
          this.signalProcess.calc_hb_2wave(
            this.config.irFilter.age,
            L[current_channel],
            ir_od,
            ir_conc
          );
        }
      }

      // 开启Bp
      if (this.config.irFilter.isBandPass) {
        if (this.config.irFilter.plotType == 1) {
          this.signalProcess.run_irbp_filter(
            this.config.irFilter.bpType,
            current_channel,
            ir_date_remove,
            ir_raw_filter
          );

          // ir_data = arrayToJs(ir_raw_filter);
        }
        if (this.config.irFilter.plotType == 2) {
          this.signalProcess.run_irbp_filter(
            this.config.irFilter.bpType,
            current_channel,
            ir_od,
            ir_od_filter
          );
          ir_od = arrayToJs(ir_od_filter);
        }
        if (this.config.irFilter.plotType == 3) {
          this.signalProcess.run_irbp_filter(
            this.config.irFilter.bpType,
            current_channel,
            ir_conc,
            ir_conc_filter
          );
          ir_conc = arrayToJs(ir_conc_filter);
        }
      }

      if (this.config.irFilter.isDCRemove) {
        pkg.near_infrared[current_channel] = arrayToJs(ir_date_remove);
      }
      if (this.config.irFilter.isBandPass) {
        pkg.near_infrared[current_channel] = arrayToJs(ir_raw_filter);
      }

      this.ir_od_date[current_channel] = JSON.parse(JSON.stringify(ir_od));

      this.concentration_date[current_channel] = JSON.parse(
        JSON.stringify(ir_conc)
      );

      ir_data = null;
      ir_od = null;
      ir_raw_filter = null;
      ir_od_filter = null;
      ir_conc_filter = null;
      ir_date_remove = null;
      ir_conc = null;
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
    baseline_ok:this.baseline_ok,
    concentration_date: this.concentration_date,
    loss_data_info_el: LDInfoEl,
    copy_brain_elec_channel: copy_brain_elec_channel,
    copy_near_infrared: copy_near_infrared,
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
