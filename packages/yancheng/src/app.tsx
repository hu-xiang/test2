import { request, getInitialState } from 'baseline/src/app';
import { layoutConfig } from 'baseline/src/app-common';

import { PageLoading } from '@ant-design/pro-layout';
import type { RunTimeLayoutConfig } from 'umi';
import { history } from 'umi';

import logo from 'baseline/src/assets/img/SysTopIcon/logoAndTitle.png';
import styles from 'baseline/src/global.less';
import 'baseline/src/global.less';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export { getInitialState };

export { request };

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }: any) => {
  const { location } = history;
  return {
    ...layoutConfig(initialState, location),
    logo: () => (
      <img
        src={history.location.pathname !== '/inspectionBoard' ? logo : ''}
        className={styles.toplogoimg}
      />
    ),
  };
};
