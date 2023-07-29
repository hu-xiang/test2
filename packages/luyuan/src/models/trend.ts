import { useState } from 'react';

export default () => {
  // const [fkId, setFkId] = useState<any>('1569911269123346434');
  const [fkId, setFkId] = useState<any>('');
  return { fkId, setFkId };
};
