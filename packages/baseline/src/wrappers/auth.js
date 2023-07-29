import { Redirect } from 'umi';
import React from 'react';
import { useModel } from 'umi';
import { history } from 'umi';
// import { getNextInfo } from '@/pages/Toolkit/ManualAuditTool/service';

export default (props) => {
  const getNextMenu = (list, routeData) => {
    const getnext = (dat) => {
      if (dat?.length > 0) {
        dat.splice(0, 1);
        if (dat[0].code !== '/inspectionBoard') {
          const ind = routeData.findIndex(
            (it) => it?.path.toLowerCase() === dat[0].code.toLowerCase(),
          );
          if (ind > -1) {
            return dat[0].code;
          }
        }
        if (dat?.length > 0) {
          getnext(dat);
        }
      }
      return '/403';
    };
    let recVal = '/403';
    // 假如菜单只有巡检看板
    if (list[0].code && list[0].code !== '/inspectionBoard') {
      const ind = routeData.findIndex(
        (it) => it?.path.toLowerCase() === list[0].code.toLowerCase(),
      );
      if (ind > -1) {
        return list[0].code;
      }
    }
    recVal = getnext(list);
    return recVal;
  };

  const getDatas = (datas) => {
    const dataList = [];
    const generateList = (data) => {
      for (let i = 0; i < data.length; i += 1) {
        const node = data[i];
        if (node?.path && node?.path?.indexOf('~') === -1 && node?.path?.indexOf('_') === -1) {
          const path = node?.path;
          dataList.push({ path });
          if (node.children?.length) {
            generateList(node?.children);
          }
        }
      }
    };
    generateList(datas);
    return dataList;
  };

  const { initialState } = useModel('@@initialState');
  const menulist = initialState.currentUser && initialState.currentUser.menus;
  const routeList = (props?.routes && props?.routes?.length && props?.routes[0]?.routes) || [];
  // console.log('props',routeList,initialState.currentUser,props.location.pathname,history.location.pathname)
  if (menulist && menulist.length > 0) {
    const index = menulist.findIndex((it) => it.code === props.location.pathname);
    if (index > -1) {
      return <div>{props.children}</div>;
    }
    let lastRoute = '/403';
    const simpleRoute = getDatas(routeList);
    if (
      history.location.pathname !== '/inspectionBoard' &&
      menulist[0].code === '/inspectionBoard'
    ) {
      const ind = menulist.findIndex((it) => it.code === history.location.pathname);
      lastRoute =
        ind > -1 ? history.location.pathname : getNextMenu(menulist?.slice(), simpleRoute);
    } else {
      lastRoute = getNextMenu(menulist?.slice(), simpleRoute);
    }
    return <Redirect to={lastRoute} />;
  }

  return <Redirect to="/user/login" />;
};
