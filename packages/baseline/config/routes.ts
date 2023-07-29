export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
        ],
      },
    ],
  },
  {
    path: '/workbench',
    name: 'workbench',
    wrappers: ['../wrappers/auth'],
    icon: 'FundViewOutlined',
    component: './workbench',
  },
  {
    path: '/InspectManage',
    name: 'inspect-manage',
    icon: 'PictureOutlined',
    routes: [
      { path: '/InspectManage', redirect: '/InspectManage/InspectPlan' },
      {
        name: 'inspect-list',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/InspectManage/InspectPlan',
        component: 'inspectManage/InspectPlan',
      },
      {
        name: 'inspect-task',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/InspectManage/InspectTask',
        component: 'inspectManage/InspectTask',
        meta: {
          keepAlive: {
            toPath: '/InspectManage/TaskDetail', // 只有去详情页的时候 才需要缓存（列表页）路由
          },
        },
      },
      {
        name: 'task-detail',
        icon: 'smile',
        path: '/InspectManage/TaskDetail',
        component: 'inspectManage/InspectTask/TaskDetail',
      },
    ],
  },
  {
    path: '/diseasemanage',
    name: 'disease-manage',
    icon: 'DiffOutlined',
    routes: [
      { path: '/diseasemanage', redirect: '/diseasemanage/diseasepanorama' },
      // {
      //   name: 'disease-panorama',
      //   icon: 'smile',
      //   wrappers: ['../wrappers/auth'],
      //   path: '/diseasemanage/diseasepanorama',
      //   component: 'diseaseManage/DiseasePanorama',
      // },
      {
        name: 'disease-trend',
        icon: 'smile',
        path: '/diseaseManage/diseaseTrend',
        component: 'diseaseManage/DiseaseTrend',
        wrappers: ['../wrappers/auth'],
      },
      {
        name: 'disease-list',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/diseasemanage/diseaselist',
        component: 'diseaseManage/DiseaseList',
        meta: {
          keepAlive: {
            toPath: '/diseasemanage/diseaselist/diseasecard', // 只有去详情页的时候 才需要缓存（列表页）路由
          },
        },
      },
      {
        // name: 'disease-card',
        icon: 'smile',
        path: '/diseasemanage/diseaselist/diseasecard',
        component: 'diseaseManage/DiseaseList/DiseaseCard',
      },
      {
        name: 'disease-physicalDiseaseList',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/diseasemanage/physicalDiseaseList',
        component: 'diseaseManage/physicalDiseaseList',
        meta: {
          keepAlive: {
            toPath: '/diseasemanage/physicalDiseaseList/physicalDiseaseDetail', // 只有去详情页的时候 才需要缓存（列表页）路由
          },
        },
      },
      {
        icon: 'smile',
        path: '/diseasemanage/physicalDiseaseList/physicalDiseaseDetail',
        component: 'diseaseManage/DiseaseList/DiseaseCard',
      },
    ],
  },
  {
    path: '/roadDetection',
    name: 'road-detection',
    icon: 'FundProjectionScreenOutlined',
    routes: [
      { path: '/roadDetection', redirect: '/roadDetection/projectList' },
      {
        name: 'project-list',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/roadDetection/projectList',
        component: 'roadDetection/ProjectList',
        meta: {
          keepAlive: {
            toPath: '/roadDetection/projectList/detail', // 只有去详情页的时候 才需要缓存（列表页）路由
          },
        },
      },
      {
        icon: 'smile',
        path: '/roadDetection/projectList/detail',
        component: 'roadDetection/ProjectList/Detail',
      },
      {
        icon: 'smile',
        path: '/roadDetection/projectList/detect',
        component: 'roadDetection/ProjectList/Detect',
      },
    ],
  },
  {
    path: '/realcheck',
    name: 'realcheck',
    wrappers: ['../wrappers/auth'],
    icon: 'LineChartOutlined',
    component: 'Realcheck',
  },
  {
    path: '/picturemanage',
    name: 'pictureManage',
    wrappers: ['../wrappers/auth'],
    component: './PictureManage',
  },
  {
    path: '/task',
    name: 'task-manage',
    icon: 'DiffOutlined',
    // component: 'TaskList',
    routes: [
      { path: '/task', redirect: '/task/list' },
      {
        name: 'task-list',
        icon: 'smile',
        path: '/task/list',
        wrappers: ['../wrappers/auth'],
        component: 'taskList/PicDetection',
      },
      // 目前没这个功能
      // {
      //   name: 'video-detection',
      //   icon: 'smile',
      //   path: '/task/video/detection',
      //   wrappers: ['../wrappers/auth'],
      //   component: 'taskList/VideoDetection',
      // },
    ],
  },
  {
    path: '/DeviceWarehouse',
    name: 'device-warehouse',
    icon: 'PictureOutlined',
    routes: [
      { path: '/DeviceWarehouse', redirect: '/DeviceWarehouse/DeviceList' },
      {
        name: 'device-list',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/DeviceWarehouse/DeviceList',
        component: 'deviceManage/DeviceList',
      },
      {
        name: 'version-list',
        icon: 'smile',
        // wrappers: ['../wrappers/auth'],
        path: '/DeviceWarehouse/VersionList',
        component: 'deviceManage/VersionList',
      },
      {
        icon: 'smile',
        path: '/DeviceWarehouse/ExternalFlag',
        component: 'deviceManage/ExternalFlag',
      },
    ],
  },
  {
    path: '/facilitymanage',
    name: 'facility-manage',
    // wrappers: ['../wrappers/auth'],
    icon: 'DiffOutlined',
    routes: [
      { path: '/facilitymanage', redirect: '/facilitymanage/facilitylist' },
      {
        name: 'facility-list',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/facilitymanage/facilitylist',
        component: 'facilityManage/FacilityList',
        meta: {
          keepAlive: {
            toPath: '/facilitymanage/facilitylist/TStatus', // 只有去详情页的时候 才需要缓存（列表页）路由
          },
          otherKeepAlive: {
            toPath: '/facilitymanage/facilitylist/Station', // 只有去详情页的时候 才需要缓存（列表页）路由
          },
        },
      },
      {
        // name: 'disease-card',
        icon: 'smile',
        path: '/facilitymanage/facilitylist/Station',
        component: 'facilityManage/FacilityList/Station',
      },
      {
        // name: 'disease-card',
        icon: 'smile',
        path: '/facilitymanage/facilitylist/TStatus',
        component: 'facilityManage/FacilityList/TStatus',
      },
      {
        name: 'sub-facility-list',
        icon: 'smile',
        path: '/facilitymanage/subfacilitylist',
        component: 'facilityManage/SubFacilityList',
        wrappers: ['../wrappers/auth'],
        meta: {
          keepAlive: {
            toPath: '/facilitymanage/subfacilitylist', // 只有去附属设施页的时候 才需要缓存（列表页）路由
          },
        },
      },
    ],
  },
  {
    path: '/DeviceManageLessee',
    name: 'device-manage-lessee',
    icon: 'PictureOutlined',
    routes: [
      { path: '/DeviceManageLessee', redirect: '/DeviceManageLessee/DeviceList' },
      {
        name: 'device-list',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/DeviceManageLessee/DeviceList',
        component: 'deviceManageTenant/DeviceList',
      },
    ],
  },
  {
    path: '/tenantManage',
    name: 'tenant-manage',
    icon: 'PictureOutlined',
    routes: [
      { path: '/tenantManage', redirect: '/tenantManage/TenantList' },
      {
        name: 'tenant-list',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/tenantManage/TenantList',
        component: 'tenantManage/TenantList',
      },
      {
        icon: 'smile',
        path: '/tenantManage/TenantList/ConfigInfo',
        component: 'tenantManage/TenantList/ConfigInfo',
      },
    ],
    // redirect:'/tenantManage/TenantList'
  },
  {
    path: '/modelmanage',
    name: 'model-manage',
    icon: 'DiffOutlined',
    routes: [
      { path: '/modelmanage', redirect: '/modelmanage/modellist' },
      {
        name: 'model-list',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/modelmanage/modellist',
        component: 'modelManage/ModelList',
      },
    ],
  },
  {
    path: '/toolkit',
    name: 'toolkit',
    icon: 'DiffOutlined',
    routes: [
      { path: '/toolkit', redirect: '/toolkit/ManualAuditTool' },
      {
        name: 'manual-audit-tool',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/toolkit/ManualAuditTool',
        component: 'toolkit/ManualAuditTool',
      },
      {
        name: 'remove-duplicates-debug-tool',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/toolkit/RemoveDuplicatesDebugTool',
        component: 'toolkit/RemoveDuplicatesDebugTool',
      },
      {
        name: 'error-book',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/toolkit/ErrorBook',
        component: 'toolkit/ErrorBook',
      },
      {
        name: 'algorithm-validate-Tool',
        icon: 'smile',
        // wrappers: ['../wrappers/auth'],
        path: '/toolkit/AlgorithmValidateTool',
        component: 'toolkit/AlgorithmValidateTool',
      },
      {
        name: 'algorithm-validate-tool-detail',
        icon: 'smile',
        path: '/toolkit/AlgorithmValidateTool/AVTDetail',
        component: 'toolkit/AlgorithmValidateTool/AVTDetail',
      },
    ],
  },
  {
    path: '/systemset',
    name: 'system-set',
    icon: 'SettingFilled',
    routes: [
      { path: '/systemset', redirect: '/systemset/departmentmanage' },
      {
        name: 'dictionary-manage',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/systemset/dictionary',
        component: 'systemSet/Dictionary',
        meta: {
          keepAlive: {
            toPath: '/systemset/dictionary/dicdetail', // 只有去详情页的时候 才需要缓存（列表页）路由
          },
        },
      },
      {
        icon: 'smile',
        path: '/systemset/dictionary/dicdetail',
        component: 'systemSet/Dictionary/DicDetail',
      },
      {
        name: 'department-manage',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/systemset/departmentmanage',
        component: 'systemSet/DepartmentManage',
      },
      {
        name: 'user-manage',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/systemset/usermanage',
        component: 'systemSet/UserManage',
      },
      {
        name: 'role-manage',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/systemset/rolemanage',
        component: 'systemSet/RoleManage',
      },
      {
        name: 'menu-manage',
        icon: 'smile',
        wrappers: ['../wrappers/auth'],
        path: '/systemset/menumanage',
        component: 'systemSet/MenuManage',
      },
    ],
  },
  {
    path: '/inspectionBoard',
    layout: false,
    name: 'inspectionBoard',
    icon: 'FundProjectionScreen',
    component: './InspectionScreen',
    menuRender: false,
    headerRender: false,
    wrappers: ['../wrappers/auth'],
    hideInMenu: true,
  },
  {
    path: '/inspectionScreen',
    layout: false,
    name: 'inspectionScreen',
    icon: 'FundProjectionScreen',
    component: './InspectionBoard',
    menuRender: false,
    headerRender: false,
    // wrappers: ['../wrappers/auth'],
    hideInMenu: true,
  },
  {
    path: '/facilityAssets',
    layout: false,
    name: 'facilityAssets',
    icon: 'FundProjectionScreen',
    component: './FacilityAssets',
    menuRender: false,
    headerRender: false,
    // wrappers: ['../wrappers/auth'],
    hideInMenu: true,
  },
  {
    path: '/systemLog',
    name: 'systemLog',
    icon: 'PictureOutlined',
    // redirect: '/systemLog/loginLog',
    routes: [
      { path: '/systemLog', redirect: '/systemLog/loginLog' },
      {
        path: '/systemLog/loginLog',
        name: 'loginLog',
        component: './systemLog/LoginLog',
        wrappers: ['../wrappers/auth'],
      },
    ],
  },
  {
    path: '/403',
    component: './403',
  },
  {
    path: '/',
    redirect: '/inspectionBoard',
    wrappers: ['../wrappers/auth'],
  },
  {
    component: './404',
  },
];
