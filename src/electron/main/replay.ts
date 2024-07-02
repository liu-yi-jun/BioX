import { join } from "path";
const ReplayProcessing = require("./processing");
let _product_path = process.argv[3];
const processing: any = new ReplayProcessing(
  join(_product_path, "/dll/signal_process.dll"),
  process.argv[4] // 加载配置项
);

// 接收消息
process.on("message", async function ({ type, data }) {
  if (type === "filter-init") {
    processing.init();
  }
  if (type === "start-data-replay") {
    if (Array.isArray(data)) {
      let sendDataList: any = [];
      data.forEach((item: any) => {
        let dataList = processing.processData(item);
        sendDataList = sendDataList.concat(dataList);
      });
      process.send!({
        type: "end-data-replay",
        data: sendDataList,
      });
    } else {
      let dataList = processing.processData(data);
      dataList.forEach((item: any) => {
        process.send!({
          type: "end-data-replay",
          data: item,
        });
      });
    }
  }
});
