import { request } from 'umi';

/** 列表 */
export async function getListInfo(params: any) {
  const res = await request('/traffic-bsl/standardCitation/list', {
    method: 'get',
    params: {
      name: params?.name,
      type: params?.type,
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

/** 删除 */
export async function dellistinfo(datas: any, options?: Record<string, any>) {
  return request(`/traffic-bsl/standardCitation/del`, {
    method: 'DELETE',
    params: datas,
    ...(options || {}),
  });
}

export async function addInfo(datas: Record<string, any>, options?: Record<string, any>) {
  return request('/traffic-bsl/standardCitation/add', {
    method: 'POST',
    data: datas,
    ...(options || {}),
  });
}

export async function editInfo(datas: Record<string, any>, options?: Record<string, any>) {
  return request('/traffic-bsl/standardCitation/edit', {
    method: 'PUT',
    data: datas,
    ...(options || {}),
  });
}

/** 删除 */
export async function delInfo(ids: any, options?: Record<string, any>) {
  return request(`/traffic-bsl/standardCitation/del`, {
    method: 'DELETE',
    params: ids,
    ...(options || {}),
  });
}
export async function checkName(params: Record<string, any>, options?: Record<string, any>) {
  return request(`/traffic-bsl/standardCitation/checkName?name=${params?.name}`, {
    method: 'GET',
    ...(options || {}),
  });
}
