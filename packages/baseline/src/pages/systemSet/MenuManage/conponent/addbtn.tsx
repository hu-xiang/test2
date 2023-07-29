import { Input, Modal, Form, Select, message } from 'antd';
import React, { useState } from 'react';
import styles from '../styles.less';
import { addmenubtn } from '../service';
import validRule from '../../../../utils/validate';

const { Option } = Select;
type Iprops = {
  menuId: any;
  addbtnshow: boolean;
  onsetkey: Function;
  onCancel: Function;
};

const AddBtn: React.FC<Iprops> = (props) => {
  const [btn1, setBtn1] = useState('');
  const [btn2, setBtn2] = useState('');
  const [formlist, setFormlist] = useState<any>({});
  const [methodOptions] = useState(['GET', 'POST', 'PUT', 'DELETE']);
  const [typeOptions] = useState(['uri', 'button']);

  // const formref = useRef<any>();
  const [form] = Form.useForm();
  const changedValue = (changedValues: any, allValues: any) => {
    setFormlist(allValues);
  };

  const crtusers = async () => {
    let meid: any = null;
    if (props.menuId) {
      [meid] = props.menuId;
    } else {
      message.error({
        content: '请选择左侧菜单项!',
        key: '请选择左侧菜单项!',
      });
      return false;
    }
    formlist.menuId = meid;
    formlist.code = formlist.code?.trim();
    formlist.name = formlist.name?.trim();
    formlist.uri = formlist.uri?.trim();
    // formref.current.submit();
    // if (!formlist.code || !formlist.type || !formlist.name || !formlist.uri || !formlist.method) {
    //   message.error('请填好必要的信息!');
    //   return false;
    // }
    form
      .validateFields()
      .then(async () => {
        try {
          const res = await addmenubtn(formlist);
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
    return false;
  };

  const changeOpt1 = (value: any) => {
    setBtn1(value);
  };

  const changeOpt2 = (value: any) => {
    setBtn2(value);
  };
  const rules: any = {
    code: [validRule.permissionRegular()],
    type: [validRule.inputRequired('资源类型')],
    name: [validRule.limitNumber20()],
    uri: [validRule.pathRegular()],
    method: [validRule.inputRequired('资源请求类型')],
  };

  return (
    <Modal
      title="按钮或资源创建"
      open={props.addbtnshow}
      onCancel={() => props.onCancel()}
      onOk={() => crtusers()}
      className={`crtumenuipt ${styles.crtuser}`}
      // maskClosable={false}
    >
      <Form
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        // ref={formref}
        colon={false}
        form={form}
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
export default AddBtn;
