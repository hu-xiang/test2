import { request } from 'umi';
import type { TableListParams } from './data';

type ParamsType = {
  keyword?: string;
  rolenames?: string;
} & Partial<TableListParams>;

/** 用户列表 GET /admin/user/page/list */
export async function rolelist(params: ParamsType) {
  const res = await request('/admin/role/list', {
    method: 'post',
    params: {
      keyword: params?.rolenames,
      // taskId: params?.id,
      page: params?.current,
      pageSize: params?.pageSize,
    },
  });

  return {
    data: res.data.rows,
    success: true,
    total: Number(res.data.total),
  };
}

/** 创建角色 post /admin/role */
export async function addrole(datas?: any) {
  return request('/admin/role/addRole', {
    method: 'get',
    params: datas,
  });
}

/** 根据角色id获取信息 get /admin/role */
export async function getroleinfo(id?: any) {
  return request(`/admin/role/${id}`, {
    method: 'get',
  });
}

/** 编辑角色 put /admin/menu */
export async function edtnewrole(id: any, obj?: any) {
  return request(`/admin/role/${id}`, {
    method: 'put',
    data: obj,
  });
}

/** 删除角色 delete /admin/role/del */
export async function delrole(id: any) {
  return request(`/admin/role/del/${id}`, {
    method: 'delete',
  });
}

/** 获取分配权限的树 GET /admin/menu/tree */
export async function getroletree() {
  return request('/admin/menu/tree', {
    method: 'GET',
  });
}

/** 获取分配权限被选中的树 GET /admin/menu/tree */
export async function getseledtree(id: any) {
  return request(`/admin/role/${id}/authority/menu`, {
    method: 'GET',
  });
}

/** 管理端获取角色按钮或资源列表 GET /admin/element/list */
export async function getbtnlist(code: any) {
  return request('/admin/element/list', {
    method: 'GET',
    params: code,
  });
}
/** 租户端获取角色按钮或资源列表 GET /element/tenant/list */
export async function getTenantBtnlist(code: any) {
  return request('/admin/element/tenant/list', {
    method: 'GET',
    params: code,
  });
}

/** 获取角色按钮或资源被选中列表 GET /admin/role/3/authority/element */
export async function getbtnseledlist(id: any) {
  return request(`/admin/role/${id}/authority/element`, {
    method: 'GET',
  });
}

/** 选中按钮资源发送请求 PUT /admin/role/10/authority/element/add */
export async function putbtnid(id: any, code: any) {
  return request(`/admin/role/${id}/authority/element/add`, {
    method: 'PUT',
    params: code,
  });
}

/** 取消选中按钮资源发送请求 PUT /admin/role/10/authority/element/add */
export async function delbtnid(id: any, code: any) {
  return request(`/admin/role/${id}/authority/element/remove`, {
    method: 'PUT',
    params: code,
  });
}

/** 保存分配权限 PUT /admin/role/' + id + '/authority/menu */
export async function savepower(id: any, code: any) {
  return request(`/admin/role/${id}/authority/menu`, {
    method: 'PUT',
    params: code,
  });
}
