// import headLogo from '@/assets/img/InspectionBoard/head/logo.svg';
// import bottomLogo from '@/assets/img/InspectionBoard/bottom/bottomlogo.svg';
// import InspectionBoard from 'baseline/src/pages/InspectionScreen';
// import styles from '../InspectionBoard/styles.less';
// // import baseStyles from 'baseline/src/pages/InspectionBoard/styles.less';
// import React from 'react';

// const copyright = '版权所有 © 上海仪电';
// const poweredBy = '© Powered by smartmore';
// const logoDesc = '道路巡管养平台';

// export default (): React.ReactNode => {
//   return (
//     <InspectionBoard
//       headLogo={headLogo}
//       logoDesc={logoDesc}
//       bottomInfo={{ bottomLogo, copyright, poweredBy }}
//       propStyles={styles}
//       mapInfo={{
//         zoom: 9,
//         center: [121.473667, 31.230525],
//       }}
//     ></InspectionBoard>
//   );
// };

import InspectionScreen from 'baseline/src/pages/InspectionScreen';
import styles from '../InspectionBoard/styles.less';
// import baseStyles from 'baseline/src/pages/InspectionBoard/styles.less';
import React from 'react';

const logoDesc = '';

export default (): React.ReactNode => {
  return (
    <InspectionScreen
      headLogo={' '}
      logoDesc={logoDesc}
      bottomInfo={{ bottomLogo: '无' }}
      propStyles={styles}
      mapInfo={{
        zoom: 9,
        center: [121.473667, 31.230525],
      }}
    ></InspectionScreen>
  );
};
