export type lsType = {
  imgName: string;
  collectTime: string;
  diseaseName: string;
  area: string;
  length: string;
  deepth: string;
  facilityName: string;
  projectName: string;
  stationNo: string;
  imgUrl: string;
  id: any;
  direction: string;
  laneName: string;
};
export const facilityType = {
  0: '路基路面',
  1: '隧道',
  2: '桥梁',
  3: '涵洞',
  4: '人行道',
  5: '边坡',
};
export const roadType = {
  0: '城市道路',
  1: '公路',
};
export const roadLevelType = {
  0: '快速路',
  1: '主干道',
  2: '次干道',
  3: '支路',
  4: '高速公路',
  5: '一级公路',
  6: '二级公路',
  7: '三级公路',
  8: '四级公路',
};
export const roadLevelColor = {
  0: {
    A: '#76F0A4',
    B: '#3B86F6',
    C: '#F0AF3E',
    D: '#FF5656',
  },
  1: {
    优: '#76F0A4',
    良: '#3B86F6',
    中: '#9786FF',
    次: '#F0AF3E',
    差: '#FF5656',
  },
};
