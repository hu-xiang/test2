/**
 * app.tsx中不能导出规定之外的其它方法
 * 本文件放公共的一些配置方法，可与其它项目公用
 */
import React from 'react';
import { history } from 'umi';
import { initRoutes, AliveScope, KeepAliveWrapper } from './components/ReactKeepAlive';
// import allIcons from '@@/plugin-antd-icon/icons';
import * as Icon from '@ant-design/icons';
// import QuestBack from './components/QuestBack';
import logo from './assets/img/SysTopIcon/logoAndTitle.png';
import styles from './global.less';
import UploadPics from './components/UploadPics';
import RightContent from './components/RightContent';
import Pwdchange from './components/RightContent/component/pwdchange';

// import Icon from '@ant-design/icons';
import { ReactComponent as Workbench } from './assets/icon/workbench.svg';
import { ReactComponent as Picturemanage } from './assets/icon/imgBk.svg';
import { ReactComponent as Task } from './assets/icon/task.svg';
import { ReactComponent as Diseasemanage } from './assets/icon/disease.svg';
import { ReactComponent as Facilitymanage } from './assets/icon/faci.svg';
import { ReactComponent as Systemset } from './assets/icon/site.svg';
import { ReactComponent as DeviceManage } from './assets/icon/deviceIcon.svg';
import { ReactComponent as Toolkit } from './assets/icon/toolkitIcon.svg';
import { ReactComponent as Modelmanage } from './assets/icon/model.svg';
import { ReactComponent as TenantManage } from './assets/icon/tenant.svg';
import { ReactComponent as WorkOrderManage } from './assets/icon/gongdan.svg';
import { ReactComponent as InspectManage } from './assets/icon/inspect.svg';
import { ReactComponent as RegularInspection } from './assets/icon/specProjManage.svg';
import { ReactComponent as HiddenIcon } from './assets/icon/hiddenicon.svg';
import { ReactComponent as RoadDetection } from './assets/icon/roadDetection.svg';
import { ReactComponent as Log } from './assets/icon/log.svg';
//  import type { MenuDataItem } from '@ant-design/pro-components'
import { getTokenName, serviceError } from './utils/commonMethod';
import { message, notification } from 'antd';

let needError: boolean = true;

// message全局配置
message.config({
  maxCount: 1,
  duration: 2,
});

notification.config({
  maxCount: 1,
});

interface keyVal {
  [key: string]: any;
  children: any[];
  routes: any[];
}
interface MenuDataItem {
  routes?: MenuDataItem[];
  /** @name 在菜单中隐藏子节点 */
  hideChildrenInMenu?: boolean;
  /** @name 在菜单中隐藏自己和子节点 */
  hideInMenu?: boolean;
  /** @name 在面包屑中隐藏 */
  hideInBreadcrumb?: boolean;
  /** @name 菜单的icon */
  icon?: React.ReactNode;
  /** @name 自定义菜单的国际化 key */
  locale?: string | false;
  /** @name 菜单的名字 */
  name?: string;
  /** @name 用于标定选中的值，默认是 path */
  key?: string;
  /** @name disable 菜单选项 */
  disabled?: boolean;
  /** @name 路径,可以设定为网页链接 */
  path?: string;
  /**
   * @deprecated 当此节点被选中的时候也会选中 parentKeys 的节点
   * @name 自定义父节点
   */
  parentKeys?: string[];
  /** @name 隐藏自己，并且将子节点提升到与自己平级 */
  flatMenu?: boolean;
  /** @name 指定外链打开形式，同a标签 */
  target?: string;

  [key: string]: any;
}

export const loginPath = '/user/login';
if (process.env.NODE_ENV === 'development') {
  console.log(
    `gitVersion: %c${GitVersion}`,
    'color: #43bb88;font-size: 16px;font-weight: bold;text-decoration: underline;',
  );
}

// key为路由path，value为图标组件
const IconNameList = {
  '/workbench': <Workbench />,
  '/picturemanage': <Picturemanage />,
  '/task': <Task />,
  '/diseasemanage': <Diseasemanage />,
  '/facilitymanage': <Facilitymanage />,
  '/systemset': <Systemset />,
  '/DeviceWarehouse': <DeviceManage />,
  '/DeviceManageLessee': <DeviceManage />,
  '/toolkit': <Toolkit />,
  '/modelmanage': <Modelmanage />,
  '/tenantManage': <TenantManage />,
  '/workordermanage': <WorkOrderManage />,
  '/InspectManage': <InspectManage />,
  '/regularInspection': <RegularInspection />,
  '/hiddenDangerCheck': <HiddenIcon />,
  '/roadDetection': <RoadDetection />,
  '/systemLog': <Log />,
};

export const layoutConfig = (initialState: any) => {
  let routeList: any;
  return {
    // 网页标题不随路由变化
    pageTitleRender: false,
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    // menuFooterRender: (props: any) => <QuestBack info={props} />,

    logo: () => (
      <img
        src={history.location.pathname !== '/inspectionBoard' ? logo : ''}
        className={styles.toplogoimg}
      />
    ),
    menuHeaderRender: false,
    childrenRender: (children: any) => {
      const isChangePwd = sessionStorage.getItem('changePwd');
      initialState.isChangePwd = isChangePwd;

      return (
        <>
          <AliveScope>
            <KeepAliveWrapper>{children}</KeepAliveWrapper>
          </AliveScope>
          {initialState?.uploadModal && (
            <UploadPics visib={initialState?.uploadModal} uploadFun={initialState?.uploadFun} />
          )}
          {initialState.isChangePwd === 'true' && history.location.pathname !== '/user/login' ? (
            <Pwdchange
              pwdshow={initialState.isChangePwd === 'true'}
              onCancel={() => {
                initialState.isChangePwd = 'false';
              }}
              platform={'resetPwd'}
            />
          ) : null}
        </>
      );
    },
    menuDataRender: (item: any) => {
      routeList = item;
      initRoutes(routeList); // 这里先初始化一下routes

      // item是route.js中配置的路由，initialState?.menuinfo是总菜单管理中总配置的路由，initialState?.currentUser?.menus是后端返回的有权限的路由
      const iconlist = initialState?.menuinfo || [];
      const list = initialState?.currentUser?.menus;
      // const menulist: any = [];

      if (!list?.length) {
        return [];
      }
      // console.log('item',item,list);
      // 整理后端返回的数组，组成顺序的list
      const newList = list.reduce((limitArr: MenuDataItem[], cur: any, index: any, arr: any) => {
        if (cur) {
          if (cur?.parentId?.toString() === '-1') {
            const itemData = limitArr.find((itr: any) => itr?.id === cur?.id);
            if (!itemData) {
              const childArr = arr.filter((itn: any) => itn?.parentId === cur?.id);
              const routeItemData = item.find((itr: any) => {
                return itr.path === cur?.code;
              });
              if (routeItemData) {
                const newItem: keyVal = { ...routeItemData, icon: Toolkit };
                if (IconNameList[cur.code]) {
                  newItem.icon = (
                    <span className="anticon anticon-picture">{IconNameList[cur.code]}</span>
                  );
                } else {
                  const itemCode = iconlist.find((ntx: any) => ntx.code === cur.code);
                  const icon = itemCode ? itemCode?.icon?.trim() : 'peoples';
                  newItem.icon = React.createElement(Icon[icon] || Toolkit, {
                    style: { fontSize: 15 },
                  });
                }
                if (routeItemData?.children?.length > 0) {
                  const newChildData: any[] = [];
                  if (routeItemData?.children[0]?.path === cur?.code) {
                    newChildData.push(routeItemData?.children[0]); // 存在第一级默认redirect
                  }
                  if (childArr?.length) {
                    childArr.forEach((nitem: any) => {
                      const mItem = routeItemData?.children.find(
                        (ii: any) => ii.path === nitem?.code,
                      );
                      if (mItem) {
                        newChildData.push(mItem);
                      }
                    });
                  }
                  newItem.children = newChildData;
                  newItem.routes = newChildData;
                }
                limitArr.push(newItem);
              }
            }
          }
        }
        return limitArr;
      }, []);
      // console.log('newList',newList);
      return Array.from(new Set(newList));
    },
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};

// 全局 响应拦截
export const responseInterceptors = async (response: any, option: any) => {
  let res: any = null;
  try {
    const { responseType } = option;
    if (responseType === 'blob') {
      res = await response.clone().blob();
    } else {
      res = await response?.clone()?.json();
    }
  } catch (error) {
    console.log(error);
  }
  // 登录页不进行操作
  if (history.location.pathname !== loginPath) {
    const data = await response.clone();

    if (data?.status && [404, 405, 500, 501, 502, 503, 504, 505].includes(data?.status)) {
      if (data?.status === 500) {
        serviceError({ message: res?.message || '发生异常，无法连接服务器' });
      } else {
        serviceError({ message: '发生异常，无法连接服务器' });
      }
    }
    // 增加业务报错场景处理
    if (data?.status && data?.status === 200) {
      if (res?.status && res?.status !== 0) {
        if (needError !== false) serviceError({ message: res?.message });
      }
    }
    if (data && data.status === 401) {
      message.warning({
        content: '登录会话已过期，请重新登录！',
        key: '登录会话已过期，请重新登录！',
      });
      const tk = getTokenName();
      localStorage.removeItem(tk);
      localStorage.removeItem('isTenant');
      sessionStorage.removeItem('username');
      history.replace({
        pathname: loginPath,
      });
    } else if (data && data.status === 403) {
      message.warning({
        content: '无访问权限！',
        key: '无访问权限！',
      });
      history.push('/403');
    }
  }
  return response;
};

// 全局 请求拦截
export const requestInterceptors = (url: any, options: any) => {
  const tk = getTokenName();
  const headers: any = {
    'zhsq-client-type': '0',
    Authorization: localStorage.getItem(tk) || '',
    ...options.headers,
  };
  needError = options?.needError;
  return {
    options: { ...options, headers },
  };
};

// 全局 错误处理
export const globalErrorHandler = (error: any) => {
  const { response } = error;
  // eslint-disable-next-line
  if (typeof error === 'object' && Object.getPrototypeOf(error)?.__CANCEL__) {
    console.log('取消请求了');
  } else {
    if (!response) {
      notification.error({
        description: '您的网络发生异常，无法连接服务器',
        message: '网络异常',
      });
    }
    throw error;
  }
};
