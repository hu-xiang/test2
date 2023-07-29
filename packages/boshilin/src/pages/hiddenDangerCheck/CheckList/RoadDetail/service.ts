import { request } from 'umi';

/** 子线信息:分页查询  */
export async function sublineList(params: any) {
  const res = await request('/traffic-bsl/project/subListByPage', {
    method: 'get',
    params: {
      proFacId: params?.proFacId,
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

/** 子线创建-获取地图点位 */
export async function queryStake(datas: any) {
  return request('/traffic/facility/location/queryStake', {
    method: 'get',
    params: datas,
    // requestType: 'form',
  });
}

/** 子线创建-组织架构 */
export async function sublineDept(datas: any) {
  return request('/traffic/device/dept', {
    method: 'get',
    params: datas,
    // requestType: 'form',
  });
}
/** 子线创建-保存 */
export async function sublineAddSave(datas: any) {
  return request('/traffic-bsl/project/subAdd', {
    method: 'POST',
    data: datas,
    // requestType: 'form',
  });
}
/** 排查项目:道路详情:子线信息:删除 */
export async function sublineDel(datas: any) {
  return request('/traffic-bsl/project/delSub', {
    method: 'DELETE',
    data: datas,
    requestType: 'form',
  });
}
/** 道路详情:场景信息列表 */
export async function sceneList(datas: any) {
  return request('/traffic-bsl/project/sceneList', {
    method: 'get',
    params: datas,
    // requestType: 'form',
  });
}

/** 排查项目:道路详情:场景信息:批量删除 */
export async function sceneDel(datas: any) {
  return request('/traffic-bsl/project/delScene', {
    method: 'DELETE',
    data: datas,
    requestType: 'form',
  });
}

/** 排查项目:项目详情:道路详情:基本信息 */
export async function roadDetail(datas: any) {
  return request('/traffic-bsl/project/roadDetail', {
    method: 'get',
    params: datas,
    // timeout: 30000,
    // ...(options || {}),
  });
}
/** 子线信息:获取所有子线轨迹点 */
export async function querySubTrackList(datas: any) {
  return request('/traffic-bsl/project/querySubTrackList', {
    method: 'get',
    params: datas,
  });
}
/** 子线信息:获取所有子线轨迹点 */
export async function subLineEditSave(datas: any) {
  return request('/traffic-bsl/project/subEdit', {
    method: 'PUT',
    data: datas,
  });
}
/** 排查项目:道路详情:场景信息:场景类型统计 */
export async function sceneTypeTotal(datas: any) {
  return request('/traffic-bsl/project/sceneTypeTotal', {
    method: 'get',
    params: datas,
  });
}

/** 排查项目:道路详情:场景信息：场景标定状态 */
export async function doneCalibration(datas: any) {
  return request('/traffic-bsl/project/doneCalibration', {
    method: 'POST',
    data: datas,
    requestType: 'form',
  });
}
/** 场景标定:场景类型下拉 */
export async function sceneTypeSelect(datas: any) {
  return request('/traffic-bsl/project/sceneTypeSelect', {
    method: 'get',
    params: datas,
  });
}
/** 排查项目:道路详情:场景信息:场景标定:创建 */
export async function addScene(datas: any) {
  return request('/traffic-bsl/project/addScene', {
    method: 'POST',
    data: datas,
    // requestType: 'form',
  });
}
/** 排查项目:道路详情:场景信息:场景标定:编辑 */
export async function editScene(datas: any) {
  return request('/traffic-bsl/project/editScene', {
    method: 'PUT',
    data: datas,
    // requestType: 'form',
  });
}
/** 排查项目:道路详情:场景信息:编辑查看 */
export async function sceneShowEdit(datas: any) {
  return request('/traffic-bsl/project/sceneShowEdit', {
    method: 'get',
    params: datas,
    // requestType: 'form',
  });
}
/** 排查项目:道路详情:子线信息:编辑查看 */
export async function subShowEdit(datas: any) {
  return request('/traffic-bsl/project/subShowEdit', {
    method: 'get',
    params: datas,
    // requestType: 'form',
  });
}
/** 场景识别:场景类型校验 */
export async function sceneTypeCheck(datas: any) {
  return request('/traffic-bsl/project/sceneTypeCheck', {
    method: 'get',
    params: datas,
  });
}
/** 场景信息:场景识别 */
export async function sceneIdentify(datas: any) {
  return request('/traffic-bsl/project/identify', {
    method: 'post',
    data: datas,
    // requestType: 'form',
  });
}

/** 场景标定：根据上行桩号匹配下行桩号 */
export async function matchStakeNo(datas: any) {
  return request('/traffic-bsl/project/matchStakeNo', {
    method: 'post',
    data: datas,
  });
}
