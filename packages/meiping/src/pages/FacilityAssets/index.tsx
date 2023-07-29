import FacilityAssets from 'baseline/src/pages/FacilityAssets';
import React from 'react';
import headLogo from '../../assets/img/inspectionBoard/logo.svg';
import bottomLogo from '../../assets/img/inspectionBoard/bottomlogo.png';
import propStyles from './styles.less';

const logoDesc = '高速公路路面日常管养智能巡检及辅助分析系统';
export default (): React.ReactNode => {
  const extraData = {
    isMpgs: true,
  };
  return (
    <>
      <FacilityAssets
        headLogo={headLogo}
        logoDesc={logoDesc}
        propStyles={propStyles}
        bottomInfo={{ bottomLogo }}
        extraData={extraData}
      ></FacilityAssets>
    </>
  );
};
