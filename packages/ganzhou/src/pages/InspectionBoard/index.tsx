import headLogo from '@/assets/img/InspectionBoard/head/logo.svg';
import bottomLogo from '@/assets/img/InspectionBoard/bottom/bottomlogo.svg';
import InspectionBoard from 'baseline/src/pages/InspectionBoard';
import styles from './styles.less';
import React from 'react';

const logoDesc = '城市道路病害检测管理系统';

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
    ></InspectionBoard>
  );
};
