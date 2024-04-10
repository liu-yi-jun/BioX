var ref = require("ref-napi");
var ffi = require("ffi-napi");
import { join } from "path";
const Struct = require("ref-struct-napi");
var ArrayType = require("ref-array-napi");

let __static = process.argv[2];
let _product_path = process.argv[3];
// 定义指针类型
// 定义用于映射DLL内结构体的结构
const PKG = Struct({
  pkglen: ref.types.int16,
  time_mark: ref.types.int32,
  brain_elec_channel: ArrayType(ref.types.int32, 2),
  near_infrared_channel: ArrayType(ref.types.int32, 6),
  acceleration_x: ref.types.uint16,
  acceleration_y: ref.types.uint16,
  acceleration_z: ref.types.uint16,
  temperature: ref.types.int16,
  fall_off: ref.types.uint8,
  error_state: ref.types.int16,
});


// 加载DLL

var pkg_decode_path = join(_product_path, "/dll/pkg_decode(1).dll");

var TEST_SERIAL_PORT_PATH = join(_product_path, "/dll/TEST_SERIAL_PORT.dll");

// let pkgDecode = ffi.Library(TEST_SERIAL_PORT_PATH, {
//   OPEN_COM: ['bool', ['int']],
//   SEND_COM: ['bool', [ref.types.uint8, ArrayType(ref.types.uint8), 'int', ref.types.uint16]],
//   RECV_COM: ['bool', [ArrayType(ref.types.uint8)]],
// });

const pkgDecode = ffi.Library(pkg_decode_path, {
  get_pkg_buffer_length: ["int", []],
  push_to_databuffer: ["void", ["uint8"]],
  pkgbuffer_pop: ["void", []],
  pkg_recv: ["void", []],
  // ref.refType(PKG)定义一个PKG类型的指针
  decode: [ref.refType(PKG) , []],
});

// 接收消息
process.on("message", async function ({ msg, data }) {
  if (msg === "start-data-decode") {
    pkgDecode.pkg_recv();      
    let recvBuffer = Buffer.from(data.data);
    for (let i = 0; i < recvBuffer.length; i++) {
      pkgDecode.push_to_databuffer(recvBuffer[i]);
    }
    
    if (pkgDecode.get_pkg_buffer_length()) {
      // 返回一个指针
      const ptrpkg = pkgDecode.decode();;
      // 获取值
      const pkg = ptrpkg.deref()
      console.log('pkg.pkglen',pkg.pkglen);
      console.log('pkg.time_mark',pkg.time_mark);
      console.log('brain_elec_channel.0',pkg.brain_elec_channel[0]);
      console.log('brain_elec_channel.1',pkg.brain_elec_channel[1]);
      console.log('near_infrared_channel.0',pkg.near_infrared_channel[0]);
      console.log('near_infrared_channel.1',pkg.near_infrared_channel[1]);
      console.log('near_infrared_channel.2',pkg.near_infrared_channel[2]);
      console.log('near_infrared_channel.3',pkg.near_infrared_channel[3]);
      console.log('near_infrared_channel.4',pkg.near_infrared_channel[4]);
      console.log('near_infrared_channel.5',pkg.near_infrared_channel[5]);
      console.log('acceleration_x',pkg.acceleration_x);
      console.log('acceleration_y',pkg.acceleration_y);
      console.log('acceleration_z',pkg.acceleration_z);
      console.log('temperature',pkg.temperature);
      console.log('fall_off',pkg.fall_off);
      console.log('error_state',pkg.error_state);
      pkgDecode.pkgbuffer_pop();
    }
  }
});
