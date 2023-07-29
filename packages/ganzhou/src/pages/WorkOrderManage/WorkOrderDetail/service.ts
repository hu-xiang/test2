import { request } from 'umi';
import { serviceError } from 'baseline/src/utils/commonMethod';

/** 病害列表 */
export async function getDisListInfo(params: any) {
  const res = await request('/traffic-km/order/disease/list', {
    method: 'get',
    params: {
      orderId: params?.orderId,
      page: params?.current,
      pageSize: params?.pageSize,
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

/** 图片详情单个病害详情 */
export async function getDiseaseInfo(id: any) {
  return request(`/traffic/disease/map/imgList`, {
    method: 'get',
    params: {
      id,
    },
  });
}

/** 上传图片 */
export async function uploadOrder(data: any) {
  return request('/traffic-km/order/disease/upload', {
    method: 'POST',
    data,
  });
}

/** 删除图片 */
export async function delImage(data: any) {
  return request('/traffic-km/order/disease/file/del', {
    method: 'DELETE',
    data,
  });
}

/** 工单验收 */
export async function orderCheck(id: any) {
  return request(`/traffic-km/order/check`, {
    method: 'get',
    params: {
      id,
    },
  });
}

/** 设施定位 */
export async function orderLocation(id: any) {
  return request(`/traffic-km/order/location`, {
    method: 'get',
    params: {
      id,
    },
  });
}

/** 确认上传 */
export async function confirmUpload(data: any) {
  return request('/traffic-km/order/disease/confirm/upload', {
    method: 'POST',
    data,
  });
}

/** 状态 */
export async function orderButton(orderId: any) {
  return request('/traffic-km/order/button', {
    method: 'get',
    params: {
      orderId,
    },
  });
}
