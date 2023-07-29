import { useState } from 'react';

export default () => {
  const [lnglatArr, setLnglatArr] = useState<any[]>([]);
  const [upList, setUpList] = useState<any[]>([]);
  const [downList, setDownList] = useState<any[]>([]);
  const [initPosition, setInitPosition] = useState<any[]>([]);
  const [upStartIndex, setUpStartIndex] = useState<number>(-1);
  const [upEndIndex, setUpEndIndex] = useState<number>(-1);
  const [downStartIndex, setDownStartIndex] = useState<number>(-1);
  const [downEndIndex, setDownEndIndex] = useState<number>(-1);
  const [canMark, setCanMark] = useState<boolean>(false);
  const [pointTypeList, setPointTypeList] = useState<any>([]);
  const [stakeNo, setStakeNo] = useState<any[]>(['000', '000']);
  const [bbox, setBbox] = useState<any>();
  const [bboxData, setBboxData] = useState<any>('');

  return {
    lnglatArr,
    setLnglatArr,
    upList,
    setUpList,
    downList,
    setDownList,
    initPosition,
    setInitPosition,
    upStartIndex,
    setUpStartIndex,
    upEndIndex,
    setUpEndIndex,
    downStartIndex,
    setDownStartIndex,
    downEndIndex,
    setDownEndIndex,
    canMark,
    setCanMark,
    pointTypeList,
    setPointTypeList,
    stakeNo,
    setStakeNo,
    bbox,
    setBbox,
    bboxData,
    setBboxData,
  };
};
