import { Upload, message, Popconfirm } from 'antd';
import { useEffect, useState } from 'react';
import { DeleteOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { request } from 'umi';
import styles from './styles.less';

type Iprops = {
  onRemove: Function;
  onUpload: Function;
  uploadUrl: string;
  removeUrl: string;
  fileName: string;
  filePath: string;
};
const UploadPic: React.FC<Iprops> = (props) => {
  const [filePath, setFilePath] = useState<any>('');
  const [fileName, setFileName] = useState<any>('');
  const [fileList, setFileList] = useState<any>([]);
  const [filenum, setFilenum] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setFilePath(props.filePath);
      setFileName(props.fileName);
      setFilenum(props.filePath ? 1 : 0);
      if (props.filePath) {
        setFileList([
          {
            uid: 1,
            filePath: props.filePath,
            fileName: props.fileName,
          },
        ]);
      }
    }, 0);
  }, [props]);

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
      message.error(`${fileinfos.name}不是一个图片文件`);
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
          setFilePath(res.data.filePath);
          const imginfo = {
            uid: fileinfos.uid,
            filePath: res.data.filePath,
            name: fileinfos.name,
          };
          const imgurlList: any = [];
          imgurlList.push(imginfo);
          setFileList(imgurlList);
          setFilenum(1);
          setFileName(fileinfos.name);
          props.onUpload({
            fileName: fileinfos.name,
            filePath: res.data.filePath,
            fileinfos,
            fileList: imgurlList,
          });
        } else {
          // message.error({
          //   content: res.message,
          //   key: res.message,
          // });
        }
        return false;
      } catch (error) {
        return false;
      }
    };
    return false;
  };

  const removeFile = async (file: any) => {
    const formData = new FormData();
    formData.append('path', file.filePath || filePath);
    const hide = message.loading({
      content: '正在删除',
      key: '正在删除',
    });
    try {
      const res = await removeUrl(formData);
      hide();
      if (res.status === 0) {
        message.success({
          content: '删除成功',
          key: '删除成功',
        });
        setFilenum(0);
        setFileList([]);
        setFilePath('');
        setFileName('');
        props.onRemove();
      } else {
        // message.error({
        //   content: res.message,
        //   key: res.message,
        // });
      }
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

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const getBase64 = (img: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
  };

  const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as RcFile, (url) => {
        setLoading(false);
        setFilePath(url);
      });
    }
  };

  return (
    <div className={styles.uploadPic}>
      <Upload
        maxCount={1}
        fileList={fileList}
        listType="picture-card"
        beforeUpload={beforeUploads}
        onChange={handleChange}
        itemRender={(originNode: any, file: any) => {
          return (
            <Popconfirm
              title={`你确定要删除${fileName}文件吗？`}
              onConfirm={() => removeFile(file)}
              overlayStyle={{ minWidth: 200 }}
              okText="确定"
              cancelText="取消"
            >
              <span>
                <DeleteOutlined />
              </span>
            </Popconfirm>
          );
        }}
      >
        {props.filePath ? <img src={props.filePath} style={{ width: '100%' }} /> : uploadButton}
      </Upload>
    </div>
  );
};

export default UploadPic;
