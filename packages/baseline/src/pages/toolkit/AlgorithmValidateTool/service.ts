import { request } from 'umi';
// import { serviceError } from '../../../utils/commonMethod';

/** 验证任务-列表  */
export async function getValidateToolList(params: any) {
  const res = await request('/traffic/algorithmVerifyTask/', {
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

/** 验证任务-创建  */
export async function addValidateTool(datas: any) {
  return request('/traffic/algorithmVerifyTask/', {
    method: 'POST',
    data: datas,
    // requestType: 'form',
  });
}
/** 验证任务-编辑回显  */
export async function getEditInfo(datas: any) {
  return request(`/traffic/algorithmVerifyTask/${datas?.id}`, {
    method: 'get',

    // requestType: 'form',
  });
}
/** 验证任务-编辑-保存  */
export async function updateEditInfo(datas: any) {
  return request(`/traffic/algorithmVerifyTask/`, {
    method: 'put',
    data: datas,
  });
}

/** 模型列表 */
export async function getModelList(datas: any) {
  return request('/traffic/model/modelByPage', {
    method: 'get',
    params: datas,
  });
}

/** 删除 */
export async function taskDel(datas: any) {
  return request('/traffic/algorithmVerifyTask/', {
    method: 'DELETE',
    data: datas,
  });
}

/** 任务-开始 */
export async function taskStart(datas: any) {
  return request('/traffic/algorithmVerifyTask/start', {
    method: 'PUT',
    data: datas,
  });
}
/** 图片库列表 */
export async function getImgLibList(params: any) {
  const res = await request('/traffic/algorithmVerifyVerifyImage/', {
    method: 'get',
    params: {
      imgName: params?.keyword,
      taskId: params?.taskId,
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
export async function imgLibDel(datas: any) {
  return request('/traffic/algorithmVerifyVerifyImage/', {
    method: 'DELETE',
    data: datas,
  });
}
/** 上传图片/json */
export async function uploadInfo(datas: any) {
  return request('/traffic/algorithmVerifyVerifyImage/upload', {
    method: 'POST',
    data: datas,
    requestType: 'form',
  });
}
/** 图片和json进行匹配 */
export async function checkUploadInfo(datas: any) {
  return request(`/traffic/algorithmVerifyVerifyImage/match/${datas.taskId}`, {
    method: 'POST',
    data: datas,
    // requestType: 'form',
  });
}
/** 预览图片-详情 */
export async function getImgInfo(datas: any) {
  return request(`/traffic/algorithmVerifyVerifyImage/${datas.id}`, {
    method: 'get',
    params: datas,
  });
}

/** 删除前校验 */
export async function versionCheck(datas: any) {
  return request('/traffic/algorithmVerifyTask/', {
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
