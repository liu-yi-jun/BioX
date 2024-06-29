let sourceData: any = [];
let timer: any = null;
let timerRecord: number = 60 * 1000;
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("data.db");
let recordLastID = 0;
let sourceNumber = 0;

const saveData = () => {
  sourceNumber += sourceData.length
 

  // if (sourceData.length > 0) {
  db.run(
    "INSERT INTO source (recordId, data) VALUES (?, ?)",
    [recordLastID, JSON.stringify(sourceData)],
    function (this: any, err: any, res: any) {
      if (err) {
        console.log("存储阶段错误:", err);
      } else {
        sourceData = [];
        console.log("存储阶段:", this.lastID);
      }
    }
  );
  // }
};

// 接收消息
process.on("message", async function ({ type, data }) {
  if (type === "end-data-decode") {
    sourceData.push(data);
  }
  if (type === "start-store") {
    console.log("recordLastID", data.recordLastID);

    recordLastID = data.recordLastID;
    timer && clearInterval(timer);
    timer = setInterval(() => {
      saveData();
    }, timerRecord);
  }
  if (type === "stop-store") {
    console.log("stop-store");
    timer && clearInterval(timer);
    saveData();
    console.log("sourceNumber:", sourceNumber);
  }
});
