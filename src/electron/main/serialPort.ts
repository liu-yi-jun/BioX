const { SerialPort } = require("serialport"); //引入模块
var portName = "COM1"; //定义串口名
var serialPort: any = null;
// 接收消息
process.on("message", async function ({ type, data }) {
  if (type === "init-serialPort") {
    SerialPort.list().then((ports: any) => {
      if(ports.length == 0){
       return process.send!({
          type: "serial-no-ports",
        });
      }
      ports.forEach((port: any) => {
        if (port.productId == 5740) {
          serialPort = new SerialPort(
            {
              path: port.path,
              baudRate: 57600, //波特率
              dataBits: 8, //数据位
              parity: "none", //奇偶校验
              stopBits: 1, //停止位
              flowControl: false,
              autoOpen: false, //自动打开 这个得设置为false，不然下面的open会报错 Error: The port is opening
            },
            false
          );
          serialPort.open(function (error: any) {
            if (error) {
              console.log("打开端口" + port.path + "错误：" + error);
            } else {
              process.send!({
                type: "serial-open-success",
              });
              console.log("打开端口成功");
              serialPort.on("data", function (data: any) {
                process.send!({
                  type: "serial-data-receive",
                  data: data,
                });
              });
              serialPort.write("AT+START_ALL\r");
            }
          });
        }
      });
    });
  }
  if (type === "write-serialPort") {
    serialPort && serialPort.write(data);
  }
  if (type === "close-serialPort") {
    serialPort && serialPort.close();
  }
});
