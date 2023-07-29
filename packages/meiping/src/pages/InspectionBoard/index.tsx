import React from 'react';
import headLogo from '../../assets/img/inspectionBoard/logo.svg';
import bottomLogo from '../../assets/img/inspectionBoard/bottomlogo.png';
import InspectionBoard from 'baseline/src/pages/InspectionBoard';
import styles from './styles.less';

// const copyright = '版权所有 © 上海同蹊科技有限公司';
// const poweredBy = '© Powered by smartmore';
const logoDesc = '高速公路路面日常管养智能巡检及辅助分析系统';

export default (): React.ReactNode => {
  return (
    <InspectionBoard
      headLogo={headLogo}
      logoDesc={logoDesc}
      bottomInfo={{ bottomLogo }}
      propStyles={styles}
      // mapInfo={{
      //   districtSearch: '昆明市',
      //   zoom: 10,
      //   center: [102.847977, 25.11826],
      // }}
    ></InspectionBoard>
  );
};
