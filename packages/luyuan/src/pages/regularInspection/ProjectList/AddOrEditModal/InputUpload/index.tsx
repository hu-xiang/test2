import { Upload, Image, message } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { uploadFile } from '../../serves';
import styles from './styles.less';

type Iprops = {
  placeholder?: string;
  width?: number;
  isCanDel?: boolean;
  isCanPreview?: boolean;
  fileType?: any[];
  index?: number;
  filePath?: string;
  onUpload: Function;
  type: string;
};

const InputUpload: React.FC<Iprops> = (props) => {
  const [visible, setVisible] = useState(false);
  const [filePath, setFilePath] = useState('');
  const [fileName, setFileName] = useState('');
  useEffect(() => {
    let lastName = '';
    if (props.filePath) {
      const index = props.filePath.lastIndexOf('.');
      lastName = props.filePath.substring(index, props.filePath.length);
    }
    switch (props.type) {
      case 'evaluationFile':
        if (props.filePath) setFileName(`路况及养护状况评定表${lastName}`);
        break;
      case 'questionnaireFile':
        if (props.filePath) setFileName(`路面病害调查表${lastName}`);
        break;
      case 'recordFile':
        if (props.filePath) setFileName(`道路弯沉原始记录表${lastName}`);
        break;
      case 'streetViewFile':
        if (props.filePath) setFileName(`街景图${lastName}`);
        break;
      case 'diseaseFile':
        if (props.filePath) setFileName(`病害信息${lastName}`);
        break;
      default:
        setFileName('');
        break;
    }
  }, []);

  const beforeUploads = (fileinfos: any) => {
    if (filePath) {
      message.error({
        content: '只能上传一个文件!',
        key: '只能上传一个文件!',
      });
      return false;
    }

    if (props.type === 'streetViewFile') {
      const isJpgOrPng =
        fileinfos.type === 'image/jpeg' ||
        fileinfos.type === 'image/png' ||
        fileinfos.type === 'image/jpg';
      if (!isJpgOrPng) {
        message.error(`请传jpg、jpeg、png的图片！`);
        return false;
      }
    }

    if (props.type === 'diseaseFile') {
      const isTxt = /(txt)$/i.test(fileinfos.name);
      if (!isTxt) {
        message.error(`请传.txt的文件！`);
        return false;
      }
    }

    const isExcel = /(xls|xlsx)$/i.test(fileinfos.name);
    const excelTpeList = ['evaluationFile', 'questionnaireFile', 'recordFile'];
    if (excelTpeList.includes(props.type)) {
      if (!isExcel) {
        message.error(`请传.xls、.xlsx的文件！`);
        return false;
      }
    }
    const reader = new FileReader();
    reader.readAsDataURL(fileinfos);
    reader.onload = async () => {
      const formData = new FormData();
      formData.append('file', fileinfos);
      const index = fileinfos.name.lastIndexOf('.');
      const lastName = fileinfos.name.substring(index, fileinfos.name.length);
      const res = await uploadFile(formData);
      if (res.status === 0) {
        switch (props.type) {
          case 'evaluationFile':
            setFileName(`路况及养护状况评定表${lastName}`);
            break;
          case 'questionnaireFile':
            setFileName(`路面病害调查表${lastName}`);
            break;
          case 'recordFile':
            setFileName(`道路弯沉原始记录表${lastName}`);
            break;
          case 'streetViewFile':
            setFileName(`街景图${lastName}`);
            break;
          case 'diseaseFile':
            setFileName(`病害信息${lastName}`);
            break;
          default:
            setFileName(fileinfos.name);
            break;
        }

        setFilePath(res.data);
        props.onUpload(props.index, props.type, res.data, fileinfos.name);
      } else {
        message.error({
          content: res.message,
          key: res.message,
        });
      }
    };
    return false;
  };

  const removeFile = async () => {
    // const formData = new FormData();
    // formData.append('path', filePath);
    const hide = message.loading({
      content: '正在删除',
      key: '正在删除',
    });
    // if (props.id) {
    //   formData.append('id', props.id);
    // }
    try {
      // const res = await delImage(formData);
      hide();
      // if (res.status === 0) {
      message.success({
        content: `删除${fileName}成功`,
        key: '删除成功',
      });
      setFilePath('');
      setFileName('');
      props.onUpload(props.index, props.type, filePath, fileName);
      // } else {
      //   message.error({
      //     content: res.message,
      //     key: res.message,
      //   });
      // }
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
      style={props.width ? { width: `${props.width}px` } : { width: '300px' }}
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

      {visible && (
        <Image
          src={filePath}
          style={{ display: 'none' }}
          preview={{
            visible,
            src: filePath,
            onVisibleChange: (value) => {
              setVisible(value);
            },
          }}
        />
      )}
    </div>
  );
};
export default InputUpload;
