import baseRoutes from '../../baseline/config/routes';

baseRoutes.forEach((route) => {
  // if (route.name === 'facility-manage') {
  //   route.routes?.push({
  //     name: 'sub-facility-list',
  //     icon: 'smile',
  //     path: '/facilitymanage/subfacilitylist',
  //     component: 'facilityManage/SubFacilityList',
  //     wrappers: ['../wrappers/auth'],
  //   });
  // }
  if (route.name === 'disease-manage') {
    route.routes?.push({
      name: 'land-disease-list',
      icon: 'smile',
      path: '/diseasemanage/landdiseaselist',
      component: 'diseaseManage/LandDiseaseList',
      wrappers: ['../wrappers/auth'],
    });
  }
});

const kunmingRoutes: any = [
  {
    path: '/workordermanage',
    name: 'work-order-manage',
    icon: 'PictureOutlined',
    routes: [
      {
        name: 'work-order-list',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/workordermanage/workorderlist',
        component: 'WorkOrderManage/WorkOrderList',
      },
      {
        name: 'work-order-detail',
        icon: 'smile',
        // wrappers: ['../wrappers/auth'],
        path: '/workordermanage/workorderdetail',
        component: 'WorkOrderManage/WorkOrderDetail',
      },
    ],
  },
  {
    path: '/undergroundDisease',
    layout: false,
    name: 'undergroundDisease',
    icon: 'FundProjectionScreen',
    component: './InspectionBoard/UndergroundDisease',
    menuRender: false,
    headerRender: false,
    hideInMenu: true,
  },
];

export default kunmingRoutes.concat(baseRoutes);
