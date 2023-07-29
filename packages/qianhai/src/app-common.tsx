/**
 * app.tsx中不能导出规定之外的其它方法
 * 本文件放公共的一些配置方法，可与其它项目公用
 */
import React from 'react';
import { history } from 'umi';
// import allIcons from '@@/plugin-antd-icon/icons';
import * as Icon from '@ant-design/icons';
// import QuestBack from './components/QuestBack';
import logoBlack from './assets/img/logoBlack.svg';
import logo from './assets/img/SysTopIcon/logoAndTitle.png';
import styles from './global.less';
// import UploadPics from './pages/PictureManage/component/uploadPics';
import RightContent from './components/RightContent';
import Pwdchange from './components/RightContent/component/pwdchange';
// import Icon from '@ant-design/icons';
import { ReactComponent as Workbench } from './assets/icon/workbench.svg';
// import { ReactComponent as Picturemanage } from './assets/icon/imgBk.svg';
import { ReactComponent as Task } from './assets/icon/task.svg';
import { ReactComponent as Diseasemanage } from './assets/icon/disease.svg';
import { ReactComponent as Facilitymanage } from './assets/icon/faci.svg';
import { ReactComponent as Systemset } from './assets/icon/site.svg';
import { ReactComponent as DeviceManage } from './assets/icon/deviceIcon.svg';
import { ReactComponent as Toolkit } from './assets/icon/toolkitIcon.svg';
import { ReactComponent as Modelmanage } from './assets/icon/model.svg';
import { ReactComponent as TenantManage } from './assets/icon/tenant.svg';

export const loginPath = '/user/login';
// key为路由path，value为图标组件
const IconNameList = {
  '/workbench': <Workbench />,
  // '/picturemanage': <Picturemanage />,
  '/task': <Task />,
  '/diseasemanage': <Diseasemanage />,
  '/facilitymanage': <Facilitymanage />,
  '/systemset': <Systemset />,
  '/DeviceWarehouse': <DeviceManage />,
  '/DeviceManageLessee': <DeviceManage />,
  '/toolkit': <Toolkit />,
  '/modelmanage': <Modelmanage />,
  '/TenantManage': <TenantManage />,
};

export const layoutConfig = (initialState: any) => {
  // let routeList: any;
  return {
    // 网页标题不随路由变化
    pageTitleRender: false,
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    // menuFooterRender: (props: any) => <QuestBack info={props} />,
    onPageChange: () => {
      // 如果没有登录，重定向到 login
      // if (
      //   (!localStorage.getItem('token') && location.pathname !== loginPath) ||
      //   route.pathname === '/user/login'
      // ) {
      //   history.replace({
      //     pathname: loginPath,
      //   });
      //   return;
      // }
      // if (route.pathname === '/403') {
      //   return;
      // }
      // console.log('ddff',route);
      // // 在系统重定向的地址没有时，让系统首次进入左侧菜单显示的第一个可进入页面
      // // 判断url地址是否有菜单权限
      // const list = initialState?.currentUser?.menus;
      // if (list?.length > 0 && !list.some((i: any) => i.code === route.pathname)) {
      //   const pathList: any = [];
      //   // 将系统route中的子级拿出来放入routeList
      //   routeList.forEach((it: any) => {
      //     if (it?.children) {
      //       routeList = [...routeList, ...it?.children];
      //     }
      //   });
      //   // 将有菜单权限的路由过滤
      //   routeList.forEach((it: any) => {
      //     if (list.some((its: any) => its.code === it.path)) {
      //       pathList.push(it);
      //     }
      //   });
      //   // 判断跳转的地址是否一定不在有权限的路由中，且在系统路由中
      //   // 如不在，则跳转到有权限的路由中的第一个
      //   // 如一定不在系统路由里面，则跳转404
      //   if (
      //     pathList.length &&
      //     routeList.some((its: any) => its.path === route.pathname) &&
      //     pathList.every((its: any) => its.path !== route.pathname) &&
      //     routeList[routeList.findIndex((its: any) => its.path === route.pathname)]?.name
      //   ) {
      //     history.replace({
      //       pathname:
      //         (pathList[0]?.children && pathList[0]?.children[0]?.path) ||
      //         (pathList[0]?.routes && pathList[0]?.routes[0]?.path) ||
      //         pathList[0]?.path,
      //     });
      //   } else if (pathList.length && routeList.every((its: any) => its.path !== route.pathname)) {
      //     history.replace({
      //       pathname: '/404',
      //     });
      //   }
      // }
      // if (!list?.length) {
      //   localStorage.removeItem('token');
      //   history.replace({
      //     pathname: '/user/login',
      //   });
      // }
    },
    logo: () => (
      <img
        src={history.location.pathname !== '/inspectionBoard' ? logo : logoBlack}
        className={styles.toplogoimg}
      />
    ),
    menuHeaderRender: false,
    childrenRender: (children: any) => {
      const isChangePwd = sessionStorage.getItem('changePwd');
      initialState.isChangePwd = isChangePwd;
      return (
        <>
          {children}
          {initialState?.uploadModal && <UploadPics visib={initialState?.uploadModal} />}
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
      // routeList = item;
      const iconlist = initialState?.menuinfo || [];
      const list = initialState?.currentUser?.menus;
      const menulist: any = [];

      // 先将该用户的一级菜单找到
      const menurender = (items: any, flag: any) => {
        items.map((i: any) => {
          if (i.path && list) {
            list.map((it: any) => {
              if (i.path === it.code && flag) {
                menulist.push(i);
              }
              if (i.children) {
                i.children.map((e: any) => {
                  if (e.path === it.code) {
                    menulist.push(i);
                  }
                  return false;
                });
                menurender(i.children, false);
              }
              return false;
            });
          }
          return false;
        });
      };
      menurender(item, true);
      const newlist: any = Array.from(new Set(menulist));
      // 将该用户的一级菜单下的二级菜单过滤出来
      newlist.map((it: any, ind: any) => {
        if (it.children) {
          const newchild: any = [];
          newlist[ind].children.map((child: any) => {
            list.map((its: any) => {
              if (!child?.name || its.code === child.path) {
                newchild.push(child);
              }
              return false;
            });
            return false;
          });
          newlist[ind].routes = Array.from(new Set(newchild));
          newlist[ind].items = Array.from(new Set(newchild));
          newlist[ind].children = Array.from(new Set(newchild));
        }
        return false;
      });

      // 使用阿里图标iconfont时使用
      // const IconFont = createFromIconfontCN({
      //   scriptUrl: '//at.alicdn.com/t/font_8d5l8fzk5b87iudi.js',
      // });
      // newlist.map((it: any) => {
      //   const index = newlist.indexOf(it);
      //   iconlist.map((its: any) => {
      //     if (its.code === it.path) {
      //       newlist[index].icon = <IconFont type={its.icon}/>
      //     }
      //     return false;
      //   });
      // });

      // 菜单路由图标根据菜单管理设置的icon从antd图标库查找进行替换
      // 可根据菜单管理设置菜单各级名字
      const replaceIcon = (path: any, index: any, its: any) => {
        if (IconNameList[path]) {
          newlist[index].icon = (
            <span className="anticon anticon-picture">{IconNameList[path]}</span>
          );
        } else {
          const icon = its.icon?.trim();
          newlist[index].icon = React.createElement(Icon[icon], { style: { fontSize: 15 } });
        }
      };
      newlist.map((it: any) => {
        const index1 = newlist.indexOf(it);
        iconlist.map((its: any) => {
          if (its.code === it.path) {
            newlist[index1].name = its.title;
            newlist[index1].locale = false;
            if (its.icon && Icon[its.icon]) {
              replaceIcon(its.code, index1, its);
            }
          }
          if (it.children) {
            it.children.map((chi: any) => {
              const index2 = newlist[index1].children.indexOf(chi);
              if (its.code === chi.path) {
                newlist[index1].children[index2].locale = false;
                newlist[index1].children[index2].name = its.title;
              }
              return false;
            });
          }
          return false;
        });
        return false;
      });
      return Array.from(new Set(newlist));
    },
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};
