export type FormType = {
  standardName?: string;
  checkType?: string | number;
  page?: number;
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
export const plainOptions = [
  { label: '正常', value: '1', disabled: true, defaultChecked: true },
  { label: '错误', value: '2', disabled: false },
  { label: '缺失', value: '3', disabled: false },
  { label: '遮档', value: '4', disabled: false },
  { label: '损坏', value: '5', disabled: false },
  { label: '磨损', value: '6', disabled: false },
  { label: '不良', value: '7', disabled: false },
];
