import { request } from 'umi';

/** 列表 */
export async function getListInfo(params: any) {
  const res = await request('/traffic/model/modelByPage', {
    method: 'get',
    params: {
      ids: params?.id,
      id: params?.id,
      type: params?.type,
      keyword: params?.keyword,
      page: params?.current,
      pageSize: params?.pageSize,
    },
  });
  if (res.status === 0) {
    return {
      data: res.data.rows,
      success: true,
      total: res.data.total,
    };
  }
  return {
    data: res.data.rows,
    success: false,
    total: res.data.total,
  };
}

/** 创建弹窗模型列表 */
export async function getCrtListInfo(params: any) {
  const res = await request('/traffic/model/list', {
    method: 'get',
    params: {
      modelId: params?.modelId,
      modelName: params?.keyword,
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

/** 删除弹窗列表 */
export async function delmodelDel(datas: any) {
  return request('/traffic/model/del', {
    method: 'DELETE',
    data: datas,
  });
}

/** 批量删除 */
export async function delModlist(datas: any) {
  return request('/traffic/model/batchdel', {
    method: 'DELETE',
    data: datas,
  });
}

/** 创建模型列表 */
export async function addModelList(datas: any) {
  return request('/traffic/model/addModel', {
    method: 'POST',
    data: datas,
  });
}

/** 新增模型 */
export async function addModel(datas: any) {
  return request('/traffic/model/add', {
    method: 'POST',
    data: datas,
  });
}

/** 删除 */
export async function delModOne(datas: any) {
  return request('/traffic/model/delModel', {
    method: 'DELETE',
    data: datas,
  });
}

/** 修改  */
export async function editMod(datas: any) {
  return request('/traffic/model/update', {
    method: 'PUT',
    data: datas,
  });
}

// 发布
export async function putModel(datas: any) {
  return request(`/traffic/model/push`, {
    method: 'PUT',
    data: datas,
  });
}

// 修改阈值
export async function putUpdateThVal(datas: any) {
  return request(`/traffic/model/updateThVal`, {
    method: 'PUT',
    data: datas,
  });
}

// 验证文件
export async function verifyfile(datas: any) {
  return request('/traffic/model/check', {
    method: 'POST',
    data: datas,
  });
}
// 验证文件
export async function getmodtype() {
  return request('/traffic/model/modelTypeList', {
    method: 'GET',
  });
}
