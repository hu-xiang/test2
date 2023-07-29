import { request } from 'umi';
import { serviceError } from 'baseline/src/utils/commonMethod';

/** 列表 */
export async function getListInfo(params: any) {
  const res = await request('/traffic-km/order/list', {
    method: 'get',
    params: {
      orderType: params?.orderType,
      maintenanceUnit: params?.maintenanceUnit,
      keyword: params?.keyword,
      page: params?.current,
      pageSize: params?.pageSize,
      facilitiesType: params?.facilitiesType,
      workflowStatus: params?.workflowStatus,
      startTime: params?.startTime,
      endTime: params?.endTime,
    },
  });

  if (res.status !== 0) {
    serviceError(res);
  }

  return {
    data: res.data.rows,
    success: true,
    total: res.data.total,
  };
}

/** 删除 */
export async function delOrder(data: any) {
  return request('/traffic-km/order/del', {
    method: 'DELETE',
    data,
  });
}
