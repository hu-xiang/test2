import { Input, Modal, Form, Select, message } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles.less';
import { getmenubtn, putmenubtn } from '../service';
import validRule from '../../../../utils/validate';

const { Option } = Select;

type Iprops = {
  menuId: any;
  edtbtnshow: boolean;
  onsetkey: Function;
  onCancel: Function;
  btninfo: any;
};

const EdtBtn: React.FC<Iprops> = (props) => {
  const [btn1, setBtn1] = useState('');
  const [btn2, setBtn2] = useState('');
  const [formlist, setFormlist] = useState<any>({});
  const [methodOptions] = useState(['GET', 'POST', 'PUT', 'DELETE']);
  const [typeOptions] = useState(['uri', 'button']);
  const [getbtninfo, setGetbtninfo] = useState<any>({});

  const formref = useRef<any>();
  const [form] = Form.useForm();
  const rules: any = {
    code: [validRule.permissionRegular()],
    type: [validRule.inputRequired('资源类型')],
    name: [validRule.limitNumber20()],
    uri: [validRule.pathRegular()],
    method: [validRule.inputRequired('资源请求类型')],
  };
  const changedValue = (changedValues: any, allValues: any) => {
    setFormlist(allValues);
  };

  const infobase = async () => {
    const res = await getmenubtn(props.btninfo.id);
    setGetbtninfo(res.data);
    formref.current.setFieldsValue(res.data);
  };

  useEffect(() => {
    infobase();
  }, []);

  const crtusers = async () => {
    const obj: any = getbtninfo;
    const [meid] = props.menuId;
    obj.menuId = meid;
    if (formlist.code) {
      obj.code = formlist.code;
    }
    if (formlist.type) {
      obj.type = formlist.type;
    }
    if (formlist.name) {
      obj.name = formlist.name;
    }
    if (formlist.uri) {
      obj.uri = formlist.uri;
    }
    if (formlist.method) {
      obj.method = formlist.method;
    }
    formlist.code = formlist.code?.trim();
    formlist.name = formlist.name?.trim();
    formlist.uri = formlist.uri?.trim();
    // formref.current.submit();
    form
      .validateFields()
      .then(async () => {
        try {
          const res = await putmenubtn(getbtninfo.id, obj);
          props.onsetkey();
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onCancel();
          }
          // else {
          //   message.error({
          //     content: res.message,
          //     key: res.message,
          //   });
          // }
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

  const changeOpt1 = (value: any) => {
    setBtn1(value);
  };

  const changeOpt2 = (value: any) => {
    setBtn2(value);
  };
  return (
    <Modal
      title="编辑"
      open={props.edtbtnshow}
      onCancel={() => props.onCancel()}
      onOk={() => crtusers()}
      className={`crtumenuipt ${styles.crtuser}`}
      // maskClosable={false}
    >
      <Form
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        ref={formref}
        form={form}
        colon={false}
        onValuesChange={(changedValues, allValues) => changedValue(changedValues, allValues)}
      >
        <Form.Item label="资源编码" name="code" rules={rules.code}>
          <Input autoComplete="off" placeholder="请输入资源编码" />
        </Form.Item>
        <Form.Item name="type" label="资源类型" rules={rules.type}>
          <Select
            value={btn1}
            style={{ height: 40 }}
            placeholder="请选择资源类型"
            onChange={changeOpt1}
          >
            {typeOptions.map((item: any) => (
              <Option key={item} value={item}>
                {item}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="资源名称" name="name" rules={rules.name}>
          <Input autoComplete="off" placeholder="请输入资源名称" />
        </Form.Item>
        <Form.Item label="资源地址" name="uri" rules={rules.uri}>
          <Input autoComplete="off" placeholder="请输入资源地址" />
        </Form.Item>
        <Form.Item name="method" label="资源请求类型" rules={rules.method}>
          <Select
            value={btn2}
            style={{ height: 40 }}
            placeholder="请选择资源请求类型"
            onChange={changeOpt2}
          >
            {methodOptions.map((item: any) => (
              <Option key={item} value={item}>
                {item}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default EdtBtn;
