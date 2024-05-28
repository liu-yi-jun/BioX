export function CustomBluetooth() {}
const ipcRenderer = require("electron").ipcRenderer;
let noticeList: Function[] = [];
import { CustomDatabase } from "../utils/db";
const db = new CustomDatabase();
let server, device;
let handleNotifications = function (event) {
  let data = event.target.value;
  ipcRenderer.send("start-data-decode", new Uint8Array(data.buffer));
};
let textIndex = 1
let handleEndDataDecode = (event, data) => {
  for (let i = 0; i < noticeList.length; i++) {
    noticeList[i]({
      ...data.pkg,
      ps_s: data.ps_s,
      psd_s: data.psd_s,
      hexString: data.hexString,
      psd_relative_s: data.psd_relative_s,
      psd_relative_percent_s: data.psd_relative_percent_s,
      time_e_s: data.time_e_s,
    });
  }
  textIndex++
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
    }, 1000);

    if (!server) {
      device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [serverUUID], //将服务UUID添加到这里
        // filters: [{ services: ['00000000-cc7a-482a-984a-7f2ed5b3e58f'] }],
        // filters: [{ name: 'Biox_Demo' },],
      });
      // 连接到设备
      server = await device.gatt.connect();
    } else {
      if (!device.gatt.connected) {
        server = await device.gatt.connect();
      }
    }

    cb(true, "loading");

    // 获取服务
    const service = await server.getPrimaryService(serverUUID); // 替换为实际的服务UUID

    // 获取特征
    const characteristic1 = await service.getCharacteristic(character1); // 替换为实际的特征UUID

    // 获取特征
    const characteristic2 = await service.getCharacteristic(character2); // 替换为实际的特征UUID

    // 绑定通知事件
    characteristic2.addEventListener(
      "characteristicvaluechanged",
      handleNotifications
    );
    characteristic1.addEventListener("characteristicvaluechanged", (event) => {
      console.log("characteristic1", event.target.value);
    });
    // 开始监听通知
    await characteristic2.startNotifications();
    await characteristic1.startNotifications();

    // AT指令
    const atCommand = "AT+START_ALL\r\n";

    // 将AT指令转换为Uint8Array
    const commandBuffer = new TextEncoder().encode(atCommand);

    // 发送写请求
    characteristic1.writeValue(commandBuffer);

    // setTimeout(() => {
    //   console.log("发送停止指令");
    //   // 发送写请求
    //   characteristic1.writeValue(new TextEncoder().encode("AT+STOP_ALL\r\n"));
    // }, 10000);
    console.log("create-child");

    // 创建子进程
    ipcRenderer.send("create-child");
    // 解码后的蓝牙数据
    ipcRenderer.on("end-data-decode", handleEndDataDecode);
    cb(true, "hide");
    cb(true, "success");
  } catch (err) {
    cb(false, err.message);
  }
};

CustomBluetooth.prototype.addNotice = function (cb: Function) {
  noticeList.push(cb);
};
CustomBluetooth.prototype.removeNotice = function (cb: Function) {
  noticeList = noticeList.filter((item) => item !== cb);
};

CustomBluetooth.prototype.close = function (cb: Function) {
  if (server && device.gatt.connected) {
    server.disconnect();
    server = null;
    device = null;
    ipcRenderer.removeListener("end-data-decode", handleEndDataDecode);
    ipcRenderer.send("close-child");
    cb(true, "设备连接已断开");
  } else {
    cb(false, "蓝牙未连接");
  }
};

CustomBluetooth.prototype.bluetoothScan = function () {
  ipcRenderer.send("bluetooth-scan");
};
