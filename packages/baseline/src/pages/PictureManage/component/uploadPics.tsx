import { Modal, List, message, Tooltip, Image } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from '../styles.less';
import { uploadimg } from '../service';
import uploadNullImg from '../../../assets/img/uploadIcon/uploadImg.png';
import { ExclamationCircleOutlined, MinusOutlined, CloseOutlined } from '@ant-design/icons';
import uploadImgIcon from '../../../assets/img/uploadIcon/upload.png';
import { useModel } from 'umi';

type Iprops = {
  visib: boolean;
};

const UploadPicList: React.FC<Iprops> = (props) => {
  const [successFileNum, setSuccessFileNum] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0); // 总页数
  const [tempCount, setTempCount] = useState<number>(0); // 暂时记录失败总数
  const [currentFailPage, setCurrentFailPage] = useState<number>(0);
  const [uploadSize] = useState<number>(10);
  const [disPlaySize] = useState<number>(10);
  const [reUploadAllFlag, setReUploadAllFlag] = useState<any>(false);
  const [cancelBool, setCancelBool] = useState<any>(false);
  const [disfileList, setDisfileList] = useState<any>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [clickDisabled, setClickDisabled] = useState(false);
  const [continueFlag, setContinueFlag] = useState(false);
  const [failList, setFailList] = useState<any>([]);
  const [miniShow, setMiniShow] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');
  const getBase64 = (file: any) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // 失败处理
  const handleFail = async (file: any, addItem: any) => {
    const imgurl = await getBase64(file.file);
    setDisfileList((fileList: any) => {
      const indexfile = fileList.findIndex((it: any) => {
        return it.file.uid === file.file.uid;
      });
      let newList = fileList.slice();
      const newfile = { file: file?.file, status: 'error', url: imgurl };
      if (indexfile > -1) {
        newList.splice(indexfile, 1, newfile);
      } else {
        newList = [...newList, newfile];
      }
      if (JSON.stringify(addItem) !== '{}') {
        return [...newList, addItem];
      }
      return [...newList];
    });

    setFailList((item: any) => {
      return [...item, file];
    });
  };

  // 正常关闭窗口时的操作
  const handleClose = () => {
    message.success({
      content: '图片上传已完成！',
      key: '图片上传已完成！',
    });
    setContinueFlag(false);
    setCancelBool(false);
    setReUploadAllFlag(false);
    setInitialState({
      ...initialState,
      uploadModal: false,
      fileStatusList: [],
      refreshUploadPage: true,
    });
  };
  const uploadFailFile = async (item: any) => {
    try {
      const formDataU = new FormData();
      formDataU.append('file', item.file);
      // formDataU.append('libraryId', initialState?.fileLibraryId);
      const res = await uploadimg(formDataU);
      if (res) {
        if (res?.status === 0) {
          setFailList((list: any) => {
            const index = list.findIndex((it: any) => {
              return it.file.uid === item.file.uid;
            });
            const newLists = list.slice();
            if (index > -1) {
              newLists.splice(index, 1);
            }
            return [...newLists];
          });
          setDisfileList((fileList: any) => {
            if (fileList?.length > 0) {
              const fileindex = fileList.findIndex((it: any) => {
                return it.file.uid === item.file.uid;
              });
              const newLists = fileList.slice();
              if (fileindex > -1) {
                newLists.splice(fileindex, 1);
              }
              return [...newLists];
            }
            return [...fileList];
          });
          setSuccessFileNum((it: number) => {
            return it + 1;
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };
  // 处理重新上传
  const reUpload = (file: any) => {
    const clickItem = failList.find((it: any) => {
      return it.file.uid === file.file.uid;
    });
    if (!clickItem) {
      return;
    }
    uploadFailFile(clickItem);
  };

  // 处理全部重新上传
  const reUploadAll = () => {
    setCurrentFailPage(0);
    setReUploadAllFlag(true);
    setTempCount(failList?.length);
  };

  useEffect(() => {
    const countTotal = (initialState?.fileStatusList && initialState?.fileStatusList?.length) || 0;
    setTotalCount(countTotal);
    if (countTotal === 0) {
      setClickDisabled(false);
    }
  }, []);

  useEffect(() => {
    if (successFileNum > 0 && totalCount > 0 && successFileNum === totalCount) {
      if (miniShow) {
        setMiniShow(false);
      }
      handleClose();
    }
  }, [successFileNum, totalCount]);

  useEffect(() => {
    const uploadFile = async (item: any, addItem: any) => {
      try {
        const formDataU = new FormData();
        formDataU.append('file', item?.file);
        // formDataU.append('libraryId', initialState?.fileLibraryId);
        const res = await uploadimg(formDataU);
        if (res) {
          if (res?.status === 0) {
            setSuccessFileNum((it: number) => {
              return it + 1;
            });
            setDisfileList((efileList: any) => {
              const indexfile = efileList.findIndex((it: any) => {
                return it.file.uid === item.file.uid;
              });
              const newList = efileList.slice();
              if (indexfile > -1) {
                newList.splice(indexfile, 1);
              }
              if (JSON.stringify(addItem) !== '{}') {
                return [...newList, addItem];
              }
              return [...newList];
            });
          } else {
            handleFail(item, addItem);
          }
          return true;
        }
      } catch (error) {
        handleFail(item, addItem);
        return false;
      }
      return false;
    };
    const totalNum = (initialState?.fileStatusList && initialState?.fileStatusList?.length) || 0;
    if (totalNum > 0) {
      if (clickDisabled && !continueFlag) {
        return;
      }
      if (cancelBool) {
        return;
      }
      if (successFileNum === initialState?.fileStatusList?.length) {
        return;
      }
      const currentlist: any =
        initialState?.fileStatusList &&
        initialState?.fileStatusList.slice(
          currentPage * uploadSize,
          (currentPage + 1) * uploadSize,
        );
      let num: number = 0;
      if (currentlist && currentlist?.length > 0) {
        currentlist.forEach((item: any, indexNum: any) => {
          try {
            let addItem: any = {};
            if (totalNum > (currentPage + 1) * disPlaySize) {
              const rec = totalNum - (currentPage + 1) * disPlaySize;
              const dispage = (currentPage * uploadSize + (indexNum + 1)) % disPlaySize;
              if (rec >= disPlaySize) {
                const addItems =
                  initialState?.fileStatusList &&
                  initialState?.fileStatusList.slice(
                    (currentPage + 1) * disPlaySize,
                    (currentPage + 2) * disPlaySize,
                  );

                if (dispage === 0) {
                  if (addItems && addItems?.length > 0) {
                    const [itemA]: any = addItems.slice(-1);
                    addItem = itemA;
                  }
                } else {
                  addItem =
                    addItems && addItems?.length > 0 && dispage >= 1 ? addItems[dispage - 1] : {};
                }
              } else if (rec > 0 && rec < disPlaySize) {
                const addItems =
                  initialState?.fileStatusList &&
                  initialState?.fileStatusList.slice(
                    (currentPage + 1) * disPlaySize,
                    (currentPage + 1) * disPlaySize + rec,
                  );
                addItem =
                  addItems && addItems?.length > 0 && dispage >= 1 ? addItems[dispage - 1] : {};
              }
            }
            try {
              uploadFile(item, addItem || {}).then(() => {
                num += 1;
                if (num === uploadSize) {
                  setCurrentPage((count) => {
                    return count + 1;
                  });
                }
              });
            } catch (error) {
              handleFail(item, {});
            }
          } catch (error) {
            console.log('错误捕捉', error);
          }
        });
      }
    }
  }, [cancelBool, clickDisabled, continueFlag, currentPage]);

  useEffect(() => {
    if (reUploadAllFlag && failList?.length > 0 && currentFailPage + 1 <= tempCount) {
      if (clickDisabled && !continueFlag) {
        return;
      }
      if (cancelBool) {
        return;
      }
      const currentfail = failList.slice(-1) || [];
      if (currentfail?.length === 0) {
        setCurrentFailPage(0);
        setReUploadAllFlag(false);
        return;
      }
      const clickItem = currentfail[0];
      if (JSON.stringify(clickItem) === '{}') {
        return;
      }
      try {
        uploadFailFile(clickItem).then(() => {
          setCurrentFailPage((count) => count + 1);
        });
      } catch (error) {
        // handleFail(file);
      }
    }
  }, [reUploadAllFlag, currentFailPage, cancelBool, clickDisabled, continueFlag]);

  enum statusType {
    'uploading' = '正在上传',
    'error' = '重新上传',
    'done' = '上传成功',
    'removed' = '已被移除',
  }
  const miniDiv = () => {
    setMiniShow(true);
  };
  const maxDiv = () => {
    setMiniShow(false);
  };
  const closeModal = () => {
    setClickDisabled(true);
    if (totalCount - successFileNum - failList?.length > 0) {
      Modal.confirm({
        title: '取消上传？',
        icon: <ExclamationCircleOutlined />,
        content: `当前仍有${
          totalCount - (currentPage + 1) * uploadSize
        }个文件未上传，关闭窗口后文件,上传将被取消！`,
        okText: '取消上传',
        okType: 'danger',
        cancelText: '继续上传',
        onOk() {
          setCancelBool(true);
          setContinueFlag(false);
          setReUploadAllFlag(false);
          setInitialState({
            ...initialState,
            uploadModal: false,
            fileStatusList: [],
            refreshUploadPage: true,
          });
        },
        onCancel() {
          setCurrentPage(currentPage + 1);
          setCancelBool(false);
          setContinueFlag(true);
          setClickDisabled(false);
        },
      });
    } else {
      setCancelBool(false);
      setReUploadAllFlag(false);
      setContinueFlag(false);
      setInitialState({
        ...initialState,
        uploadModal: false,
        fileStatusList: [],
        refreshUploadPage: true,
      });
    }
  };

  return miniShow ? (
    <span onClick={maxDiv} className={styles.uploadPanel}>
      <img src={uploadImgIcon} className={styles.imgsUpload} alt="not found" />
      {`${totalCount - successFileNum - failList?.length}/${successFileNum}`}
    </span>
  ) : (
    <Modal
      title={
        <div className="headModal">
          <span className="leftTxt">{`文件上传中（${
            totalCount - successFileNum - failList?.length
          }/${successFileNum}）`}</span>
          <div className="rightTxt">
            <span onClick={miniDiv}>
              <MinusOutlined />
            </span>
            <span
              onClick={clickDisabled ? () => {} : closeModal}
              className={clickDisabled ? 'disableClose' : ''}
            >
              <CloseOutlined />
            </span>
          </div>
        </div>
      }
      open={props.visib}
      closable={false}
      className={styles.fileListModal}
      footer={null}
      maskClosable={false}
    >
      {failList?.length > 0 && (
        <span
          className={`${styles.reUploadClass} ${
            totalCount - successFileNum - failList?.length > 0 ? '' : 'disableStart'
          }`}
          onClick={totalCount - successFileNum - failList?.length === 0 ? reUploadAll : () => {}}
        >
          全部开始
        </span>
      )}
      <div
        id="scrollableDiv"
        style={{ height: disfileList?.length > 0 ? '502px' : 'auto' }}
        className={styles.scrollableDivClass}
      >
        <List
          itemLayout="horizontal"
          dataSource={disfileList || []}
          className={styles.fileUploadClass}
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Image
                    width={58}
                    height={46.5}
                    src={item?.url || 'error'}
                    fallback={uploadNullImg}
                  />
                }
                title={
                  <Tooltip title={item?.file?.name}>
                    <span>{item?.file?.name}</span>
                  </Tooltip>
                }
              />
              <div
                style={{
                  color: item?.status === 'error' ? '#E94141' : '#33333',
                  cursor: item?.status === 'error' ? 'pointer' : '',
                }}
                onClick={
                  item?.status === 'error'
                    ? () => {
                        reUpload(item);
                      }
                    : () => {}
                }
              >
                {statusType[item?.status] || '正在上传中'}
              </div>
            </List.Item>
          )}
        />
      </div>
    </Modal>
  );
};
export default UploadPicList;
