import React from 'react';
import Login from 'baseline/src/pages/user/Login';
import logo from '../../../assets/img/loginIcon/logo.svg';
import propStyle from './index.less';

export default (): React.ReactElement => {
  return <Login logo={logo} styles={propStyle}></Login>;
};
