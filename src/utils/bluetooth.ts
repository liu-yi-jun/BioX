export function CustomBluetooth() {}
const ipcRenderer = require("electron").ipcRenderer;
let noticeList: Function[] = [];
let disNoticeList: object = {};
let atNoticeList: Function[] = [];
import { CustomDatabase } from "../utils/db";
const db = new CustomDatabase();
import { message } from "ant-design-vue";
let server, device, characteristic1, characteristic2;
import { useIndexStore } from "../store/index";
import { storeToRefs } from "pinia";
import { getCurrentInstance } from "vue";

let Loading: any;
let connectNum = 3;
let isNormalClose = false;

import _, { reject, set } from "lodash";
let handleNotifications = function (event) {
  let data = event.target.value;
  ipcRenderer.send("start-data-decode", new Uint8Array(data.buffer));
};

// 监测蓝牙是否断开防抖
const bluetoothMonitor = _.debounce(function () {
  if (!isNormalClose) {
    message.error("蓝牙异常断开!");
    const indexStore = useIndexStore();
    const { isConnect, bluetoothATConfig } = storeToRefs(indexStore);
    isConnect.value = false;
    startConnect("重新连接...")
      .then(() => {
        isNormalClose = false;
        message.success("连接成功!");
        setTimeout(() => {
          // 延迟发送，不然会报错
          for (const key in bluetoothATConfig.value) {
            const item = bluetoothATConfig.value[key];
            const atCommand = `AT+${key}${item.operate}${item.value}`;
            const commandBuffer = new TextEncoder().encode(atCommand + "\r");
            characteristic1.writeValue(commandBuffer);
          }
        }, 600);
      })
      .catch((error) => {
        message.error("连接失败:" + error.message);
        if (server) {
          clearBluetooth();
        }
      });
  }
}, 5000);

// 蓝牙通知函数
const handleEndDataDecode = (event, data) => {
  bluetoothMonitor();
  for (let i = 0; i < noticeList.length; i++) {
    noticeList[i]({
      ...data.pkg,
      ps_s: data.ps_s,
      psd_s: data.psd_s,
      // hexString: data.hexString,
      psd_relative_s: data.psd_relative_s,
      psd_relative_percent_s: data.psd_relative_percent_s,
      time_e_s: data.time_e_s,
      ps_s_multiple: data.ps_s_multiple,
      psd_s_multiple: data.psd_s_multiple,
      psd_relative_s_multiple: data.psd_relative_s_multiple,
      psd_relative_percent_s_multiple: data.psd_relative_percent_s_multiple,
      time_e_s_multiple: data.time_e_s_multiple,
      loss_data_info_el: data.loss_data_info_el,
      ir_od_date: data.ir_od_date,
      baseline_ok: data.baseline_ok,
      concentration_date: data.concentration_date,
      time_stamp: data.time_stamp,
      heart_rate: data.heart_rate,
    });
  }
};

// at通知函数
const atNotice = (event) => {
  console.log("回复", event.target.value);

  for (let i = 0; i < atNoticeList.length; i++) {
    let uint8Data = new Uint8Array(event.target.value.buffer);
    // 搜索 0x0D (回车符) 的位置
    let carriageReturnIndex = -1;
    for (let i = 0; i < uint8Data.length; i++) {
      if (uint8Data[i] === 0x0d) {
        carriageReturnIndex = i;
        break;
      }
    }
    let relevantData = uint8Data;
    if (carriageReturnIndex !== -1) {
      // 截取到回车符之前的数据
      relevantData = uint8Data.slice(0, carriageReturnIndex);
    }
    let decoder = new TextDecoder("utf-8");
    let decodedString = decoder.decode(relevantData);
    atNoticeList[i](decodedString);
  }
};

// 蓝牙连接函数
const startConnect = function (tip) {
  return new Promise((resolve, reject) => {
    const serverUUID = "00000000-cc7a-482a-984a-7f2ed5b3e58f";
    const character1 = "00000001-8e22-4541-9d4c-21edae82ed19";
    const character2 = "00000002-8e22-4541-9d4c-21edae82ed19";
    if (server) {
      server.disconnect();
    }
    if (device) {
      setTimeout(async () => {
        try {
          Loading.show(tip);
          // 连接到设备
          server = await device.gatt.connect();
          if (characteristic1) {
            characteristic1.removeEventListener(
              "characteristicvaluechanged",
              atNotice
            );
          }
          if (characteristic2) {
            characteristic2.removeEventListener(
              "characteristicvaluechanged",
              handleNotifications
            );
          }
          characteristic1 = null;
          characteristic2 = null;
          ipcRenderer.removeListener("end-data-decode", handleEndDataDecode);
          ipcRenderer.send("close-child");

          // 获取服务
          const service = await server.getPrimaryService(serverUUID); // 替换为实际的服务UUID

          // 获取特征
          characteristic1 = await service.getCharacteristic(character1); // 替换为实际的特征UUID

          // 获取特征
          characteristic2 = await service.getCharacteristic(character2); // 替换为实际的特征UUID

          // 绑定通知事件
          characteristic2.addEventListener(
            "characteristicvaluechanged",
            handleNotifications
          );
          characteristic1.addEventListener(
            "characteristicvaluechanged",
            atNotice
          );
          // 开始监听通知
          await characteristic2.startNotifications();
          await characteristic1.startNotifications();

          // AT指令
          const atCommand = "AT+START_ALL\r";

          // 将AT指令转换为Uint8Array
          const commandBuffer = new TextEncoder().encode(atCommand);

          // 发送写请求
          characteristic1.writeValue(commandBuffer);

          // 创建子进程
          ipcRenderer.send("create-child");
          // 解码后的蓝牙数据
          ipcRenderer.on("end-data-decode", handleEndDataDecode);
          const indexStore = useIndexStore();
          const { isConnect } = storeToRefs(indexStore);
          isConnect.value = true;
          Loading.hide();

          connectNum = 3;
          resolve(true);
        } catch (error) {
          connectNum--;
          if (connectNum <= 0) {
            reject(error);
            Loading.hide();
            console.error("连接失败", error.message);
            return
          }
          setTimeout(() => {
            startConnect("重新连接...")
              .then(() => {
                resolve(true);
              })
              .catch((error) => {
                reject(error);
              });
          }, 5000);
        }
      }, 1000);
    }
  });
};

CustomBluetooth.prototype.scan = async function () {
  try {
    await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
    });
  } catch (error) {
    if (error.message !== "User cancelled the requestDevice() chooser.") {
      console.error(error.message);
    }
  }
};

CustomBluetooth.prototype.init = async function (cb, deviceId, loading) {
  try {
    Loading = loading;
    // ipcRenderer.send("create-child");
    // setTimeout(() => {
    //   handleNotifications({ target: { value: "111" } })
    // },3000)

    // cb(true);
    // let deviceInfo = await db.get(
    //   `select * from device where deviceId = "${deviceId}"`
    // );

    // deviceInfo.uuidList = JSON.parse(deviceInfo.uuidList).filter((i) => {
    //   return (
    //     i.uuid !== "00001801-0000-1000-8000-00805f9b34fb" &&
    //     i.uuid !== "00001800-0000-1000-8000-00805f9b34fb"
    //   );
    // });

    // const serverUUID = deviceInfo.uuidList[deviceInfo.uuidList.length - 1].uuid;
    // const character1 =
    //   deviceInfo.uuidList[deviceInfo.uuidList.length - 1].characteristics[0]
    //     .uuid;
    // const character2 =
    //   deviceInfo.uuidList[deviceInfo.uuidList.length - 1].characteristics[1]
    //     .uuid;
    const serverUUID = "00000000-cc7a-482a-984a-7f2ed5b3e58f";
    const character1 = "00000001-8e22-4541-9d4c-21edae82ed19";
    const character2 = "00000002-8e22-4541-9d4c-21edae82ed19";
    setTimeout(() => {
      cb(true, "initComplete");
    }, 1500);

    // if (!server || !device.gatt) {
    device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [serverUUID], //将服务UUID添加到这里
      // filters: [{ services: ['00000000-cc7a-482a-984a-7f2ed5b3e58f'] }],
      // filters: [{ name: 'Biox_Demo' },],
    });

    // // 连接到设备
    // server = await device.gatt.connect();
    // // } else {
    // //   if (!device.gatt.connected) {
    // //     server = await device.gatt.connect();
    // //   }
    // // }

    // cb(true, "loading");

    // // 获取服务
    // const service = await server.getPrimaryService(serverUUID); // 替换为实际的服务UUID

    // // 获取特征
    // characteristic1 = await service.getCharacteristic(character1); // 替换为实际的特征UUID

    // // 获取特征
    // characteristic2 = await service.getCharacteristic(character2); // 替换为实际的特征UUID

    // // 绑定通知事件
    // characteristic2.addEventListener(
    //   "characteristicvaluechanged",
    //   handleNotifications
    // );
    // characteristic1.addEventListener("characteristicvaluechanged", atNotice);
    // // 开始监听通知
    // await characteristic2.startNotifications();
    // await characteristic1.startNotifications();
    // // AT指令
    // const atCommand = "AT+START_ALL\r";

    // // 将AT指令转换为Uint8Array
    // const commandBuffer = new TextEncoder().encode(atCommand);
    // // 发送写请求

    // characteristic1.writeValue(commandBuffer);

    // // 创建子进程
    // ipcRenderer.send("create-child");
    // // 解码后的蓝牙数据
    // ipcRenderer.on("end-data-decode", handleEndDataDecode);
    // cb(true, "hide");
    // cb(true, "success");
    startConnect("连接中...")
      .then(() => {
        isNormalClose = false;
        cb(true, "success");
        message.success("连接成功!");
      })
      .catch((err) => {
        message.error("连接失败:" + err.message);
        if (server) {
          clearBluetooth();
        }
      });
  } catch (err) {
    debugger;
    console.error("bluetooth:", err);
    if (server) {
      clearBluetooth();
    }
    cb(false, err.message);
  }
};
// 添加蓝牙通知事件
CustomBluetooth.prototype.addNotice = function (cb: Function) {
  noticeList.push(cb);
};
// 移除蓝牙通知事件
CustomBluetooth.prototype.removeNotice = function (cb: Function) {
  noticeList = noticeList.filter((item) => item !== cb);
};

CustomBluetooth.prototype.close = function (cb: Function) {
  isNormalClose = true;
  if (server) {
    clearBluetooth();
    cb(true, "设备连接已断开！");
  } else {
    cb(false, "蓝牙未连接！");
  }
};

function clearBluetooth() {
  server.disconnect();
  server = null;
  device = null;
  if (characteristic1) {
    characteristic1.removeEventListener("characteristicvaluechanged", atNotice);
  }
  if (characteristic2) {
    characteristic2.removeEventListener(
      "characteristicvaluechanged",
      handleNotifications
    );
  }
  characteristic1 = null;
  characteristic2 = null;
  ipcRenderer.removeListener("end-data-decode", handleEndDataDecode);
  ipcRenderer.send("close-child");
}

// 添加AT通知事件
CustomBluetooth.prototype.addATNotice = function (cb: Function) {
  if (!characteristic1) {
    return message.error("请先连接设备!");
  }
  atNoticeList.push(cb);
};
// 移除AT通知事件
CustomBluetooth.prototype.removeATNotice = function (cb: Function) {
  atNoticeList = atNoticeList.filter((item) => item !== cb);
};

CustomBluetooth.prototype.sendAT = function (atCommand) {
  try {
    if (!characteristic1) {
      return message.error("请先连接设备!");
    }
    if (!atCommand) {
      return message.error("请输入AT指令!");
    }
    console.log("sendAT", atCommand);

    // 将AT指令转换为Uint8Array
    // 发送写请求
    const commandBuffer = new TextEncoder().encode(atCommand + "\r");
    characteristic1.writeValue(commandBuffer);
  } catch (error) {
    console.error("sendAT:", error);
  }
};

CustomBluetooth.prototype.bluetoothScan = function () {
  ipcRenderer.send("bluetooth-scan");
};
