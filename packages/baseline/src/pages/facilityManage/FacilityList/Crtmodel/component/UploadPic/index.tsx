import React, { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Upload, Image, Modal } from 'antd';
// import type { RcFile, UploadProps, UploadChangeParam } from 'antd/es/upload';
import type { UploadProps, UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import styles from './styles.less';
import { getTokenName } from '../../../../../../utils/commonMethod';
import { useModel } from 'umi';

// const getBase64 = (file: RcFile): Promise<string> =>
//   new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => resolve(reader.result as string);
//     reader.onerror = (error) => reject(error);
//   });

type Iprops = {
  isEdit: boolean;
};

const { confirm } = Modal;

const App: React.FC<Iprops> = (props) => {
  const tk = getTokenName();
  const herders: any = {
    Authorization: localStorage.getItem(tk),
  };
  const [previewOpen, setPreviewOpen] = useState(false);
  // const [previewImage, setPreviewImage] = useState('');
  // const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { filePath, setFilePath } = useModel<any>('file');

  useEffect(() => {
    if (filePath && !fileList.length && props.isEdit) {
      setFileList([
        {
          uid: '-1',
          url: filePath,
          name: 'image.png',
          status: 'done',
        },
      ]);
    }
  }, [filePath]);

  // const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async () => {
    // if (!file.url && !file.preview) {
    //   file.preview = await getBase64(file.originFileObj as RcFile);
    // }

    // setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    // setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const handleChange: UploadProps['onChange'] = async (info: UploadChangeParam<UploadFile>) => {
    if (info?.fileList.length) {
      setFileList([
        {
          uid: info?.file?.uid,
          url: info?.file?.response?.data,
          name: info?.file?.name,
          status: info?.file?.status,
        },
      ]);
      if (info.file.status === 'done') {
        // Get this url from response in real world.
        setFilePath(info?.file?.response?.data);
      }
    } else {
      setFileList([]);
      setFilePath('');
    }
  };

  const onRemove = () => {
    return new Promise((resolve) => {
      confirm({
        title: '确定删除图片吗？',
        // icon: <ExclamationCircleOutlined />,
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        async onOk() {
          resolve(true);
        },
        onCancel() {
          resolve(false);
        },
      });
    });
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <div className={styles.uploadPic}>
      <Upload
        action={`${BASE_API}/api/traffic/facilities/upload`}
        listType="picture-card"
        fileList={fileList}
        headers={herders}
        onPreview={handlePreview}
        onChange={handleChange}
        onRemove={onRemove}
        accept=".jpg,.png,.JPG,.PNG"
      >
        {fileList.length >= 1 ? null : uploadButton}
      </Upload>
      {previewOpen && (
        <Image
          src={filePath}
          style={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            src: filePath,
            onVisibleChange: (value) => {
              setPreviewOpen(value);
            },
          }}
        />
      )}
      {/* <Modal
        visible={previewOpen}
        title="图片预览"
        footer={null}
        bodyStyle={{
          height: 'calc(90vh - 55px)',
          paddingBottom: '20px',
        }}
        onCancel={handleCancel}
        width={'70%'}
        style={{ top: '5%' }}
        className={`uploadPic ${styles.uploadPic}`}
      >
        <img
          alt="example"
          style={{ width: '100%', height: 'calc(90vh - 95px)' }}
          src={previewImage}
        />
      </Modal> */}
    </div>
  );
};

export default App;
