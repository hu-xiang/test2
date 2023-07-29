import { request } from 'umi';

// 删除单个
export async function delInfo(ids: any, options?: Record<string, any>) {
  return request(`/traffic/inspection/del`, {
    method: 'DELETE',
    params: ids,
    ...(options || {}),
  });
}
// 导出Excel
export async function downloadExcel(param: any) {
  return request('/traffic/inspection/export', {
    method: 'post',
    responseType: 'blob',
    // dataType: 'json',
    data: param,
    getResponse: true,
  });
}

/** 列表 */
export async function getListInfo(params: any) {
  const res = await request('/traffic/inspection/list', {
    method: 'get',
    params: {
      keyword: params?.keyword,
      page: params?.current,
      pageSize: params?.pageSize,
    },
  });

  return {
    data: res.data.rows,
    success: true,
    total: res.data.total,
  };
}
/** 创建 post  */
export async function addPlan(datas?: any, options?: Record<string, any>) {
  return request('/traffic/inspection/add', {
    method: 'post',
    data: datas,
    ...(options || {}),
  });
}
/** 编辑  */
export async function editPlan(datas?: any, options?: Record<string, any>) {
  return request('/traffic/inspection/edit', {
    method: 'put',
    data: datas,
    ...(options || {}),
  });
}
/** 下拉，设备  */
export async function getDeviceList(options?: Record<string, any>) {
  return request('/traffic/inspection/selectDevices', {
    method: 'get',
    // data: datas,
    ...(options || {}),
  });
}
// 中止计划
export async function stopPlan(ids: string) {
  return request(`/traffic/inspection/endPlan?id=${ids}`, {
    method: 'get',
  });
}
