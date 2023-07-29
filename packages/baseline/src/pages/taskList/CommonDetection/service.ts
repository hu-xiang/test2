import { request } from 'umi';
import type { TableListParams } from './data.d';

type ParamsType = {
  code?: string;
  types?: number;
} & Partial<TableListParams>;

export async function queryTaskList(params: any) {
  const res = await request('/traffic/task/list', {
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

/** 获取数据业务主键 POST /task/pk */
export async function getTaskpk() {
  return request('/traffic/task/pk', {
    method: 'POST',
  });
}

/** 图库列表 GET /library/list */
export async function libList(data?: any, options?: Record<string, any>) {
  return request('/traffic/library/list', {
    method: 'GET',
    params: data,
    ...(options || {}),
  });
}

/** 创建任务 POST /task/add */
export async function addtask(datas: any, options?: Record<string, any>) {
  return request('/traffic/task/add', {
    method: 'POST',
    data: datas,
    ...(options || {}),
  });
}

/** 显示编辑信息 POST /task/showEdit */
export async function showEdit(datas: any, options?: Record<string, any>) {
  return request('/traffic/task/showEdit', {
    method: 'GET',
    params: datas,
    ...(options || {}),
  });
}
// 详情接口
export async function queryDetailInfo(id: string) {
  return request('/traffic/task/detail', {
    method: 'put',
    params: {
      id,
    },
  });
}

// 详情列表接口
export async function queryDetailList(params: ParamsType) {
  const res = await request('/traffic/task/detail/list', {
    method: 'get',
    params: {
      code: params?.code,
      taskId: params?.id,
      page: params?.current,
      pageSize: params?.pageSize,
      type: params?.types,
    },
  });

  return {
    data: res.data.rows,
    success: true,
    total: Number(res.data.total),
  };
}

// 模型列表
export async function getModelListInfo() {
  const res = await request('/traffic/model/modelList', {
    method: 'get',
  });

  return {
    data: res.data || [],
    success: true,
    total: res?.data?.total || 0,
  };
}

// 单个图片病害详情接口
export async function queryImgInfo(taskId: string, imgId: string) {
  return request('/traffic/task/imgDetail', {
    method: 'get',
    params: {
      taskId,
      imgId,
    },
  });
}
// 单个图片病害详情接口
export async function startTask(id: string) {
  return request('/traffic/task/startTask', {
    method: 'put',
    params: {
      id,
    },
  });
}

// 编辑任务
export async function edittask(ids: any, taskNames: any, idsLists: any, taskType: any) {
  return request('/traffic/task/edit', {
    method: 'PUT',
    params: {
      id: ids,
      taskName: taskNames,
      idsList: idsLists,
      modelId: taskType,
    },
  });
}

// 人工修订新增
export async function addRevision(params: any) {
  return request('/traffic/task/revision/add', {
    method: 'post',
    params,
  });
}
// 人工修订列表
export async function getRevisionList(params: any) {
  return request('/traffic/task/revision/list', {
    method: 'get',
    params,
  });
}
// 删除人工修订
export async function delRevision(id: string) {
  return request('/traffic/task/revision/del', {
    method: 'delete',
    params: {
      id,
    },
  });
}

// 导出PDF
export async function educefile(id: any) {
  return request('/traffic/task/downlodPdfForTask', {
    method: 'get',
    responseType: 'blob',
    getResponse: true,
    params: {
      taskId: id,
    },
  });
}

// 导出Excel
export async function educeExcel(id: any) {
  return request('/traffic/task/downlodExcel', {
    method: 'get',
    responseType: 'blob',
    getResponse: true,
    params: {
      taskId: id,
    },
  });
}
// 删除任务
export async function delTask(id: any) {
  return request('/traffic/task/del', {
    method: 'delete',
    params: {
      taskId: id,
    },
  });
}
// 图片列表
export async function getimglist(params: any) {
  const res = await request('/traffic/img/list', {
    method: 'get',
    params: {
      keyword: params?.keyword,
      page: params?.current,
      pageSize: params?.pageSize,
      libraryId: params?.id,
    },
  });

  return {
    data: res.data.rows,
    success: true,
    total: res?.data?.total || 0,
  };
}
