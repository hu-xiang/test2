import { Modal, Form, Progress, message, Upload, Button } from 'antd';
import React, { useState, useEffect } from 'react';
// import styles from '../styles.less';
import { importJson } from '../service';
import { UploadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

type Iprops = {
  uploadLngFlag: boolean;
  onCancel: Function;
  // pkid: any;
  refreshPage: Function;
  rowinfo: any;
};
const UploadModal: React.FC<Iprops> = (props) => {
  const [updalist, setUpdalist] = useState<any>([]);
  const [form] = Form.useForm();
  const [everyUploadList, setEveryUploadList] = useState<any>([]);
  const [percentageNum, setPercentageNum] = useState<number>(0);
  const [successImgNum, setSuccessImgNum] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0); // 页数
  const [continueFlag, setContinueFlag] = useState(false);
  const [cancelBool, setCancelBool] = useState<any>(false); // 取消上传
  const [everyFinishFlag, setEveryFinishFlag] = useState<any>(false);
  const [clickClosed, setClickClosed] = useState(false);
  const [staticsCountFlag, setStaticsCountFlag] = useState<any>(false); // 累计上传不超过多少张的标志
  const [moreThanFlag, setMoreThanFlag] = useState<any>(false); // 单次上传不超过多少张的标志
  const [formatError, setFormatError] = useState<any>(false); // 格式上传报错标志
  const [disableFlag, setDisableFlag] = useState<any>(false);
  const limitNum = 100;
  const uploadSize = 10;
  const rules: any = {
    // facilityName: [validRule.selectRequired('','请选择已配置设备')],
    fileJsonList: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          if (!updalist?.length) {
            callback('请上传文件!');
          } else {
            callback();
          }
        },
      },
    ],
  };
  const beforeUpload = (file: any, fileList: any) => {
    if (fileList?.length > limitNum) {
      setMoreThanFlag(true);
      return false;
    }
    if (updalist?.length + fileList?.length > limitNum) {
      setStaticsCountFlag(true);
      return false;
    }
    const isJson = file.type === 'application/json';
    if (!isJson) {
      setFormatError(true);
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 100;
    if (!isLt2M) {
      message.error({
        content: '上传文件大小需小于100MB!',
        key: '上传文件大小需小于100MB!',
      });
      return false;
    }
    setEveryUploadList(fileList);
    return false;
  };
  useEffect(() => {
    if (formatError) {
      message.error({
        content: '只能上传.json格式文件',
        key: '只能上传.json格式文件',
      });
    }
  }, [formatError]);
  useEffect(() => {
    if (moreThanFlag) {
      message.error({
        content: `单次上传文件数量需小于${limitNum}个`,
        key: `单次上传文件数量需小于${limitNum}个`,
      });
      return;
    }
    if (staticsCountFlag) {
      message.error({
        content: `累计上传文件总数需小于${limitNum}个`,
        key: `累计上传文件总数需小于${limitNum}个`,
      });
    }
  }, [moreThanFlag, staticsCountFlag]);
  useEffect(() => {
    if (everyUploadList?.length > 0) {
      setUpdalist((it: any) => {
        return [...it, ...everyUploadList];
      });
    }
  }, [everyUploadList]);
  useEffect(() => {
    if (updalist?.length > 0 && successImgNum > 0) {
      const numFloat: any = Number(successImgNum / updalist.length);
      const rec: any = numFloat.toFixed(2) * 100;
      setPercentageNum(rec);
    }
    if (updalist?.length >= limitNum) {
      setDisableFlag(true);
    }
  }, [updalist, successImgNum]);
  useEffect(() => {
    const uploadFile = async (item: any) => {
      try {
        // console.log('上传中', currentPage,item, addItem);
        const formDataU = new FormData();
        formDataU.append('file', item);
        formDataU.append('libraryId', props.rowinfo.id);
        const res = await importJson(formDataU);
        if (res) {
          if (res?.status === 0) {
            // console.log('SuccessFileNum',successFileNum)
            setSuccessImgNum((it: number) => {
              return it + 1;
            });
            return true;
          }
        }
      } catch (error) {
        message.error({
          content: '请上传文件后再提交!',
          key: '请上传文件后再提交!',
        });
        return false;
      }
      return false;
    };
    if (everyUploadList?.length > 0) {
      if (clickClosed && !continueFlag) {
        return;
      }
      if (cancelBool) {
        return;
      }
      const currentlist =
        everyUploadList &&
        everyUploadList.slice(currentPage * uploadSize, (currentPage + 1) * uploadSize);
      let num: number = 0;
      if (currentlist && currentlist?.length > 0) {
        setEveryFinishFlag(true);
        currentlist.forEach((item: any) => {
          try {
            uploadFile(item).then(() => {
              num += 1;
              if (num === uploadSize) {
                setCurrentPage((count) => {
                  return count + 1;
                });
              }
            });
          } catch (error) {
            console.log('错误捕捉', error);
          }
        });
        if ((currentPage + 1) * uploadSize >= everyUploadList?.length) {
          setEveryFinishFlag(false);
        }
      }
    }
  }, [everyUploadList, continueFlag, clickClosed, currentPage]);

  const onChange = (files: any) => {
    if (!files.fileList.length) {
      form.setFieldsValue({
        file: undefined,
      });
    }
  };
  const handleFileUpload = () => {
    setEveryUploadList([]);
    setEveryFinishFlag(false);
    setMoreThanFlag(false);
    setStaticsCountFlag(false);
    setFormatError(false);
    setCurrentPage(0);
  };
  const closeModal = () => {
    setClickClosed(true);
    if (everyFinishFlag) {
      // 正在上传中
      Modal.confirm({
        title: '取消上传？',
        icon: <ExclamationCircleOutlined />,
        content: `当前仍有文件正在上传中，关闭窗口后文件,上传将被取消！`,
        okText: '取消上传',
        okType: 'danger',
        cancelText: '继续上传',
        onOk() {
          setCancelBool(true);
          setContinueFlag(false);
          props.onCancel();
        },
        onCancel() {
          setCurrentPage(currentPage + 1);
          setCancelBool(false);
          setContinueFlag(true);
          setClickClosed(false);
        },
      });
    } else {
      setCancelBool(false);
      setContinueFlag(false);
      props.onCancel();
    }
  };

  return (
    <Modal
      title="上传图片信息"
      open={props.uploadLngFlag}
      width={438}
      onCancel={closeModal}
      // onOk={() => handleSubmit()}
      maskClosable={false}
      footer={false}
      className="uploadLngClass"
    >
      <Form
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        form={form}
        className="uploadLngFormClass"
      >
        <Form.Item
          label="上传JSON"
          name="file"
          valuePropName="file"
          className="uploadFormItemClass"
          rules={rules.fileimglist}
        >
          <div className="rowProgress">
            <Upload
              maxCount={100}
              multiple={true}
              // directory={true}
              onChange={onChange}
              fileList={updalist}
              disabled={disableFlag || everyFinishFlag}
              accept=".json"
              className="uploadItemClass"
              beforeUpload={beforeUpload}
              itemRender={(originNode: any, file: any) => {
                return (
                  <div className="uploadBoxClass">
                    <span className="uploadTxtClass">{file.name}</span>
                  </div>
                );
              }}
            >
              <Button
                disabled={disableFlag || everyFinishFlag}
                onClick={handleFileUpload}
                icon={<UploadOutlined />}
              >
                选择文件
              </Button>
            </Upload>
            {updalist?.length > 0 ? (
              <Progress
                percent={percentageNum}
                format={() => {
                  return `${successImgNum}/${updalist?.length}`;
                }}
              />
            ) : null}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default UploadModal;
