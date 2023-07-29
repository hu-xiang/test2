import headLogo from '@/assets/img/InspectionBoard/head/logo.svg';
import bottomLogo from '@/assets/img/InspectionBoard/bottom/bottomlogo.png';
import InspectionBoard from 'baseline/src/pages/InspectionBoard';
import styles from './styles.less';
import baseStyles from 'baseline/src/pages/InspectionBoard/components/HeadBottom/styles.less';
import React, { useState, useEffect } from 'react';
import { history, useModel } from 'umi';

const copyright = '版权所有 © 河北博士林科技开发有限公司';
const poweredBy = '© Powered by smartmore';
const logoDesc = '道路巡检智能管理平台';

export default (): React.ReactNode => {
  const [detectionType, setDetectionType] = useState<string>('inspectionBoard');
  const { inspectType, setInspectType } = useModel<any>('inspect');
  const excludeDatas = ['/inspectionBoard', '/facilityAssets', '/hiddenDangerBoard'];
  const handleDetetion = (str: string) => {
    setInspectType(str);
    setDetectionType(str);
    if (str) {
      const toUrl = `/${str}`;
      history.push(toUrl);
    }
  };

  useEffect(() => {
    if (!inspectType) {
      setDetectionType(history.location?.pathname.replace('/', ''));
    } else {
      setDetectionType(inspectType);
    }
  }, [inspectType]);
  return (
    <InspectionBoard
      headLogo={headLogo}
      logoDesc={logoDesc}
      bottomInfo={{ bottomLogo, copyright, poweredBy }}
      propStyles={styles}
      mapInfo={{
        districtSearch: '河北省',
        zoom: 10,
        center: [114.51, 38.04],
        subdistrict: 4,
      }}
      excludeRoutes={excludeDatas}
    >
      <div
        className={`${baseStyles.detectSpanClass} ${
          detectionType === 'hiddenDangerBoard' ? `${baseStyles.cuberbuttonClass}` : null
        }`}
        onClick={() => {
          handleDetetion('hiddenDangerBoard');
        }}
      >
        <span className={baseStyles.txtDetectClass}>隐患看板</span>
      </div>
    </InspectionBoard>
  );
};
