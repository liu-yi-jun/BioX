export function CustomBluetooth() {}
const ipcRenderer = require("electron").ipcRenderer;
let noticeList: Function[] = [];
let server, device;
let handleNotifications = function (event) {
  let data = event.target.value;
  ipcRenderer.send("start-data-decode", new Uint8Array(data.buffer));
};



CustomBluetooth.prototype.init = async function (cb) {
  try {
    // ipcRenderer.send("create-child");
    // setTimeout(() => {
    //   handleNotifications({ target: { value: "111" } })
    // },3000)

    // cb(true);

    if (!server) {
      device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["00000000-cc7a-482a-984a-7f2ed5b3e58f"], //将服务UUID添加到这里
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

    cb(true,"loading");

    // 获取服务
    const service = await server.getPrimaryService(
      "00000000-cc7a-482a-984a-7f2ed5b3e58f"
    ); // 替换为实际的服务UUID

    // 获取特征
    const characteristic1 = await service.getCharacteristic(
      "00000001-8e22-4541-9d4c-21edae82ed19"
    ); // 替换为实际的特征UUID

    // 获取特征
    const characteristic2 = await service.getCharacteristic(
      "00000002-8e22-4541-9d4c-21edae82ed19"
    ); // 替换为实际的特征UUID

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

    // 创建子进程
    ipcRenderer.send("create-child");
    // 解码后的蓝牙数据
    ipcRenderer.on("end-data-decode", (event, data) => {
      for (let i = 0; i < noticeList.length; i++) {
        noticeList[i](data);
      }
    });
    cb(true,"hide");
    cb(true,'success');
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
    server = null
    device = null
    cb(true, "设备连接已断开");
  } else {
    cb(false, "蓝牙未连接");
  }
};
