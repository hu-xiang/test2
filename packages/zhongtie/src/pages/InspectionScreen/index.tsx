import React from 'react';
import headLogo from '../../assets/img/loginIcon/logo4.png';
import bottomLogo from '../../assets/img/loginIcon/logo2.png';
import InspectionScreen from 'baseline/src/pages/InspectionScreen';
import styles from '../InspectionBoard/styles.less';

const copyright = '版权所有 © 中铁西南科学研究院有限公司';
const poweredBy = '© Powered by smartmore';
const logoDesc = '道路巡检智能管理平台';

export default (): React.ReactNode => {
  return (
    <InspectionScreen
      headLogo={headLogo}
      hasHeadUser={false}
      logoDesc={logoDesc}
      bottomInfo={{ bottomLogo, copyright, poweredBy }}
      propStyles={styles}
      mapInfo={{
        districtSearch: '成都市',
        zoom: 10,
        center: [104.07, 30.57],
      }}
    ></InspectionScreen>
  );
};
