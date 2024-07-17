// 如果有node环境才能使用require，node环境在electron中main.ts中配置
const sqlite3 = require("sqlite3");
// import log  from 'electron-log';
export function CustomDatabase(this: any, url = "data.db") {
  // const sqlite3 = sq3.verbose();
  this.db = new sqlite3.Database(url);
}

CustomDatabase.prototype.init = function (isMain = true) {
  return new Promise((resolve, reject) => {
    this.db.serialize(async () => {
      try {
        await this.run("PRAGMA cipher_compatibility = 4");
        await this.run("PRAGMA key = 'eigene123'");

        // 录制数据表
        await this.run(`CREATE TABLE if not exists record(
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          instanceID VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          describe VARCHAR(255) NOT NULL,
          recoredCreateTime INTEGER NOT NULL default(0),
          recoredTotalTime INTEGER NOT NULL default(0),
          recoredEndTime INTEGER NOT NULL default(0),
          eegInputMarkerList BLOB,
          irInputMarkerList BLOB
          )`);
        // 源数据表
        await this.run(`CREATE TABLE if not exists source(
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          recordId INTEGER NOT NULL,
          data BLOB
          )`);
        // 蓝牙设备表
        await this.run(`CREATE TABLE if not exists device(
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          deviceId VARCHAR(255) NOT NULL,
          uuidList text,
          name VARCHAR(255) NOT NULL,
          describe VARCHAR(255) NOT NULL,
          createTime INTEGER NOT NULL default(0)
          )`);
        // 配置表
        await this.run(`CREATE TABLE if not exists config(
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            configData text
            )`);

        resolve(true);
      } catch (err) {
        // log.error(err);
        reject(err);
      }
    });
  });
};

CustomDatabase.prototype.get = function (sql: string) {
  let that = this;
  return new Promise((resolve, reject) => {
    that.db.get(sql, (err: any, res: any) => {
      if (err) {
        // log.error(err);
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};
CustomDatabase.prototype.run = function (sql: string) {
  let that = this;
  return new Promise((resolve, reject) => {
    // console.log('sql', sql);

    that.db.run(sql, function (this: any, err: any, res: any) {
      if (err) {
        // log.error(err);
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};
CustomDatabase.prototype.all = function (sql: string) {
  let that = this;
  return new Promise((resolve, reject) => {
    that.db.all(sql, (err: any, res: any) => {
      if (err) {
        // log.error(err);
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};
CustomDatabase.prototype.update = function (
  table: string,
  modifys: any,
  conditions: any
) {
  let that = this;
  return new Promise((resolve, reject) => {
    let modifyKey: string[] = [];
    let conditionsKey: string[] = [];
    for (let key in modifys) {
      modifyKey.push(`${key}='${modifys[key]}'`);
    }
    for (let key in conditions) {
      conditionsKey.push(`${key}='${conditions[key]}'`);
    }
    let sql = `UPDATE ${table} SET ${modifyKey.join(
      ","
    )} WHERE ${conditionsKey.join(" and ")}`;
    that
      .run(sql)
      .then((res: any) => resolve(res))
      .catch((err: any) => reject(err));
  });
};
CustomDatabase.prototype.insertOrUpdate = function (
  table: string,
  params: any
) {
  let that = this;
  return new Promise((resolve, reject) => {
    let keys: string[] = [],
      values: string[] = [];
    for (var i in params) {
      keys.push(i);
      values.push("'" + params[i] + "'");
    }
    let sql = `REPLACE INTO ${table} (${keys.join(",")}) VALUES(${values.join(
      ","
    )})`;
    that
      .run(sql)
      .then((res: any) => resolve(res))
      .catch((err: any) => reject(err));
  });
};
CustomDatabase.prototype.insertOrIgnore = function (
  table: string,
  params: any
) {
  let that = this;
  return new Promise((resolve, reject) => {
    let keys: string[] = [],
      values: string[] = [];
    for (var i in params) {
      keys.push(i);
      values.push("'" + params[i] + "'");
    }
    let sql = `insert or ignore INTO ${table} (${keys.join(
      ","
    )}) VALUES(${values.join(",")})`;
    that
      .run(sql)
      .then((res: any) => resolve(res))
      .catch((err: any) => reject(err));
  });
};

CustomDatabase.prototype.insert = function (table: string, params: any) {
  let that = this;
  return new Promise((resolve, reject) => {
    let keys: string[] = [],
      values: string[] = [];
    for (var i in params) {
      keys.push(i);
      values.push("'" + params[i] + "'");
    }
    let sql = `INSERT INTO ${table} (${keys.join(",")}) VALUES(${values.join(
      ","
    )})`;
    that
      .run(sql)
      .then((res: any) => resolve(res))
      .catch((err: any) => reject(err));
  });
};
CustomDatabase.prototype.delete = function (table: string, conditions: any) {
  let that = this;
  let conditionsKey: string[] = [];
  return new Promise(async (resolve, reject) => {
    try {
      for (let key in conditions) {
        conditionsKey.push(`${key}='${conditions[key]}'`);
      }
      let sql = `DELETE FROM ${table} WHERE ${conditionsKey.join(" and ")} `;
      let res = await that.run(sql);
      that.run("VACUUM");
      resolve(res);
    } catch (err) {
      reject(err);
    }
  });
};
