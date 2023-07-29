import { request } from 'umi';

// 获取工作台前四个数据
export async function getbenchimginfo() {
  return request('/traffic/center/info', {
    method: 'get',
  });
}
// 今日上传图片数量变化图
export async function getline1info() {
  return request('/traffic/center/getImageNumber', {
    method: 'GET',
  });
}
// 今日AI检测图片数量变化图
export async function getline2info() {
  return request('/traffic/center/AICheckNumber', {
    method: 'get',
  });
}
