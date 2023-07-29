import { Input, Modal, Form, Select, message } from 'antd';
import React, { useState, useRef } from 'react';
import styles from '../styles.less';
import { addrole } from '../service';
import validRule from '../../../../utils/validate';

const { TextArea } = Input;
const { Option } = Select;
type Iprops = {
  crtusershow: boolean;
  onCancel: Function;
  onsetkey: Function;
};

const CrtRole: React.FC<Iprops> = (props) => {
  const [role, setRole] = useState('');
  const [roletype, setRoletype] = useState('');
  const [formlist, setFormlist] = useState<any>({});

  const [typeOptions] = useState([
    {
      label: '系统管理员',
      value: 0,
    },
    {
      label: '业务管理员',
      value: 1,
    },
  ]);

  const formref = useRef<any>();

  const rules: any = {
    roleName: [validRule.limitNumber20()],
    roleType: [validRule.inputRequired('角色类型')],
  };

  const changedValue = (changedValues: any, allValues: any) => {
    setFormlist(allValues);
  };

  const crtusers = async () => {
    formlist.roleType = roletype;
    formlist.roleName = formlist.roleName?.trim();
    formlist.remark = formlist.remark?.trim();

    // formref.current.submit();
    // if (!formlist.roleType || !formlist.roleName) {
    //   message.error('请填好必要的信息!');
    //   return false;
    // }

    formref.current
      .validateFields()
      .then(async () => {
        try {
          const res = await addrole(formlist);
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

  const changeOpt1 = (value: any, text: any) => {
    setRole(value);
    setRoletype(text.key);
  };

  return (
    <Modal
      title="角色创建"
      open={props.crtusershow}
      onCancel={() => props.onCancel()}
      onOk={() => crtusers()}
      className={`crturoleipt ${styles.crtuser}`}
      // maskClosable={false}
    >
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        ref={formref}
        colon={false}
        onValuesChange={(changedValues, allValues) => changedValue(changedValues, allValues)}
      >
        <Form.Item label="角色名称" name="roleName" rules={rules.roleName}>
          <Input autoComplete="off" placeholder="请输入角色名称" />
        </Form.Item>

        <Form.Item name="roleType" label="类型" rules={rules.roleType}>
          <Select
            value={role}
            style={{ height: 40 }}
            placeholder="请选择角色类型"
            onChange={changeOpt1}
          >
            {typeOptions.map((item: any) => (
              <Option key={item.value} value={item.label}>
                {item.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="描述" name="remark">
          <TextArea placeholder="请输入内容" style={{ height: 75 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default CrtRole;
