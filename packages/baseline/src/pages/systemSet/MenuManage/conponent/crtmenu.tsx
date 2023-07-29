import { Input, Modal, Form, Select, message } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles.less';
import { newcrtmenu } from '../service';
import validRule from '../../../../utils/validate';

const { Option } = Select;
type Iprops = {
  menuId: any;
  inpctrshow: boolean;
  getmenutree: Function;
  onCancel: Function;
  menuinfo: any;
};

const CrtMenu: React.FC<Iprops> = (props) => {
  const [btn2, setBtn2] = useState('');
  const [formlist, setFormlist] = useState<any>({});

  const formref = useRef<any>();
  const [form] = Form.useForm();
  const rules: any = {
    code: [validRule.pathRegular()],
    title: [validRule.limitNumber20()],
    parentId: [{ required: true, message: '请输入父级节点' }],
    type: [validRule.inputRequired('资源请求类型')],
    orderNum: [validRule.cameraChannel()],
  };
  const changedValue = (changedValues: any, allValues: any) => {
    setFormlist(allValues);
  };

  const paridget = () => {
    if (props.menuinfo) {
      formref.current.setFieldsValue({ parentId: props.menuinfo });
    } else {
      formref.current.setFieldsValue({ parentId: -1 });
    }
  };

  useEffect(() => {
    paridget();
  }, []);

  const crtusers = async () => {
    formlist.menuId = props.menuId;
    formlist.code = formlist.code?.trim();
    formlist.title = formlist.title?.trim();
    formlist.icon = formlist.icon?.trim();
    formlist.href = formlist.href?.trim();
    formlist.orderNum = formlist.orderNum?.trim();
    formlist.description = formlist.description?.trim();
    formlist.attr1 = formlist.attr1?.trim();
    // formref.current.submit();
    form
      .validateFields()
      .then(async () => {
        try {
          const res = await newcrtmenu(formlist);
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onCancel();
            props.getmenutree();
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

  const changeOpt2 = (value: any) => {
    setBtn2(value);
  };

  return (
    <Modal
      title="菜单创建"
      open={props.inpctrshow}
      onCancel={() => props.onCancel()}
      onOk={() => crtusers()}
      className={`crtumenuipt ${styles.crtuser}`}
      // maskClosable={false}
    >
      <Form
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        ref={formref}
        form={form}
        colon={false}
        onValuesChange={(changedValues, allValues) => changedValue(changedValues, allValues)}
      >
        <Form.Item label="路径编码" name="code" rules={rules.code}>
          <Input autoComplete="off" placeholder="请输入路径编码" />
        </Form.Item>

        <Form.Item label="标题" name="title" rules={rules.title}>
          <Input autoComplete="off" placeholder="请输入标题" />
        </Form.Item>
        <Form.Item label="父级节点" name="parentId" rules={rules.parentId}>
          <Input disabled autoComplete="off" placeholder="请输入父级节点" />
        </Form.Item>

        <Form.Item label="图标" name="icon">
          <Input autoComplete="off" placeholder="请输入图标" />
        </Form.Item>

        <Form.Item label="资源路径" name="href">
          <Input autoComplete="off" placeholder="请输入资源路径" />
        </Form.Item>
        <Form.Item name="type" label="资源请求类型" rules={rules.type}>
          <Select
            value={btn2}
            style={{ height: 40 }}
            placeholder="请选择资源请求类型"
            onChange={changeOpt2}
          >
            <Option value="menu">menu</Option>
            <Option value="dirt">dirt</Option>
          </Select>
        </Form.Item>
        <Form.Item label="排序" name="orderNum" rules={rules.orderNum}>
          <Input autoComplete="off" placeholder="请输入排序" />
        </Form.Item>
        <Form.Item label="描述" name="description">
          <Input autoComplete="off" placeholder="请输入描述" />
        </Form.Item>
        <Form.Item label="前端组件" name="attr1">
          <Input autoComplete="off" placeholder="请输入前端组件" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CrtMenu;
