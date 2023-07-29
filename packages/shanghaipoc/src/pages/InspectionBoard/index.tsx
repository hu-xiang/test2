import InspectionBoard from 'baseline/src/pages/InspectionBoard';
import styles from './styles.less';
// import baseStyles from 'baseline/src/pages/InspectionBoard/styles.less';
import React from 'react';

const logoDesc = '';

export default (): React.ReactNode => {
  return (
    <InspectionBoard
      headLogo={' '}
      logoDesc={logoDesc}
      bottomInfo={{ bottomLogo: '无' }}
      propStyles={styles}
      mapInfo={{
        zoom: 9,
        center: [121.473667, 31.230525],
      }}
    ></InspectionBoard>
  );
};
