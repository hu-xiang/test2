import { request } from 'umi';

export function getDiseaseListByPage(
  params: {
    keyword?: string;
    page?: number;
    pageSize?: number;
  },
  options?: Record<string, any>,
) {
  return request<API.FakeCaptcha>('/api/order/disease/listByPage', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export function getDiseaseList(
  params: {
    orderId: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  },
  options?: Record<string, any>,
) {
  return request<API.FakeCaptcha>('/api/order/disease/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
