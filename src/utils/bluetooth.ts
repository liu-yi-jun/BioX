export function CustomBluetooth() {}

let noticeList: Function[] = [];

let handleNotifications = function (event) {
  let data = event.target.value;
  for (let i = 0; i < noticeList.length; i++) {
    noticeList[i](data);
  }
};

CustomBluetooth.prototype.init = async function (cb) {
  try {
    let timer = setTimeout(() => {
      cb(false,'蓝牙未识别到，请检查设备是否开启');
      timer && clearTimeout(timer);
    }, 4000);
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ["00000000-cc7a-482a-984a-7f2ed5b3e58f"], //将服务UUID添加到这里
      // filters: [{ services: ['00000000-cc7a-482a-984a-7f2ed5b3e58f'] }],
      // filters: [{ name: 'Biox_Demo' },],
    });
    // 连接到设备
    const server = await device.gatt.connect();
    // 获取服务
    const service = await server.getPrimaryService(
      "00000000-cc7a-482a-984a-7f2ed5b3e58f"
    ); // 替换为实际的服务UUID
    // 获取特征
    const characteristic = await service.getCharacteristic(
      "00000002-8e22-4541-9d4c-21edae82ed19"
    ); // 替换为实际的特征UUID

    // 绑定通知事件
    characteristic.addEventListener(
      "characteristicvaluechanged",
      handleNotifications
    );
    // 开始监听通知
    await characteristic.startNotifications();
    cb(true);
  } catch (err) {
    cb(false,err.message);
  }
};

CustomBluetooth.prototype.addNotice = function (cb: Function) {
  noticeList.push(cb);
};
CustomBluetooth.prototype.removeNotice = function (cb: Function) {
  noticeList = noticeList.filter((item) => item !== cb);
};
