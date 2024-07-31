const { SerialPort } = require("serialport"); //引入模块
var portName = "COM1"; //定义串口名

// module.exports = {
//   start (call) {

SerialPort.list().then((ports) => {
  console.log(ports);
  ports.forEach((port) => {
    if (port.productId == 5740) {
      var serialPort = new SerialPort(
        {
          path: port.path,
          baudRate: 57600, //波特率
          dataBits: 8, //数据位
          parity: 'none', //奇偶校验
          stopBits: 1, //停止位
          flowControl: false,
          autoOpen: false //自动打开 这个得设置为false，不然下面的open会报错 Error: The port is opening
        },
        false
      );
      console.log(serialPort);
      serialPort.open(function (error) {
        if (error) {
          console.log("打开端口" + port.path + "错误：" + error);
        } else {
          console.log("打开端口成功");
          serialPort.on("data", function (data) {
            console.log("data received: " + data);
          });
          serialPort.write('AT+START_ALL\r')
        }
      })
    }
  });
});
// var serialPort = new SerialPort(
//   {
//     path: portName,
//     baudRate: 57600, //波特率
//   },
//   false
// );

// serialPort.open(function (error) {
//   if (error) {
//     console.log("打开端口" + portName + "错误：" + error);
//   } else {
//     console.log("2打开端口成功");
//     serialPort.on("data", function (data) {
//       call(data);
//       console.log("data received: " + data);
//     });
//   }
// });
// }
// }
