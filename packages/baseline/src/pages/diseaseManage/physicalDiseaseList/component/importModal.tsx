import { Upload, Button, Modal, Progress, Form, message } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from '../styles.less';
// import validRule from '@/utils/validate';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { getFacilitityList } from '../../../../services/commonApi';
import { getLibPk, importJson, uploadDiseaseImg, stationMatch } from '../service';
// import validRule from '@/utils/validate';
import { UploadOutlined } from '@ant-design/icons';

// const { Option } = Select;
type Iprops = {
  importShow: boolean;
  onCancel: Function;
  refreshPage: Function;
};

const ImportModal: React.FC<Iprops> = (props) => {
  const [imgUploadList, setImgUploadList] = useState<any>([]);
  const [fileListJson, setFileListJson] = useState<any>([]);
  const [imgEveryUploadList, setImgEveryUploadList] = useState<any>([]);
  const [successImgNum, setSuccessImgNum] = useState<number>(0);
  const [percentageNum, setPercentageNum] = useState<number>(0);
  const [formatError, setFormatError] = useState<any>(false);
  const [canDelete, setCanDelete] = useState<any>(false);
  const [staticsCountFlag, setStaticsCountFlag] = useState<any>(false);
  const [everyFinishFlag, setEveryFinishFlag] = useState<any>(false);
  const [moreThanFlag, setMoreThanFlag] = useState<any>(false);
  const [disableFlag, setDisableFlag] = useState<any>(false);
  const [currentPage, setCurrentPage] = useState<number>(0); // 页数
  const uploadSize: number = 10;
  const [clickClosed, setClickClosed] = useState(false);
  const [upJsonFlag, setUpJsonFlag] = useState<any>(false);
  const [crtTime, setCrtTime] = useState<any>();
  const [libraryId, setLibraryId] = useState<any>();
  const [taskId, setTaskId] = useState<any>();
  const [form] = Form.useForm();
  const rules: any = {
    // facilityName: [validRule.selectRequired('','请选择已配置设备')],
    fileimglist: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          if (!imgUploadList?.length) {
            callback('请上传图片!');
          } else {
            callback();
          }
        },
      },
    ],
  };
  const getLibraryId = async () => {
    let res: any = {};
    try {
      res = await getLibPk();
      setLibraryId(res?.data?.libraryId);
      setTaskId(res?.data?.taskId);
      setCrtTime(res?.data?.crtTime);
    } catch (error) {
      message.error({
        content: '获取libraryId失败',
        key: '获取libraryId失败',
      });
    }
  };
  // const getTaskId = async () => {
  //   let res: any = {};
  //   try {
  //     res = await getpk();
  //     setTaskId(res?.data);
  //   } catch (error) {
  //     message.error('获取TaskId失败');
  //   }
  // };
  // const rules: any = {
  //   name: [validRule.limitNumber()],
  // };
  // 获取libraryId以及taskId
  useEffect(() => {
    getLibraryId();
    // getTaskId();
  }, []);
  useEffect(() => {
    if (formatError) {
      message.error({
        content: '图片格式仅支持.png、.jpg、.jpeg、.bmp!',
        key: '图片格式仅支持.png、.jpg、.jpeg、.bmp!',
      });
    }
  }, [formatError]);
  useEffect(() => {
    if (!upJsonFlag) {
      if (imgUploadList?.length > 0) {
        setCanDelete(false);
      } else {
        setCanDelete(true);
      }
    }
  }, [upJsonFlag, fileListJson]);

  useEffect(() => {
    if (moreThanFlag) {
      message.error({
        content: '单次上传图片数量需小于1000张',
        key: '单次上传图片数量需小于1000张',
      });
      return;
    }
    if (staticsCountFlag) {
      message.error({
        content: '累计上传图片总数需小于1000张',
        key: '累计上传图片总数需小于1000张',
      });
    }
  }, [moreThanFlag, staticsCountFlag]);
  // 获取设施列表
  useEffect(() => {
    const getFacilitiesList = async () => {
      let rec: any = [];
      try {
        const { status, data = [] } = await getFacilitityList({ name: '' });
        if (status === 0) {
          data.forEach((it: any) => {
            rec.push({ label: it.facilitiesName, value: it.id });
          });
        }
        // setFacilitiesList(rec);
      } catch (error) {
        rec = [];
      }
    };
    getFacilitiesList();
  }, []);
  const handleFacilityChange = (val: any, option: any) => {
    console.log('val,option', val, option);
  };
  const handleRemove = () => {
    setFileListJson([]);
    form.setFieldsValue({
      fileJson: undefined,
    });
  };
  const downloadFile = (content: any, filename: any) => {
    const a = document.createElement('a');
    a.href = content;
    a.download = filename;
    a.click();
  };
  const beforeUploadJson = (file: any, fileList: any) => {
    const isJson = file.type === 'application/json';
    if (!isJson) {
      message.error({
        content: '只能上传.json格式文件!',
        key: '只能上传.json格式文件!',
      });
      setUpJsonFlag(true);
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
    setFileListJson(fileList);
    // setHasJsonFlag(false);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', taskId);
      try {
        const res = await importJson(formData);
        if (res.status === 0) {
          // setHasJsonFlag(false);
        } else {
          const fileName = '错误信息.txt';
          const blob = new Blob([res], {
            type: 'text/plain',
          });
          const objectUrl = URL.createObjectURL(blob);
          downloadFile(objectUrl, fileName);
          message.success({
            content: '导出成功',
            key: '导出成功',
          });
        }
        return false;
      } catch (error) {
        // hide();
        // message.error('添加失败!');
        return false;
      }
    };
    return false;
  };
  useEffect(() => {
    if (imgEveryUploadList?.length > 0) {
      setImgUploadList((it: any) => {
        return [...it, ...imgEveryUploadList];
      });
    }
  }, [imgEveryUploadList]);
  useEffect(() => {
    const uploadFile = async (item: any) => {
      try {
        // console.log('上传中', currentPage,item, addItem);
        const formDataU = new FormData();
        formDataU.append('file', item);
        formDataU.append('libraryId', libraryId);
        formDataU.append('taskId', taskId);
        formDataU.append('crtTime', crtTime);
        const res = await uploadDiseaseImg(formDataU);
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
        return false;
      }
      return false;
    };
    if (imgEveryUploadList?.length > 0) {
      if (clickClosed) {
        return;
      }
      const currentlist =
        imgEveryUploadList &&
        imgEveryUploadList.slice(currentPage * uploadSize, (currentPage + 1) * uploadSize);
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
        if ((currentPage + 1) * uploadSize >= imgEveryUploadList?.length) {
          setEveryFinishFlag(false);
        }
      }
    }
  }, [imgEveryUploadList, clickClosed, currentPage]);
  const handleFileUpload = () => {
    setUpJsonFlag(false);
    // setFileListJson([]);
    setCanDelete(false);
  };
  const handleUpload = () => {
    setImgEveryUploadList([]);
    setEveryFinishFlag(false);
    setMoreThanFlag(false);
    setStaticsCountFlag(false);
    setFormatError(false);
    setCurrentPage(0);
  };
  const beforeUploadImgList = (file: any, fileList: any) => {
    if (fileList?.length > 1000) {
      setMoreThanFlag(true);
      return false;
    }
    const isJpgOrPng =
      file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/bmp';
    if (!isJpgOrPng) {
      setFormatError(true);
      return false;
    }
    if (imgUploadList?.length + fileList?.length > 1000) {
      setStaticsCountFlag(true);
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 10;
    if (!isLt2M) {
      message.error({
        content: '上传文件大小需小于10MB!',
        key: '上传文件大小需小于10MB!',
      });
      return false;
    }
    setImgEveryUploadList(fileList);
    return false;
  };

  useEffect(() => {
    if (imgUploadList?.length > 0 && successImgNum > 0) {
      const numFloat: any = Number(successImgNum / imgUploadList.length);
      const rec: any = numFloat.toFixed(2) * 100;
      setPercentageNum(rec);
    }
    if (imgUploadList?.length >= 1000) {
      setDisableFlag(true);
    }
  }, [imgUploadList, successImgNum]);

  // const handleImgChange = (files: any) => {
  // if (!files.fileList.length) {
  //   form.setFieldsValue({
  //     file: undefined,
  //   });
  // }
  // };
  const handleJsonChange = (files: any) => {
    if (!files.fileList.length) {
      form.setFieldsValue({
        fileJson: undefined,
      });
    }
  };
  const handleSubmit = async () => {
    form
      .validateFields()
      .then(async () => {
        const formData = form.getFieldsValue();
        const hide = message.loading({
          content: '正在导入',
          key: '正在导入',
        });
        try {
          hide();
          const res = await stationMatch({ facilitiesId: formData?.facilityId, libraryId });
          if (res.status === 0) {
            message.success({
              content: '导入成功',
              key: '导入成功',
            });
            props.refreshPage();
            props.onCancel();
          }
          // else {
          // message.error({
          //   content: res.message,
          //   key: res.message,
          // });
          // }
          return true;
        } catch (error) {
          hide();
          message.error({
            content: '提交失败',
            key: '提交失败',
          });
          return false;
        }
      })
      .catch(() => {});
  };

  const closeModal = () => {
    setClickClosed(true);
    props.onCancel();
  };

  return (
    <Modal
      title="病害导入"
      open={props.importShow}
      onCancel={closeModal}
      onOk={() => handleSubmit()}
      className={`importClass ${styles.importClass}`}
      maskClosable={false}
    >
      <ProForm // 配置按钮的属性
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        submitter={{
          // 配置按钮的属性
          resetButtonProps: {
            style: {
              // 隐藏重置按钮
              display: 'none',
            },
          },
          submitButtonProps: {
            style: {
              // 隐藏重置按钮
              display: 'none',
            },
          },
        }}
        layout="horizontal"
        className={styles.modelCustomClass}
      >
        <ProForm.Item
          label="上传JSON"
          name="fileJson"
          valuePropName="fileJson"
          className="jsonFormItemClass"
          rules={[{ required: true, message: '请上传文件' }]}
          getValueFromEvent={({ file, fileList }) => {
            if (fileList.length > 0) {
              file.status = 'done';
              return [file];
            }
            return undefined;
          }}
        >
          <Upload
            maxCount={1}
            onChange={handleJsonChange}
            accept=".json"
            fileList={fileListJson}
            onRemove={handleRemove}
            disabled={imgUploadList?.length > 0}
            showUploadList={upJsonFlag ? false : { showRemoveIcon: canDelete }}
            className="jsonUploadClass"
            beforeUpload={beforeUploadJson}
          >
            <Button
              disabled={imgUploadList?.length > 0}
              onClick={handleFileUpload}
              className={imgUploadList?.length > 0 ? 'disableUploadClass' : ''}
              icon={<UploadOutlined />}
            >
              选择文件
            </Button>
          </Upload>
        </ProForm.Item>
        {/* <Form.Item name="facilityName" label="设备名称" rules={rules.facilityName}>
              <Select allowClear placeholder="请选择已配置设备" showArrow>
                {facilitiesList.map((item: any) => (
                  <Option key={item.value} value={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
        </Form.Item> */}
        <div className={styles.uploadImgListClass}>
          <ProForm.Item
            label="上传文件"
            name="fileimglist"
            valuePropName="fileimglist"
            rules={rules.fileimglist}
            // getValueFromEvent={({ file, fileList }) => {
            //   console.log('getValueFromEvent', file, fileList);
            // if (fileList.length > 0) {
            //   file.status = 'done';
            //   return [file];
            // }
            // return undefined;
            // }}
          >
            {/* disabled={hasJsonFlag} Math.floor(successImgNum/imgUploadList?.length)*100 */}
            <div className="rowProgress">
              <Upload
                maxCount={1000}
                disabled={fileListJson?.length <= 0 || disableFlag || everyFinishFlag}
                multiple={true}
                beforeUpload={beforeUploadImgList}
                showUploadList={false}
                fileList={imgUploadList}
              >
                <Button
                  disabled={fileListJson?.length <= 0 || disableFlag || everyFinishFlag}
                  onClick={handleUpload}
                  className={fileListJson?.length <= 0 ? 'disableUploadClass' : ''}
                  icon={<UploadOutlined />}
                >
                  选择图片
                </Button>
              </Upload>
              <Progress
                percent={percentageNum}
                format={() => {
                  return `${successImgNum}/${imgUploadList?.length}`;
                }}
              />
            </div>
          </ProForm.Item>
        </div>
        <ProFormSelect
          name="facilityId"
          label="道路名称"
          // style={{marginBottom: 24}}
          request={async () => {
            const rec: any = [];
            const { status, data } = await getFacilitityList({ name: '' });
            if (status === 0) {
              data.forEach((it: any) => {
                rec.push({ label: it.facilitiesName, value: it.id });
              });
            }
            return rec;
          }}
          fieldProps={{
            onChange: (val: any, option: any) => {
              handleFacilityChange(val, option);
            },
          }}
          placeholder="请选择已配置设备"
        />
      </ProForm>
    </Modal>
  );
};

export default ImportModal;
