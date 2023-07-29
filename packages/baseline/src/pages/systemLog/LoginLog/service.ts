import { request } from 'umi';

/** 列表 */
export async function getListInfo(params: any) {
  const res = await request('/admin/syslog/loginlog/list', {
    method: 'get',
    params: {
      location: params?.location,
      userName: params?.userName,
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
