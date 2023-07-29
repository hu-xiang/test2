import { request } from 'umi';
// import { serviceError } from '../../../../src/utils/commonMethod';

/** 列表 */
export async function getListInfo(params: any) {
  const res = await request('/traffic/facilities/list', {
    method: 'get',
    params: {
      ids: params?.id,
      id: params?.id,
      // type: params?.type,
      keyword: params?.keyword,
      page: params?.current,
      pageSize: params?.pageSize,
    },
  });

  // if (res.status !== 0) {
  //   serviceError(res);
  // }

  return {
    data: res.data.rows,
    success: true,
    total: res.data.total,
  };
}

/** 新增设施 */
export async function addfaci(datas: any) {
  return request('/traffic/facilities/add', {
    method: 'POST',
    data: datas,
  });
}

/** 修改  */
export async function editfaci(datas: any) {
  return request('/traffic/facilities/edit', {
    method: 'PUT',
    data: datas,
  });
}

/** 删除 */
export async function delfacilist(datas: any) {
  return request('/traffic/facilities/del', {
    method: 'DELETE',
    data: datas,
  });
}
// 导出文件
export async function educefacilist(datas: any) {
  return request(`/traffic/facilities/export`, {
    method: 'post',
    responseType: 'blob',
    getResponse: true,
    data: datas,
  });
}
/** 批量删除 */
export async function delfacilitieslist(datas: any) {
  return request('/traffic/facilities/batchdel', {
    method: 'DELETE',
    data: datas,
  });
}

/** 获取组织机构树 get /api/admin/dept/tree/list */
export async function fetchTree() {
  return request('/traffic/device/dept', {
    method: 'get',
  });
}

/** 获取设施定位 */
export async function getLocationList(params: any) {
  return request('/traffic/facilities/locationList', {
    method: 'get',
    params: {
      id: params,
    },
  });
}

/** 获取设施编辑详情信息 */
export async function getFacilitiesEditInfo(id: any) {
  return request('/traffic/facilities/showEdit', {
    method: 'get',
    params: {
      id,
    },
  });
}

/** 设施管理：校验设施是否关联了生效巡检任务 */
export async function checkProTask(id: any) {
  return request('/traffic/facilities/checkProTask', {
    method: 'get',
    params: {
      id,
    },
  });
}

export async function roadLibUpload(datas: any, options?: Record<string, any>) {
  return request('/sm-traffic-hn/ledger/upload', {
    method: 'POST',
    data: datas,
    requestType: 'form', // 浏览器会自动识别并添加请求头 "Content-Type: multipart/form-data"
    ...(options || {}),
  });
}

/** 台账管理：批量删除 */
export async function roadLibBatchDel(params: any) {
  return request('/sm-traffic-hn/ledger/batchDel', {
    method: 'DELETE',
    params,
    requestType: 'form',
  });
}
