// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
import { contextBridge, ipcRenderer } from 'electron'
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector: any, text: any) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  cancelBluetoothRequest: () => ipcRenderer.send('cancel-bluetooth-request'),
  bluetoothPairingRequest: (callback: any) => ipcRenderer.on('bluetooth-pairing-request', () => callback()),
  bluetoothPairingResponse: (response: any) => ipcRenderer.send('bluetooth-pairing-response', response),
  require: () => ipcRenderer.invoke('require'),
  __dirname: () => ipcRenderer.invoke('dirname'),
})

