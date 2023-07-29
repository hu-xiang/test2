import { request } from 'umi';

/** 列表 */
export async function getStatInfo(params: any) {
  const res = await request('/traffic/stack/list', {
    method: 'get',
    params: {
      ids: '',
      id: params?.id,
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

/** 导入 */
export async function importexcel(datas: any) {
  return request('/traffic/stack/importexcel', {
    method: 'post',
    data: datas,
  });
}

/** 修改  */
export async function editfstack(datas: any) {
  return request('/traffic/stack/edit', {
    method: 'PUT',
    data: datas,
  });
}
/** 删除 */
export async function delstack(datas: any) {
  return request('/traffic/stack/del', {
    method: 'DELETE',
    data: datas,
  });
}

/** 批量删除 */
export async function delstacklist(datas: any) {
  return request('/traffic/stack/batchdel', {
    method: 'DELETE',
    data: datas,
  });
}

/** 模板导出 */
export async function educestackmod() {
  return request(`/traffic/stack/export`, {
    method: 'post',
    responseType: 'blob',
    getResponse: true,
  });
}
// 批量导出文件
export async function educestacklist(datas: any) {
  return request(`/traffic/stack/exportexcel`, {
    method: 'post',
    responseType: 'blob',
    getResponse: true,
    data: datas,
  });
}
