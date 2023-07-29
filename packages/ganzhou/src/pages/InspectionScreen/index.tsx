import React from 'react';
import headLogo from '@/assets/img/InspectionBoard/head/logo.svg';
import bottomLogo from '@/assets/img/InspectionBoard/bottom/bottomlogo.svg';
import InspectionBoard from 'baseline/src/pages/InspectionScreen';
import styles from '../InspectionBoard/styles.less';

const logoDesc = '道路巡检智能管理平台';

export default (): React.ReactNode => {
  return (
    <InspectionBoard
      headLogo={headLogo}
      logoDesc={logoDesc}
      bottomInfo={{ bottomLogo }}
      propStyles={styles}
      mapInfo={{
        districtSearch: '江西省',
        zoom: 8,
        center: [115.53, 26.83],
      }}
    />
  );
};
