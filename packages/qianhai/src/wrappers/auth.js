import { Redirect } from 'umi';
import React from 'react';
import { useModel } from 'umi';

export default (props) => {
  const { initialState } = useModel('@@initialState');
  const menulist = initialState.currentUser && initialState.currentUser.menus;
  if (menulist && menulist.length > 0) {
    const index = menulist.findIndex((it) => it.code === props.location.pathname);
    if (index > -1) {
      return <div>{props.children}</div>;
    }
    if (index < 0) {
      const lastRoute = menulist[0].code ? menulist[0].code : '/403';
      return <Redirect to={lastRoute} />;
    }
  }

  return <Redirect to="/user/login" />;
};
