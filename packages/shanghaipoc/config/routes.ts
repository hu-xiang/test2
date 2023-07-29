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
  //   route.routes?.push({
  //     name: 'key-scene-list',
  //     icon: 'smile',
  //     path: '/facilitymanage/keyscenelist',
  //     component: 'FacilityManage/KeyScene',
  //     wrappers: ['../wrappers/auth'],
  //   });
  // }
});

/**
 * 项目独有模块添加
 */
const specificRoutes: any = [
  // {
  //   path: '/hiddenDangerCheck',
  //   name: 'hidden-danger-check',
  //   icon: 'PictureOutlined',
  //   routes: [
  //     {
  //       name: 'scene-type-list',
  //       icon: 'smile',
  //       wrappers: ['../wrappers/auth'],
  //       path: '/hiddenDangerCheck/SceneTypeList',
  //       component: 'hiddenDangerCheck/SceneTypeList',
  //     },
  //     {
  //       name: 'check-list',
  //       icon: 'smile',
  //       wrappers: ['../wrappers/auth'],
  //       path: '/hiddenDangerCheck/CheckList',
  //       component: 'hiddenDangerCheck/CheckList',
  //     },
  //     {
  //       name: 'check-list-detail',
  //       icon: 'smile',
  //       // wrappers: ['../wrappers/auth'],
  //       path: '/hiddenDangerCheck/CheckList/detail/:id',
  //       component: 'hiddenDangerCheck/CheckList/Detail',
  //     },
  //     {
  //       name: 'check-list-sceneDetail',
  //       icon: 'smile',
  //       // wrappers: ['../wrappers/auth'],
  //       path: '/hiddenDangerCheck/CheckList/sceneDetail/:id/:facId',
  //       component: 'hiddenDangerCheck/CheckList/components/HiddenScenario',
  //     },
  //     {
  //       name: 'check-list-sceneCheck',
  //       icon: 'smile',
  //       // wrappers: ['../wrappers/auth'],
  //       path: '/hiddenDangerCheck/CheckList/sceneCheck/:id',
  //       component: 'hiddenDangerCheck/CheckList/components/ScenarioCheck',
  //     },
  //     {
  //       name: 'standard-quote',
  //       icon: 'smile',
  //       wrappers: ['../wrappers/auth'],
  //       path: '/hiddenDangerCheck/StandardQuote',
  //       component: 'hiddenDangerCheck/StandardQuote',
  //     },
  //   ],
  // },
  // {
  //   path: '/hiddenDangerBoard',
  //   layout: false,
  //   name: 'hiddenDangerBoard',
  //   icon: 'FundProjectionScreen',
  //   component: 'InspectionBoard/HiddenDangerBoard',
  //   menuRender: false,
  //   headerRender: false,
  //   hideInMenu: true,
  // },
];

const taskIndex = baseRoutes.findIndex((item) => item.path === '/task');
// specificRoutes.unshift(taskIndex + 1, 0);
// Array.prototype.splice.apply(baseRoutes, specificRoutes);

const baseRoutesRes = baseRoutes.slice();
baseRoutesRes.splice(taskIndex + 1, 0, ...specificRoutes);

export default baseRoutesRes;
