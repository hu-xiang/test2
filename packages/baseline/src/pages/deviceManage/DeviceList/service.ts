import { request } from 'umi';
// import { serviceError } from '../../../utils/commonMethod';

/** 设备列表  */
export async function devList(params: any) {
  const res = await request('/traffic/device/list', {
    method: 'get',
    params: {
      keyword: params?.keyword,
      page: params?.current,
      pageSize: params?.pageSize,
      type: params?.type,
    },
  });

  // if (res.status !== 0) {
  // serviceError(res);
  // }

  return {
    data: res?.data?.rows,
    success: true,
    total: res?.data?.total,
  };
}

/** 标定图片库列表  */
export async function imgList(params: any) {
  const res = await request('/traffic/device/img/page', {
    method: 'get',
    params: {
      channelId: params?.channelId,
      deviceId: params?.deviceId,
      page: params?.current,
      pageSize: params?.pageSize,
    },
  });

  // if (res.status !== 0) {
  //   serviceError(res);
  // }

  return {
    data: res.data.rows,
    success: true,
    total: res.data.total,
  };
}

// 批量导出Excel
export async function downlodExcel(param: any) {
  return request('/traffic/device/export', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    params: {
      // itemNo: param.itemNo,
      ids: param?.ids,
      keyword: param?.keyword,
    },
  });
}

// 导出标定图片库Excel
export async function downlodlibExcel(param: any) {
  return request('/traffic/device/export/param', {
    method: 'POST',
    responseType: 'blob',
    getResponse: true,
    params: {
      // itemNo: param.itemNo,
      ids: '',
      page: '',
      pageSize: '',
      keyword: param?.id,
    },
  });
}
// 下载安全证书
export async function downlodFile(param: any) {
  return request(`/traffic/device/download/${param?.id}`, {
    method: 'GET',
    responseType: 'blob',
    getResponse: true,
    // params: {
    //   // itemNo: param.itemNo,
    //   id: param?.id,
    // },
  });
}

/** 删除设备 */
export async function devdel(datas: any) {
  return request('/traffic/device/del', {
    method: 'DELETE',
    data: datas,
  });
}

/** 批量删除设备 */
export async function devlistdel(datas: any) {
  return request('/traffic/device/batchdel', {
    method: 'DELETE',
    data: datas,
  });
}

/** 获取组织机构树 get /api/admin/dept/tree/list */
export async function fetchTree() {
  return request('/traffic/device/dept', {
    method: 'get',
  });
}

// 新增
export async function deviceAdd(param: any) {
  return request('/traffic/device/add', {
    method: 'POST',
    params: param,
  });
}
// 编辑
export async function deviceEdt(param: any) {
  return request('/traffic/device/edit', {
    method: 'put',
    params: param,
  });
}
// 租户端编辑
export async function deviceTenEdt(param: any) {
  return request('/traffic/device/tenant/edit', {
    method: 'put',
    params: param,
  });
}

// 标定图片更新
export async function imgUpdata(param: any) {
  return request('/traffic/device/img/update', {
    method: 'put',
    data: param,
  });
}

/** 上传文件 POST /model/upload */
export async function uploadfile(datas: any) {
  return request('/traffic/device/upload', {
    method: 'POST',
    data: datas,
  });
}

/** 设备管理：生成设备编号 */
export async function getGenerate() {
  return request('/traffic/device/generate', {
    method: 'get',
  });
}

/** 删除安全证书 DELETE /model/file/dell */
export async function delfile(datas: any) {
  return request('/traffic/device/file/del', {
    method: 'DELETE',
    data: datas,
  });
}
/** 设备管理：升级-查询版本信息 */
export async function selectVersion(datas: any) {
  return request('/traffic/device/selectVersion', {
    method: 'GET',
    params: datas,
  });
}
/** 设备管理：升级-查询版本信息 */
export async function deviceUp(datas: any) {
  return request('/traffic/device/up', {
    method: 'POST',
    data: datas,
  });
}
/** 设备管理：查询设备状态 */
export async function deviceStatus(datas: any) {
  const res = await request('/traffic/device/status', {
    method: 'get',
    params: {
      deviceId: datas.deviceId,
    },
  });
  if (res?.data?.length) {
    res.data.forEach((item: any, i: number) => {
      item.id = i;
    });
  }
  return {
    data: res?.data || [],
    success: true,
    total: res.data?.length || 0,
  };
}
/** 设备管理：取消升级 */
export async function cancelUpgrade(datas: any) {
  return request('/traffic/device/cancel/upgrade', {
    method: 'GET',
    params: datas,
  });
}
