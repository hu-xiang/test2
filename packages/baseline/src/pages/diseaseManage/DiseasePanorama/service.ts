import { request } from 'umi';

// 全景地图
export async function getMapInfo(datas: any) {
  return request('/traffic/disease/map/list', {
    method: 'get',
    params: datas,
  });
}

export async function getDiseaseInfo(imgId: string, diseaseType: any[]) {
  return request(`/traffic/disease/map/detail/${imgId}`, {
    method: 'get',
    params: {
      diseaseType,
    },
  });
}
// 全景左侧圆
export async function getDiseasePieInfo(taskType: string, type: any) {
  return request(`/traffic/disease/map/pie`, {
    method: 'get',
    params: { taskType, type, diseaseImpArray: [0, 1] },
  });
}
// 全景左侧柱
export async function getColInfo(type: any) {
  return request(`/traffic/disease/map/col`, {
    method: 'get',
    params: {
      type,
      diseaseImpArray: [0, 1],
    },
  });
}
/** 设施名称列表 */
export async function getFacilitiesList(param?: any, options?: Record<string, any>) {
  return request('/traffic/facilities/select', {
    method: 'GET',
    params: param,
    ...(options || {}),
  });
}
