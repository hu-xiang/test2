import { request } from 'umi';

// 年度数据
// 近5年检测里程
export async function getDetectMileage() {
  return request(`/traffic-ly/map/detectMileage`, {
    method: 'get',
  });
}
// 路面病害扣分分布
export async function getDiseaseDis(param: Record<string, number>) {
  return request(`/traffic-ly/map/diseaseDistribution`, {
    method: 'get',
    params: {
      roadType: param?.roadType,
      year: param?.year,
    },
  });
}
// 本年度累计总览/评分统计
export async function getYearOverview(param: Record<string, string>) {
  return request(`/traffic-ly/map/overview`, {
    method: 'get',
    params: {
      year: param?.year,
    },
  });
}
// 项目评分分布
export async function getProjectDistribution(param: Record<string, string>) {
  return request(`/traffic-ly/map/projectDistribution`, {
    method: 'get',
    params: {
      type: param?.type,
      year: param?.year,
    },
  });
}
// 项目道路等级分布
export async function getRoadDistributed(param: Record<string, number>) {
  return request(`/traffic-ly/map/roadDistributed`, {
    method: 'get',
    params: {
      roadType: param?.roadType,
      year: param?.year,
    },
  });
}
// 设施评分TOP5
export async function getFacTop5(param: Record<string, number>) {
  return request(`/traffic-ly/map/top`, {
    method: 'get',
    params: {
      year: param?.year,
    },
  });
}
// 具体项目
// 路面病害扣分分布
export async function getDeduDistribution(params: Record<string, any>) {
  return request(`/traffic-ly/projectDetails/deductionDistribution`, {
    method: 'get',
    params,
  });
}
// 项目信息
export async function getProjectInformation(params: Record<string, any>) {
  return request(`/traffic-ly/projectDetails/information`, {
    method: 'get',
    params,
  });
}
// 项目平均合格率、平均完好率
export async function getScoreAvg(params: Record<string, string>) {
  return request(`/traffic-ly/projectDetails/scoreAvg`, {
    method: 'get',
    params,
  });
}
// 车道评分Top5
export async function getProjectTop5(params: Record<string, any>) {
  return request(`/traffic-ly/projectDetails/top`, {
    method: 'get',
    params,
  });
}
// 单元评分分布
export async function getUnitDistribution(params: { id: string; type: string }) {
  return request(`/traffic-ly/projectDetails/unitDistribution`, {
    method: 'get',
    params,
  });
}
// 单元评分情况
export async function getUnitScore(params: { direction: number; id: string; type: string }) {
  return request(`/traffic-ly/projectDetails/unitScore`, {
    method: 'get',
    params,
  });
}
// 项目所有落点和病害图片信息
export async function getProjLocation(params: Record<string, any>) {
  return request(`/traffic-ly/map/placement`, {
    method: 'get',
    params,
  });
}
// 项目病害信息
export async function getProjDiseaInfo(params: Record<string, any>) {
  return request(`/traffic-ly/map/disease`, {
    method: 'get',
    params,
  });
}
