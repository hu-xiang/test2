import React from 'react';
import FacilityAssets from 'baseline/src/pages/FacilityAssets';
import headLogo from '@/assets/img/InspectionBoard/head/logo.svg';
import bottomLogo from '@/assets/img/InspectionBoard/bottom/bottomlogo.svg';

export default (): React.ReactNode => {
  return (
    <>
      <FacilityAssets
        headLogo={headLogo}
        bottomInfo={{ bottomLogo }}
        mapInfo={{
          districtSearch: '江西省',
          zoom: 8,
          center: [115.53, 26.83],
        }}
      />
    </>
  );
};
