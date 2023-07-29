import { request } from 'umi';
import type { TableListParams } from './data';

type ParamsType = {
  keyword?: string;
} & Partial<TableListParams>;

// /** 用户列表 GET /admin/user/page/list */
// export async function page(data?: any, options?: Record<string, any>) {
//   return request('/admin/user/page/list', {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json;charset=UTF-8',
//     },
//     params: data,
//     ...(options || {}),
//   });
// }

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

/** 创建用户 post /admin/user */
export async function adduser(datas?: any, options?: Record<string, any>) {
  return request('/admin/user', {
    method: 'post',
    data: datas,
    ...(options || {}),
  });
}

/** 获取角色 get /admin/dict/queryForKV */
export async function getrole(code?: any) {
  return request('/admin/dict/queryForKV', {
    method: 'get',
    params: code,
  });
}

/** 获取组织机构树 get /api/admin/dept/tree/list */
export async function fetchTree(code?: any, options?: Record<string, any>) {
  return request('/admin/dept/tree/list', {
    method: 'get',
    params: code,
    ...(options || {}),
  });
}

/** 获取角色1的子级 get /api/admin/role/queryRoleForType */
export async function getrolechild(code?: any, options?: Record<string, any>) {
  return request('/admin/role/queryRoleForType', {
    method: 'get',
    params: code,
    ...(options || {}),
  });
}

/** 删除用户 delete /api/admin/user */
export async function deluser(id?: any) {
  return request(`/admin/user/del/user?id=${id}`, {
    method: 'delete',
  });
}

/** 重置密码 put /api/admin/user */
export async function resetPwd(id?: any) {
  return request(`/admin/user/resetPwd?id=${id}`, {
    method: 'put',
  });
}

/** 根据id搜索用户信息 put /api/admin/user */
export async function getuserinfo(id?: any) {
  return request(`/admin/user/det/${id}`, {
    method: 'get',
  });
}

/** 编辑用户信息 put /api/admin/user */
export async function edituserinfo(id?: any, obj?: any) {
  return request(`/admin/user/${id}`, {
    method: 'put',
    data: obj,
  });
}

/** 冻结用户信息 put /admin/user/frozenAccount */
export async function frozenAccount(id?: any, flag?: any) {
  return request(`/admin/user/frozenAccount?id=${id}&flag=${flag}`, {
    method: 'put',
  });
}

/** 验证账户名称 put /admin/user/checkUserName */
export async function checkUserName(obj?: any) {
  return request('/admin/user/checkUserName', {
    method: 'post',
    data: obj,
  });
}

// export function checkUserName(obj) {
//   return fetch({
//     url: '/admin/user/checkUserName',
//     method: 'post',
//     data: obj
//   });
// }

/** 验证手机号 put /admin/user/checkPhone */
export async function checkPhone(obj?: any) {
  return request('/admin/user/checkPhone', {
    method: 'post',
    data: obj,
  });
}

// export function checkPhone(obj) {
//   return fetch({
//     url: '/admin/user/checkPhone',
//     method: 'post',
//     data: obj
//   });
// }
