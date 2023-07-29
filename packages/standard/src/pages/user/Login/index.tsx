import React from 'react';
import Login from 'baseline/src/pages/user/Login';
import logo from '../../../assets/img/loginIcon/logo.png';
import styles from './index.less';

export default (): React.ReactElement => {
  return <Login logo={logo} styles={styles}></Login>;
};
