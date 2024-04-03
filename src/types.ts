import { InjectionKey, Ref } from 'vue'
import Highcharts from "highcharts";

 
// 对象的InjectionKey
export const HighchartsKey: InjectionKey<typeof Highcharts> = Symbol()
 
