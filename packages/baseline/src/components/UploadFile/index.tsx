import { Upload, message, Button, Image } from 'antd';
import { useEffect, useState } from 'react';
import { request, useModel } from 'umi';
import styles from './styles.less';
import { UploadOutlined, PaperClipOutlined, DeleteOutlined } from '@ant-design/icons';

type Iprops = {
  uploadUrl: string;
  removeUrl: string;
  id?: string;
  width?: number;
  disabled?: boolean;
};
const UploadPic: React.FC<Iprops> = (props) => {
  const { filePath, setFilePath, fileName, setFileName } = useModel<any>('file');
  const [fileList, setFileList] = useState<any>([]);
  const [filenum, setFilenum] = useState(0);
  const [visible, setVisible] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { disabled = false } = props;

  useEffect(() => {
    setTimeout(() => {
      setFilenum(filePath ? 1 : 0);
      if (filePath && !fileList.length) {
        setFileList([
          {
            uid: 1,
            filePath,
            name: fileName,
          },
        ]);
      }
      if (!filePath) {
        setFileList([]);
      }
    }, 0);
  }, [filePath]);

  useEffect(() => {
    setTimeout(() => {
      if (fileName) {
        const index = fileName.lastIndexOf('.');
        setFirstName(fileName.substring(0, index));
        setLastName(fileName.substring(index, fileName.length));
      }
    }, 0);
  }, [fileName]);

  /** 上传图片 */
  const uploadUrl = (data: any) => {
    return request(`${props.uploadUrl}`, {
      method: 'POST',
      data,
    });
  };

  /** 删除图片 */
  const removeUrl = (data: any) => {
    return request(`${props.removeUrl}`, {
      method: 'DELETE',
      data,
    });
  };

  const beforeUploads = (fileinfos: any) => {
    if (filenum === 1) {
      message.error({
        content: '只能上传一个文件!',
        key: '只能上传一个文件!',
      });
      return false;
    }
    const isJpgOrPng = fileinfos.type === 'image/jpeg' || fileinfos.type === 'image/png';
    if (!isJpgOrPng) {
      message.error(`请传jpg、jpeg、png的图片！`);
      return false;
    }
    const reader = new FileReader();
    reader.readAsDataURL(fileinfos);
    reader.onload = async () => {
      const formData = new FormData();
      formData.append('file', fileinfos);
      try {
        const res = await uploadUrl(formData);
        if (res.status === 0) {
          const imgurlList: any = [
            {
              uid: fileinfos.uid,
              filePath: res.data.filePath,
              name: fileinfos.name,
            },
          ];
          setFilenum(1);
          setFileName(fileinfos.name);
          setFileList(imgurlList);
          setFilePath(res.data.filePath || res.data);
        }
        //  else {
        //   message.error({
        //     content: res.message,
        //     key: res.message,
        //   });
        // }
        return false;
      } catch (error) {
        return false;
      }
    };
    return false;
  };

  const removeFile = async () => {
    if (disabled) return;
    const formData = new FormData();
    formData.append('path', filePath);
    const hide = message.loading({
      content: '正在删除',
      key: '正在删除',
    });
    if (props.id) {
      formData.append('id', props.id);
    }
    try {
      const res = await removeUrl(formData);
      hide();
      if (res.status === 0) {
        message.success({
          content: `删除${fileName}成功`,
          key: '删除成功',
        });
        setFilenum(0);
        setFileList([]);
        setFilePath('');
        setFileName('');
      }
      // else {
      //   message.error({
      //     content: res.message,
      //     key: res.message,
      //   });
      // }
    } catch (error) {
      hide();
      message.error({
        content: '删除失败!',
        key: '删除失败!',
      });
    }
  };

  return (
    <div className={styles.uploadPic}>
      <Upload maxCount={1} beforeUpload={beforeUploads} showUploadList={false}>
        <Button icon={<UploadOutlined />} style={{ height: '40px' }} disabled={disabled}>
          上传图片
        </Button>
      </Upload>
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
      {filePath ? (
        <div className={styles.fileBox}>
          <div className="fileIcon">
            <PaperClipOutlined />
          </div>
          <div className={styles.fileName} title={firstName} onClick={() => setVisible(true)}>
            <div
              className={styles.firstName}
              style={props.width ? { maxWidth: `${props.width}px` } : { maxWidth: '200px' }}
            >
              {firstName}
            </div>
            <div className={styles.lastName}>{lastName}</div>
          </div>
          <div className={`${disabled ? styles.noRemove : styles.removeBnt}`}>
            <DeleteOutlined
              onClick={removeFile}
              className={`${disabled ? styles.noCursor : null}`}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default UploadPic;
