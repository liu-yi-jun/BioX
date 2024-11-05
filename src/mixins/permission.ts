import { CustomDatabase } from "../utils/db";
import { useIndexStore } from "../store/index";
import { storeToRefs } from "pinia";
import { DataItem } from "../types";
const db = new CustomDatabase();


export default {
  install(app) {
    app.config.globalProperties.$exportCsv = async function (record: DataItem,tableName:string) {
      let eegInputMarkerList = JSON.parse(record.eegInputMarkerList);
      let irInputMarkerList = JSON.parse(record.irInputMarkerList);
      let markerList = JSON.parse(record.markerList);
      let csvContent = "";
      let eegChannel = 1;
      let irChannel = 1;
      let eegDataNum = 1;
      debugger
      app?.proxy?.loading.show("导出中...");
      // 第一行的值
      const metaDataKeys = [
        "ID",
        "NAME",
        "DESCRIPTION",
        "RECORDCREATETIME",
        "RECORDTOTALTIME",
        "DEVICE TYPE",
        "DEVICE SERIAL",
        "DEVICE FIRMWARE",
        "EEG CHANNELS",
        "EEG SAMPLING RATE",
        "IR CHANNELS",
        "IR WAVELENGTHS",
        "IR SAMPLING RATE",
        "MARKER DESCRIPTION",
        "LOSS NUM",
      ];
      csvContent += metaDataKeys.join(",") + "\n";

      // 第二行的值
      // 保存record的信息
      csvContent +=
        record.id +
        "," +
        record.name +
        "," +
        record.describe +
        "," +
        record.recoredCreateTime +
        "," +
        record.recoredTotalTime +
        ",";
      // Device TYPE
      csvContent += "" + ",";
      // Device SERIAL
      csvContent += "" + ",";
      // DEVICE FIRMWARE
      csvContent += "" + ",";
      // 获取记录的数据
      // const res = await db.get(`select sourceData from record where id = ${record.id}`);
      const res = await db.all(
        `select * from ${tableName} where recordId = ${record.id}`
      );

      let sourceData = res
        .map((item) => {
          return JSON.parse(item.data);
        })
        .flat();

      // 检查sourceData是否是数组以及是否有数据
      if (!Array.isArray(sourceData) || sourceData.length === 0) {
        alert("记录的数据异常！");
        app?.proxy?.loading.hide();
        return;
      }
      let firstPKGData = sourceData[0];
      let firstEntries = Object.entries(firstPKGData);
      // EEG CHANNELS
      let keyToFind = "eeg_channel";
      let valueForKey = (
        firstEntries.find(([key]) => key === keyToFind) as
          | [string, number]
          | undefined
      )?.[1];
      if (valueForKey != undefined) {
        csvContent += valueForKey + ",";
        eegChannel = valueForKey;
      } else {
        csvContent += "" + ",";
      }
      // EEG SAMPLING RATE
      csvContent += "" + ",";
      // IR CHANNELS
      keyToFind = "ir_channel";
      valueForKey = (
        firstEntries.find(([key]) => key === keyToFind) as
          | [string, number]
          | undefined
      )?.[1];
      if (valueForKey != undefined) {
        csvContent += valueForKey + ",";
        irChannel = valueForKey;
      } else {
        csvContent += "" + ",";
      }
      // IR WAVELENGTHS
      csvContent += "" + ",";
      // IR SAMPLING RATE
      csvContent += "" + ",";
      // MARKER DESCRIPTION
      if (markerList.length > 0) {
        markerList.sort((a, b) => {
          if (a.type < b.type) {
            return -1;
          }
          if (a.type > b.type) {
            return 1;
          }
          return 0;
        });
      }

      let markerDescription: string[] = [];
      markerList.forEach((element) => {
        if (element.type && element.type.trim() !== "") {
          markerDescription.push(`${element.type}:${element.description}`);
        }
      });
      csvContent += markerDescription.join(";") + ",";
      // LOSS NUM
      let lossNum = 0;
      sourceData.forEach((ele) => {
        if (ele.isLosspkg == true) {
          lossNum += 1;
        }
      });
      csvContent += lossNum.toString() + "\n";

      // 获取eeg data num
      keyToFind = "eeg_data_num";
      valueForKey = (
        firstEntries.find(([key]) => key === keyToFind) as
          | [string, number]
          | undefined
      )?.[1];
      if (valueForKey != undefined) {
        eegDataNum = valueForKey;
      } else {
        console.error("未获取到eeg_data_num");
      }

      // 第三行的值
      let thirdRowList = ["TIMESTAMP"];
      thirdRowList.push("EEG.COUNTER");
      for (let index = 1; index < eegChannel + 1; index++) {
        thirdRowList.push("EEG.FP" + index);
      }

      thirdRowList.push("FNIRS.COUNTER");

      // 构造IR数据的列名，可能为双波长或者三波长
      // 表示IR Channel的数量
      let irChannelCount = 0;
      const waveLengthNamePrefixes = [
        "FNIRS.S1D1",
        "FNIRS.S1D2",
        "FNIRS.S1D3",
        "FNIRS.S1D4",
        "FNIRS.S2D1",
        "FNIRS.S2D2",
        "FNIRS.S2D3",
        "FNIRS.S2D4",
      ];
      const twoWaveLengths = ["735", "850"];
      const threeWaveLengths = ["735", "805", "850"];
      if (record.waveLength == 2) {
        for (let i = 0; i < waveLengthNamePrefixes.length; i++) {
          for (let j = 0; j < twoWaveLengths.length; j++) {
            irChannelCount += 1;
            thirdRowList.push(
              waveLengthNamePrefixes[i] + "." + twoWaveLengths[j]
            );
          }
        }
      } else if (record.waveLength == 3) {
        for (let i = 0; i < waveLengthNamePrefixes.length; i++) {
          for (let j = 0; j < threeWaveLengths.length; j++) {
            irChannelCount += 1;
            thirdRowList.push(
              waveLengthNamePrefixes[i] + "." + threeWaveLengths[j]
            );
          }
        }
      } else {
        alert("记录数据的波长选择错误！");
        app?.proxy?.loading.hide();
      }

      thirdRowList.push("MARKER");
      thirdRowList.push("IS_LOSS");
      // thirdRowList.value.push("PKG_NUM")
      // thirdRowList.value.push("TIME_MARK")
      csvContent += thirdRowList.join(",") + "\n";

      // 第三行值的长度，即记录的数据字段的个数
      let thirdRowListLength = thirdRowList.length;

      // 第三行以后的值
      // 处理marker数组
      // 合并两个marker数组
      let mergedMarkerData = [...eegInputMarkerList, ...irInputMarkerList];
      // 对合并后的数组按 timestamp 排序
      mergedMarkerData.sort((a, b) => a.timestamp - b.timestamp);

      // 处理marker数组和sourceData，将两者合并
      // 首先给数据加入一个标识符，表明来自于哪个数组
      sourceData.forEach((item) => {
        item.source = "sourceData";
      });

      mergedMarkerData.forEach((item) => {
        item.source = "mergedMarkerData";
      });
      let mergedData = [...sourceData, ...mergedMarkerData];
      // debugger;
      mergedData.sort((a, b) => {
        const timeA = a.source === "sourceData" ? a.time_utc : a.time_stamp;
        const timeB = b.source === "sourceData" ? b.time_utc : b.time_stamp;
        return timeA - timeB;
      });

      // 用来表示eeg数据的序列号
      let eegCounter = 0;
      // 用来表示ir数据的序列号
      let fnirsCounter = 0;
      let valueArrayArrayForKey;
      // 转换数据到CSV格式
      // 转换数据时，需要将数据包数组与marker数组的数据进行融合写入文件里
      mergedData.forEach((pkgData, pkgIndex) => {
        // 数据是marker数组内的数据
        if (pkgData.source == "mergedMarkerData") {
          csvContent += pkgData.time_stamp + ",";
          // 中间的eeg或者ir数据都写为空
          for (let index = 0; index < thirdRowListLength - 3; index++) {
            csvContent += "" + ",";
          }
          csvContent += pkgData.type + ",";
          csvContent += "" + "\n";
          return;
        }
        // 正常的数据包数据
        const entries = Object.entries(pkgData);
        keyToFind = "pkg_type";
        valueForKey = (
          entries.find(([key]) => key === keyToFind) as
            | [string, number]
            | undefined
        )?.[1];
        if (valueForKey == 1) {
          // EEG Data
          keyToFind = "brain_elec_channel";
          valueArrayArrayForKey = (
            entries.find(([key]) => key === keyToFind) as
              | [string, number[][]]
              | undefined
          )?.[1];
          if (Array.isArray(valueArrayArrayForKey)) {
            // 处理二维数组
            // console.log('Found array:', valueArrayArrayForKey);
            for (let col = 0; col < eegDataNum; col++) {
              // 补包的情况下自己算间隔，因为丢包后的时间戳不太对
              let TimeGap;
              let mI = pkgIndex + 1;
              for (mI; mI < mergedData.length; mI++) {
                if (mergedData[mI].pkg_type == 1) {
                  break;
                }
              }
              if (
                pkgData.isLosspkg &&
                mI < mergedData.length &&
                mergedData[mI].pkg_type == 1
              ) {
                TimeGap =
                  (mergedData[mI].time_mark - pkgData.time_mark) / eegDataNum;
              } else {
                const indexStore = useIndexStore();
                const { configData } = storeToRefs(indexStore);
                TimeGap = 1000 / configData.value.eegFilter.sample_rate;
              }
              csvContent += "" + (pkgData.time_utc + col * TimeGap) + ",";
              //增加eeg counter
              csvContent += "" + eegCounter + ",";
              eegCounter += 1;
              if (eegCounter >= 256) {
                eegCounter = 0;
              }
              for (let row = 0; row < eegChannel; row++) {
                const element = valueArrayArrayForKey[row];
                csvContent += "" + element[col] + ",";
              }
              // 之后的近红外数据和marker数据应该都是空的
              // remainFieldNumber: 余下的还没赋值的字段数量
              let remainFieldNumber = irChannelCount + 2;
              for (let index = 0; index < remainFieldNumber; index++) {
                csvContent += ",";
              }
              if (pkgData.isLosspkg == true) {
                csvContent += "1";
              } else {
                csvContent += "0";
              }
              // csvContent += "" + pkgData.pkgnum + ",";
              // csvContent += "" + pkgData.time_mark + ",";
              csvContent += "\n";
            }
          } else {
            // 找不到数据，这行都是空的
            // 2是marker数据字段的长度
            for (
              let index = 0;
              index < eegChannel + irChannelCount + 2 + 1;
              index++
            ) {
              csvContent += ",";
            }
            csvContent += "\n";
            console.error("Key not found or value is not an array.");
          }
        } else if (valueForKey == 2) {
          // 近红外数据
          // EEG 数据应该是空的，所以空起来
          csvContent += "" + pkgData.time_utc + ",";
          for (let index = 0; index < eegChannel + 1; index++) {
            csvContent += ",";
          }
          csvContent += "" + fnirsCounter + ",";
          fnirsCounter += 1;
          if (fnirsCounter >= 256) {
            fnirsCounter = 0;
          }
          // 近红外 Data
          keyToFind = "near_infrared";
          valueArrayArrayForKey = (
            entries.find(([key]) => key === keyToFind) as
              | [string, number[][]]
              | undefined
          )?.[1];

          // 余下的还没赋值的字段数量
          let remainFieldNumber = irChannelCount + 2;
          if (Array.isArray(valueArrayArrayForKey)) {
            let neadInfrared = valueArrayArrayForKey?.flat();
            if (record.waveLength == 2) {
              for (let index = 0; index < neadInfrared.length; index++) {
                if (index % 2 == 0) {
                  csvContent += "" + neadInfrared[index] + ",";
                }
              }
            } else if (record.waveLength == 3) {
              for (let index = 0; index < neadInfrared.length; index++) {
                if (index % 4 != 3) {
                  csvContent += "" + neadInfrared[index] + ",";
                }
              }
            }
            // 2 是marker数据字段
            csvContent += "" + ",";
            if (pkgData.isLosspkg == true) {
              csvContent += "1";
            } else {
              csvContent += "0";
            }
            // csvContent += "" + pkgData.pkgnum + ",";
            // csvContent += "" + pkgData.time_mark + ",";
            csvContent += "\n";
          } else {
            // 找不到数据，这行都是空的
            for (
              let index = 0;
              index < eegChannel + remainFieldNumber + 1;
              index++
            ) {
              csvContent += ",";
            }
            csvContent += "\n";
          }
        }
      });
      // 创建一个Blob对象
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      // 创建一个临时的URL对象
      const url = window.URL.createObjectURL(blob);

      // 创建一个a标签模拟点击进行下载
      const a = document.createElement("a");
      a.href = url;
      a.download = record.name + ".csv"; // 设置下载的文件名
      document.body.appendChild(a);
      a.click();

      app?.proxy?.loading.hide();

      // 清理并释放URL对象
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    };
  },
};
