import { request } from 'umi';
// import { serviceError } from '../../../utils/commonMethod';

/** 版本管理：分页查询  */
export async function cameraList(params: any) {
  const res = await request('/traffic/camera/page', {
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

/** 摄像头管理：生成摄像头编号 */
export async function generate(datas: any) {
  return request('/traffic/camera/generate', {
    method: 'GET',
    params: datas,
  });
}

// /** 摄像头管理：添加摄像头  */
export async function addCamera(datas: any) {
  return request('/traffic/camera/add', {
    method: 'POST',
    data: datas,
    // requestType: 'form',
  });
}
// /** 摄像头管理：编辑摄像头  */
export async function editCamera(datas: any) {
  return request('/traffic/camera/edit', {
    method: 'POST',
    data: datas,
    // requestType: 'form',
  });
}
// /** 摄像头管理：ID删除  */
export async function deleteCamera(datas: any) {
  return request('/traffic/camera/delete', {
    method: 'DELETE',
    data: datas,
    requestType: 'form',
  });
}
// /** 摄像头管理：批量删除  */
export async function batchDelCamera(datas: any) {
  return request('/traffic/camera/batchDel', {
    method: 'DELETE',
    data: datas,
    requestType: 'form',
  });
}

// // 摄像头管理：摄像头导出
export async function exportCamera(datas: any) {
  return request('/traffic/camera/export', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data: datas,
  });
}

// /** 摄像头管理：内参  */
export async function addInnerParam(datas: any) {
  return request('/traffic/camera/addInnerParam', {
    method: 'POST',
    data: datas,
    // requestType: 'form',
  });
}

/** 摄像头管理：图片面积 */
export async function getArea(datas: any) {
  return request('/traffic/camera/img/area', {
    method: 'GET',
    params: datas,
  });
}

// /** 摄像头管理：计算外参  */
export async function outParam(datas: any) {
  return request('/traffic/camera/img/outParam', {
    method: 'POST',
    data: datas,
    // requestType: 'form',
  });
}

// // 摄像头管理：导出外参
export async function exportParam(datas: any) {
  return request('/traffic/camera/export/param', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    data: datas,
  });
}

// /** 设备管理：摄像头-导入  */
export async function uploadFile(datas: any) {
  return request('/traffic/camera/import/param', {
    method: 'POST',
    data: datas,
    requestType: 'form',
  });
}
