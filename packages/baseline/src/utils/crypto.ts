import CryptoJS from 'crypto-js';
import SparkMD5 from 'spark-md5';
// 加密
export function aesEcode(word: string, keyStr = '123qwer456asdf@#', ivStr = 'encryptionIntVec') {
  const key = CryptoJS.enc.Utf8.parse(keyStr);
  const iv = CryptoJS.enc.Utf8.parse(ivStr);
  const srcs = CryptoJS.enc.Utf8.parse(word);
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    // padding: CryptoJS.pad.ZeroPadding
  });
  return encrypted.toString();
}

// 解密
export function aesDecode(
  encryptedStr: string,
  keyStr = '123qwer456asdf@#',
  ivStr = 'encryptionIntVec',
) {
  // if (!encryptedStr) return;
  const key = CryptoJS.enc.Utf8.parse(keyStr);
  const iv = CryptoJS.enc.Utf8.parse(ivStr);
  const decrypt = CryptoJS.AES.decrypt(encryptedStr, key, {
    iv,
    mode: CryptoJS.mode.CBC,
  });
  return decrypt.toString(CryptoJS.enc.Utf8);
}

// 获取文件md5
export function getFileMd5(file: any) {
  return new Promise((resolve, reject) => {
    // let blobSlice = File.prototype.slice || File.prototype?.mozSlice || File.prototype?.webkitSlice;
    const blobSlice = File.prototype.slice;
    // const chunkSize = file.size / 100;
    const chunkSize = 50 * 1024 * 1024;

    // const chunks = 100;
    const chunks = Math.ceil(file.size / chunkSize);

    let currentChunk = 0;
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    fileReader.onload = function (e: any) {
      spark.append(e.target.result); // Append array buffer
      currentChunk += 1;
      if (currentChunk < chunks) {
        loadNext();
      } else {
        const result = spark.end();
        resolve(result);
      }
    };
    fileReader.onerror = function (err) {
      console.warn('oops, something went wrong.');
      reject(err);
    };
    function loadNext() {
      const start = currentChunk * chunkSize;
      const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }
    loadNext();
  });
}
