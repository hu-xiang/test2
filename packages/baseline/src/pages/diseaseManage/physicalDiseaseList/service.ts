import { request } from 'umi';

/** 详情 */
export async function getdetail(id: any) {
  return request(`/traffic/disease/list/det/${id}`, {
    method: 'get',
  });
}

/** 列表 */
export async function getListInfo(params: any) {
  const res = await request('/traffic/real/disease/listByPage', {
    method: 'get',
    params: {
      page: params?.current,
      pageSize: params?.pageSize,
      keyword: params?.keyword,
      openStatus: params?.openStatus,
      // fkFacilitiesId: params?.fkFacilitiesId,
      fkFacilitiesIdList: params?.fkFacilitiesIdList,
      diseaseImp: params?.diseaseImp,
      startTime: params?.startTime,
      endTime: params?.endTime,
      disease: params?.disease,
      severity: params?.severity,
    },
  });
  return {
    data: res.data.rows,
    success: true,
    total: res.data.total,
  };
}

/** 图片详情单个病害详情 */
export async function getDiseaseInfo(id: any) {
  return request(`/traffic/disease/map/imgList`, {
    method: 'get',
    params: {
      id,
    },
  });
}

/** 图片详情单个病害详情 */
export async function getPhDiseaseInfo(id: any) {
  return request(`/traffic/real/disease/map/imgList`, {
    method: 'get',
    params: {
      id,
    },
  });
}

// 批量导出Excel
export async function downlodExcel(params: any) {
  return request('/traffic/real/disease/export', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data: params,
  });
}

/** 切换物理病害状态 */
export async function toggleDiseaseStatus(params: any) {
  return request(`/traffic/real/disease/updOpenStatus`, {
    method: 'put',
    params: {
      fkRealDiseaseId: params?.fkRealDiseaseId,
      type: params?.type,
    },
  });
}

/** 导出pdf */
export async function exportPdf(params: any) {
  return request(`/traffic/real/disease/exportPdf`, {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data: params,
  });
}
