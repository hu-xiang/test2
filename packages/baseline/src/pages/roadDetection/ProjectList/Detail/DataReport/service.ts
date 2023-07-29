import { request } from 'umi';

/** 列表 */
export async function getListInfo(params: any) {
  const res = await request('/traffic/road/project/detail/road', {
    method: 'post',
    data: {
      pavementId: params?.pavementId,
      direct: params?.direct,
      diseaseTypeList: params?.diseaseTypeList,
      projectId: params?.projectId,
      ids: params?.ids,
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
