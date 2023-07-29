import headLogo from '../../assets/img/InspectionBoard/head/logo.png';
import bottomLogo from '../../assets/img/InspectionBoard/bottom/bottomlogo.svg';
import InspectionBoard from 'baseline/src/pages/InspectionScreen';
import styles from '../InspectionBoard/styles.less';
import { useModel } from 'umi';
import baseStyles from 'baseline/src/pages/InspectionBoard/components/HeadBottom/styles.less';
import React, { useState, useEffect } from 'react';
import { history, useAccess } from 'umi';

const copyright = '';
const poweredBy = '';

export default (): React.ReactNode => {
  const access: any = useAccess();
  const [detectionType, setDetectionType] = useState<string>('');
  const { inspectType, setInspectType } = useModel<any>('inspect');
  const excludeDatas = ['/inspectionBoard', '/facilityAssets', '/detectionEvalution'];
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
      bottomInfo={{ bottomLogo, copyright, poweredBy }}
      propStyles={styles}
      programName={'luyuan'}
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
    </InspectionBoard>
  );
};
