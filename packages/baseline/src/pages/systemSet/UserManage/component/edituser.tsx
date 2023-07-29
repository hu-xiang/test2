import { Input, Modal, Form, Select, message, Tree, Card } from 'antd';
import React, { useEffect, useState, useRef } from 'react';

import validRule from '../../../../utils/validate';
import styles from '../styles.less';
import {
  getrole,
  fetchTree,
  getrolechild,
  getuserinfo,
  edituserinfo,
  checkPhone,
} from '../service';

const { TextArea } = Input;
const { Option } = Select;

type Iprops = {
  editusershow: boolean;
  onCancel: Function;
  onsetkey: Function;
  editinfo: any;
  editid: any;
};

const EditUser: React.FC<Iprops> = (props) => {
  const { editinfo, editid } = props;
  const [rolelist, setRolelist] = useState<any>([]);
  const [roleIdlist, setRoleIdlist] = useState([]);
  const [role, setRole] = useState('');
  const [roleId, setRoleId] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [formlist, setformlist] = useState<any>({});
  const [treelist, setTreelist] = useState<any>([]);
  const [treeold, setTreeold] = useState([]);
  const [treeshow, setTreeshow] = useState(false);
  const [userinfos, setUserinfos] = useState<any>({});
  const [deptid, setDeptid] = useState<any>(0);
  const [phon, setPhon] = useState(0);
  const [phonecheck, setPhonecheck] = useState<any>('');
  const [propPhone, setPropPhone] = useState();
  const [form] = Form.useForm();
  const formref = useRef<any>();
  const ref = useRef<any>();
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
  const rules: any = {
    name: [validRule.limitNumber20()],
    phone: [
      {
        required: true,
        validator(rule: any, value: any, callback: any) {
          const regExp =
            /^((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-8])|(18[0-9])|166|198|199|147)\d{8}$/;
          if (!value) {
            callback('请输入手机号码!');
          } else if (propPhone === value) {
            callback();
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
  const changedValue = (changedValues: any) => {
    // setformlist(allValues);
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
    const obj = res?.data?.role;
    const list: any = [];
    if (obj) {
      Object.values(obj).forEach((item) => {
        list.push(item);
      });
    }
    setRolelist(list);
    form.setFieldsValue({
      roleType: list?.length > 0 ? list[props.editinfo.roleType * 1] : undefined,
    });
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

  const treemap = (treeres: any) => {
    treeres.map((item: any) => {
      if (item.id === props.editinfo.deptId) {
        form.setFieldsValue({ deptId: item.label });
        return false;
      }
      if (item.children) {
        treemap(item.children);
      }
      return treeres;
    });
  };

  const getuserinfos = async () => {
    const res = await getuserinfo(props.editid);
    setUserinfos(props.editinfo);
    const list = res.data;
    // const params = {
    //   code: 'role',
    // };
    // const roleres = await getrole(params);
    // const obj = roleres?.data?.role;
    // const rolist: any = [];
    // if(obj){
    //   Object.values(obj).forEach((item) => {
    //     rolist.push(item);
    //   });
    // }
    const p = {
      type: props?.editinfo?.roleType,
    };
    const rolechild = await getrolechild(p);
    setRoleIdlist(rolechild.data);
    const par = {
      type: null,
    };
    const treeres = await fetchTree(par);
    treemap(treeres);
    setPropPhone(list.phone);
    if (list) {
      form.setFieldsValue({ idcard: list.idcard });
      form.setFieldsValue({ name: list.name });
      form.setFieldsValue({ phone: list.phone });
      form.setFieldsValue({ remark: list.remark });
      setPhon(list.phone);
      form.setFieldsValue({ roleId: props.editinfo.roleId });
      form.setFieldsValue({ username: list.username });
    }
  };

  useEffect(() => {
    convertData(treeold);
  }, [treeold]);

  useEffect(() => {
    getrolelist();
    getTree();
    // setTimeout(() => {
    //   getuserinfos();
    // }, 1);
  }, []);

  useEffect(() => {
    if (editid) {
      getuserinfos();
    }
  }, [editid, editinfo]);

  const crtusers = async () => {
    userinfos.phone = phon;
    if (userinfos) {
      userinfos.id = props.editid;
    }
    const formLists = form.getFieldsValue(true);
    if (formLists.name) {
      userinfos.name = formLists.name;
    }
    if (formLists.username) {
      userinfos.username = formLists.username;
    }
    if (formLists.phone) {
      userinfos.phone = formLists.phone;
    }
    if (rolelist && formLists.roleType) {
      userinfos.roleType = rolelist.indexOf(formLists.roleType);
    }
    if (deptid) {
      [userinfos.deptId] = deptid;
    }
    if (roleIdlist?.length > 0) {
      roleIdlist.map((item: any) => {
        if (item.roleName === formLists.roleId) {
          // userinfos.roleId = item.id;
          userinfos.roleIdArr = [item.id];
        }
        return roleIdlist;
      });
    }

    userinfos.remark = formLists.remark?.trim();
    userinfos.idcard = formLists.idcard?.trim();
    userinfos.name = userinfos.name?.trim();
    userinfos.username = userinfos.username?.trim();
    userinfos.phone = userinfos.phone?.trim();
    userinfos.roleId = formLists.roleId;

    formref.current
      .validateFields()
      .then(async () => {
        try {
          setIsLoading(true);
          const res = await edituserinfo(props.editid, userinfos);
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onCancel();
            setIsLoading(false);
            props.onsetkey();
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
    setRoleId('');
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

  // const changeunphone = async (e: any) => {
  //   const code = {
  //     phone: e.target.value,
  //   };
  //   const res = await checkPhone(code);
  //   if (res.data === 0 && e.target.value.length === 11) {
  //     setPhonecheck('success');
  //   } else {
  //     setPhonecheck('error');
  //   }
  // };
  const outcli = (e: any) => {
    if (treeshow && !e.target.contains(ref.current)) {
      setTreeshow(false);
    }
  };

  return (
    <Modal
      title="编辑"
      open={props.editusershow}
      onCancel={() => props.onCancel()}
      onOk={() => crtusers()}
      confirmLoading={isLoading}
      className={`crtuseript ${styles.crtuser}`}
      // maskClosable={false}
      destroyOnClose
    >
      <div onClick={(e) => outcli(e)} className="box">
        <Form
          form={form}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 21 }}
          ref={formref}
          colon={false}
          onValuesChange={(changedValues) => changedValue(changedValues)}
        >
          <Form.Item label="真实姓名" name="name" rules={rules.name}>
            <Input autoComplete="off" placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item label="账户名称" name="username">
            <Input autoComplete="off" disabled placeholder="请输入账户" />
          </Form.Item>
          <Form.Item
            label="手机号"
            name="phone"
            validateStatus={phonecheck}
            hasFeedback
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
                  disabled={props.editinfo.username === 'admin'}
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
                rules={rules.roleId}
                style={{
                  display: 'inline-block',
                  width: 'calc(50% - 8px)',
                  marginLeft: '10px',
                  marginBottom: '0',
                }}
              >
                <Select
                  value={roleId}
                  style={{ height: 40 }}
                  placeholder="请选择"
                  allowClear
                  disabled={props?.editinfo?.username === 'admin'}
                  onChange={changeOpt2}
                >
                  {roleIdlist?.length > 0 &&
                    roleIdlist.map((item: any) => (
                      <Option key={item.id} value={item.id}>
                        {item.roleName}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </div>
          </Form.Item>
          <Form.Item
            label="组织机构"
            name="deptId"
            rules={[{ required: true, message: '请选择部门' }]}
          >
            <Input
              autoComplete="off"
              readOnly
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
export default EditUser;
