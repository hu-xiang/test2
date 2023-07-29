import styles from './styles.less';
import React, { useState, Fragment, useEffect } from 'react';
import { Image } from 'antd';
import jingai from '../../../../assets/img/InspectionBoard/leftBoard/icon-jg.svg';
import lichengbei from '../../../../assets/img/InspectionBoard/leftBoard/icon-lcz.svg';
import light from '../../../../assets/img/InspectionBoard/leftBoard/icon-xhd.svg';
import flag from '../../../../assets/img/InspectionBoard/leftBoard/icon-jtbz.svg';
import board from '../../../../assets/img/InspectionBoard/leftBoard/icon-qbb.svg';
import longmenjia from '../../../../assets/img/InspectionBoard/leftBoard/icon-lmj.svg';
import uploadNullImg from '../../../../assets/img/uploadIcon/uploadImg.png';

type Iprops = {
  facInfo?: any;
  customClass?: string;
};

const SubFacilityDis: React.FC<Iprops> = (props) => {
  const defalutFormData = {
    jingaiNo: '0',
    trafficLight: '0',
    trafficFlag: '0',
    board: '0',
    lmjNo: '0',
    lcbNo: '0',
  };
  const { facInfo } = props;
  const [facilityInfo, setFacilityInfo] = useState<any>();
  useEffect(() => {
    setFacilityInfo(facInfo);
  }, [facInfo]);
  const facilityInfoName = {
    jingaiNo: '井盖',
    trafficLight: '交通信号灯',
    trafficFlag: '标志标牌',
    board: '电子情报板',
    lmjNo: '龙门架',
    // lcbNo: '里程桩',
  };
  const imgList = {
    jingaiNo: jingai,
    trafficLight: light,
    trafficFlag: flag,
    board,
    lmjNo: longmenjia,
    lcbNo: lichengbei,
  };
  return (
    <div className={`${styles['content-nums-box']} ${props.customClass}`}>
      {Object.keys(facilityInfoName).map((it: any) => {
        return (
          <Fragment key={it}>
            <div className={`${styles['fac-item-class']}`}>
              <div className={styles['img-class']}>
                <Image src={imgList[it] || 'error'} fallback={uploadNullImg} preview={false} />
              </div>
              <div className={styles['column-class']}>
                <span
                  title={`${facilityInfoName[it]}(个)`}
                  className={styles['name-txt']}
                >{`${facilityInfoName[it]}(个)`}</span>
                <span className={styles['num-txt']}>
                  {(facilityInfo && facilityInfo[`${facilityInfoName[it]}`]) || defalutFormData[it]}
                </span>
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
};

export default SubFacilityDis;
