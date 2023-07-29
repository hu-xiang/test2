import { request } from 'umi';
import type { TableListParams } from './data';

type ParamsType = {
  keyword?: string;
} & Partial<TableListParams>;

/** 问题反馈列表 GET /center/feedback/list */
export async function queList(params: ParamsType) {
  const res = await request('/traffic/center/feedback/list', {
    method: 'get',
    params: {
      keyword: params?.keyword,
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

/** 删除反馈 DELETE /center/feedback/del */
export async function questdel(id: any) {
  return request('/traffic/center/feedback/del', {
    method: 'DELETE',
    data: id,
  });
}

/** 编辑反馈 PUT /center/feedback/edit */
export async function questedit(id: any, status: any) {
  return request<API.RuleListItem>('/traffic/center/feedback/edit', {
    method: 'PUT',
    data: {
      id,
      dataStatus: status,
    },
  });
}
