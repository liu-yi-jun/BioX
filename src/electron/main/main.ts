import { join } from "path";
import { app, BrowserWindow, ipcMain, dialog } from "electron";

const isDev = process.env.npm_lifecycle_event === "app:dev" ? true : false;
let bluetoothPinCallback: any;
let selectBluetoothCallback: any;

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "Open File",
  });
  if (!canceled) {
    return filePaths[0];
  }
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
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
  mainWindow.webContents.on(
    "select-bluetooth-device",
    (event, deviceList, callback) => {
      console.log(deviceList, "deviceList");
      debugger;
      event.preventDefault();
      selectBluetoothCallback = callback;
      const result = deviceList.find((device) => {
        return device.deviceName === "Biox_Demo";
      });
      if (result) {
        callback(result.deviceId);
      } else {
        // The device wasn't found so we need to either wait longer (eg until the
        // device is turned on) or until the user cancels the request
      }
    }
  );

  ipcMain.on("cancel-bluetooth-request", (event) => {
    console.log("cancel-bluetooth-request");
    
    selectBluetoothCallback("");
  });

  // Listen for a message from the renderer to get the response for the Bluetooth pairing.
  ipcMain.on("bluetooth-pairing-response", (event, response) => {
    console.log("bluetooth-pairing-response");
    bluetoothPinCallback(response);
  });

  mainWindow.webContents.session.setBluetoothPairingHandler(
    (details, callback) => {
      bluetoothPinCallback = callback;
      console.log("bluetooth-pairing-request");
      // Send a message to the renderer to prompt the user to confirm the pairing.
      mainWindow.webContents.send("bluetooth-pairing-request", details);
    }
  );
  //   蓝牙连接部分

  // and load the index.html of the app.
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000"); // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, "../../index.html"));
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
