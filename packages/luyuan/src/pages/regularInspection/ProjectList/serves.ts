import { request } from 'umi';
import { serviceError } from 'baseline/src/utils/commonMethod';

/** 列表 */
export async function getListInfo(params: any) {
  const res = await request('/traffic-ly/project/page', {
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

/** 新增编辑保存 */
export async function addOrEdit(data: any) {
  return request('/traffic-ly/project/save', {
    method: 'POST',
    data,
  });
}
// 导出文件
export async function exportProject(data: any) {
  return request(`/traffic-ly/project/export`, {
    method: 'post',
    responseType: 'blob',
    getResponse: true,
    data,
  });
}
/** 批量删除 */
export async function batchdelProject(data: any) {
  return request('/traffic-ly/project/delete', {
    method: 'DELETE',
    data,
  });
}

/** 上传报表文件 */
export async function uploadFile(data: any) {
  return request('/traffic-ly/project/upload', {
    method: 'POST',
    data,
  });
}

/** 上传图片 */
export async function uploadImg(data: any) {
  return request('/traffic-ly/project/img/upload', {
    method: 'POST',
    data,
  });
}

/** 删除图片 */
export async function delImage(data: any) {
  return request('/traffic-ly/project/img/delete', {
    method: 'DELETE',
    data,
  });
}

/** 获取图片列表 */
export async function getImgList(params: any) {
  const res = await request('/traffic-ly/project/img/page', {
    method: 'get',
    params: {
      projectId: params.projectId,
      laneId: params.laneId,
      keyword: params.keyword,
      page: params.current,
      pageSize: params.pageSize,
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

/** 获取编辑详情信息 */
export async function getProjectEditInfo(projectId: any) {
  return request('/traffic-ly/project/edit/info', {
    method: 'get',
    params: {
      projectId,
    },
  });
}

/** 获取项目车道信息 */
export async function getProjectLane(projectId: any) {
  return request('/traffic-ly/project/lane', {
    method: 'get',
    params: {
      projectId,
    },
  });
}

/** 根据上下行获取项目车道 */
export async function getLaneBydirect(params: any) {
  return request('/traffic-ly/project/queryLaneBydirect', {
    method: 'get',
    params: {
      projectId: params.projectId,
      direction: params.direction,
    },
  });
}

/** 获取项目详情指标得分 */
export async function getProjectScore(laneId: any) {
  return request('/traffic-ly/project/queryScore', {
    method: 'get',
    params: {
      laneId,
    },
  });
}

/** 获取所属设施 */
export async function selectFacilities() {
  return request('/traffic/facilities/select', {
    method: 'get',
  });
}

/** 获取位置 */
export async function queryFacilitiesLocation(projectId: any) {
  return request('/traffic-ly/project/queryFacilitiesLocation', {
    method: 'get',
    params: {
      projectId,
    },
  });
}
