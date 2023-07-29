import { request } from 'umi';
import type { TableListParams } from './data';

type ParamsType = {
  keyword?: string;
  rolenames?: string;
} & Partial<TableListParams>;

/** 用户列表 GET /model/list */
export async function modellist(params: ParamsType) {
  const res = await request('/traffic/model/list', {
    method: 'get',
    params: {
      keyword: params?.rolenames,
      // taskId: params?.id,
      page: params?.current,
      limit: params?.pageSize,
    },
  });

  return {
    data: res.data.rows,
    success: true,
    total: Number(res.data.total),
  };
}

/** 创建算法模型文件管理 post /model/add */
export async function addmodel(datas?: any) {
  return request('/traffic/model/add', {
    method: 'post',
    data: datas,
  });
}

/** 获取数据业务主键 get /model/pk */
export async function getmodpk() {
  return request('/traffic/model/pk', {
    method: 'POST',
  });
}

/** 上传文件 POST /model/upload */
export async function uploadfile(datas: any) {
  return request('/traffic/model/upload', {
    method: 'POST',
    data: datas,
  });
}

/** 删除上传文件 DELETE /model/file/dell */
export async function delfile(datas: any) {
  return request('/traffic/model/file/del', {
    method: 'DELETE',
    data: datas,
  });
}

/** 删除模型文件 delete /admin/role/del */
export async function delmodel(datas: any) {
  return request('/traffic/model/del', {
    method: 'delete',
    data: datas,
  });
}

// 导出文件
export async function educeMod(id: any) {
  return request(`/traffic/model/download/${id}`, {
    method: 'get',
    responseType: 'blob',
    getResponse: true,
  });
}

/** 动态发布 PUT /center/feedback/edit */
export async function modpub(id: any) {
  return request('/traffic/model/push', {
    method: 'PUT',
    data: id,
  });
}
