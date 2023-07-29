import baseRoutes from '../../baseline/config/routes';

/**
 * 基线已存在路由参照以下方式添加
 */
baseRoutes.forEach((route) => {
  // if (route.name === 'facility-manage') {
  //   route.routes?.push({
  //     name: 'sub-facility-list',
  //     icon: 'smile',
  //     path: '/facilitymanage/subfacilitylist',
  //     component: 'FacilityManage/SubFacilityList',
  //     wrappers: ['../wrappers/auth'],
  //   });
  // }
});

/**
 * 项目独有模块添加
 */
const specificRoutes: any = [
  // {
  //   path: '/undergroundDisease',
  //   layout: false,
  //   name: 'undergroundDisease',
  //   icon: 'FundProjectionScreen',
  //   component: './InspectionBoard/UndergroundDisease',
  //   menuRender: false,
  //   headerRender: false,
  //   hideInMenu: true,
  // },
];

export default specificRoutes.concat(baseRoutes);
