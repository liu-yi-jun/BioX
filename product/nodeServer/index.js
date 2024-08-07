const fs = require("fs");
const net = require("net");
const queue = [];
let isWriting = false;
// 创建一个 TCP 服务器
const server = net.createServer((socket) => {
  console.log("客户端已连接");

  // // 创建一个文件流
  // let fileStream;
  // try {
  //   fileStream = fs.createWriteStream('rawData.txt', { flags: 'a' });
  // } catch (err) {
  //   console.error(`创建文件失败: ${err}`);
  //   // 关闭连接
  //   socket.end();
  //   return;
  // }

  // // 定义一个函数来处理接收到的数据
  // function handleData(data) {
  //   queue.push(data);

  //   if (!isWriting) {
  //     writeNext();
  //   }
  // }

  // // 定义一个函数来执行下一次写入操作
  // function writeNext() {
  //   if (queue.length === 0) {
  //     isWriting = false;
  //     return;
  //   }

  //   const data = queue.shift();
  //   isWriting = true;

  //   fileStream.write(data + '\n', () => {
  //     isWriting = false;
  //     writeNext();
  //   });
  // }

  // 当客户端发送数据时
  socket.on("data", (data) => {
    console.log(`接收到数据: ${data}`);
    // handleData(data);
  });

  // 当客户端断开连接时
  socket.on("end", () => {
    console.log("客户端已断开连接");
    console.log('server end')
  });

  // 当客户端发生错误时
  socket.on("error", (err) => {
    console.error(`客户端发生错误: ${err}`);
    // 关闭连接
    socket.end();
  });
});

// 监听端口
const PORT = 9000;
server.listen(PORT, () => {
  console.log(`服务器已启动，监听端口 ${PORT}`);
  console.log('server suscess')
});

// 当服务器关闭时
server.on("close", () => {
  console.log("服务器已关闭");
});

// 如果你想在某个条件下关闭服务器，可以调用 server.close()
// server.close();
