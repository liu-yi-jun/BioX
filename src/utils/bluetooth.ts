export function CustomBluetooth() {}
const ipcRenderer = require("electron").ipcRenderer;
let noticeList: Function[] = [];
let atNoticeList: Function[] = [];
import { CustomDatabase } from "../utils/db";
const db = new CustomDatabase();
import { message } from "ant-design-vue";
let server, device, characteristic1, characteristic2;
let handleNotifications = function (event) {
  let data = event.target.value;
  ipcRenderer.send("start-data-decode", new Uint8Array(data.buffer));
};
let textIndex = 1;
// 蓝牙通知函数
const handleEndDataDecode = (event, data) => {
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
      loss_data_info_el: data.LDInfoEl,
      ir_od_date: data.ir_od_date,
    });
  }
  textIndex++;
};

// at通知函数
const atNotice = (event) => {
  for (let i = 0; i < atNoticeList.length; i++) {
    console.log(event.target.value);
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

CustomBluetooth.prototype.scan = async function () {
  await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
  });
};

CustomBluetooth.prototype.init = async function (cb, deviceId) {
  try {
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
      // 连接到设备
      server = await device.gatt.connect();
    // } else {
    //   if (!device.gatt.connected) {
    //     server = await device.gatt.connect();
    //   }
    // }

    cb(true, "loading");

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
    characteristic1.addEventListener("characteristicvaluechanged", atNotice);
    // 开始监听通知
    await characteristic2.startNotifications();
    await characteristic1.startNotifications();

    // AT指令
    const atCommand = "AT+START_ALL\r";

    // 将AT指令转换为Uint8Array
    const commandBuffer = new TextEncoder().encode(atCommand);

    // 发送写请求
    characteristic1.writeValue(commandBuffer);

    console.log("create-child");

    // 创建子进程
    ipcRenderer.send("create-child");
    // 解码后的蓝牙数据
    ipcRenderer.on("end-data-decode", handleEndDataDecode);
    cb(true, "hide");
    cb(true, "success");
  } catch (err) {
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
  if (server) {
    clearBluetooth();
    cb(true, "设备连接已断开");
  } else {
    cb(false, "蓝牙未连接");
  }
};

function clearBluetooth() {
  server.disconnect();
  server = null;
  device = null;
  if(characteristic1) {
    characteristic1.removeEventListener("characteristicvaluechanged", atNotice);
  }
  if(characteristic2) {
    characteristic2.removeEventListener("characteristicvaluechanged", handleNotifications);
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
  if (!characteristic1) {
    return message.error("请先连接设备!");
  }
  if (!atCommand) {
    return message.error("请输入AT指令!");
  }
  // 将AT指令转换为Uint8Array
  // 发送写请求
  const commandBuffer = new TextEncoder().encode(atCommand + "\r");
  characteristic1.writeValue(commandBuffer);
};

CustomBluetooth.prototype.bluetoothScan = function () {
  ipcRenderer.send("bluetooth-scan");
};
