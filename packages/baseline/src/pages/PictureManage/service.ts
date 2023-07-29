import { request } from 'umi';
import type { TableListParams } from './data.d';

/** 获取数据业务主键 POST /library/pk */
export async function getpk(options?: Record<string, any>) {
  return request('/traffic/library/pk', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 上传照片 POST /library/upload */
export async function uploadimg(datas: any, options?: Record<string, any>) {
  return request('/traffic/library/upload', {
    method: 'POST',
    data: datas,
    requestType: 'form', // 浏览器会自动识别并添加请求头 "Content-Type: multipart/form-data"
    ...(options || {}),
  });
}

/** 保存 POST /library/add */
export async function addku(datas: any, options?: Record<string, any>) {
  return request('/traffic/library/add', {
    method: 'POST',
    data: datas,
    ...(options || {}),
  });
}

/** 修改 put /library/update */
export async function editku(datas: any, options?: Record<string, any>) {
  return request('/traffic/library/update', {
    method: 'PUT',
    data: datas,
    ...(options || {}),
  });
}

/** 删除图片 DELETE /img/del */
export async function delimg(datas: any, options?: Record<string, any>) {
  return request('/traffic/img/del', {
    method: 'DELETE',
    data: datas,
    ...(options || {}),
  });
}

// /** 图库列表 GET /library/list */
// export async function libList(data?: any, options?: Record<string, any>) {
//   return request('/traffic/library/list', {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json;charset=UTF-8',
//     },
//     params: data,
//     ...(options || {}),
//   });
// }

type ParamsType = {
  keyword?: string;
} & Partial<TableListParams>;

/** 图库列表 GET /library/list */
export async function libList(params: ParamsType) {
  const res = await request('/traffic/library/list', {
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

/** 删除图库 DELETE /library/del */
export async function libdel(datas: any, options?: Record<string, any>) {
  return request('/traffic/library/del', {
    method: 'DELETE',
    data: datas,
    ...(options || {}),
  });
}
/** 桩号绑定 */
export async function matchStation(param?: any, options?: Record<string, any>) {
  return request('/traffic/img/match', {
    method: 'put',
    params: param,
    ...(options || {}),
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

export async function getimglist(params: any) {
  const res = await request('/traffic/img/list', {
    method: 'get',
    params: {
      keyword: params?.keyword,
      page: params?.current,
      pageSize: params?.pageSize,
      libraryId: params?.libraryId,
    },
  });

  return {
    data: res.data.rows,
    success: true,
    total: res.data.total,
  };
}
/** 导入 */
export async function importJson(datas: any) {
  return request('/traffic/library/import/json', {
    method: 'post',
    data: datas,
  });
}
