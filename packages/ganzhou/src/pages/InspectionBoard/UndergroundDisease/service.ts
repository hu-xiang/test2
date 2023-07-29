import { request } from 'umi';

// 获取地下病害落点信息
export async function getMapDatas(param: Record<string, string>) {
  return request(`/traffic-km/under/disease/list`, {
    method: 'post',
    data: param,
  });
}
// 获取病害详情信息
export async function getDiseaseDetailInfo(imgId: any) {
  return request(`/traffic-km/under/disease/detail?id=${imgId}`, {
    method: 'get',
  });
}
/** 地下病害近30天新增病害概况 */
export async function getDiseaseMonthData(options?: Record<string, any>) {
  return request('/traffic-km/under/disease/statistics', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 地下病害新增病害分布 */
export async function getDiseaseDistribution(options?: Record<string, any>) {
  return request('/traffic-km/under/disease/distribution', {
    method: 'GET',
    ...(options || {}),
  });
}
/** 地下病害重点设施病害数量top5 */
export async function getFacilityTop5(param: Record<string, any>) {
  const res = await request(`/traffic-km/under/disease/top`, {
    method: 'get',
    params: {
      type: param?.type,
    },
  });
  let recData: any = [];
  if (Object.keys(res?.data)?.length > 0) {
    recData = Object.keys(res?.data).map((it: any, index: any) => {
      const itemKey = Object.keys(res?.data[it])[0];
      const itemValue = res?.data[it][itemKey];
      const itRadio = itemValue ? itemValue.substr(0, itemValue.lastIndexOf('%')) : undefined;
      let itArrow: number = -1;
      if (itRadio) {
        // eslint-disable-next-line
        itArrow = itRadio > 0 ? 1 : itRadio < 0 ? 2 : -1;
      }
      const absData = itemValue ? itemValue.replace('-', '') : undefined;
      return { id: index, facility: it, num: itemKey, radio: absData, ratioStatus: itArrow };
    });
  }
  return {
    data: recData,
    success: true,
    total: res.data.total,
  };
}
