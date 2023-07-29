import { request } from 'umi';

const routeName = 'traffic-bsl';
/** 列表 */
export async function getListInfo(params: any) {
  const res = await request('/traffic-bsl/project/listByPage', {
    method: 'get',
    params: {
      checkStatus: params?.checkStatus,
      projectName: params?.projectName,
      startTime: params?.startTime,
      endTime: params?.endTime,
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

/** 项目列表-删除 */
export async function dellistinfo(data: any) {
  return request(`/traffic-bsl/project/del`, {
    method: 'DELETE',
    data,
    requestType: 'form',
  });
}

/** 创建排查项目-设施列表 */
export async function getFacListInfo(datas: any) {
  return request(`/traffic/facilities/select`, {
    method: 'get',
    params: datas,
  });
}
/** 创建排查项目-图片库 */
export async function getImgLib(datas: any) {
  return request(`/traffic/library/list`, {
    method: 'get',
    params: datas,
  });
}
/** 创建排查项目-新增 */
export async function addProject(datas: any) {
  return request(`/traffic-bsl/project/add`, {
    method: 'POST',
    data: datas,
  });
}

/** 详情 */
export async function projectEditShow(datas: any) {
  return request('/traffic-bsl/project/editShow', {
    method: 'GET',
    params: datas,
  });
}

/** 排查项目-编辑 */
export async function editProject(datas: any) {
  return request(`/traffic-bsl/project/edit`, {
    method: 'POST',
    data: datas,
  });
}

/** 创建排查项目-导出报告 */
export async function wordReport(datas: any) {
  return request(`/traffic-bsl/project/wordReport`, {
    method: 'get',
    // responseType: 'blob',
    // getResponse: true,
    params: datas,
    timeout: 5 * 60 * 1000,
  });
}

/** 详情 */
export async function getDetailInfo(datas: any) {
  return request(`/traffic-bsl/project/details`, {
    method: 'get',
    params: datas,
  });
}
/** 隐患排查:重点场景列表 */
export async function getCheckListInfo(params: any) {
  const res = await request('/traffic-bsl/project/sceneList', {
    method: 'get',
    params: {
      projectId: params?.projectId,
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
/** 排查:添加场景:列表 */
export async function getAddSceneList(datas: any) {
  return request(`/traffic-bsl/project/addSceneList`, {
    method: 'get',
    params: datas,
  });
}
/** 排查:添加场景:保存 */
export async function addSceneSave(datas: any) {
  return request(`/traffic-bsl/project/addSceneSave`, {
    method: 'POST',
    data: datas,
    requestType: 'form',
  });
}
/** 排查:完成排查 */
export async function doneCheck(datas: any) {
  return request(`/traffic-bsl/project/doneCheck`, {
    method: 'POST',
    data: datas,
    requestType: 'form',
  });
}

/** 排查:场景裁剪轨迹展示 */
export async function getSceneTailorInfo(datas: any) {
  return request(`/traffic-bsl/project/sceneTailorInfo`, {
    method: 'get',
    params: datas,
  });
}

/** 场景列表-删除 */
export async function sceneListDel(data: any) {
  return request(`/traffic-bsl/project/sceneListDel`, {
    method: 'DELETE',
    data,
    requestType: 'form',
  });
}

/** 排查:隐患排查:获取所有排查项 */
export async function queryAllCheck(datas: any) {
  return request(`/traffic-bsl/project/queryAllCheck`, {
    method: 'get',
    params: datas,
  });
}
/** 排查:隐患排查:重点场景下级标点信息 */
export async function querySceneTreeInfo(datas: any) {
  return request(`/traffic-bsl/project/querySceneTreeInfo`, {
    method: 'get',
    params: datas,
  });
}
/** 排查:隐患排查:信息展示 前两级树节点 */
export async function checkShowInfo(datas: any) {
  return request(`/traffic-bsl/project/checkShowInfo`, {
    method: 'get',
    params: datas,
  });
}
/** 排查:场景裁剪:保存 */
export async function sceneTailorSave(datas: any) {
  return request(`/traffic-bsl/project/sceneTailorSave`, {
    method: 'POST',
    data: datas,
    // headers:{
    //   'Content-Type':'application/x-www-form-urlencoded'
    // },
    // requestType: 'form',
  });
}
/** 排查:隐患排查:获取点位相关信息 */
export async function queryGpsInfo(datas: any) {
  return request(`/traffic-bsl/project/queryGpsInfo`, {
    method: 'get',
    params: datas,
  });
}
/** 排查:隐患排查:获取点位相关信息 */
export async function saveCheck(datas: any) {
  return request(`/traffic-bsl/project/saveCheck`, {
    method: 'POST',
    data: datas,
    // requestType: 'form',
  });
}
/** 排查:排查:场景裁剪:上传图片 */
export async function tailorUpImg(datas: any) {
  return request(`/traffic-bsl/project/tailorUpImg`, {
    method: 'post',
    data: datas,
    requestType: 'form',
  });
}
/** 排查:隐患排查:下一点位(更新状态) */
export async function nextPoint(datas: any) {
  return request(`/traffic-bsl/project/nextPoint`, {
    method: 'post',
    data: datas,
    requestType: 'form',
  });
}
// bsl1.0.2接口
export async function getRoadListInfo(params: any) {
  return request('/traffic-bsl/project/roadList', {
    method: 'get',
    params: {
      projectId: params?.projectId,
    },
  });
}
/** 道路-编辑 */
export async function editRoad(datas: any) {
  return request(`/traffic-bsl/project/roadEdit`, {
    method: 'POST',
    data: datas,
  });
}
/** 道路-删除 */
export async function delRoadinfo(data: any) {
  return request(`/traffic-bsl/project/roadDel`, {
    method: 'DELETE',
    data,
    requestType: 'form',
  });
}
export async function checkProjName(params: Record<string, any>, options?: Record<string, any>) {
  return request(`/${routeName}/project/checkName?name=${params?.name}`, {
    method: 'GET',
    ...(options || {}),
  });
}
// 道路编辑中的图片库下拉接口
export async function getRoadLibraryInfos(params: Record<string, string>) {
  return request('/traffic-bsl/project/librarySelect', {
    method: 'get',
    params: {
      name: params?.name,
    },
  });
}
// 排查项目:隐患排查:修改场景状态
export async function updateDoneStatus(datas: any) {
  return request('/traffic-bsl/project/updateDoneStatus', {
    method: 'PUT',
    data: datas,
  });
}

/** 删除报表 */
export async function delReport(data: any) {
  return request(`/traffic-bsl/project/delReport`, {
    method: 'DELETE',
    data,
    requestType: 'form',
  });
}
