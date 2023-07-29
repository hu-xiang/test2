import React from 'react';
import { history } from 'umi';

/** 此方法会跳转到 redirect 参数所在的位置 */
const goto = () => {
  if (!history) return;
  setTimeout(() => {
    const { query } = history.location;
    const { redirect } = query as { redirect: string };
    if (redirect === '/user/login' || redirect === '/defaultLogin') history.push('/');
    else history.push(redirect || '/');
  }, 10);
};

goto();

const defaultLogin: React.FC = () => {
  return <></>;
};

export default defaultLogin;
