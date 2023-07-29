import { Input, Modal, Form, message } from 'antd';
import { useRef, useState } from 'react';
import { updatePwd, outLogin } from '@/services/ant-design-pro/api';
import { history, useModel } from 'umi';
// import { stringify } from 'querystring';

type Iprops = {
  pwdshow: boolean;
  onCancel: Function;
  // initialState: any;
};

const CrtPart: React.FC<Iprops> = (props) => {
  const [formlist, setFormlist] = useState<any>({});

  const formref = useRef<any>();
  const { initialState, setInitialState } = useModel<any>('@@initialState');

  const changedValue = (changeVal: any, allValues: any) => {
    setFormlist(allValues);
  };

  /**
   * 退出登录，并且将当前的 url 保存
   */
  const loginOut = async () => {
    await outLogin();
    // const { query = {}, pathname } = history.location;
    const { query = {} } = history.location;
    const { redirect } = query;
    localStorage.removeItem('token');
    localStorage.removeItem('isTenant');
    sessionStorage.removeItem('username');
    // Note: There may be security issues, please note
    if (window.location.pathname !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        // search: stringify({
        //   redirect: pathname,
        // }),
      });
    }
  };

  const crtnewpart = () => {
    formlist.newPassword = formlist.newPassword?.trim();
    formlist.oldPassword = formlist.oldPassword?.trim();
    formlist.checkPass = formlist.checkPass?.trim();
    formref.current
      .validateFields()
      .then(async () => {
        try {
          const res = await updatePwd(
            formlist.newPassword,
            formlist.oldPassword,
            // props.initialState.currentUser.id,
            initialState.currentUser.id,
          );
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onCancel();
            setInitialState({ ...initialState, currentUser: undefined });
            loginOut();
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

  return (
    <Modal
      title="密码修改"
      open={props.pwdshow}
      onCancel={() => props.onCancel()}
      onOk={() => crtnewpart()}
      className="pwdreset"
    >
      <Form
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        ref={formref}
        onValuesChange={(changedValues, allValues) => changedValue(changedValues, allValues)}
      >
        <Form.Item
          label="旧密码"
          name="oldPassword"
          rules={[
            { required: true, message: '请输入旧密码!' },
            { min: 6, max: 20, message: '长度在 6 到 20 个字符' },
          ]}
        >
          <Input.Password
            autoComplete="off"
            name="oldPassword"
            style={{ height: 40 }}
            placeholder="请输入旧密码"
          />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, message: '请输入新密码!' },
            { min: 6, max: 20, message: '长度在 6 到 20 个字符' },
          ]}
        >
          <Input.Password
            // value={role}
            autoComplete="off"
            style={{ height: 40 }}
            placeholder="请输入新密码"
            name="newPassword"
            // onClick={() => setTreeshow(true)}
          />
        </Form.Item>
        <Form.Item
          label="确认密码"
          name="checkPass"
          rules={[
            { required: true, message: '请输入新密码!' },
            { min: 6, max: 20, message: '长度在 6 到 20 个字符' },
            {
              validator(rule, value, callback) {
                if (!value) {
                  callback();
                }
                if (value === formref.current.getFieldValue('newPassword')) {
                  callback();
                } else {
                  callback('两次密码不一致');
                }
              },
            },
          ]}
        >
          <Input.Password
            autoComplete="off"
            style={{ height: 40 }}
            placeholder="请确认新密码"
            name="checkPass"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CrtPart;
