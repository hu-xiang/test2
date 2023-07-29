import { request } from 'umi';

const route_url = 'traffic-bsl';

// 重点场景treelist
export async function getSceneTreeList(param: Record<string, string>) {
  return request(`/${route_url}/hidden/bgQueryTree`, {
    method: 'get',
    params: param,
  });
}
// 地图详情
export async function getMapDetail(param: Record<string, string>) {
  return request(`/${route_url}/hidden/detailList`, {
    method: 'get',
    params: param,
  });
}
// 项目列表
export async function getProjectList(param: Record<string, string>) {
  return request(`/${route_url}/hidden/projectDoneList`, {
    method: 'get',
    params: param,
  });
}
// 获取最近一次项目的id
export async function getLastProjectId() {
  return request(`/${route_url}/hidden/queryProjectId`, {
    method: 'get',
    // params:param,
  });
}
// 获取点位相关信息
export async function getCheckInfo(param: Record<string, string>) {
  return request(`/${route_url}/project/queryGpsInfo`, {
    method: 'get',
    params: param,
  });
}
// 浏览模式
export async function getImgListInfo(param: Record<string, string>) {
  return request(`/${route_url}/hidden/scan`, {
    method: 'get',
    params: param,
  });
}
// 根据场景查看落点
export async function getSCeneMapDatas(param: Record<string, string>) {
  return request(`/${route_url}/hidden/hiddenList`, {
    method: 'get',
    params: param,
  });
}
// 根据场景类型查看落点
export async function getSCeneTypeMapDatas(param: Record<string, string>) {
  return request(`/${route_url}/hidden/keySceneList`, {
    method: 'get',
    params: param,
  });
}
/** 获取道路轨迹落点 */
export async function queryStake(datas: any, options?: Record<string, any>) {
  return request('/traffic/facility/location/queryStake', {
    method: 'get',
    params: datas,
    ...(options || {}),
  });
}
