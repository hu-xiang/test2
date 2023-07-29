import { request } from 'umi';
// import { serviceError } from '../../../utils/commonMethod';

/** 列表 */
export async function getListInfo(params: any) {
  const res = await request('/traffic/disease/listByPage', {
    method: 'get',
    params: {
      taskType: params?.taskType,
      keyword: params?.keyword,
      startTime: params?.startTime,
      endTime: params?.endTime,
      disease: params?.disease,
      checkCode: params?.checkCode,
      diseaseImp: params?.diseaseImp,
      // fkFacilitiesId: params?.fkFacilitiesId,
      fkFacilitiesIdList: params?.fkFacilitiesIdList,
      page: params?.current,
      pageSize: params?.pageSize,
      openStatus: params?.openStatus,
      severity: params?.severity,
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

/** 删除 */
export async function dellistinfo(datas: any, options?: Record<string, any>) {
  return request(`/traffic/disease/list/batchDel`, {
    method: 'DELETE',
    data: datas,
    ...(options || {}),
  });
}
/** 图片详情单个病害详情 */
export async function getDiseaseInfo(id: any) {
  return request(`/traffic/disease/map/imgList`, {
    method: 'get',
    params: {
      id,
    },
  });
}
/** 图片详情 */
// export async function getDiseaseInfo(imgId: string) {
//   return request(`/traffic/disease/map/detail/${imgId}`, {
//     method: 'get',
//   });
// }
// 导出Excel
export async function downlodExcel(param: any) {
  return request('/traffic/disease/downlodExcel', {
    method: 'get',
    responseType: 'blob',
    getResponse: true,
    params: {
      // itemNo: param.itemNo,
      ids: param?.ids,
    },
  });
}
// 导出PDF
export async function downlodPDF(param: any) {
  return request('/traffic/disease/exportPdf', {
    method: 'get',
    responseType: 'blob',
    getResponse: true,
    params: {
      // itemNo: param.itemNo,
      ids: param?.ids,
    },
  });
}
// beta2.2新增的导出接口
// export async function exportDisease(param: any) {
//   return request('/traffic/disease/export', {
//     method: 'get',
//     responseType: 'blob',
//     getResponse: true,
//     params: param,
//   });
// }
// beta2.4新增的导出接口
export async function exportDisease(formdata: any) {
  return request(`/traffic/disease/export`, {
    method: 'post',
    responseType: 'blob',
    getResponse: true,
    // params: {
    //   ids: param?.ids,
    // },
    data: formdata,
  });
}
/** 设施名称列表 */
// export async function getFacilitityList(param?: any, options?: Record<string, any>) {
//   return request('/traffic/facilities/select', {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json;charset=UTF-8',
//     },
//     params: param,
//     ...(options || {}),
//   });
// }

/** 获取数据业务主键 POST /library/pk */
export async function getpk(options?: Record<string, any>) {
  return request('/traffic/library/pk', {
    method: 'POST',
    ...(options || {}),
  });
}
/** 批量导入上传照片 POST /traffic/disease/upload */
export async function uploadDiseaseImg(datas: any, options?: Record<string, any>) {
  return request('/traffic/disease/upload', {
    method: 'POST',
    data: datas,
    requestType: 'form', // 浏览器会自动识别并添加请求头 "Content-Type: multipart/form-data"
    ...(options || {}),
  });
}
/** 导入json */
export async function importJson(datas: any) {
  return request('/traffic/disease/importJsonFile', {
    method: 'POST',
    data: datas,
    requestType: 'form', // 浏览器会自动识别并添加请求头 "Content-Type: multipart/form-data"
  });
}

/** 桩号图片匹配 */
export async function stationMatch(datas: any) {
  return request('/traffic/disease/confirm', {
    method: 'put',
    params: datas,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  });
}

/** 获取pkid和libraryId */
export async function getLibPk() {
  return request('/traffic/disease/generatorIds', {
    method: 'get',
    // params: datas,
    // headers: {
    //   'Content-Type': 'multipart/form-data',
    // },
  });
}
