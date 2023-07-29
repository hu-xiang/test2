import { Input, Modal, Form, Select, message, DatePicker } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles.less';
import { underAdd, underEdit } from '../service';
import UploadPic from '../../../../components/UploadFile';
import moment from 'moment';

type Iprops = {
  isModalshow: boolean;
  isEdit: boolean;
  onCancel: Function;
  onsetkey: Function;
  editInfo: any;
};

const riskLvEnum = {
  0: 'I',
  1: 'II',
  2: 'III',
  3: 'IV',
  4: '安全',
};

const diseaseTypeEnum = {
  0: '空洞',
  1: '脱空',
  2: '一般疏松',
  3: '严重疏松',
  4: '富水',
};

const { Option } = Select;

const LandModal: React.FC<Iprops> = (props) => {
  const [filePath, setFilePath] = useState<any>('');
  const [fileName, setFileName] = useState<any>('');
  const formref = useRef<any>();

  useEffect(() => {
    if (props.isEdit) {
      formref.current.setFieldsValue({
        ...props.editInfo,
      });
      setFilePath(props.editInfo.fileUrl);
      setFileName(props.editInfo.fileName);
    }
  }, []);

  const handleSubmit = () => {
    formref.current
      .validateFields()
      .then(async () => {
        // const formList = formref.current.getFieldsValue();
        // formList.fileUrl = filePath;
        // formList.fileName = fileName;
        // formList.commitTime = moment(formList.commitTime).format('YYYY-MM-DD');

        const formList = formref.current.getFieldsValue();
        formList.fileUrl = filePath;
        formList.fileName = fileName;
        formList.commitTime = moment(formList.commitTime).format('YYYY-MM-DD');
        const formData = new FormData();
        Object.keys(formList).forEach((key) => {
          if (typeof formList[key] === 'undefined' || formList[key] === null) {
            formData.append(key, '');
            formList[key] = '';
            return;
          }
          formData.append(key, `${formList[key]}`);
        });

        try {
          let res;
          if (props.isEdit) {
            formList.id = props.editInfo.id;
            res = await underEdit(formList);
          } else {
            res = await underAdd(formList);
          }
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onCancel();
            props.onsetkey();
          } else {
            // message.error({
            //   content: res.message,
            //   key: res.message,
            // });
          }
          return true;
        } catch {
          message.error({
            content: '提交失败!',
            key: '提交失败!',
          });
          return false;
        }
      })
      .catch(() => {});
  };

  const onUpload = (e: any) => {
    setFilePath(e.filePath);
    setFileName(e.fileName);
    formref.current.setFieldsValue('fileUrl', e.filePath);
  };

  const onRemove = () => {
    setFilePath('');
    formref.current.setFieldsValue('fileUrl', '');
    setFileName('');
  };

  return (
    <div>
      <Modal
        title={props.isEdit ? '病害编辑' : '病害创建'}
        open={props.isModalshow}
        onCancel={() => props.onCancel()}
        onOk={() => handleSubmit()}
        className={styles.LandModal}
      >
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          ref={formref}
          initialValues={props.editInfo}
        >
          <Form.Item
            label="病害编号"
            name="diseaseNo"
            rules={[{ required: true, message: '请输入病害编号' }]}
          >
            <Input autoComplete="off" placeholder="请输入病害编号" />
          </Form.Item>
          <Form.Item
            label="项目名称"
            name="projectName"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input autoComplete="off" placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item
            label="病害类型"
            name="diseaseType"
            rules={[{ required: true, message: '请选择病害类型' }]}
          >
            <Select style={{ height: 40 }} placeholder="请选择病害类型" allowClear>
              {Object.keys(diseaseTypeEnum).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {diseaseTypeEnum[item]}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="风险等级"
            name="riskLv"
            rules={[{ required: true, message: '请选择风险等级' }]}
          >
            <Select style={{ height: 40 }} placeholder="请选择风险等级" allowClear>
              {Object.keys(riskLvEnum).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {riskLvEnum[item]}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="所在区域"
            name="address"
            rules={[{ required: true, message: '请输入所在区域' }]}
          >
            <Input autoComplete="off" placeholder="请输入所在区域" />
          </Form.Item>
          <Form.Item
            label="道路名称"
            name="roadName"
            rules={[{ required: true, message: '请输入道路名称' }]}
          >
            <Input autoComplete="off" placeholder="请输入道路名称" />
          </Form.Item>
          <Form.Item
            label="提交日期"
            name="commitTime"
            rules={[{ required: true, message: '请选择提交日期' }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            label="病害定位"
            name="diseaseLocation"
            rules={[{ required: true, message: '请输入经纬度坐标，纬度在前' }]}
          >
            <Input autoComplete="off" placeholder="请输入经纬度坐标，纬度在前" />
          </Form.Item>
          <Form.Item
            label="预估养护费用"
            name="maintenanceCost"
            rules={[{ required: true, message: '请输入预估养护费用' }]}
          >
            <Input autoComplete="off" placeholder="请输入预估养护费用" />
          </Form.Item>
          <Form.Item
            label="报告上传"
            name="fileUrl"
            valuePropName="fileUrl"
            // rules={[{ required: true, message: '请上传报告' }]}
          >
            <UploadPic
              uploadUrl="/traffic-km/under/upload"
              removeUrl="/traffic-km/under/delFile"
              fileName={fileName}
              filePath={filePath}
              onUpload={onUpload}
              onRemove={onRemove}
            ></UploadPic>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default LandModal;
