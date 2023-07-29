import { useState } from 'react';

export default () => {
  const [fileName, setFileName] = useState<any>('');
  const [filePath, setFilePath] = useState<any>('');
  return { fileName, setFileName, filePath, setFilePath };
};
