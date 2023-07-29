import FacilityAssets from 'baseline/src/pages/FacilityAssets';
import React from 'react';
// import propStyles from './styles.less';

const logoDesc = '';
const excludeDatas = ['/inspectionBoard', '/facilityAssets', '/undergroundDisease'];
export default (): React.ReactNode => {
  return (
    <>
      <FacilityAssets
        headLogo={' '}
        bottomInfo={{ bottomLogo: '无' }}
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
