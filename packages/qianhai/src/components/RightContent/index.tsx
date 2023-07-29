import { Space, Button } from 'antd';
// import { QuestionCircleOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { history } from 'umi';
import Avatar from './AvatarDropdown';
// import HeaderSearch from '../HeaderSearch';
import styles from './index.less';
import Pwdchange from './component/pwdchange';
import { useModel } from 'umi';

// import NoticeIconView from '../NoticeIcon';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  // const { initialState } = useModel<any>('@@initialState');
  const [pwdshow, setPwdshow] = useState(false);
  const { initialState } = useModel<any>('@@initialState');

  // if (!initialState || !initialState.settings) {
  //   return null;
  // }

  // const { navTheme, layout } = initialState.settings;
  const className = styles.right;

  // if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
  //   className = `${styles.right}  ${styles.dark}`;
  // }

  return (
    <Space className={className}>
      {/* <HeaderSearch
        className={`${styles.action} ${styles.search}`}
        placeholder="站内搜索"
        defaultValue="umi ui"
        options={[
          {
            label: <a href="https://umijs.org/zh/guide/umi-ui.html">umi ui</a>,
            value: 'umi ui',
          },
          {
            label: <a href="next.ant.design">Ant Design</a>,
            value: 'Ant Design',
          },
          {
            label: <a href="https://protable.ant.design/">Pro Table</a>,
            value: 'Pro Table',
          },
          {
            label: <a href="https://prolayout.ant.design/">Pro Layout</a>,
            value: 'Pro Layout',
          },
        ]} // onSearch={value => {
        //   console.log('input', value);
        // }}
      />
      <span
        className={styles.action}
        onClick={() => {
          window.open('https://pro.ant.design/docs/getting-started');
        }}
      >
        <QuestionCircleOutlined />
      </span> */}
      {/* <NoticeIconView /> */}
      <Avatar menu onshows={() => setPwdshow(true)} />
      {/* <SelectLang className={styles.action} /> */}
      {initialState?.currentUser?.menus?.filter((i: any) => i.code === '/inspectionBoard').length >
        0 &&
        (history.location.pathname !== '/inspectionBoard' ? (
          <Button
            type="primary"
            shape="round"
            style={{ borderRadius: '24px' }}
            onClick={() => history.push('/inspectionBoard')}
          >
            进入智慧巡检看板
          </Button>
        ) : (
          <Button
            type="primary"
            shape="round"
            style={{ borderRadius: '24px' }}
            onClick={() => history.push('/workbench')}
          >
            进入管理平台
          </Button>
        ))}
      {pwdshow ? (
        <Pwdchange
          pwdshow={pwdshow}
          // initialState={initialState}
          onCancel={() => setPwdshow(false)}
        />
      ) : null}
    </Space>
  );
};

export default GlobalHeaderRight;
