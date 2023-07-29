// import headLogo from '@/assets/img/InspectionBoard/head/logo.svg';
// import headLogo from 'baseline/src/assets/img/InspectionBoard/Head/logo.svg';
// import bottomLogo from '@/assets/img/InspectionBoard/bottom/bottomlogo.png';
import InspectionBoard from 'baseline/src/pages/InspectionBoard';
import styles from './styles.less';
import baseStyles from 'baseline/src/pages/InspectionBoard/components/HeadBottom/styles.less';
// import baseStyles from 'baseline/src/pages/InspectionBoard/styles.less';
import React, { useState, useEffect } from 'react';
import { history } from 'umi';
import { useModel } from 'umi';

const copyright = '';
const poweredBy = '';
const logoDesc = '农村公路巡检智能管理平台';

export default (): React.ReactNode => {
  const [detectionType, setDetectionType] = useState<string>('');
  const { inspectType, setInspectType } = useModel<any>('inspect');
  const excludeDatas = ['/inspectionBoard', '/facilityAssets', '/undergroundDisease'];
  const handleDetetion = (str: string) => {
    setInspectType(str);
    setDetectionType(str);
    if (str) {
      const toUrl = `/${str}`;
      history.push(toUrl);
    }
  };

  // useEffect(() => {
  //   if (history.location?.pathname === '/inspectionBoard') {
  //     setDetectionType('Inspection');
  //   } else if (history.location?.pathname === '/undergroundDisease') {
  //     setDetectionType('Detection');
  //   }
  // }, []);
  useEffect(() => {
    if (!inspectType) {
      setDetectionType(history.location?.pathname.replace('/', ''));
    } else {
      setDetectionType(inspectType);
    }
  }, [inspectType]);
  return (
    <InspectionBoard
      headLogo={''}
      logoDesc={logoDesc}
      bottomInfo={{ bottomLogo: '', copyright, poweredBy }}
      propStyles={styles}
      mapInfo={{
        districtSearch: '长沙市',
        zoom: 10,
        center: [112.938882, 28.228304],
      }}
      excludeRoutes={excludeDatas}
    >
      <div
        className={`${baseStyles.detectSpanClass} ${
          detectionType === 'undergroundDisease' ? `${baseStyles.cuberbuttonClass}` : null
        }`}
        onClick={() => {
          handleDetetion('undergroundDisease');
        }}
      >
        <span className={baseStyles.txtDetectClass}>地下病害</span>
      </div>
    </InspectionBoard>
  );
};
