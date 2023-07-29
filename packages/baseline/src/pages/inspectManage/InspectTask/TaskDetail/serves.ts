import { request } from 'umi';
import { serviceError } from '../../../../utils/commonMethod';

/** 列表 */
export async function getListInfo(params: any) {
  const obj: any = {
    typeList: params?.typeList,
    page: params?.current,
    pageSize: params?.pageSize,
    patrolTaskId: params?.patrolTaskId,
    reviewStatus: params?.reviewStatus,
    pushStatus: params?.pushStatus,
    openStatus: params?.openStatus,
    startTime: params?.startTime,
    endTime: params?.endTime,
    severity: params?.severity,
  };
  const res = await request('/traffic/patrol/task/detail', {
    method: 'get',
    params: obj,
  });

  if (res.data.status !== 0) {
    serviceError(res.data);
  }

  return {
    data: res?.data?.data?.rows,
    success: true,
    total: res?.data?.data?.total,
    mileage: res?.mileage,
  };
}

// // 导出文件
// export async function exportDisease(data: any) {
//   return request(`/traffic/disease/statistics/download`, {
//     method: 'post',
//     responseType: 'blob',
//     getResponse: true,
//     data,
//   });
// }

// 导出文件
export async function exportDisease(data: any) {
  return request(`/sm-traffic-yc/disease/statistics/download`, {
    method: 'post',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}

export async function getMapInfo(params: any) {
  return request(`/traffic/patrol/task/punctuation`, {
    method: 'get',
    params,
  });
}

export async function getStakeInfo(params: any) {
  return request(`/traffic/facility/location/queryStake`, {
    method: 'get',
    params,
  });
}

export async function getMapImg(id: any) {
  return request(`/traffic/patrol/task/notification`, {
    method: 'get',
    params: {
      id,
    },
  });
}

// 复核
export async function checkDis(data: any) {
  return request(`/sm-traffic-yc/ycApi/updateAndPush`, {
    method: 'put',
    data,
  });
}

// 请求桩号
export async function taskMap(datas: any) {
  return request('/traffic/facility/location/task/map', {
    method: 'post',
    data: datas,
  });
}

// 推送
export async function pushDisease(data: any) {
  return request(`/sm-traffic-mpgs/disease/push?taskId=${data.taskId}`, {
    method: 'post',
    // data: {},
  });
}
