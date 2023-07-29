import { useState } from 'react';

export default () => {
  const [faclityId, setFaclityId] = useState<any>();
  const [inspectType, setInspectType] = useState<string>('');
  const [currentType, setCurrentType] = useState<string>('subfac');
  return { faclityId, setFaclityId, inspectType, setInspectType, currentType, setCurrentType };
};
