import { Upload, message, Button, Modal, Image } from 'antd';
import React, { useEffect, useState } from 'react';
import { request, useModel } from 'umi';
import styles from './styles.less';
import { UploadOutlined, PaperClipOutlined, DeleteOutlined } from '@ant-design/icons';
import MarkPic from '../MarkPic';
import ImgCanvas from '../../../../components/DistressCanvas';

const { confirm } = Modal;

type Iprops = {
  uploadUrl: string;
  removeUrl: string;
  id?: string;
  width?: number;
  disabled?: boolean;
  isEdit?: boolean;
};
const UploadPic: React.FC<Iprops> = (props) => {
  const [isShow, setIsShow] = useState(false);
  const { filePath, setFilePath, fileName, setFileName } = useModel<any>('file');
  const [fileList, setFileList] = useState<any>([]);
  const [filenum, setFilenum] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [file, setFile] = useState<any>(null);
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const { disabled = false } = props;
  const { setBbox, bboxData, setBboxData } = useModel<any>('facility');
  const [imgUrl, setImgUrl] = useState('');

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
  const uploadUrl = (data1: any) => {
    return request(`${props.uploadUrl}`, {
      method: 'POST',
      data: data1,
    });
  };

  /** 删除图片 */
  const removeUrl = (data1: any) => {
    return request(`${props.removeUrl}`, {
      method: 'DELETE',
      data: data1,
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
    reader.onload = async (e: any) => {
      // const formData = new FormData();
      // formData.append('file', fileinfos);
      // try {
      //   const res = await uploadUrl(formData);
      //   if (res.status === 0) {
      //     const imgurlList: any = [
      //       {
      //         uid: fileinfos.uid,
      //         filePath: res.data.filePath,
      //         name: fileinfos.name,
      //       },
      //     ];
      //     setFilenum(1);
      //     setFileName(fileinfos.name);
      //     setFileList(imgurlList);
      //     setFilePath(res.data.filePath || res.data);
      //     setFile(e?.target?.result);
      //   }
      //   return false;
      // } catch (error) {
      //   return false;
      // }
      setFileInfo(fileinfos);
      setFile(e?.target?.result);
      setFileName(fileinfos.name);
      setIsShow(true);
      return false;
    };
    return false;
  };

  const removeFile = async () => {
    if (disabled) return;
    confirm({
      title: '确定删除图片吗？',
      // icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
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
        } catch (error) {
          hide();
          message.error({
            content: '删除失败!',
            key: '删除失败!',
          });
        }
      },
      onCancel() {},
    });
  };

  // const removePic = () => {
  //   /* eslint no-async-promise-executor: 0 */
  //   return new Promise(async (resolve) => {
  //     const formData1 = new FormData();
  //     formData1.append('path', filePath);
  //     if (props.id) {
  //       formData1.append('id', props.id);
  //     }
  //     try {
  //       const res = await removeUrl(formData1);
  //       if (res.status === 0) {
  //         setFilenum(0);
  //         setFileList([]);
  //         setFilePath('');
  //         setFileName('');
  //         resolve(true);
  //       }
  //       resolve(false);
  //     } catch (error) {
  //       resolve(false);
  //     }
  //   });
  // };

  // const onOk = async (fileInfo: any) => {
  //   const result = await removePic();
  //   if (result) {
  //     const formData = new FormData();
  //     formData.append('file', fileInfo);
  //     const res = await uploadUrl(formData);
  //     if (res.status === 0) {
  //       const imgurlList: any = [
  //         {
  //           uid: fileInfo.uid,
  //           filePath: res.data.filePath,
  //           name: fileInfo.name,
  //         },
  //       ];
  //       setFilenum(1);
  //       setFileName(fileInfo.name);
  //       setFileList(imgurlList);
  //       setFilePath(res.data.filePath || res.data);

  //       const reader = new FileReader();
  //       reader.readAsDataURL(fileInfo);
  //       reader.onload = async (e: any) => {
  //         setFile(e?.target?.result);
  //       };
  //       setIsShow(false);
  //     }
  //   }
  // };

  const onOk = async (box: any) => {
    if (!box?.length) {
      message.warning({
        content: `未添加标注`,
        key: '未添加标注',
      });
      return;
    }
    // const formData = new FormData();
    // formData.append('file', fileInfo);
    // const res = await uploadUrl(formData);
    // if (res.status === 0) {
    //   const imgurlList: any = [
    //     {
    //       uid: fileInfo.uid,
    //       filePath: res.data.filePath,
    //       name: fileInfo.name,
    //     },
    //   ];
    //   setFilenum(1);
    //   setFileName(fileInfo.name);
    //   setFileList(imgurlList);
    //   setFilePath(res.data.filePath || res.data);
    //   setIsShow(false);
    // }
    const formData = new FormData();
    formData.append('file', fileInfo);
    const res = await uploadUrl(formData);
    if (res.status === 0) {
      const imgurlList: any = [
        {
          uid: fileInfo.uid,
          filePath: res.data.filePath,
          name: fileInfo.name,
        },
      ];
      setFilenum(1);
      setFileName(fileInfo.name);
      setFileList(imgurlList);
      setFilePath(res.data.filePath || res.data);
      setIsShow(false);
      setBboxData({
        url: res.data.filePath || res.data,
        ls: [{ bbox: box }],
      });
      setBbox(box);
    }
  };

  const getImgUrl = (val: any) => {
    setImgUrl(val);
  };

  return (
    <div className={styles.uploadPic}>
      <Upload maxCount={1} beforeUpload={beforeUploads} showUploadList={false}>
        <Button icon={<UploadOutlined />} style={{ height: '40px' }} disabled={disabled}>
          上传图片
        </Button>
      </Upload>
      {visible && (
        <>
          <Image
            // src={filePath}
            style={{ display: 'none' }}
            preview={{
              visible,
              src: imgUrl,
              onVisibleChange: (value) => {
                setVisible(value);
              },
            }}
          />
          <ImgCanvas setImgUrl={getImgUrl} data={bboxData} />
        </>
      )}
      {filePath ? (
        <div className={styles.fileBox}>
          <div className="fileIcon">
            <PaperClipOutlined />
          </div>
          <div
            className={styles.fileName}
            title={firstName}
            onClick={() => {
              // if (props.isEdit) {
              //   setVisible(true);
              // } else {
              //   setIsShow(true);
              // }
              setVisible(true);
            }}
            style={props.width ? { width: `${props.width + 40}px` } : { width: '240px' }}
          >
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

      {isShow && (
        <MarkPic
          isShow={isShow}
          onCancel={() => {
            setFileName('');
            setFile(null);
            setIsShow(false);
          }}
          file={file || filePath}
          onOk={onOk}
          isEdit={props?.isEdit}
        />
      )}
    </div>
  );
};

export default UploadPic;
