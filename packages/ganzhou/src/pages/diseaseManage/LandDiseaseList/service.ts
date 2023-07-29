import { request } from 'umi';
import { serviceError } from 'baseline/src/utils/commonMethod';

/** 列表 */
export async function getListInfo(params: any) {
  const res = await request('/traffic-km/under/list', {
    method: 'get',
    params: {
      startTime: params?.startTime,
      endTime: params?.endTime,
      roadName: params?.roadName,
      keyword: params?.keyword,
      page: params?.current,
      pageSize: params?.pageSize,
      riskLvList: params?.riskLvList,
      diseaseTypeList: params?.diseaseTypeList,
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

/** 新增地下病害 */
export async function underAdd(datas: any) {
  return request('/traffic-km/under/add', {
    method: 'POST',
    data: datas,
  });
}

/** 修改  */
export async function underEdit(datas: any) {
  return request('/traffic-km/under/edit', {
    method: 'PUT',
    data: datas,
  });
}

/** 删除 */
export async function underDel(datas: any) {
  return request('/traffic-km/under/del', {
    method: 'DELETE',
    data: datas,
  });
}

/** 批量删除 */
export async function underBatchDel(datas: any) {
  return request('/traffic-km/under/batchDel', {
    method: 'DELETE',
    data: datas,
  });
}

/** 上传图片 */
export async function underUpload(data: any) {
  return request('/traffic-km/under/upload', {
    method: 'POST',
    data,
  });
}

/** 删除图片 */
export async function underDelFile(data: any) {
  return request('/traffic-km/under/delFile', {
    method: 'DELETE',
    data,
  });
}

/** 查看定位 */
export async function underLocation(params: any) {
  return request('/traffic-km/under/location', {
    method: 'get',
    params: {
      id: params,
    },
  });
}
