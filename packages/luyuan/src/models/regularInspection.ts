import { useState } from 'react';

export default () => {
  const [fileList, setFileList] = useState<any>([]);
  const [fileNum, setFileNum] = useState<number>(0);
  return { fileList, setFileList, fileNum, setFileNum };
};
