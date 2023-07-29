import baseRoutes from '../../baseline/config/routes';

/**
 * 项目独有模块添加
 */
const specificRoutes: any = [
  {
    path: '/defaultLogin',
    layout: false,
    name: 'user-default-login',
    icon: 'FundProjectionScreen',
    component: './user/defaultLogin',
    menuRender: false,
    headerRender: false,
    hideInMenu: true,
  },
];

export default specificRoutes.concat(baseRoutes);
