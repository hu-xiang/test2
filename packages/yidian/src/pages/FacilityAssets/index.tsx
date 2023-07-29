import FacilityAssets from 'baseline/src/pages/FacilityAssets';
import React from 'react';
import headLogo from '@/assets/img/InspectionBoard/head/logo.svg';
import bottomLogo from '@/assets/img/InspectionBoard/bottom/bottomlogo.svg';
// import propStyles from './styles.less';

const logoDesc = '道路巡管养平台';
const excludeDatas = ['/inspectionBoard', '/facilityAssets', '/undergroundDisease'];
export default (): React.ReactNode => {
  return (
    <>
      <FacilityAssets
        headLogo={headLogo}
        bottomInfo={{ bottomLogo }}
        // propStyles={propStyles}
        logoDesc={logoDesc}
        excludeRoutes={excludeDatas}
        mapInfo={{
          zoom: 9,
          center: [121.473667, 31.230525],
        }}
      ></FacilityAssets>
    </>
  );
};
