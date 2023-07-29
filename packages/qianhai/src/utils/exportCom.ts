export function exportCom(res: any, name?: any, type?: any) {
  const downloadFile = (content: any, filename: any) => {
    const a = document.createElement('a');
    a.href = content;
    a.download = filename;
    a.click();
  };
  const fileName = name || decodeURI(res.response.headers.get('content-disposition').split('=')[1]);
  const blob = new Blob([res.data], {
    type: type || 'application/vnd.ms-excel',
  });
  const objectUrl = URL.createObjectURL(blob);
  downloadFile(objectUrl, fileName);
}
