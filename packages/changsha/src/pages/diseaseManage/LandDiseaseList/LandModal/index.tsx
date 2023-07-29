import { Input, Modal, Form, Select, message, DatePicker, InputNumber } from 'antd';
import React, { useEffect, useRef } from 'react';
import styles from '../styles.less';
import { underAdd, underEdit } from '../service';
import UploadPic from 'baseline/src/components/UploadFile';
import moment from 'moment';
import { useModel } from 'umi';
import type { Moment } from 'moment';
import validRule from '@/utils/validate';

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
  const { filePath, fileName, setFilePath, setFileName } = useModel<any>('file');
  const formref = useRef<any>();

  const rules: any = {
    name: [validRule.limitNumber50()],
    checkLocation: [validRule.checkLocation()],
    maintenanceCost: [validRule.checkInteger()],
  };

  useEffect(() => {
    if (props.isEdit) {
      formref.current.setFieldsValue({
        ...props.editInfo,
        commitTime1: props.editInfo.commitTime1,
      });
      setFilePath(props.editInfo.fileUrl);
      setFileName(props.editInfo.fileName);
    } else {
      formref.current.setFieldsValue({
        diseaseNo: null,
        projectName: null,
        diseaseType: null,
        riskLv: null,
        address: null,
        roadName: null,
        diseaseLocation: null,
        commitTime1: null,
        maintenanceCost: null,
        fileUrl: '',
      });
      setFilePath('');
      setFileName('');
    }
  }, []);

  useEffect(() => {
    formref.current.setFieldsValue({
      fileUrl: filePath,
    });
  }, [filePath]);

  const handleSubmit = () => {
    formref.current
      .validateFields()
      .then(async () => {
        const formList = formref.current.getFieldsValue();
        formList.fileUrl = filePath;
        formList.fileName = fileName;
        formList.commitTime = moment(formList.commitTime1).format('YYYY-MM-DD HH:mm:ss');
        delete formList.commitTime1;
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

  const disabledDate = (current: Moment) => {
    return current && current > moment(new Date()).endOf('day');
  };

  const numberChange = (e: any) => {
    e.replace(/[^0-9]/g, '');
  };

  return (
    <div>
      <Modal
        title={props.isEdit ? '病害编辑' : '病害创建'}
        open={props.isModalshow}
        maskClosable={false}
        onCancel={() => props.onCancel()}
        onOk={() => handleSubmit()}
        width={'700px'}
        className={styles.landModal}
      >
        <Form
          // labelCol={{ span: 6 }}
          // wrapperCol={{ span: 18 }}
          labelAlign="right"
          labelCol={{ flex: '110px' }}
          labelWrap
          wrapperCol={{ flex: 1 }}
          ref={formref}
          colon={false}
          initialValues={props.editInfo}
        >
          <Form.Item label="病害编号" name="diseaseNo" rules={rules.name}>
            <Input autoComplete="off" placeholder="请输入病害编号" disabled={props.isEdit} />
          </Form.Item>
          <Form.Item label="项目名称" name="projectName" rules={rules.name}>
            <Input autoComplete="off" placeholder="请输入项目名称" disabled={props.isEdit} />
          </Form.Item>
          <Form.Item
            label="病害类型"
            name="diseaseType"
            rules={[{ required: true, message: '请选择病害类型' }]}
          >
            <Select placeholder="请选择病害类型" allowClear>
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
            <Select placeholder="请选择风险等级" allowClear>
              {Object.keys(riskLvEnum).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {riskLvEnum[item]}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="所在区域" name="address" rules={rules.name}>
            <Input autoComplete="off" placeholder="请输入所在区域" />
          </Form.Item>
          <Form.Item label="道路名称" name="roadName" rules={rules.name}>
            <Input autoComplete="off" placeholder="请输入道路名称" />
          </Form.Item>
          <Form.Item
            label="提交日期"
            name="commitTime1"
            rules={[{ required: true, message: '请选择提交日期' }]}
          >
            <DatePicker style={{ width: '100%' }} disabledDate={disabledDate} />
          </Form.Item>
          <Form.Item label="病害定位" name="diseaseLocation" rules={rules.checkLocation}>
            <Input autoComplete="off" placeholder="请输入经纬度坐标，经度在前" />
          </Form.Item>
          <Form.Item label="预估养护费用" name="maintenanceCost" rules={rules.maintenanceCost}>
            <InputNumber
              autoComplete="off"
              style={{ width: '100%' }}
              placeholder="请输入预估养护费用"
              onInput={numberChange}
              maxLength={15}
              controls={false}
            />
          </Form.Item>
          <Form.Item
            label="报告上传"
            name="fileUrl"
            valuePropName="fileUrl"
            // style={{ marginBottom: '0px' }}
            rules={[{ required: true, message: '请上传报告' }]}
          >
            <UploadPic
              uploadUrl="/traffic-km/under/upload"
              removeUrl="/traffic-km/under/delFile"
              width={296}
            ></UploadPic>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default LandModal;
