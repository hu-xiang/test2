export default [
  {
    path: '/inspectionBoard',
    layout: false,
    name: 'inspectionBoard',
    icon: 'FundProjectionScreen',
    component: './InspectionBoard',
    menuRender: false,
    headerRender: false,
    // wrappers: ['../wrappers/auth'],
    hideInMenu: true,
  },
  {
    path: '/403',
    component: './403',
  },
  {
    path: '/',
    redirect: '/inspectionBoard',
    // wrappers: ['../wrappers/auth'], // 取消权限校验
  },
  {
    component: './404',
  },
];
