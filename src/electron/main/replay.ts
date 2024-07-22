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
      sendDataList = sendDataList.map((data: any) => {
        let pkg = data.pkg;
        delete data.pkg
        return {
          ...data,
          ...pkg,
        };
      });
   
      process.send!({
        type: "end-data-replay",
        data: sendDataList,
      });
    } else {
  
      let dataList = processing.processData(data);
    
      dataList.forEach((data: any) => {
        let pkg = data.pkg;
        delete data.pkg
        process.send!({
          type: "end-data-replay",
          data: {
            ...data,
            ...pkg,
          },
        });
      });
    }
  }
  if (type === "change-config") {
    processing.setConfig(JSON.parse(data));
    process.send!({
      type: "change-config-success",
      data: true,
    });
  }
  if (type === "change-config-field") {
    processing.setConfig(JSON.parse(data).config);
    let field = JSON.parse(data).field;
    if (field === "filterConfig" || field === "plotType" || field === "wave") {
      processing.setInit();
    }

    process.send!({
      type: "change-config-field-success",
      data: {
        field: field,
        status: true,
      },
    });
  }
});
