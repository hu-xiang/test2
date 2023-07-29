import { request } from 'umi';
// import { serviceError } from '../../../utils/commonMethod';

/** 版本管理：分页查询  */
export async function versionList(params: any) {
  const res = await request('/traffic/version/list', {
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

/** 删除 */
export async function versionDel(datas: any) {
  return request('/traffic/version/del', {
    method: 'DELETE',
    data: datas,
  });
}
/** 删除前校验 */
export async function versionCheck(datas: any) {
  return request('/traffic/version/check', {
    method: 'get',
    params: datas,
    // requestType: 'form',
  });
}

// /** 上传文件  */
export async function uploadFile(datas: any) {
  return request('/traffic/version/upload', {
    method: 'POST',
    data: datas,
    requestType: 'form',
  });
}
// /** 删除上传文件  */
export async function removeFile(datas: any) {
  return request('/traffic/version/file/del', {
    method: 'DELETE',
    data: datas,
    // requestType: 'form',
  });
}
// /** 版本管理：新增  */
export async function addVersionSave(datas: any) {
  return request('/traffic/version/add', {
    method: 'POST',
    data: datas,
    // requestType: 'form',
  });
}
// /** 版本管理：编辑 */
export async function versionEdit(datas: any) {
  return request('/traffic/version/edit', {
    method: 'PUT',
    data: datas,
    // requestType: 'form',
  });
}
// /** 版本管理：分片上传文件 */
export async function splitUpload(datas: any) {
  return request('/traffic/version/split/upload', {
    method: 'POST',
    data: datas,
    requestType: 'form',
    getResponse: true,
    contentType: 'multipart/form-data',
    enctype: 'multipart/form-data',
    encoding: 'multipart/form-data',
  });
}
