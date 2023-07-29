const downloadFile = (content: any, filename: any) => {
  const a = document.createElement('a');
  a.href = content;
  a.download = filename;
  a.click();
};
export function exportCom(res: any, name?: any, type?: any) {
  const newname: string = res.response.headers.get('content-disposition')?.split('=')[1];
  const fileName = name || (newname && decodeURI(decodeURI(newname))) || '导出列表';
  const blob = new Blob([res.data], {
    type: type || 'application/vnd.ms-excel',
  });
  const objectUrl = URL.createObjectURL(blob);
  downloadFile(objectUrl, fileName);
}
export function exportErrorInfo(res: any, name?: any, type?: any) {
  const fileName = name || '错误列表';
  const blob = new Blob([res], {
    type: type || 'application/vnd.ms-excel',
  });
  const objectUrl = URL.createObjectURL(blob);
  downloadFile(objectUrl, fileName);
}
