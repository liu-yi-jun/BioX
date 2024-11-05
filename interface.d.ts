export interface IElectronAPI {
  loadPreferences: () => Promise<void>;
  cancelBluetoothRequest: () => void;
  bluetoothPairingRequest: (callback: any) => void;
  bluetoothPairingResponse: (response: any) => void;
}

export interface DataItem {
  instanceID: string;
  age: string;
  id: number;
  name: string;
  recoredCreateTime: number;
  recoredTotalTime: number;
  recoredEndTime: number;
  describe: string;
  eegInputMarkerList: string;
  irInputMarkerList: string;
  markerList: string;
  waveLength: number;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
    p5: any;
    GPoint: any
    GPlot: any  
  }
} 

interface loadingType {
  show(text?:string):null
  hide():null
}


declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $exportCsv: (record: DataItem, tableName: string) => void,
    loading: loadingType;
  }
}
