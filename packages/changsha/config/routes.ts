import baseRoutes from '../../baseline/config/routes';

/**
 * 项目独有模块添加
 */
const specificRoutes: any = {
  name: 'structure-list',
  path: '/facilitymanage/structureList',
  icon: 'smile',
  component: 'facilityManage/StructureList',
  wrappers: ['../wrappers/auth'],
};

const index = baseRoutes.findIndex((item) => item.path === '/facilitymanage');

const baseRoutesRes = baseRoutes?.slice();
const len = baseRoutesRes[index].routes?.length || 0;
baseRoutesRes[index].routes?.splice(len, 0, specificRoutes);

export default baseRoutesRes;
