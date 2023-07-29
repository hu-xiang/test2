import { request } from 'umi';
import { serviceError } from 'baseline/src/utils/commonMethod';

const base = '/traffic-km/order';

//
export function editOrder(data: any) {
  return request<API.Result>(`${base}/edit`, {
    method: 'put',
    data,
  });
}

export function addOrder(data: any) {
  return request<API.Result>(`${base}/add`, {
    method: 'post',
    data,
  });
}

export function deleteDisease(data: { id: string }) {
  return request<API.Result>(`${base}/disease/del`, {
    method: 'delete',
    params: data,
  });
}

//
export function addDisease(data: any) {
  return request<API.Result>(`${base}/disease/add`, {
    method: 'post',
    data,
  });
}

// 新增工单时 先获取随机工单 id
export function getWorkOrderId() {
  return request<API.Result>(`${base}/generate`, {
    method: 'get',
  });
}

// 工单 查看所有 疾病列表
export async function getDiseaseListByPage(params: any) {
  const res = await request(`${base}/disease/listByPage`, {
    method: 'get',
    params: {
      keyword: params?.keyword,
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

// 工单 查看所有 当前工单 疾病列表
// params {
//   orderId: string;
//   keyword?: string;
//   page?: number;
//   pageSize?: number;
// }
export async function getDiseaseList(params: any) {
  const res = await request<API.Result>(`${base}/disease/list`, {
    method: 'get',
    params: {
      ...params,
      page: params?.current,
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
