import { request } from 'umi';

// 删除单个
export async function delInfo(id: any, options?: Record<string, any>) {
  return request(`/admin/tenant/del/tenant?id=${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}
// 导出Excel
export async function downloadExcel(param: any) {
  return request('/admin/tenant/export', {
    method: 'post',
    responseType: 'blob',
    // dataType: 'json',
    params: param,
    getResponse: true,
  });
}

/** 列表 */
export async function getListInfo(params: any) {
  const res = await request('/admin/tenant/list', {
    method: 'get',
    params: {
      serviceStatus: params?.serviceStatus,
      keyword: params?.keyword,
      type: params?.type,
      tenantType: params?.tenantType,
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
/** 创建 post  */
export async function addTenantUser(pathname: string, datas?: any, options?: Record<string, any>) {
  return request(pathname, {
    method: 'post',
    params: datas,
    ...(options || {}),
  });
}
/** 创建 post  */
export async function editTenantUser(datas?: any, options?: Record<string, any>) {
  return request('/admin/tenant/edit/tenant', {
    method: 'put',
    params: datas,
    ...(options || {}),
  });
}
// 修改服务状态
export async function editTenantStatus(datas?: any, options?: Record<string, any>) {
  return request('/admin/tenant/changeServiceStatus', {
    method: 'get',
    params: datas,
    ...(options || {}),
  });
}
// 生成租户编号
export async function generateNum() {
  return request(`/admin/tenant/generate`, {
    method: 'GET',
  });
}
// 校验超管账号
export async function checkAdmin(params: any, options?: Record<string, any>) {
  return request(`/admin/tenant/checkAdmin?administration=${params?.administration}`, {
    method: 'GET',
    ...(options || {}),
  });
}
// 校验域名
export async function checkRealName(params: any, options?: Record<string, any>) {
  return request(`/admin/tenant/checkRealName`, {
    method: 'GET',
    params,
    ...(options || {}),
  });
}
// 校验租户名称
export async function checkTenantName(params: any, options?: Record<string, any>) {
  return request(`/admin/tenant/checkTenantName?TenantName=${params?.TenantName}`, {
    method: 'GET',
    ...(options || {}),
  });
}
// 获取资源初始化数据
export async function getSourceData(params: any, options?: Record<string, any>) {
  return request(`/admin/deploy/list`, {
    method: 'GET',
    params,
    ...(options || {}),
  });
}
// 保存资源数据
export async function saveSourceData(params: any, options?: Record<string, any>) {
  return request(`/admin/deploy/add/tenantDeploy`, {
    method: 'post',
    params,
    ...(options || {}),
  });
}
// 查询资源中所有模型数据
export async function getModelData(options?: Record<string, any>) {
  return request(`/admin/deploy/model/list`, {
    method: 'get',
    ...(options || {}),
  });
}

// 在配置界面获取具体的参数
export async function getDetailData(params: any, options?: Record<string, any>) {
  return request(`/admin/deploy/param`, {
    method: 'get',
    params,
    ...(options || {}),
  });
}
// 租户超管账号界面列表查询信息
export async function getSuperNumData(params: any, options?: Record<string, any>) {
  return request(`/admin/tenant/queryAdminInfo`, {
    method: 'get',
    params,
    ...(options || {}),
  });
}
// 租户管理：获取省份
export async function province(params: any) {
  return request(`/admin/tenant/province`, {
    method: 'get',
    params,
  });
}

/** 租户配置管理：审核配置列表  */
export async function getAuditList(params: any) {
  return request('/admin/deploy/audit/list', {
    method: 'get',
    params: {
      DiseaseType: params.DiseaseType,
      tenantId: params.tenantId,
    },
  });
}
/** 租户配置管理 审核配置保存  */
export async function updateAuditList(data: any) {
  return request('/admin/deploy/audit/update', {
    method: 'post',
    data,
  });
}

/** 租户配置管理：审核配置列表  */
export async function getSeverityList(params: any) {
  return request('/admin/deploy/severity/list', {
    method: 'get',
    params: {
      DiseaseType: params.DiseaseType,
      tenantId: params.tenantId,
    },
  });
}
/** 租户配置管理 审核配置保存  */
export async function severityUpdate(data: any) {
  return request('/admin/deploy/severity/update', {
    method: 'post',
    data,
  });
}
