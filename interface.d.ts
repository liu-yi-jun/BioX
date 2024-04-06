export interface IElectronAPI {
  loadPreferences: () => Promise<void>;
  cancelBluetoothRequest: () => void;
  bluetoothPairingRequest: (callback: any) => void;
  bluetoothPairingResponse: (response: any) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;

  }
}      