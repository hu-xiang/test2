import { request } from 'umi';

const route_url = 'traffic';
// 设施资产技术状况
export async function getAvgSort(datas: { roadType: number }) {
  return request(`/${route_url}/screen/avgSort`, {
    method: 'get',
    params: datas,
  });
}
// 资产详情
export async function getFacDetailInfo(param: any) {
  return request(`/${route_url}/screen/detailById`, {
    method: 'get',
    params: param,
  });
}

// 等级分布
export async function getFacAllDistribution() {
  return request(`/${route_url}/screen/distribution`, {
    method: 'get',
  });
}
// 查等级分布单个
export async function getFacDistribution(param: { roadType: number | string }) {
  return request(`/${route_url}/facilities/distribution`, {
    method: 'get',
    params: param,
  });
}
// 设施类型分组
export async function getFacGroupByType() {
  return request(`/${route_url}/screen/groupByType`, {
    method: 'get',
  });
}
// 附属设施数量分布
export async function getSubFacDistribution() {
  return request(`/${route_url}/screen/subFacilitiesByType`, {
    method: 'get',
  });
}
// 附属设施在地图上的所有落点
export async function getSubFacInfo(param: { facilitiesId: string }) {
  return request(`/${route_url}/screen/subFacilityByFId`, {
    method: 'get',
    params: param,
  });
}
// 物理病害在地图上的所有落点
export async function getPhpInfo(param: { facilitiesId: string }) {
  return request(`/${route_url}/screen/diseaseByFId`, {
    method: 'get',
    params: param,
  });
}
// 设施资产看板-PCI&RQI切换
export async function getTabChangeInfo(
  param: { facilityName: string },
  options?: Record<string, any>,
) {
  return request(`/${route_url}/screen/technicalStatusMap`, {
    method: 'get',
    params: param,
    ...(options || {}),
  });
}
