export type FormType = {
  standardName?: string;
  checkType?: string | number;
  page?: number;
  flag?: boolean;
  current?: number;
  pageSize?: number;
};

export const checkTypeValues = [
  {
    label: '全部',
    value: '',
  },
  {
    label: '道路技术指标',
    value: 1,
  },
  {
    label: '交通标志标线',
    value: 2,
  },
  {
    label: '隔离防护设施',
    value: 3,
  },
  {
    label: '科技管控设施',
    value: 4,
  },
  {
    label: '其他',
    value: 99,
  },
];
export const checkTypeDatas = {
  1: '道路技术指标',
  2: '交通标志标线',
  3: '隔离防护设施',
  4: '科技管控设施',
  99: '其他',
};
