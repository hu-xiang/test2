import { request } from 'umi';

const route_url = 'traffic';
// 全景地图
export async function getMapInfo(datas: any) {
  return request('/traffic/disease/map/list', {
    method: 'get',
    params: datas,
  });
}

export async function getDiseaseInfo(imgId: string, diseaseType: any) {
  console.log(diseaseType);
  return request(`/traffic/disease/map/detail/${imgId}`, {
    method: 'get',
    // 后端改了，不需要这个参数了
    // params: {
    //   diseaseType,
    // },
  });
}

// 巡检车辆实时信息
export async function getCarInfo(datas: any) {
  return request('/traffic/car/information', {
    method: 'get',
    params: datas,
  });
}
// 巡检地图车辆轨迹
export async function getCarLine() {
  return request(`/traffic/car/vehicleTrack`, {
    method: 'get',
  });
}
/** 根据id查询近1000条平整度信息 */
export async function getPlaneness(datas: any) {
  return request('/traffic/car/getPlaneness', {
    method: 'GET',
    params: datas,
  });
}
// 全景左侧圆
export async function getDiseasePieInfo(param: any) {
  return request(`/traffic/disease/map/pie`, {
    method: 'get',
    params: param,
  });
}
// 全景左侧柱
export async function getColInfo(type: any) {
  return request(`/traffic/disease/map/col`, {
    method: 'get',
    params: {
      type,
      diseaseImpArray: [0, 1],
    },
  });
}

export async function getSeverityTotal(type: any) {
  return request(`/traffic/disease/severity/total`, {
    method: 'get',
    params: {
      type,
    },
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

/** 今日新增病害数 */
export async function getDiseaseCount(param?: any, options?: Record<string, any>) {
  return request('/traffic/disease/map/count', {
    method: 'GET',
    params: param,
    ...(options || {}),
  });
}
/** 重点设施病害数据量top5 */
export async function getTop5Datas(param?: any) {
  const res = await request('/traffic/facilities/top', {
    method: 'get',
    params: {
      type: param?.type,
    },
  });
  let recData: any = [];
  if (res?.status === 0 && Object.keys(res?.data)?.length > 0) {
    recData = Object.keys(res?.data).map((it: any, index: any) => {
      const itemKey = Object.keys(res?.data[it])[0];
      const itemValue = res?.data[it][itemKey];
      const itRadio = itemValue ? itemValue.substr(0, itemValue.lastIndexOf('%')) : undefined;
      let itArrow;
      if (itRadio) {
        // eslint-disable-next-line
        itArrow = itRadio > 0 ? 1 : itRadio < 0 ? 2 : -1;
      }
      const absData = itemValue ? itemValue.replace('-', '') : undefined;
      return { id: index, facility: it, num: itemKey, radio: absData, ratioStatus: itArrow };
    });
  }
  return {
    data: recData,
    success: true,
    total: res?.data?.total,
  };
}
/** 设施统计 */
export async function getFacStaticesData(param?: any, options?: Record<string, any>) {
  return request('/traffic/facilities/total', {
    method: 'GET',
    params: param,
    ...(options || {}),
  });
}
/** 设施等级分布统计 */
export async function getDistributionData(param?: any, options?: Record<string, any>) {
  return request('/traffic/facilities/distribution', {
    method: 'GET',
    params: param,
    ...(options || {}),
  });
}
/** 近7天巡检里程统计 */
export async function getMileage7Data(param?: any, options?: Record<string, any>) {
  return request('/traffic/car/inspectionMileageStatistics', {
    method: 'GET',
    params: param,
    ...(options || {}),
  });
}
/** 累计巡检总里程数 */
export async function getTotalMileageData() {
  return request('/traffic/car/totalInspectionMileage', {
    method: 'GET',
  });
}
/** 今日新增总里程数 */
export async function getTodayMileageData() {
  return request('/traffic/car/totalMileage', {
    method: 'GET',
  });
}

// 后期新增的接口，获取巡检里程（今日和总的）
export async function getMileInfo() {
  return request(`/traffic/car/totalMileage`, {
    method: 'get',
  });
}
// 根据imgId查询车辆信息和平整度信息
export async function getCarInfos(param?: any) {
  return request(`/traffic/car/information`, {
    method: 'get',
    params: param,
  });
}
// 智能看板设备实时在线统计
export async function getDeviceOnline() {
  return request(`/traffic/device/online`, {
    method: 'get',
  });
}
// 巡检地图车辆轨迹
export async function getRealData(param?: any, options?: Record<string, any>) {
  return request(`/traffic/car/vehicleTrack`, {
    method: 'get',
    params: param,
    ...(options || {}),
  });
}
// 查询舒适度
export async function getComfort(params?: any) {
  return request(`/traffic/car/queryComfort`, {
    method: 'get',
    params,
  });
}
// 车辆和病害信息
export async function getCarData(param?: any) {
  return request(`/traffic/car/getList`, {
    method: 'get',
    params: param,
  });
}

export async function getDiseaseData(param?: any) {
  return request(`/traffic/disease/mapList`, {
    method: 'get',
    params: param,
  });
}
/** 图片详情单个病害详情 */
export async function getDiseaseImgInfo(id: any) {
  return request(`/traffic/disease/map/imgList`, {
    method: 'get',
    params: {
      id,
    },
  });
}
// 本年度总巡检里程
export async function getTotalMile() {
  return request(`/traffic/car/totalByYear`, {
    method: 'get',
  });
}
// 巡检看板:获取病害追踪信息
export async function getDiseaseTrackInfo(param: { diseaseId: string }) {
  return request(`/${route_url}/car/diseaseTrack`, {
    method: 'get',
    params: param,
  });
}
// 巡检看板:获取病害追踪日期下拉框
export async function getQueryDate(param: { diseaseId: string }) {
  return request(`/${route_url}/car/queryDate`, {
    method: 'get',
    params: param,
  });
}
// 单击单个物理病害落点的详情信息
export async function getPhpDetailInfo(param: { id: string }) {
  return request(`/${route_url}/screen/detail`, {
    method: 'get',
    params: param,
  });
}
// 单击单个物理病害落点的详情信息
export async function getSubDetailInfo(param: { id: string }) {
  return request(`/${route_url}/screen/subDetailById`, {
    method: 'get',
    params: param,
  });
}
// 地图聚合数据查询---新加的接口
export async function queryGeoDisease(datas: Record<string, any>, options?: Record<string, any>) {
  return request(`/${route_url}/disease/queryGeoDisease`, {
    method: 'POST',
    data: datas,
    timeout: 30000,
    ...(options || {}),
    // requestType: 'form',
  });
}

export async function getMarkTime(params: any) {
  return request(`/${route_url}/car/markTime`, {
    method: 'get',
    params,
  });
}

export async function getCurrentCarLine(params: any) {
  return request(`/${route_url}/car/queryTrack`, {
    method: 'get',
    params,
  });
}

export async function getMileages(param?: any, options?: Record<string, any>) {
  return request('/traffic/screen/diseaseStatistics', {
    method: 'GET',
    params: param,
    ...(options || {}),
  });
}
