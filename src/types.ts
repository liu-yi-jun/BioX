import { InjectionKey, Ref } from 'vue'
import Highcharts from "highcharts";

 
// 对象的InjectionKey
export const HighchartsKey: InjectionKey<typeof Highcharts> = Symbol()
 
// 记录的类型
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