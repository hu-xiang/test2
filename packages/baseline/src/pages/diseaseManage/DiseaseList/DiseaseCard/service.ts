import { request } from 'umi';

/** 病害列表进入的详情 */
export async function getdetail(id: any) {
  return request(`/traffic/disease/list/det/${id}`, {
    method: 'get',
  });
}
// 物理病害列表进入的详情
export async function getPhDetail(id: any) {
  return request(`/traffic/real/disease/detById/${id}`, {
    method: 'get',
  });
}

/** 病害列表-跟踪列表 */
export async function getListInfo(params: any) {
  const res = await request('/traffic/disease/detByList', {
    method: 'get',
    params: {
      id: params?.id,
      pageNo: params?.current,
      pageSize: params?.pageSize,
      fkImgId: params?.fkImgId,
    },
  });

  return {
    data: res.data.rows,
    success: true,
    total: res.data.total,
  };
}
/** 物理病害列表-跟踪列表 */
export async function getPhListInfo(params: any) {
  const res = await request('/traffic/real/disease/followList', {
    method: 'get',
    params: {
      fkDiseaseId: params?.fkDiseaseId,
      pageNo: params?.current,
      pageSize: params?.pageSize,
    },
  });

  return {
    data: res.data.rows,
    success: true,
    total: res.data.total,
  };
}

/** 复核 */
export async function putCheck(obj?: any) {
  return request(`/traffic/disease/check`, {
    method: 'put',
    data: obj,
  });
}

/** 图片详情 */
// export async function getDiseaseInfo(imgId: string) {
//   return request(`/traffic/disease/map/detail/${imgId}`, {
//     method: 'get',
//   });
// }

/** 图片详情单个病害详情 */
export async function getDiseaseInfo(id: any) {
  return request(`/traffic/disease/map/imgList`, {
    method: 'get',
    params: {
      id,
    },
  });
}
/** 病害列表 */
export async function getDisListInfo(params: any) {
  const res = await request('/traffic/disease/listByPage', {
    method: 'get',
    params: {
      taskType: params?.taskType,
      startTime: params?.startTime,
      endTime: params?.endTime,
      disease: params?.disease,
      checkCode: params?.checkCode,
      page: params?.page,
      pageSize: params?.pageSize,
      keyword: params?.keyword,
      diseaseImp: params?.diseaseImp,
      fkFacilitiesIdList: params?.fkFacilitiesIdList,
      severity: params?.severity,
    },
  });

  return {
    data: res.data.rows,
    success: true,
    total: res.data.total,
  };
}
/** 删除 */
export async function dellistinfo(params: any) {
  return request(`/traffic/disease/delTrack/${params.diseaseId}/${params.trackId}`, {
    method: 'DELETE',
    // params,
  });
}

/** 物理病害列表 */
export async function getPhyDisListInfo(params: any) {
  const res = await request('/traffic/real/disease/listByPage', {
    method: 'get',
    params: {
      page: params?.page,
      pageSize: params?.pageSize,
      keyword: params?.keyword,
      openStatus: params?.openStatus,
      fkFacilitiesIdList: params?.fkFacilitiesIdList,
      diseaseImp: params?.diseaseImp,
      startTime: params?.startTime,
      endTime: params?.endTime,
      disease: params?.disease,
      severity: params?.severity,
    },
  });
  return {
    data: res.data.rows,
    success: true,
    total: res.data.total,
  };
}
