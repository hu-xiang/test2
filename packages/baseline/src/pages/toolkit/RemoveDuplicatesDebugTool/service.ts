import { request } from 'umi';

/** 去重病害列表 */
export async function getRemListInfo(params: any) {
  const res = await request('/traffic-analysis/platform/disease/removalDiseasePage', {
    method: 'get',
    params: {
      keyword: params?.keyword,
      disease: params?.disease,
      imgPositionThreshold: params?.imgPositionThreshold,
      bhPositionThreshold: params?.bhPositionThreshold,
      bhErrorThreshold: params?.bhErrorThreshold,
      page: params?.current,
      pageSize: params?.pageSize,
      deviceId: params?.deviceId,
      collectTime: params?.collectTime,
    },
    headers: {
      'tenant-id': params?.tenant_id,
    },
  });

  return {
    data: res.data.rows,
    success: true,
    total: res.data.total,
  };
}
/** 图片详情单个病害详情 */
export async function getDiseaseInfo(id: any, tenant_id: any) {
  return request(`/traffic/review/disease/map`, {
    method: 'get',
    params: {
      id,
    },
    headers: {
      'tenant-id': tenant_id,
    },
  });
}
/** 图片详情 */
// export async function getDiseaseInfo(imgId: string) {
//   return request(`/traffic/disease/map/detail/${imgId}`, {
//     method: 'get',
//   });
// }
// 导出Excel
export async function downlodExcel(params: any) {
  return request('/traffic-analysis/platform/disease/exportRemovalDisease', {
    method: 'post',
    responseType: 'blob',
    data: {
      ids: params?.ids,
      keyword: params?.keyword,
      disease: params?.disease,
      imgPositionThreshold: params?.imgPositionThreshold,
      bhPositionThreshold: params?.bhPositionThreshold,
      bhErrorThreshold: params?.bhErrorThreshold,
      deviceId: params?.deviceId,
      collectTime: params?.collectTime,
    },
    getResponse: true,
    headers: {
      'tenant-id': params?.tenant_id,
    },
  });
}

// 获取重复列表
export async function getDupListInfo(params: any) {
  const res = await request('/traffic-analysis/platform/disease/removalDiseaseList', {
    method: 'get',
    params: {
      // keyword: params?.keyword,
      // page: params?.current,
      // pageSize: params?.pageSize,
      ids: params?.ids,
    },
    headers: {
      'tenant-id': params?.tenant_id,
    },
  });

  return {
    data: res.data,
    success: true,
    total: res.data.length,
  };
}
