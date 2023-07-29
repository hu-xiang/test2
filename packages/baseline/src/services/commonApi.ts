/*
 * @Author: wf
 * @Date: 2022-06-02 10:06:16
 * @Last Modified by: wf
 * comment 一个接口被多个页面引用时可以将接口放入公共文档中
 * @Last Modified time: 2022-11-26 09:52:45
 */

import { request } from 'umi';

type TableListParams = {
  id: string;
  status?: string;
  name?: string;
  desc?: string;
  key?: number;
  pageSize?: number;
  current?: number;
  filter?: Record<string, any>;
  sorter?: Record<string, any>;
};
type ParamsType = {
  keyword?: string;
} & Partial<TableListParams>;

/** 设施名称列表 */
export async function getFacilitityList(param?: any, options?: Record<string, any>) {
  return request('/traffic/facilities/select', {
    method: 'GET',
    params: param,
    ...(options || {}),
  });
}
/** 设施名称列表 for select */
export async function getFacilititySelects(param?: any) {
  const res = await request('/traffic/facilities/select', {
    method: 'GET',
    params: param,
  });
  return res.data ? res.data.map((o: any) => ({ label: o.facilitiesName, value: o.id })) : [];
}
/** 获取组织机构树 get /api/admin/dept/tree/list */
export async function fetchTree(code?: any, options?: Record<string, any>) {
  return request('/admin/dept/tree/list', {
    method: 'get',
    params: code,
    ...(options || {}),
  });
}

/** 重置密码 put /api/admin/user */
export async function resetPwd(id?: any) {
  return request(`/admin/user/resetPwd?id=${id}`, {
    method: 'put',
  });
}
/** 冻结用户信息 put /admin/user/frozenAccount */
export async function frozenAccount(id?: any, flag?: any) {
  return request(`/admin/user/frozenAccount?id=${id}&flag=${flag}`, {
    method: 'put',
  });
}
/** 用户列表 GET /admin/user/page/list */
export async function userlist(params: ParamsType) {
  const res = await request('/admin/user/page/list', {
    method: 'get',
    params: {
      name: params?.name,
      taskId: params?.id,
      page: params?.current,
      limit: params?.pageSize,
      prop: 'username',
    },
  });

  return {
    data: res.data.rows,
    success: true,
    total: Number(res.data.total),
  };
}

/** 获取菜单树，所有菜单 get /admin/menu/tree */
export async function getAdminRole(obj?: any) {
  return request('/admin/menu/tree', {
    method: 'get',
    params: obj,
  });
}
/** 租户根据角色id获取信息 get /admin/role */
export async function getTenantRole(obj?: any) {
  return request(`/admin/menu/role/tree`, {
    method: 'get',
    params: obj,
  });
}
// 获取附属设施类型
export async function getFacilitiesType() {
  return request('/traffic/facilitiesCheck/facilitiesType', {
    method: 'get',
  });
}
