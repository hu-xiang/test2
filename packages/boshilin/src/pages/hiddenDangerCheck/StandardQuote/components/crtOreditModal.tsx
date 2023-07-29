import { Modal, Form, Input, message, Select } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles.less';
import { addInfo, editInfo, checkName } from '../service';
import { cloneDeep } from 'lodash';
import { checkTypeValues } from '../data.d';
import validRule from 'baseline/src/utils/validate';

const { TextArea } = Input;
const { Option } = Select;

type Iprops = {
  todo: string;
  modalShow: boolean;
  rowInfo: any;
  onCancel: () => void;
  refreshPage: () => void;
};

const CrtOreditModal: React.FC<Iprops> = (props) => {
  const { todo, rowInfo, modalShow, onCancel, refreshPage } = props;
  const [noItem, setNoItem] = useState<string>('');
  const [nocheck, setNocheck] = useState<any>('');
  const [form] = Form.useForm();
  const checkItem = async (e: any) => {
    const param = {
      name: e,
    };
    const res = await checkName(param);
    if (res.status === 0) {
      setNocheck('success');
      return Promise.resolve('success');
    }
    setNocheck('error');
    return Promise.resolve('fail');
  };
  const formref = useRef<any>(null);
  // 表单的默认值以及重置值
  const defalutform = {
    citationName: '',
    citationEntry: '', //
    standardSpecificationName: '',
    checkType: 1, // 状态
    standardContent: '',
  };

  const rules: any = {
    citationName: [validRule.limitAmount50()],
    citationEntry: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          const regExp = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_（）-]|[>]){1,50}$/;
          if (!value) {
            callback('请输入标引条目!');
          } else if (noItem === value) {
            callback();
          } else if (!regExp.test(value)) {
            callback('数字、汉字、大小写字母、中文括号和下划线组成(50位以内)');
          } else {
            checkItem(value).then((val: any) => {
              if (val === 'success') {
                callback();
              } else {
                callback('标引条目重复');
              }
            });
          }
        },
      },
    ],
    standardSpecificationName: [validRule.limitAmount50()],
    checkType: [validRule.selectReq('排查类型')],
    standardContent: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          const regExp = /^.{1,140}$/;
          if (!value) {
            callback('内容不能为空!');
          } else if (!regExp.test(value)) {
            callback('总字数不能超过140 位');
          } else {
            callback();
          }
        },
      },
    ],
  };
  // 回填数据
  const setValue = () => {
    const objform: any = cloneDeep(defalutform);
    if (props.rowInfo) {
      Object.keys(defalutform).forEach((item: any) => {
        objform[item] = props.rowInfo[item] || '';
      });
    }
    return objform;
  };
  useEffect(() => {
    if (todo === 'edit') {
      // 回填数据
      const newdata = setValue();
      form.setFieldsValue({
        ...newdata,
      });
      setNoItem(newdata?.citationEntry);
    }
  }, []);

  const submit = async () => {
    form
      .validateFields()
      .then(async () => {
        try {
          const formdata = form.getFieldsValue(true);
          let res: any;
          if (todo === 'edit') {
            res = await editInfo({ ...formdata, id: rowInfo?.id });
          } else {
            res = await addInfo(formdata);
          }
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            onCancel();
            refreshPage();
          }
        } catch {
          message.error({
            content: '提交失败!',
            key: '提交失败!',
          });
        }
      })
      .catch(() => {});
  };

  return (
    <Modal
      title={props.todo === 'add' ? '创建标引条目' : '编辑标引条目'}
      open={modalShow}
      onCancel={() => onCancel()}
      okText="提交"
      onOk={() => {
        submit();
      }}
      width={600}
      maskClosable={false}
    >
      <Form
        labelCol={{ flex: '104px' }}
        wrapperCol={{ flex: 1 }}
        autoComplete="off"
        ref={formref}
        colon={false}
        form={form}
        className={styles.form}
      >
        <Form.Item
          label="标引名称"
          name="citationName"
          rules={rules.citationName}
          // validateStatus={nocheck}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="标引条目"
          name="citationEntry"
          rules={rules.citationEntry}
          validateStatus={nocheck}
        >
          <Input disabled={todo === 'edit'} />
        </Form.Item>
        <Form.Item
          label="标准规范名称"
          name="standardSpecificationName"
          rules={rules.standardSpecificationName}
        >
          <Input />
        </Form.Item>
        <Form.Item label="排查类型" name="checkType" rules={rules.checkType}>
          <Select style={{ height: 40 }} placeholder="请选择排查类型" allowClear>
            {checkTypeValues
              .filter((it: any) => it.label !== '全部')
              .map((item: any) => (
                <Option key={item?.value} value={item?.value * 1}>
                  {item?.label}
                </Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="标准内容"
          className="texteare-class"
          name="standardContent"
          rules={rules.standardContent}
        >
          <TextArea rows={4} placeholder="最多可输入140个字" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default CrtOreditModal;
