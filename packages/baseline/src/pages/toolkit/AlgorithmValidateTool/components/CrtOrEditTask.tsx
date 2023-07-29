import { Input, Modal, Form, Select, message } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import styles from '../styles.less';
import { addValidateTool, getModelList, getEditInfo, updateEditInfo } from '../service';
// import { isNaN } from 'lodash';
// import { UploadOutlined } from '@ant-design/icons';
// import { getTenName } from '../../../../services/ant-design-pro/api';
// import { DeleteOutlined } from '@ant-design/icons';

type Iprops = {
  isShow: boolean;
  isCreate: boolean;
  onCancel: Function;
  onsetkey: Function;
  editInfo: any;
};

const EdtMod: React.FC<Iprops> = (props) => {
  const { editInfo } = props;

  const [modelNameList, setModelNameList] = useState([]);
  const [ruleList] = useState([
    { label: 'iou验证', value: '0' },
    // { label: '数量对比', value: '1' },
  ]);
  // const [valTypeKind] = useState({
  //   0: 'iou验证',
  //   1: '数量对比',
  // });

  const [valType, setValType] = useState<any>('');

  const formref = useRef<any>();

  const handleGetModelList = async () => {
    const params = {
      page: 1,
      pageSize: 50,
      deployStatus: 3,
    };
    const res = await getModelList(params);
    if (res.status === 0) {
      setModelNameList(res.data?.rows || []);
    }
  };
  const handleGetDetailInfo = async () => {
    const params = {
      id: editInfo?.verifyTaskId,
    };
    const res = await getEditInfo(params);
    if (res.status === 0) {
      const { taskName, modelId, validationRule, iou, identifyRange, confidenceInterval } =
        res?.data || {};

      setValType(validationRule);

      const resParams = {
        taskName,
        modelId,
        validationRule,
        iou,
        identifyRange,
        confidenceInterval,
      };
      formref.current.setFieldsValue(resParams);
    }
  };

  useEffect(() => {
    if (!props.isCreate) {
      handleGetDetailInfo();
    }
    handleGetModelList();
  }, []);

  const submit = async () => {
    formref.current
      .validateFields()
      .then(async () => {
        const formList = formref.current.getFieldsValue();
        const { confidenceInterval, identifyRange, iou, modelId, taskName, validationRule } =
          formList;
        try {
          let res: any;
          const params: any = {
            confidenceInterval: confidenceInterval * 1,
            identifyRange: identifyRange * 1,
            iou: iou * 1,
            modelId,
            taskName,
            validationRule,
          };
          if (props.isCreate) {
            res = await addValidateTool(params);
          } else {
            params.verifyTaskId = editInfo?.verifyTaskId;
            res = await updateEditInfo(params);
          }

          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onsetkey();
            props.onCancel();
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

  const handleValidateSelect = (val: number) => {
    setValType(val);
  };
  const modelNamefieldNames = {
    label: 'modelName',
    value: 'id',
  };

  return (
    <Modal
      title={props.isCreate ? '创建任务' : '编辑任务'}
      open={props.isShow}
      onCancel={() => props.onCancel()}
      onOk={() => submit()}
      className={` ${styles.avtToolAddModal}`}
      destroyOnClose
      maskClosable={false}
      okText={'提交'}
    >
      <div className="box">
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 21 }} ref={formref} colon={false}>
          <Form.Item
            label="任务名称"
            name="taskName"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input maxLength={255} autoComplete="off" placeholder="请输入任务名称" />
          </Form.Item>
          <Form.Item
            label="模型名称"
            name="modelId"
            rules={[{ required: true, message: '请选择模型名称' }]}
          >
            <Select
              style={{ height: 40 }}
              placeholder="请选择模型名称"
              fieldNames={modelNamefieldNames}
              allowClear
              options={modelNameList}
            ></Select>
          </Form.Item>

          <Form.Item
            label="验证规则"
            name="validationRule"
            rules={[{ required: true, message: '请选择验证规则' }]}
          >
            <Select
              onSelect={(val: number) => handleValidateSelect(val)}
              style={{ height: 40 }}
              placeholder="请选择验证规则"
              allowClear
              options={ruleList}
            ></Select>
          </Form.Item>
          <Form.Item
            style={{ display: valType !== '0' ? 'none' : 'block' }}
            label="iou值"
            name="iou"
            rules={[
              {
                required: true,
                validateTrigger: 'change',
                validator: (_, value) => {
                  if (typeof value === 'string' && !value?.length) {
                    return Promise.reject(new Error('请输入0到1的iou值'));
                  }
                  const res = value * 1;
                  return res >= 0 && res <= 1
                    ? Promise.resolve()
                    : Promise.reject(new Error('请输入0到1的iou值'));
                },
              },
            ]}
          >
            <Input autoComplete="off" placeholder="请输入0到1的iou值" />
          </Form.Item>
          <Form.Item
            style={{ display: valType !== '0' ? 'none' : 'block' }}
            label="识别范围"
            name="identifyRange"
            rules={[
              {
                required: true,
                validateTrigger: 'change',
                validator: (_, value) => {
                  if (typeof value === 'string' && !value?.length) {
                    return Promise.reject(new Error('请输入0到3000的识别范围值'));
                  }
                  const res = value * 1;
                  return res >= 0 && res <= 3000
                    ? Promise.resolve()
                    : Promise.reject(new Error('请输入0到3000的识别范围值'));
                },
              },
            ]}
          >
            <Input autoComplete="off" placeholder="请输入0到3000的识别范围值" suffix="像素" />
          </Form.Item>
          <Form.Item
            style={{ display: valType !== '0' ? 'none' : 'block' }}
            label="置信度"
            name="confidenceInterval"
            rules={[
              {
                required: true,
                validateTrigger: 'change',
                validator: (_, value) => {
                  if (typeof value === 'string' && !value?.length) {
                    return Promise.reject(new Error('请输入0到1的置信度值'));
                  }
                  const res = value * 1;
                  return res >= 0 && res <= 1
                    ? Promise.resolve()
                    : Promise.reject(new Error('请输入0到1的置信度值'));
                },
              },
            ]}
          >
            <Input autoComplete="off" placeholder="请输入0到1的置信度值" />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default EdtMod;
