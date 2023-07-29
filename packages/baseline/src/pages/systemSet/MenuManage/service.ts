import { request } from 'umi';
import type { TableListParams } from './data';

/** 获取菜单树 get /admin/menu/tree */
export async function fetchTree(obj?: any) {
  return request('/admin/menu/tree', {
    method: 'get',
    params: obj,
  });
}

/** 根据菜单id获取信息 get /api/menu */
export async function getmenuinfo(id?: any) {
  return request(`/admin/menu/${id}`, {
    method: 'get',
  });
}

type ParamsType = {
  keyword?: string;
} & Partial<TableListParams>;

/** 按钮或资源列表 GET /admin/element/list */
export async function btnlist(params: ParamsType) {
  const res = await request('/admin/element/list', {
    method: 'get',
    params: {
      name: params?.name,
      menuId: params.id || -1,
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

/** 新建菜单 post /admin/menu */
export async function newcrtmenu(obj?: any) {
  return request('/admin/menu', {
    method: 'post',
    data: obj,
  });
}

/** 编辑菜单 put /admin/menu */
export async function edtnewtmenu(id: any, obj?: any) {
  return request(`/admin/menu/${id}`, {
    method: 'put',
    data: obj,
  });
}

/** 删除菜单 delete /admin/menu */
export async function delmenu(id: any) {
  return request(`/admin/menu/${id}`, {
    method: 'delete',
  });
}

// 按钮
/** 添加按钮 delete /admin/element */
export async function addmenubtn(obj: any) {
  return request('/admin/element', {
    method: 'post',
    data: obj,
  });
}

/** 根据id获取按钮信息 delete /admin/element */
export async function getmenubtn(id: any) {
  return request(`/admin/element/${id}`, {
    method: 'get',
  });
}

/** 删除按钮 delete /admin/element */
export async function delmenubtn(id: any) {
  return request(`/admin/element/${id}`, {
    method: 'delete',
  });
}

/** 编辑按钮 delete /admin/element */
export async function putmenubtn(id: any, obj: any) {
  return request(`/admin/element/${id}`, {
    method: 'put',
    data: obj,
  });
}
