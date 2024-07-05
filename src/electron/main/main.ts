import { join, resolve } from "path";
import { app, BrowserWindow, ipcMain, dialog } from "electron";
var child_process = require("child_process");
let child: typeof child_process;
let storeChild: typeof child_process;
let replayChild: typeof child_process;
let isStartStore = false;
import log from "electron-log/main";
log.transports.file.level = "silly";
log.transports.console.level = "silly";
const max__wave_channel = 4;

const isDev = process.env.npm_lifecycle_event === "app:dev" ? true : false;
let bluetoothPinCallback: any;
let selectBluetoothCallback: any;
let selectBluetoothCb: Function;
let __static = "";
let _product_path = join(__dirname, "../../../../product");
if (isDev) {
  __static = require("path").join(__dirname, "/static").replace(/\\/g, "\\\\");
  _product_path = join(__dirname, "../../../product");
}

log.error("process.env.NODE_ENV:" + process.env.NODE_ENV);
log.error("main:path:" + _product_path);

// 定义child配置项
let config = {};

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "Open File",
  });
  if (!canceled) {
    return filePaths[0];
  }
}

// 去除多余的0
const removZero = ({ pkg }: any) => {
  let brain_elec_channel: any = [];
  let near_infrared: any = [];
  for (let i = 0; i < pkg.eeg_channel; i++) {
    brain_elec_channel[i] = [];
    for (let j = 0; j < pkg.eeg_data_num; j++) {
      brain_elec_channel[i][j] = pkg.brain_elec_channel[i][j];
    }
  }

  for (let i = 0; i < pkg.ir_channel; i++) {
    near_infrared[i] = [];
    for (let j = 0; j < max__wave_channel; j++) {
      near_infrared[i][j] = pkg.near_infrared[i][j];
    }
  }
  pkg.brain_elec_channel = brain_elec_channel;
  pkg.near_infrared = near_infrared;
};

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    frame: false,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // 渲染进程中可以使用node
      contextIsolation: false, // 上下文隔离
      // preload: join(__dirname, '../preload/preload.js'),
    },
  });
  mainWindow.setFullScreen(true);

  //   蓝牙连接部分
  // 扫描蓝牙设备
  mainWindow.webContents.on(
    "select-bluetooth-device",
    (event, deviceList, callback) => {
      event.preventDefault();
      selectBluetoothCallback = callback;
      mainWindow.webContents.send("find-device", deviceList);
      // const result = deviceList.find((device) => {
      //   return device.deviceName === "Biox_B0";
      // });
      // if (result) {
      //   callback(result.deviceId);
      // } else {
      //   // The device wasn't found so we need to either wait longer (eg until the
      //   // device is turned on) or until the user cancels the request
      // }
    }
  );

  // 确认连接设备
  ipcMain.on("connect-bluetooth-device", (event, deviceItem) => {
    if (selectBluetoothCallback) {
      console.log("connect-bluetooth-device", JSON.parse(deviceItem));
      selectBluetoothCallback(JSON.parse(deviceItem).deviceId);
      selectBluetoothCallback = null;
    } else {
      // 执行失败
      mainWindow.webContents.send("select-bluetooth-callback", false);
    }
  });

  // 取消蓝牙扫描
  ipcMain.on("cancel-bluetooth-request", (event) => {
    if (selectBluetoothCallback) {
      console.log("cancel-bluetooth-request");
      selectBluetoothCallback("");
      selectBluetoothCallback = null;
    } else {
      // 执行失败
      mainWindow.webContents.send("select-bluetooth-callback", false);
    }
  });

  // python生成蓝牙uuid
  ipcMain.on("python-uuid", (event, deviceId) => {
    log.error(
      "python-uuid:" +
        join(
          _product_path,
          `/exe/bluetooth_scanner.exe device-info --address ${deviceId}`
        )
    );
    child_process.exec(
      join(
        _product_path,
        `/exe/bluetooth_scanner.exe device-info --address ${deviceId}`
      ),
      (error: any, stdout: any, stderr: any) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        mainWindow.webContents.send("python-uuid-response", stdout);
      }
    );
  });

  // 关闭子进程
  ipcMain.on("close-child", (event) => {
    child && child.connected && child.kill();
  });

  // 关闭应用
  ipcMain.on("close-window", (event) => {
    child && child.connected && child.kill();
    app.quit();
  });

  // 打开开发者工具
  ipcMain.on("open-devtools", (event) => {
    mainWindow.webContents.openDevTools();
  });

  // 修改配置项
  ipcMain.on("change-config", (event, data) => {
    child &&
      child.connected &&
      child.send({ type: "change-config", data: data });
    config = Object.assign(config, JSON.parse(data));
  });

  // 修改配置项带具体回复
  ipcMain.on("change-config-field", (event, data) => {
    child &&
      child.connected &&
      child.send({ type: "change-config-field", data: data });
    config = Object.assign(config, JSON.parse(data).config);
  });

  // 开始存储
  ipcMain.on("start-store", (event, data) => {
    log.error("start-store", data);
    isStartStore = true;
    storeChild && storeChild.send({ type: "start-store", data: data });
  });

  // 停止存储
  ipcMain.on("stop-store", (event, data) => {
    isStartStore = false;
    storeChild && storeChild.send({ type: "stop-store", data: data });
  });

  // 关闭储进程
  ipcMain.on("close-store", (event) => {
    storeChild && storeChild.connected && storeChild.kill();
    storeChild = null;
  });

  //  开始回放数据，数据加工
  ipcMain.on("start-data-replay", (event, data) => {
    replayChild &&
      replayChild.connected &&
      replayChild.send({ type: "start-data-replay", data });
  });

  // 关闭回放进程
  ipcMain.on("close-replay", (event) => {
    replayChild && replayChild.connected && replayChild.kill();
  });

  // Listen for a message from the renderer to get the response for the Bluetooth pairing.
  // ipcMain.on("bluetooth-pairing-response", (event, response) => {
  //   console.log("bluetooth-pairing-response");
  //   bluetoothPinCallback(response);
  // });

  // mainWindow.webContents.session.setBluetoothPairingHandler(
  //   (details, callback) => {
  //     bluetoothPinCallback = callback;
  //     console.log("bluetooth-pairing-request");
  //     // Send a message to the renderer to prompt the user to confirm the pairing.
  //     mainWindow.webContents.send("bluetooth-pairing-request", details);
  //   }
  // );

  // 创建回放进程
  ipcMain.on("create-replay", (event, data) => {
    log.error("create-replay");
    replayChild && replayChild.connected && replayChild.kill();
    replayChild = child_process.fork(
      join(__dirname, "./replay.js"),
      [__static, _product_path, JSON.stringify(config)],
      {
        // 关闭子进程打印，开启ipc
        stdio: ["ignore", "pipe", "pipe", "ipc"],
      },
      function (err: any) {
        log.error(err);
        console.log(err);
      }
    );
    // 初始化
    replayChild.connected && replayChild.send({ type: "filter-init" });

    replayChild.stderr.on("data", (data: any) => {
      console.error(`stderr: ${data}`);
    });

    replayChild.stdout.on("data", (data: any) => {
      console.log(`stdout: ${data}`);
    });

    replayChild.on("error", (err: any) => {
      log.error("子进程启动或执行过程中发生错误:", err);
      console.error("子进程启动或执行过程中发生错误:", err);
    });

    replayChild.on("exit", (code: number, signal: string) => {
      log.error(`子进程退出，退出码: ${code}, 信号: ${signal}`);
      console.log(`子进程退出，退出码: ${code}, 信号: ${signal}`);
    });
    replayChild.on("message", ({ type, data }: { type: string; data: any }) => {
      if (type === "end-data-replay") {
        event.sender.send("end-data-replay", data);
      }
    });
  });
  // 创建存储进程
  ipcMain.on("create-store", (event, data) => {
    log.error("create-store");
    storeChild && storeChild.connected && storeChild.kill();

    storeChild = child_process.fork(
      join(__dirname, "./store.js"),
      [__static, _product_path],
      {
        // 关闭子进程打印，开启ipc
        stdio: ["ignore", "pipe", "pipe", "ipc"],
      },
      function (err: any) {
        log.error(err);
        console.log(err);
      }
    );
    storeChild.stderr.on("data", (data: any) => {
      console.error(`stderr: ${data}`);
    });

    storeChild.stdout.on("data", (data: any) => {
      console.log(`stdout: ${data}`);
    });

    storeChild.on("error", (err: any) => {
      log.error("子进程启动或执行过程中发生错误:", err);
      console.error("子进程启动或执行过程中发生错误:", err);
    });

    storeChild.on("exit", (code: number, signal: string) => {
      log.error(`子进程退出，退出码: ${code}, 信号: ${signal}`);
      console.log(`子进程退出，退出码: ${code}, 信号: ${signal}`);
    });
    storeChild.on(
      "message",
      ({ type, data }: { type: string; data: any }) => {}
    );
  });

  // 创建子进程
  ipcMain.on("create-child", (event, data) => {
    log.error("create-child", join(__dirname, "./child.js"));
    child = child_process.fork(
      join(__dirname, "./child.js"),
      [__static, _product_path, JSON.stringify(config)],
      {
        // 关闭子进程打印，开启ipc
        stdio: ["ignore", "pipe", "pipe", "ipc"],
      },
      function (err: any) {
        log.error(err);
        console.log(err);
      }
    );

    // 初始化
    child.connected && child.send({ type: "filter-init" });

    child.stderr.on("data", (data: any) => {
      console.error(`stderr: ${data}`);
    });

    child.stdout.on("data", (data: any) => {
      console.log(`stdout: ${data}`);
    });

    child.on("error", (err: any) => {
      log.error("子进程启动或执行过程中发生错误:", err);
      console.error("子进程启动或执行过程中发生错误:", err);
    });

    child.on("exit", (code: number, signal: string) => {
      log.error(`子进程退出，退出码: ${code}, 信号: ${signal}`);
      console.log(`子进程退出，退出码: ${code}, 信号: ${signal}`);
    });
    child.on("message", ({ type, data }: { type: string; data: any }) => {
      if (type === "end-data-decode") {
        removZero(data);
        isStartStore &&
          storeChild &&
          storeChild.send({ type: "end-data-decode", data: data.pkg });
        event.sender.send("end-data-decode", data);
      }
      if (type === "change-config-success") {
        event.sender.send("change-config-success", data);
      }
      if (type === "change-config-field-success") {
        event.sender.send("change-config-field-success", data);
      }
    });
  });

  //  开始蓝牙数据解码
  ipcMain.on("start-data-decode", (event, data) => {
    child &&
      child.connected &&
      child.send({ type: "start-data-decode", data: Buffer.from(data) });
  });

  ipcMain.on("bluetooth-scan", (event) => {
    child && child.connected && child.send({ type: "bluetooth-scan" });
  });

  // and load the index.html of the app.
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000"); // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, "../../index.html"));
    // mainWindow.webContents.openDevTools();
  }
  // mainWindow.loadURL( //this doesn't work on macOS in build and preview mode
  //     isDev ?
  //     'http://localhost:3000' :
  //     join(__dirname, '../../index.html')
  // );
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle("dialog:openFile", handleFileOpen);
  createWindow();
  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
