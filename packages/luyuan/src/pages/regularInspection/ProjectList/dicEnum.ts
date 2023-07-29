// 车道方向
export const directionEnum: any = {
  0: '上行',
  1: '下行',
};

// 路面类型
export const landTypeEnum: any = {
  2: '沥青路面',
  1: '水泥路面',
};

// 报表文件
export const reportlist: any = [
  { placeholder: '请上传路况及养护状况评定表', filePath: 'evaluationFile' },
  { placeholder: '请上传路面病害调查表', filePath: 'questionnaireFile' },
  { placeholder: '请上传道路弯沉原始记录表', filePath: 'recordFile' },
  { placeholder: '请上传街景图', filePath: 'streetViewFile' },
  { placeholder: '请上传病害信息', filePath: 'diseaseFile' },
];

// 路面类型
export const fileStatus: any = {
  uploading: '正在上传',
  done: '完成上传',
  error: '重新上传',
};
