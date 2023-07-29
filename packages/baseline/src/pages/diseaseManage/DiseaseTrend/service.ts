import { request } from 'umi';

// const route_url = 'sm-traffic-mpgs';
const route_url = 'traffic';
// 病害趋势:地图落点
export async function getMapInfo(
  datas: {
    facilitiesId?: string;
    startTime?: string;
    endTime?: string;
    diseaseType?: number[];
  },
  options?: Record<string, any>,
) {
  return request(`/${route_url}/trend/queryMap`, {
    method: 'get',
    params: datas,
    ...(options || {}),
  });
}
// 病害趋势:地图落点详情
export async function getDiseaseDetailInfo(imgId: string) {
  return request(`/${route_url}/trend/queryMapDetail`, {
    method: 'get',
    params: {
      imgId,
    },
  });
}
// 病害趋势:获取病害追踪日期下拉框
export async function getQueryDate(param: { id: string }) {
  return request(`/${route_url}/trend/queryRealDate`, {
    method: 'get',
    params: param,
  });
}
// 病害趋势:跟踪列表
export async function getTrackList(datas: { id: string; collectTime: string }) {
  return request(`/${route_url}/trend/followList`, {
    method: 'get',
    params: datas,
  });
}
// 近7天新增病害数量
export async function getDiseaseSevenNums(params: { facilitiesId: string; type: number }) {
  return request(`/${route_url}/trend/lineStatics`, {
    // return request(`/${route_url}/trend/lineStatics`, {
    method: 'get',
    params,
  });
}
// 导出
export async function exportInfo(url: string, params: any) {
  return request(`/${route_url}/${url}`, {
    method: 'get',
    params,
    responseType: 'blob',
    getResponse: true,
  });
}
// 病害趋势:新增病害数量导出
export async function exportDiseaseNums(params: { facilitiesId: string; type: number }) {
  return request(`/${route_url}/trend/lineChartExport`, {
    method: 'get',
    params,
  });
}

// 病害趋势:近7天新增病害分布
export async function getDiseaseSevenDist(params: {
  facilitiesId: string;
  type: number;
  taskType: number | string;
}) {
  return request(`/${route_url}/trend/pieStatics`, {
    method: 'get',
    params,
  });
}
// 病害趋势:新增病害数量分布导出
export async function exportDiseaseSevenDist(params: {
  facilitiesId: string;
  type: number;
  taskType: number | string;
}) {
  return request(`/${route_url}/trend/pieChartExport`, {
    method: 'get',
    params,
  });
}
// 病害趋势:近7天设施新增病害数量
export async function getFacSevenDisease(params: { facilitiesId: string; type: number }) {
  return request(`/${route_url}/trend/barStatics`, {
    method: 'get',
    params,
  });
}
// 病害趋势:设施新增病害数量导出
export async function exportFacSevenDisease(params: { facilitiesId: string; type: number }) {
  return request(`/${route_url}/trend/barChartExport`, {
    method: 'get',
    params,
  });
}
// 病害趋势:设施路面损坏状况排名
export async function getRoadDamageSort(params: { facilitiesId: string; roadType: any }) {
  return request(`/${route_url}/trend/avgSort`, {
    method: 'get',
    params,
  });
}
// // 病害趋势:获取病害追踪信息
// export async function getDiseaseTrackInfo(param: { diseaseId: string; time: string }) {
//   return request(`/${route_url}/car/diseaseTrack`, {
//     method: 'get',
//     params: param,
//   });
// }
// 病害趋势:RQI
export async function getRoadRqi(params: { roadType: any }) {
  return request(`/${route_url}/trend/rqiAvgSort`, {
    method: 'get',
    params,
  });
}

// 病害趋势:RQI
export async function getRoadRqiExport(params: { roadType: any }) {
  return request(`/${route_url}/trend/rqiAvgSortExport`, {
    method: 'get',
    params,
  });
}
// 病害趋势:RQI
export async function markTime(params: { roadType: any }) {
  return request(`/${route_url}/trend/markTime`, {
    method: 'get',
    params,
  });
}
// 病害趋势:近7天新增病害尺寸统计
export async function sizeTotal(params: { roadType: any }) {
  return request(`/${route_url}/trend/size/total`, {
    method: 'get',
    params,
  });
}
