import CryptoJS from 'crypto-js';
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
