import FacilityAssets from 'baseline/src/pages/FacilityAssets';
import React, { useState, useEffect } from 'react';
import { useModel, history, useAccess } from 'umi';
import baseStyles from 'baseline/src/pages/InspectionBoard/components/HeadBottom/styles.less';
// import headLogo from '@/assets/img/InspectionBoard/head/logo.svg';
// import bottomLogo from '@/assets/img/InspectionBoard/bottom/bottomlogo.svg';
import propStyles from './styles.less';

// const copyright = '版权所有 © 上海同蹊科技有限公司';
// const poweredBy = '© Powered by smartmore';
const logoDesc = '农村公路巡检智能管理平台';
const excludeDatas = ['/inspectionBoard', '/facilityAssets', '/undergroundDisease'];
export default (): React.ReactNode => {
  const access: any = useAccess();
  const { inspectType, setInspectType } = useModel<any>('inspect');
  const [detectionType, setDetectionType] = useState<string>('inspectionBoard');
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
        headLogo={''}
        bottomInfo={{ bottomLogo: '', copyright: '', poweredBy: '' }}
        propStyles={propStyles}
        logoDesc={logoDesc}
        mapInfo={{
          zoom: 10,
          center: [102.847977, 25.11826],
        }}
        excludeRoutes={excludeDatas}
        programName={'changsha'}
      >
        {access['inspectBorad/index:btn_disease'] ? (
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
        ) : null}
      </FacilityAssets>
    </>
  );
};
