import { Input, Modal, Form, Select, message, Tree, Card } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import styles from '../styles.less';
import { adduser, getrole, fetchTree, getrolechild, checkUserName, checkPhone } from '../service';
import validRule from '../../../../utils/validate';

const { TextArea } = Input;
const { Option } = Select;
type Iprops = {
  crtusershow: boolean;
  onCancel: Function;
  onsetkey: Function;
};

const CrtUser: React.FC<Iprops> = (props) => {
  const [rolelist, setRolelist] = useState<any>([]);
  const [roleIdlist, setRoleIdlist] = useState([]);
  const [role, setRole] = useState('');
  const [roleId, setRoleId] = useState<any>();
  const [formlist, setFormlist] = useState<any>({});
  const [treelist, setTreelist] = useState<any>([]);
  const [treeold, setTreeold] = useState([]);
  const [deptid, setDeptid] = useState<any>(0);
  const [treeshow, setTreeshow] = useState(false);
  const [namecheck, setNamecheck] = useState<any>('');
  const [phonecheck, setPhonecheck] = useState<any>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const ref = useRef<any>();
  const formref = useRef<any>();
  const changeunphone = async (e: any) => {
    const code = {
      phone: e,
    };
    const res = await checkPhone(code);
    if (res.status === 0 && e.length === 11) {
      setPhonecheck('success');
      return Promise.resolve('success');
    }
    setPhonecheck('error');
    return Promise.resolve('fail');
  };
  const changeuname = async (e: any) => {
    const code = {
      username: e,
    };
    const res = await checkUserName(code);
    if (res.status === 0) {
      setNamecheck('success');
      return Promise.resolve('success');
    }
    setNamecheck('error');
    return Promise.resolve('fail');
  };
  const rules: any = {
    name: [validRule.limitNumber20()],
    username: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          const regExp = /^([a-zA-Z0-9_]){1,50}$/;
          if (!value) {
            callback('请输入账户名称!');
          } else if (!regExp.test(value)) {
            callback('数字、大小写字母、下划线(1-50位组成)');
          } else {
            changeuname(value).then((val: any) => {
              if (val === 'success') {
                callback();
              } else {
                callback('账户名称后台校验不合格');
              }
            });
          }
        },
      },
    ],
    phone: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          const regExp =
            /^((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-8])|(18[0-9])|166|198|199|147)\d{8}$/;
          if (!value) {
            callback('请输入手机号码!');
          } else if (!regExp.test(value)) {
            callback('手机号码格式不正确');
          } else {
            changeunphone(value).then((val: any) => {
              if (val === 'success') {
                callback();
              } else {
                callback('手机号码后台校验不合格');
              }
            });
          }
        },
      },
    ],
    roleType: [validRule.selectReq('角色类型')],
    roleId: [validRule.selectReq('角色姓名')],
    deptId: [validRule.selectReq('部门')],
  };
  const changedValue = (changedValues: any, allValues: any) => {
    setFormlist(allValues);
    rolelist.map(async (item: any) => {
      if (changedValues.roleType === item) {
        const roleind = rolelist.indexOf(item).toString();
        const params = {
          type: roleind,
        };
        const res = await getrolechild(params);
        setRoleIdlist(res.data);
      }
      return true;
    });
  };

  const getrolelist = async () => {
    const params = {
      code: 'role',
    };
    const res = await getrole(params);
    const obj = res.data.role;
    const list: any = [];
    Object.values(obj).forEach((item) => {
      list.push(item);
    });
    setRolelist(list);
    return res;
  };

  const convertData = (data: any) => {
    const datalen = data.length;
    const info = data;
    info.forEach((item: any, index: any) => {
      info[index] = { ...item, title: item.label, key: item.id };
      if (item.children) {
        convertData(item.children);
      }
    });
    if (data.length && datalen === data.length && treeold.length === data.length) {
      setTreelist(info);
    }
  };

  const getTree = async () => {
    const params = {
      type: null,
    };
    const res = await fetchTree(params);
    setTimeout(() => {
      setTreeold(res);
    }, 0);
    return res;
  };

  useEffect(() => {
    convertData(treeold);
  }, [treeold]);

  useEffect(() => {
    getrolelist();
    getTree();
  }, []);

  const crtusers = async () => {
    let parentIds = 0;
    if (deptid) {
      [parentIds] = deptid;
    }

    formlist.deptId = parentIds;
    formlist.roleType = rolelist.indexOf(formlist.roleType);
    if (!formlist.idcard) formlist.idcard = '';
    if (!formlist.remark) formlist.remark = '';
    // roleIdlist.map((item: any) => {
    //   if (item.roleName === formlist.roleId) {
    //     formlist.roleId = item.id;
    //   }
    //   return roleIdlist;
    // });
    // formref.current.submit();
    if (!formlist.username) {
      setNamecheck('error');
    }
    if (!formlist.phone) {
      setPhonecheck('error');
    }
    formlist.name = formlist.name?.trim();
    formlist.username = formlist.username?.trim();
    formlist.phone = formlist.phone?.trim();
    formlist.idcard = formlist.idcard?.trim();
    formlist.remark = formlist.remark?.trim();
    formref.current
      .validateFields()
      .then(async () => {
        try {
          setIsLoading(true);
          const res = await adduser(formlist);
          props.onsetkey();
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            setIsLoading(false);
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
    setRole(value);
    setRoleId(undefined);
    setRoleIdlist([]);
    formref.current.setFieldsValue({ roleId: '' });
  };

  const changeOpt2 = (value: any) => {
    setRoleId(value);
  };

  const seltree = (selectedKeys: any, { node }: any) => {
    setDeptid(selectedKeys);
    formref.current.setFieldsValue({ deptId: node.label });
    setTreeshow(false);
  };

  const outcli = (e: any) => {
    if (treeshow && !e.target.contains(ref.current)) {
      setTreeshow(false);
    }
  };

  return (
    <Modal
      title="用户创建"
      open={props.crtusershow}
      onCancel={() => props.onCancel()}
      onOk={() => crtusers()}
      confirmLoading={isLoading}
      className={`crtuseript ${styles.crtuser}`}
      // maskClosable={false}
    >
      <div className="box" onClick={(e) => outcli(e)}>
        <Form
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 21 }}
          ref={formref}
          colon={false}
          onValuesChange={(changedValues, allValues) => changedValue(changedValues, allValues)}
        >
          <Form.Item label="真实姓名" name="name" rules={rules.name}>
            <Input autoComplete="off" placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            label="账户名称"
            name="username"
            hasFeedback
            rules={rules.username}
            validateStatus={namecheck}
          >
            {/* onChange={(e) => changeuname(e)} */}
            <Input autoComplete="off" placeholder="请输入账户" />
          </Form.Item>
          <Form.Item
            label="手机号"
            name="phone"
            hasFeedback
            validateStatus={phonecheck}
            rules={rules.phone}
          >
            <Input
              autoComplete="off"
              // onChange={(e) => changeunphone(e)}
              placeholder="请输入手机号"
              maxLength={11}
            />
          </Form.Item>
          <Form.Item label="身份证" name="idcard">
            <Input autoComplete="off" placeholder="请输入身份证号" maxLength={18} />
          </Form.Item>
          <Form.Item
            name="roleType"
            label="角色"
            className="addUserClass"
            rules={[{ required: true, message: '' }]}
          >
            <div className="roleBox">
              <Form.Item
                name="roleType"
                style={{ display: 'inline-block', width: 'calc(50% - 8px)', marginBottom: '0' }}
                rules={rules.roleType}
              >
                <Select
                  value={role}
                  style={{ height: 40 }}
                  placeholder="请选择"
                  onChange={changeOpt1}
                  allowClear
                >
                  {rolelist.map((item: any) => (
                    <Option key={item} value={item}>
                      {item}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="roleId"
                style={{
                  display: 'inline-block',
                  width: 'calc(50% - 8px)',
                  marginLeft: '10px',
                  marginBottom: '0',
                }}
                rules={rules.roleId}
              >
                <Select
                  value={roleId}
                  style={{ height: 40 }}
                  placeholder="请选择"
                  onChange={changeOpt2}
                  allowClear
                >
                  {roleIdlist.map((item: any) => (
                    <Option key={item.id} value={item.id}>
                      {item.roleName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </Form.Item>
          <Form.Item label="组织机构" name="deptId" rules={rules.deptId}>
            <Input
              readOnly
              autoComplete="off"
              placeholder="请选择部门"
              onClick={() => setTreeshow(true)}
            />
          </Form.Item>
          <Form.Item label="描述" name="remark" className="texteare-class">
            <TextArea placeholder="请输入内容" style={{ height: 75 }} />
          </Form.Item>
        </Form>
      </div>
      {treeshow ? (
        <div ref={ref}>
          <Card className={styles.treecard}>
            <Tree
              className="draggable-tree"
              defaultExpandedKeys={[treelist[0].key]}
              draggable={false}
              blockNode
              onSelect={seltree}
              treeData={treelist}
            />
          </Card>
        </div>
      ) : null}
    </Modal>
  );
};

export default CrtUser;
