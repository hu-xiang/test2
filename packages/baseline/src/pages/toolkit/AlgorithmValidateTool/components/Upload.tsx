import { Modal, Form, message, Button, Upload, Progress } from 'antd';
import React, { useRef, useEffect, useState } from 'react';
import styles from '../styles.less';
import { uploadInfo, checkUploadInfo } from '../service';
// import { isNaN } from 'lodash';
import { UploadOutlined } from '@ant-design/icons';
// import { getTenName } from '../../../../services/ant-design-pro/api';
// import { DeleteOutlined } from '@ant-design/icons';

type Iprops = {
  isShow: boolean;
  isCreate?: boolean;
  onCancel: Function;
  onsetkey: Function;
  editInfo: any;
};

const EdtMod: React.FC<Iprops> = (props) => {
  // const { editInfo } = props;

  const formref = useRef<any>();

  const [isUploadingJson, setIsUploadingJson] = useState(false);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [jsonFileList, setJsonFileList] = useState([]);
  const [imgFileList, setImgFileList] = useState([]);
  const [imgFileCount, setImgFileCount] = useState(0);
  const [jsonFileCount, setJsonFileCount] = useState(0);
  const [imgFileEndCount, setImgFileEndCount] = useState(0);
  const [jsonFileEndCount, setJsonFileEndCount] = useState(0);

  const handleCheckFile = async () => {
    try {
      const params = {
        taskId: props.editInfo.verifyTaskId,
      };
      await checkUploadInfo(params);
    } catch (err) {
      console.log(err);
    }
  };

  const resetImgInfo = () => {
    setImgFileCount(0);
    setImgFileEndCount(0);
    setImgFileList([]);
  };
  const handleUploadImg = async () => {
    setIsUploadingImg(true);

    // 批量上传
    // const formData = new FormData();
    // for (let i = 0; i < imgFileCount; i++) {
    //   formData.append('files', imgFileList[i]);
    // }
    // formData.append('taskId', props.editInfo.verifyTaskId);
    // formData.append('fileType', '1');
    // try {
    //   // setImgFileEndCount(imgFileCount - 1);
    //   const res = await uploadInfo(formData);
    //   if (res.status === 0) {
    //     message.success({
    //       content: '上传成功',
    //       key: '上传成功',
    //     });
    //     resetImgInfo();
    //   }
    //   setIsUploadingImg(false);
    // } catch (err) {
    //   resetImgInfo();
    //   setIsUploadingImg(false);
    // }

    //  单个上传
    const file = imgFileList[imgFileEndCount];
    const formData = new FormData();
    formData.append('files', file);
    formData.append('taskId', props.editInfo.verifyTaskId);
    formData.append('fileType', '1');
    try {
      const res = await uploadInfo(formData);
      if (res.status === 0) {
        if (imgFileEndCount + 1 === imgFileCount) {
          message.success({
            content: '上传成功',
            key: '上传成功',
          });
          setImgFileList([]);
        }
        setImgFileEndCount(imgFileEndCount + 1);
      }
      setIsUploadingImg(false);
    } catch (err) {
      resetImgInfo();
      setIsUploadingImg(false);
    }
  };

  useEffect(() => {
    if (imgFileCount > 0 && imgFileEndCount < imgFileCount && !isUploadingImg) {
      handleUploadImg();
    }
  }, [imgFileCount, imgFileEndCount, isUploadingImg]);

  const resetJsonInfo = () => {
    setJsonFileCount(0);
    setJsonFileEndCount(0);
    setJsonFileList([]);
  };
  const handleUploadJson = async () => {
    setIsUploadingJson(true);

    // 批量上传
    // const formData = new FormData();
    // for (let i = 0; i < jsonFileCount; i++) {
    //   formData.append('files', jsonFileList[i]);
    // }
    // formData.append('taskId', props.editInfo.verifyTaskId);
    // formData.append('fileType', '2');
    // try {
    //   // setJsonFileEndCount(jsonFileCount - 1);
    //   const res = await uploadInfo(formData);
    //   if (res.status === 0) {
    //     message.success({
    //       content: '上传成功',
    //       key: '上传成功',
    //     });
    //     resetJsonInfo();
    //   }
    //   setIsUploadingJson(false);
    // } catch (err) {
    //   resetJsonInfo();
    //   setIsUploadingJson(false);
    // }

    // 单个上传
    const file = jsonFileList[jsonFileEndCount];
    const formData = new FormData();
    formData.append('files', file);
    formData.append('taskId', props.editInfo.verifyTaskId);
    formData.append('fileType', '2');

    try {
      const res = await uploadInfo(formData);
      if (res.status === 0) {
        if (jsonFileEndCount + 1 === jsonFileCount) {
          message.success({
            content: '上传成功',
            key: '上传成功',
          });
          setJsonFileList([]);
        }
        setJsonFileEndCount(jsonFileEndCount + 1);
      }
      setIsUploadingJson(false);
    } catch (err) {
      resetJsonInfo();
      setIsUploadingJson(false);
    }
  };

  useEffect(() => {
    if (jsonFileCount > 0 && jsonFileEndCount < jsonFileCount && !isUploadingJson) {
      handleUploadJson();
    }
  }, [jsonFileCount, jsonFileEndCount, isUploadingJson]);

  const beforeUploadImg = async (file: any, fileList: any) => {
    const isImg = file.type.indexOf('image/') > -1;
    if (!isImg) {
      message.error({
        content: '只能上传图片!',
        key: '只能上传图片!',
      });

      return false;
    }
    resetImgInfo();
    setImgFileList(fileList);
    setImgFileCount(fileList.length);

    return false;
  };
  const beforeUploadJson = async (file: any, fileList: any) => {
    const isJson = file.type === 'application/json';
    if (!isJson) {
      message.error({
        content: '只能上传.json格式文件!',
        key: '只能上传.json格式文件!',
      });
      return false;
    }
    resetJsonInfo();
    setJsonFileList(fileList);
    setJsonFileCount(fileList.length);

    return false;
  };

  return (
    <Modal
      title={'上传图片及标注信息'}
      open={props.isShow}
      onCancel={() => {
        handleCheckFile();
        props.onCancel();
      }}
      className={`crtedtDev ${styles.crtedtDev} ${styles.uploadModal}`}
      destroyOnClose
      maskClosable={false}
      footer={null}
      width={443}
    >
      <div className={`box ${styles.uploadWrapper}`}>
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 21 }} ref={formref} colon={false}>
          <Form.Item
            label="上传图片"
            name="deviceType"
            // rules={[{ required: true, message: '请上传图片' }]}
            className={styles.uploadItem}
          >
            <>
              <Upload
                accept="image/*"
                multiple
                showUploadList={false}
                beforeUpload={beforeUploadImg}
              >
                <Button icon={<UploadOutlined />}>选择图片</Button>
              </Upload>
              {imgFileCount > 0 && (
                <div className={styles.customProgress}>
                  <Progress
                    strokeColor="#36C62699"
                    percent={Math.ceil((imgFileEndCount / imgFileCount) * 100)}
                    format={() => {
                      return `${imgFileEndCount}/${imgFileCount}`;
                    }}
                  />
                </div>
              )}
            </>
          </Form.Item>
          <Form.Item
            label="上传JSON"
            name="uploadJson"
            // rules={[{ required: true, message: '请上传JSON' }]}
            className={styles.uploadItem}
          >
            <>
              <Upload
                accept=".json"
                multiple
                showUploadList={false}
                beforeUpload={beforeUploadJson}
              >
                <Button icon={<UploadOutlined />}>选择文件</Button>
              </Upload>
              {jsonFileCount > 0 && (
                <div className={styles.customProgress}>
                  <Progress
                    strokeColor="#36C62699"
                    percent={Math.ceil((jsonFileEndCount / jsonFileCount) * 100)}
                    format={() => {
                      return `${jsonFileEndCount}/${jsonFileCount}`;
                    }}
                  />
                </div>
              )}
            </>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default EdtMod;
