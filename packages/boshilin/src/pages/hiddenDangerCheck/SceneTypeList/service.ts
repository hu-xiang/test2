import { request } from 'umi';
// import type { TableListParams } from '../data';

const routeName = 'traffic-bsl';
/** 列表 */
export async function getSceneListInfo(params: any) {
  const res = await request(`/${routeName}/sceneType/list`, {
    method: 'get',
    params: {
      sceneName: params?.sceneName,
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
export async function delScenelistinfo(datas: any, options?: Record<string, any>) {
  return request(`/${routeName}/sceneType/del`, {
    method: 'DELETE',
    params: datas,
    ...(options || {}),
  });
}

export async function addSceneInfo(datas: Record<string, any>, options?: Record<string, any>) {
  return request(`/${routeName}/sceneType/add`, {
    method: 'POST',
    data: datas,
    ...(options || {}),
  });
}
export async function checkSceneName(params: Record<string, any>, options?: Record<string, any>) {
  return request(`/${routeName}/sceneType/checkName?name=${params?.name}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function editSceneInfo(datas: Record<string, any>, options?: Record<string, any>) {
  return request(`/${routeName}/sceneType/edit`, {
    method: 'PUT',
    data: datas,
    ...(options || {}),
  });
}
export async function getSceneTreeList(options?: Record<string, any>) {
  return request(`/${routeName}/sceneType/tree`, {
    method: 'GET',
    ...(options || {}),
  });
}
export async function getCheckListInfo(params: any) {
  const res = await request(`/${routeName}/check/list`, {
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
export async function delChecklistinfo(datas: any, options?: Record<string, any>) {
  return request(`/${routeName}/check/del`, {
    method: 'DELETE',
    params: datas,
    ...(options || {}),
  });
}

export async function addCheckInfo(datas: Record<string, any>, options?: Record<string, any>) {
  return request(`/${routeName}/check/add`, {
    method: 'POST',
    data: datas,
    ...(options || {}),
  });
}
export async function checkName(params: Record<string, any>, options?: Record<string, any>) {
  return request(`/${routeName}/check/checkName?name=${params?.name}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function editCheckInfo(datas: Record<string, any>, options?: Record<string, any>) {
  return request(`/${routeName}/check/edit`, {
    method: 'PUT',
    data: datas,
    ...(options || {}),
  });
}
/** 根据排查项查询标准引用 */
export async function getSelectCitiation(param?: any, options?: Record<string, any>) {
  return request(`/${routeName}/check/selectCitation`, {
    method: 'GET',
    params: param,
    ...(options || {}),
  });
}
