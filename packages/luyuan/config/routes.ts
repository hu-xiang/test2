import baseRoutes from '../../baseline/config/routes';

const luyuanRoutes: any = [
  {
    path: '/detectionEvalution',
    layout: false,
    name: 'detectionEvalution',
    icon: 'FundProjectionScreen',
    component: './InspectionBoard/DetectionEvalution',
    menuRender: false,
    headerRender: false,
    hideInMenu: true,
  },
  {
    path: '/regularInspection',
    name: 'regularInspection',
    icon: 'PictureOutlined',
    routes: [
      { path: '/regularInspection', redirect: '/regularInspection/projectList' },
      {
        name: 'projectList',
        icon: 'smile',
        path: '/regularInspection/projectList',
        component: 'regularInspection/ProjectList',
      },
      {
        name: 'projectDetail',
        icon: 'smile',
        path: '/regularInspection/projectDetail',
        component: 'regularInspection/ProjectDetail',
      },
    ],
  },
];

const index: any = baseRoutes.length - 5;

luyuanRoutes.unshift(index, 0);
Array.prototype.splice.apply(baseRoutes, luyuanRoutes);
export default baseRoutes;
