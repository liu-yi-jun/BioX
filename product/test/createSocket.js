let child_process = require("child_process");
let path = require("path");
let _product_path =  path.join(__dirname, "../../product");
console.log("product_path", _product_path);
nodeServer = child_process.exec(
  path.join(_product_path, `/exe/server_socket.exe`),
  (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  }
);

