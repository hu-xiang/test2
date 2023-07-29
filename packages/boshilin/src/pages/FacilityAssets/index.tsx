import FacilityAssets from 'baseline/src/pages/FacilityAssets';
import React, { useState, useEffect } from 'react';
import { useModel, history, useAccess } from 'umi';
import headLogo from '@/assets/img/InspectionBoard/head/logo.svg';
import bottomLogo from '@/assets/img/InspectionBoard/bottom/bottomlogo.png';
import baseStyles from 'baseline/src/pages/InspectionBoard/components/HeadBottom/styles.less';
import propStyles from './styles.less';

export default (): React.ReactNode => {
  const access: any = useAccess();
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
    <>
      <FacilityAssets
        headLogo={headLogo}
        excludeRoutes={excludeDatas}
        bottomInfo={{ bottomLogo }}
        propStyles={propStyles}
        mapInfo={{
          zoom: 10,
          center: [114.487854, 38.03504],
        }}
      >
        {access['inspectBorad/index:btn_danger'] ? (
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
        ) : null}
      </FacilityAssets>
    </>
  );
};
