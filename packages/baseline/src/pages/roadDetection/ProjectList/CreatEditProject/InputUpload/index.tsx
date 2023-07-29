import { Upload, message } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import styles from './styles.less';
import { commonRequest } from '../../../../../utils/commonMethod';

type Iprops = {
  placeholder?: string;
  width?: number;
  index?: number;
  onUpload: Function;
  type: string;
  fileName?: string;
};

const requestList = [{ url: '/traffic/road/project/check/import', method: 'post' }];

const InputUpload: React.FC<Iprops> = (props) => {
  const [fileName, setFileName] = useState<any>('');
  useEffect(() => {
    setFileName(props?.fileName);
  }, []);

  const beforeUploads = (fileinfos: any) => {
    if (fileName) {
      message.error({
        content: '只能上传一个文件!',
        key: '只能上传一个文件!',
      });
      return false;
    }

    const isExcel = /(xls|xlsx)$/i.test(fileinfos.name);
    if (!isExcel) {
      message.error(`请传.xls、.xlsx的文件！`);
      return false;
    }
    const reader = new FileReader();
    reader.readAsDataURL(fileinfos);
    reader.onload = async () => {
      const params: any = new FormData();
      params.append('file', fileinfos);
      params.append('checkType', props.type === 'pavmentFile' ? 1 : 2);
      const res = await commonRequest({ ...requestList[0], params });

      if (res?.status === 0) {
        setFileName(fileinfos.name);
        props.onUpload(props.index, props.type, fileinfos, fileinfos.name);
      }
    };
    return false;
  };

  const removeFile = async () => {
    const hide = message.loading({
      content: '正在删除',
      key: '正在删除',
    });
    try {
      hide();
      message.success({
        content: `删除${fileName}成功`,
        key: '删除成功',
      });
      setFileName('');
      props.onUpload(props.index, props.type, '', '');
      return true;
    } catch (error) {
      hide();
      message.error({
        content: '删除失败!',
        key: '删除失败!',
      });
      return false;
    }
  };

  return (
    <div
      className={styles.inputUpload}
      style={props.width ? { width: `${props.width}px` } : { width: '440px' }}
    >
      <div className={styles.fileContent}>
        {fileName ? (
          <p className={styles.fileBox}>
            <span className={styles.fileNameStyle} title={fileName}>
              {fileName}
            </span>
            <DeleteOutlined onClick={removeFile} className={styles.fileRemoveBtn} />
          </p>
        ) : (
          <span className={styles.placeholderStyle}>{props.placeholder}</span>
        )}
        <div className={styles.rightUploadBtn}>
          <Upload maxCount={1} beforeUpload={beforeUploads} showUploadList={false}>
            <UploadOutlined className={styles.uploadIcon} />
          </Upload>
        </div>
      </div>
    </div>
  );
};
export default InputUpload;
