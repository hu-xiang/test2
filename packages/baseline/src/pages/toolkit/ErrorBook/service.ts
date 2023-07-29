import { request } from 'umi';

/** 病害列表 */
export async function getListInfo(params: any) {
  const res = await request('/traffic/wrongQuestionBook/page', {
    method: 'get',
    headers: {
      'tenant-id': params?.tenant_id,
    },
    params: {
      keyword: params?.keyword,
      startTime: params?.startTime,
      endTime: params?.endTime,
      diseaseType: params?.disease,
      page: params?.current,
      pageSize: params?.pageSize,
      deviceIds: params?.deviceId,
    },
  });

  return {
    data: res.data.rows,
    success: true,
    total: res.data.total,
  };
}

/** 图片详情单个病害详情 */
export async function getDiseaseInfo(id: any, tenant_id?: any) {
  return request(`/traffic/wrongQuestionBook/wrongImgList`, {
    method: 'get',
    params: {
      id,
    },
    headers: {
      'tenant-id': tenant_id,
    },
  });
}

/** 删除 */
export async function dellistinfo(datas: any, tenant_id: any) {
  return request(`/traffic/wrongQuestionBook/delete`, {
    method: 'DELETE',
    data: datas,
    headers: {
      'tenant-id': tenant_id,
    },
  });
}

// 导出Excel
export async function downloadExcel(params: any) {
  return request('/traffic/wrongQuestionBook/export', {
    method: 'POST',
    responseType: 'blob',
    dataType: 'json',
    headers: {
      'tenant-id': params?.tenant_id,
    },
    data: {
      ids: params?.ids,
      startTime: params.startTime,
      endTime: params.endTime,
      diseaseType: params.disease,
      keyword: params.keyword,
      deviceIds: params?.deviceId,
    },
    getResponse: true,
  });
}
// 编辑错误描述
export async function edtDescription(param: any, tenant_id: any) {
  return request('/traffic/wrongQuestionBook/update', {
    method: 'put',
    data: param,
    headers: {
      'tenant-id': tenant_id,
    },
  });
}
