import React from 'react';
import headLogo from 'baseline/src/assets/img/InspectionBoard/Head/logo.svg';
import bottomLogo from 'baseline/src/assets/img/InspectionBoard/bottom/bottomlogo.svg';
import InspectionBoard from 'baseline/src/pages/InspectionBoard';
import styles from './styles.less';

// const copyright = '版权所有 © 上海同蹊科技有限公司';
const poweredBy = '© Powered by smartmore';
const logoDesc = '盐城道路巡管养平台';

export default (): React.ReactNode => {
  return (
    <InspectionBoard
      headLogo={headLogo}
      logoDesc={logoDesc}
      bottomInfo={{ bottomLogo, poweredBy }}
      propStyles={styles}
      // mapInfo={{
      //   districtSearch: '昆明市',
      //   zoom: 10,
      //   center: [102.847977, 25.11826],
      // }}
    ></InspectionBoard>
  );
};
