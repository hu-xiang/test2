import FacilityAssets from 'baseline/src/pages/FacilityAssets';
import React, { useState, useEffect } from 'react';
import { useModel, history, useAccess } from 'umi';
import baseStyles from 'baseline/src/pages/InspectionBoard/components/HeadBottom/styles.less';
import headLogo from '@/assets/img/InspectionBoard/head/logo.png';
import bottomLogo from '@/assets/img/InspectionBoard/bottom/bottomlogo.svg';
import propStyles from './styles.less';

const copyright = '';
const poweredBy = '';
export default (): React.ReactNode => {
  const access: any = useAccess();
  const { inspectType, setInspectType } = useModel<any>('inspect');
  const [detectionType, setDetectionType] = useState<string>('inspectionBoard');
  const excludeDatas = ['/inspectionBoard', '/facilityAssets', '/detectionEvalution'];
  // const [theme, setTheme] = useState<string>('black');
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
        bottomInfo={{ bottomLogo, copyright, poweredBy }}
        propStyles={propStyles}
        mapInfo={{
          zoom: 9,
          center: [114.3, 30.59],
        }}
        excludeRoutes={excludeDatas}
      >
        {access['inspectBorad/index:btn_detection'] ? (
          <div
            className={`${baseStyles.detectSpanClass} ${
              detectionType === 'detectionEvalution' ? `${baseStyles.cuberbuttonClass}` : null
            }`}
            onClick={() => {
              handleDetetion('detectionEvalution');
            }}
          >
            <span className={baseStyles.txtDetectClass}>检测评价</span>
          </div>
        ) : null}
      </FacilityAssets>
    </>
  );
};
