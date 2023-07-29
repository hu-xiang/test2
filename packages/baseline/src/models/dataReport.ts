import { useState } from 'react';

export default () => {
  const [tabValue, setTabValue] = useState<string>('1');
  const [dataInfo, setDataInfo] = useState<Record<string, any>>({
    direction: 0,
    laneId: undefined,
  });
  const [arrowVisible, setArrowVisible] = useState(false); // commontable用
  const [arrowDisabled, setArrowDisabled] = useState(''); // commontable用
  const [toLeftOrRight, setToLeftOrRight] = useState('');
  return {
    tabValue,
    setTabValue,
    dataInfo,
    setDataInfo,
    arrowVisible,
    setArrowVisible,
    arrowDisabled,
    setArrowDisabled,
    toLeftOrRight,
    setToLeftOrRight,
  };
};
