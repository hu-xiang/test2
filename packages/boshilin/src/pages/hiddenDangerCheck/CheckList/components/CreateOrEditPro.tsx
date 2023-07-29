import { Input, Modal, Form, message, Popconfirm, Upload, Button, Image, Select } from 'antd';
import React, { useRef, useEffect, useState } from 'react';
import styles from '../styles.less';
import { UploadOutlined } from '@ant-design/icons';
import { adminstrativeLevelValues } from '../data.d';
import { editRoad, getRoadLibraryInfos } from '../service';
import validRule from 'baseline/src/utils/validate';

type Iprops = {
  modalShow: boolean;
  // isCreate: boolean;
  onCancel: Function;
  onsetkey: Function;
  edtInfo?: any;
  todo: string;
};
const { Option } = Select;

const EdtMod: React.FC<Iprops> = (props) => {
  const { todo, edtInfo } = props;
  const [imgLibOpts, setImgLibOpts] = useState<any>([]);
  const [gradeOpts, setGradeOpts] = useState<any>([]);
  const [curfileList, setCurFileList] = useState<any>([]);
  const [facId, setFacId] = useState<any>('');
  const [imgLibId, setImgLibId] = useState<any>('');
  const [gradeId, setGradeId] = useState<any>();
  const [imgLibName, setImgLibName] = useState<any>('');
  const [facName, setFacName] = useState<any>(''); // 设施名称
  const formref = useRef<any>();

  const rules: any = {
    grade: [validRule.selectReq('行政等级')],
  };
  // const handleGetFacListInfo = async (params = {}) => {
  //   const res = await getFacListInfo(params);
  //   if (res.status === 0) {
  //     const resData = res?.data || [];
  //     setFacilityOpts(resData);
  //   }
  // };
  const handleGetImgLibInfo = async (name: string) => {
    const res = await getRoadLibraryInfos({ name });
    if (res.status === 0) {
      const resData = res?.data || [];
      setImgLibOpts(resData);
    }
  };

  const getEditInfo = async () => {
    // const res = await projectEditShow({ projectId: props?.edtInfo?.id });

    formref.current.setFieldsValue({
      fkFacName: edtInfo?.fkFacName,
      grade: edtInfo?.grade?.toString(),
      // grade: edtInfo?.grade?adminstrativeLevelValues[edtInfo?.grade]:undefined,
      libraryName: edtInfo?.fkLibId?.toString(),
    });
    // console.log('ddddd', edtInfo?.grade);
    setGradeId(edtInfo?.grade);
    setFacId(edtInfo?.fkFacId);
    setFacName(edtInfo?.fkFacName);
    setImgLibId(edtInfo?.fkLibId || '');
    // setImgLibName(edtInfo?.fkLibName);
    setCurFileList(edtInfo?.files || []);
  };

  useEffect(() => {
    // handleGetFacListInfo();
    handleGetImgLibInfo('');
    // if (!props.isCreate) {
    if (todo === 'roadEdit') {
      getEditInfo();
    }
  }, []);

  const handleSubmit = async () => {
    formref.current
      .validateFields()
      .then(async () => {
        // const formList = formref.current.getFieldsValue();
        // console.log('formlist', edtInfo);
        try {
          const formData = new FormData();
          formData.append('fkFacName', facName);
          formData.append('fkFacId', facId);
          formData.append('fkLibId', imgLibId);
          formData.append('fkLibName', imgLibName);
          formData.append('grade', gradeId);
          curfileList.forEach((item: any) => {
            formData.append('files', item);
          });
          if (todo === 'roadEdit') {
            formData.append('id', edtInfo.id);
          }
          // console.log('formdata', formData);
          const res = await editRoad(formData);
          if (res?.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });

            props.onCancel();
            props.onsetkey(edtInfo.fkProId);
          }

          return true;
        } catch {
          // message.error({
          //   content: '提交失败!',
          //   key: '提交失败!',
          // });
          return false;
        }
      })
      .catch(() => {});
  };

  // const handleFacilitySelect = (value: any, options: any) => {
  //   if (value) {
  //     setFacId(options.key);
  //     setFacName(value);
  //   } else {
  //     setFacId('');
  //     setFacName('');
  //   }
  // };
  const handleGradeSelect = (value: any) => {
    // console.log('handleGradeSelect',value);
    setGradeId(value);
  };
  // const searchFacilities = (newValue: string) => {
  //   if (newValue) handleGetFacListInfo({ name: newValue });
  // };

  const handleImgLibSelect = (value: any, options: any) => {
    if (value) {
      setImgLibId(options.key);
      setImgLibName(value);
    } else {
      setImgLibId('');
      setImgLibName('');
    }
  };
  const searchImg = (newValue: string) => {
    if (newValue) handleGetImgLibInfo(newValue);
  };
  const handleBeforeUpload = (file: any, fileArr: any) => {
    // 格式校验
    if (file?.type.indexOf('json') < 0) {
      message.error({
        content: '格式错误，请上传json文件!',
        key: '格式错误，请上传json文件!',
      });
    }
    if (curfileList.length > 0) {
      let isExistFile = false;
      curfileList.forEach((item: any) => {
        if (item.name === file.name) {
          isExistFile = true;
          message.warning({
            content: `${file.name}文件已存在!`,
            key: `${file.name}文件已存在!`,
          });
        }
      });
      if (isExistFile) {
        return false;
      }
    }
    // // 内存校验
    // 存起fileList
    setCurFileList([...curfileList, ...fileArr]);
    return false;
  };

  const handleRemoveFile = (file: any) => {
    const fileListArr = curfileList.slice();
    const index = fileListArr.findIndex((item: any) => item.name === file.name);
    fileListArr.splice(index, 1);
    setCurFileList(fileListArr);
  };
  useEffect(() => {
    const newData = Object.keys(adminstrativeLevelValues).map((it: any) => {
      return {
        label: adminstrativeLevelValues[it],
        value: it,
      };
    });
    setGradeOpts(newData || []);
  }, []);

  return (
    <Modal
      // title={`${props.isCreate ? '创建' : '编辑'}排查项目`}
      title={`道路${todo === 'roadEdit' ? '编辑' : '创建'}`}
      open={props.modalShow}
      onCancel={() => props.onCancel()}
      onOk={() => handleSubmit()}
      className={`createOrEditModalWrapper ${styles.createOrEditModalWrapper}`}
      destroyOnClose
      okText={'提交'}
    >
      <div className={`${styles.createProContentWrapper} box`}>
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 21 }} ref={formref}>
          <Form.Item label="道路名称" name="fkFacName">
            <Input
              autoComplete="off"
              placeholder="请输入道路名称"
              maxLength={50}
              disabled={todo === 'roadEdit'}
            />
          </Form.Item>
          <Form.Item
            label="行政等级"
            name="grade"
            rules={rules.grade}
            className={`searchItem ${styles.searchItem}`}
          >
            <Select
              placeholder="请选择行政等级"
              allowClear
              onChange={(value: any) => handleGradeSelect(value)}
            >
              {gradeOpts?.map((item: any) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="关联图片库"
            name="libraryName"
            className={`searchItem ${styles.searchItem}`}
          >
            <Select
              placeholder="请选择关联图片库"
              allowClear
              showSearch
              onSearch={searchImg}
              onChange={(value: any, options: any) => handleImgLibSelect(value, options)}
              defaultActiveFirstOption={false}
              filterOption={false}
            >
              {imgLibOpts?.map((item: any) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="上传JSON" name="files" className={styles.uploadJsonFormItem}>
            <Upload
              beforeUpload={(file: any, fileArr: any) => handleBeforeUpload(file, fileArr)}
              accept={'.json'}
              multiple={true}
              maxCount={5}
              fileList={curfileList}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
            <div className={styles.uploadFileListWrapper}>
              {curfileList.length > 0 &&
                curfileList.map((item: any, index: number) => {
                  return (
                    <div className={styles.fileItem} key={index}>
                      <Image src={'images/mapScenes/link.svg'} preview={false}></Image>
                      <span className={styles.fileName}>{item.name}</span>
                      <Popconfirm
                        title="你确定要删除上传的json文件吗？"
                        onConfirm={() => handleRemoveFile(item)}
                        overlayStyle={{ minWidth: 200 }}
                        okText="确定"
                        cancelText="取消"
                      >
                        <span className={styles.uploadDel}>
                          <Image
                            className={styles.uploadIconActive}
                            src={'images/mapScenes/uploadDelete.svg'}
                            preview={false}
                          ></Image>
                          <Image
                            className={styles.uploadIcon}
                            src={'images/mapScenes/uploadDeleteNormal.svg'}
                            preview={false}
                          ></Image>
                        </span>
                      </Popconfirm>
                    </div>
                  );
                })}
            </div>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default EdtMod;
