import { request } from 'umi';

/** 部门树 GET /admin/element/list */
export async function fetchTree() {
  return request('/admin/dept/tree/list', {
    method: 'get',
    params: {
      groupType: 1,
    },
  });
}

/** 创建新部门 post /admin/dept/addDept */
export async function postnewpart(obj: any) {
  return request('/admin/dept/addDept', {
    method: 'POST',
    data: obj,
  });
}

/** 删除部门 delete /admin/dept/del */
export async function delpart(id: any) {
  return request(`/admin/dept/del/${id}`, {
    method: 'delete',
  });
}

/** 编辑部门 PUT /admin/dept/updateDept */
export async function edtparts(code: any) {
  return request('/admin/dept/updateDept', {
    method: 'PUT',
    data: code,
  });
}

/** 根据id获取部门 get /admin/dept */
export async function getpartidinfo(id: any) {
  return request(`/admin/dept/${id}`, {
    method: 'get',
  });
}
// 获取所有父节点和同级节点
export function fetchParentTree(id: any, lv: any) {
  return request(`/admin/dept/tree/updatelist?id=${id}&deptLv=${lv}`, {
    method: 'get',
  });
}
