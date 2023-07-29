import { request } from 'umi';

/** 图片详情 */
// export async function getReviewAllInfo() {
//   return request(`/traffic/review/getALL`, {
//     method: 'get',
//   });
// }

/** 图片详情 */
export async function getNextInfo(params: any, tenant_id: any) {
  return request(`/traffic/review/nextImage`, {
    method: 'get',
    params,
    headers: {
      'tenant-id': tenant_id,
    },
  });
}

/** 保存 */
export async function saveImgInfo(data: any, tenant_id: any) {
  return request(`/traffic/review/save`, {
    method: 'post',
    data,
    headers: {
      'tenant-id': tenant_id,
    },
  });
}
/** 错题本新增 */
export async function addErr(data: any, tenant_id: any) {
  return request(`/traffic/wrongQuestionBook/add`, {
    method: 'post',
    data,
    headers: {
      'tenant-id': tenant_id,
    },
  });
}

/** 生成编号 */
export async function credisNO(params: any, tenant_id: any) {
  return request(`/traffic/review/generateDiseaseNo`, {
    method: 'get',
    params,
    headers: {
      'tenant-id': tenant_id,
    },
  });
}
