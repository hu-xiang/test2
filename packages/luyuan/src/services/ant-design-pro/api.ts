// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { aesEcode } from '../../utils/crypto';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request('/admin/user/front/info', {
    params: { token: localStorage.getItem('token') },
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/auth/jwt/logout', {
    method: 'DELETE',
    params: { token: localStorage.getItem('token') },
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/auth/jwt/token', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

/** 获取菜单 get /api/login/account */
// export async function getmenuall() {
//   return request('/admin/menu/all', {
//     method: 'get',
//   });
// }

/** 获取菜单 get /api/login/account */
export async function getmenuall() {
  return request('/admin/user/front/menu/all', {
    method: 'get',
  });
}

/** 修改密码 get /api/login/account */
export async function updatePwd(newPassword: any, oldPassword: any, id: any) {
  const data = {
    newPassword: aesEcode(newPassword),
    oldPassword: aesEcode(oldPassword),
    userId: id,
  };
  return request('/admin/user/updatePwd', {
    method: 'put',
    data,
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 发布问题反馈 POST /center/feedback/add */
export async function addFeedback(textval: any, rateval: any, inpval: any) {
  return request<API.RuleListItem>('/traffic/center/feedback/add', {
    method: 'POST',
    data: {
      message: textval,
      score: rateval,
      questionType: inpval,
    },
  });
}
