import { request } from 'umi';
import { serviceError } from '../../../utils/commonMethod';

/** 列表 */
export async function getListInfo(params: any) {
  const res = await request('/traffic/patrol/task/list', {
    method: 'get',
    params: {
      taskStatus: params?.taskStatus,
      keyword: params?.keyword,
      page: params?.current,
      pageSize: params?.pageSize,
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

// 导出文件
export async function exportTasks(data: any) {
  return request(`/traffic/patrol/task/export`, {
    method: 'post',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
