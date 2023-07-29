import React, { useCallback, useState, useEffect } from 'react';
import { LogoutOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Spin } from 'antd';
import { history, useModel } from 'umi';
// import { stringify } from 'querystring';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import { outLogin } from '../../services/ant-design-pro/api';
import type { MenuInfo } from 'rc-menu/lib/interface';
import todownArrow from '../../assets/img/InspectionBoard/bottom/todownArrow.png';
import { getTokenName, getMenuItem } from '../../utils/commonMethod';

export type GlobalHeaderRightProps = {
  menu?: boolean;
  onshows?: any;
};

/**
 * 退出登录，并且将当前的 url 保存
 */
export const loginOut = async () => {
  await outLogin();
  // const { query = {}, pathname } = history.location;
  const { query = {} } = history.location;
  const { redirect } = query;
  const tk = getTokenName();
  localStorage.removeItem(tk);
  localStorage.removeItem('isTenant');
  sessionStorage.removeItem('username');
  // Note: There may be security issues, please note
  if (window.location.pathname !== '/user/login' && !redirect) {
    history.replace({
      pathname: '/user/login',
      // search: stringify({
      //   redirect: pathname,
      // }),
    });
  }
};
const bigSceenDatas = [
  '/inspectionScreen',
  '/inspectionBoard',
  '/facilityAssets',
  '/hiddenDangerBoard',
  '/undergroundDisease',
  '/detectionEvalution',
];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AvatarDropdown: React.FC<GlobalHeaderRightProps> = (props) => {
  const { setInspectType } = useModel<any>('inspect');
  const { initialState, setInitialState }: any = useModel('@@initialState');

  const [userManager_updatePwd, setUserManager_updatePwd] = useState(false);
  let elements: any = [];
  if (initialState.currentUser && initialState.currentUser.elements) {
    elements = initialState.currentUser.elements || [];
  }

  useEffect(() => {
    elements.map((it: any) => {
      if (it.code === 'userManager/updatePwd') setUserManager_updatePwd(true);
      return elements;
    });
  }, []);

  const { menu } = props;

  const onMenuClick = useCallback(
    (event: MenuInfo) => {
      const { key } = event;
      if (key === 'logout' && initialState) {
        setInitialState({ ...initialState, currentUser: undefined });
        setInspectType('');
        loginOut();
        return;
      }
      if (key === 'padchange') {
        props.onshows();
      }
      // history.push(`/account/${key}`);
    },
    [initialState, setInitialState],
  );

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.name) {
    return loading;
  }
  const getMenuItems = () => {
    const menulist = [];
    if (menu && userManager_updatePwd) {
      const menuItem = getMenuItem('密码修改', 'padchange', false, <SettingOutlined />);
      menulist.push(menuItem);
    }
    menulist.push(getMenuItem('退出登录', 'logout', false, <LogoutOutlined />));
    return menulist;
  };

  // const menuHeaderDropdown = () => {
  //   const itemsArr = getMenuItems();
  //   return (
  //     <>
  //     <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick} items={itemsArr}></Menu>
  //     </>
  //   );
  // };
  // const menuHeaderDropdown = (
  //   <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
  //     {/* {menu && (
  //       <Menu.Item key="center">
  //         <UserOutlined />
  //         个人中心
  //       </Menu.Item>
  //     )} */}
  //     {menu && userManager_updatePwd && (
  //       <Menu.Item key="padchange">
  //         <SettingOutlined />
  //         密码修改
  //       </Menu.Item>
  //     )}
  //     {/* {menu && <Menu.Divider />} */}

  //     <Menu.Item key="logout">
  //       <LogoutOutlined />
  //       退出登录
  //     </Menu.Item>
  //   </Menu>
  // );

  return (
    <HeaderDropdown
      menu={{
        items: getMenuItems(),
        selectedKeys: [],
        onClick: onMenuClick,
        className: styles.menu,
      }}
    >
      <span className={`${styles.action} ${styles.account}`}>
        {/* src={currentUser.avatar} */}
        {!bigSceenDatas.includes(history.location.pathname) ? (
          <Avatar size="small" className={styles.avatar} icon={<UserOutlined />} alt="avatar" />
        ) : null}
        <span className={`${styles.name} anticon`}>{currentUser.name}</span>
        {bigSceenDatas.includes(history.location.pathname) ? (
          <img src={todownArrow} style={{ marginLeft: 5 }} />
        ) : null}
      </span>
    </HeaderDropdown>
  );
};

export default AvatarDropdown;
