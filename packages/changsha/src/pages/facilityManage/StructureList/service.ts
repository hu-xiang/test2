import { request } from 'umi';
/** 获取组织机构树 get /api/admin/dept/tree/list */
export async function fetchTree() {
  return request('/traffic/device/dept', {
    method: 'get',
  });
}

// 查询道路列表
export async function getRoadList() {
  return request('/traffic/facilities/select', {
    method: 'get',
  });
}
// 获取道路详情
export async function getRoadInfo(params: any) {
  return request('/traffic/facilities/showEdit', {
    method: 'get',
    params,
  });
}
// 结构物 保存
export async function structureSave(data: any) {
  return request('/sm-traffic-hn/structure/save', {
    method: 'post',
    data,
  });
}

// 获取道路详情
export async function structureDel(params: any) {
  return request('/sm-traffic-hn/structure/delete', {
    method: 'DELETE',
    params,
  });
}
