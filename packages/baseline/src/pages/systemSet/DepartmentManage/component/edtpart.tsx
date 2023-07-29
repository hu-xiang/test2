import { Input, Modal, Form, message, Tree, Card } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles.less';
import { edtparts, getpartidinfo, fetchParentTree } from '../service';
import validRule from '../../../../utils/validate';

const { TextArea } = Input;

type Iprops = {
  edtpartshow: boolean;
  onCancel: Function;
  onupd: Function;
  treedata: any;
  partedtinfo: any;
};

const EdtPart: React.FC<Iprops> = (props) => {
  const [treeshow, setTreeshow] = useState(false);
  const [deptid, setDeptid] = useState(0);
  const [formlist, setFormlist] = useState<any>({});
  const [newtreeData, setNewtreeData] = useState<any>([]);
  const [idinfo, setIdinfo] = useState({});

  const ref = useRef<any>();
  const formref = useRef<any>();
  const rules: any = {
    deptName: [validRule.limitNumber20()],
  };
  const treemap = (treeres: any) => {
    treeres.map((item: any) => {
      if (item.id === props.partedtinfo.parentId) {
        formref.current.setFieldsValue({ parentId: item.label });
        return false;
      }
      if (item.children) {
        treemap(item.children);
      }
      return treeres;
    });
  };

  const convertData = (data: any) => {
    const datalen = data.length;
    const info = data;
    if (info?.length > 0) {
      info.forEach((item: any, index: any) => {
        info[index] = { ...item, title: item.label, key: item.id };
        if (item.children) {
          convertData(item.children);
        }
      });
    }
    if (data.length && datalen === data.length) {
      setNewtreeData(info);
    }
  };
  const getidinfo = async () => {
    const res = await getpartidinfo(props.partedtinfo.id);
    const infoRsres = await fetchParentTree(res.data.id, res.data.deptLv);
    convertData(infoRsres);
    setIdinfo(res.data);
  };

  // useEffect(() => {
  //   const newTreeData = props.treedata.filter((it: any) => {
  //     return props.partedtinfo.id !== it.id;
  //   });
  //   setNewtreeData(newTreeData);
  // }, [props.treedata]);
  useEffect(() => {
    const data = {
      deptName: props.partedtinfo.label,
      remark: props.partedtinfo.remark,
    };
    formref.current.setFieldsValue(data);
    treemap(props.treedata);
    getidinfo();
  }, []);

  const seltree = (selectedKeys: any, { node }: any) => {
    setDeptid(selectedKeys);
    formref.current.setFieldsValue({ parentId: node.label });
    setTreeshow(false);
  };

  const changedValue = (changedValues: any, allValues: any) => {
    setFormlist(allValues);
  };

  const crtnewpart = async () => {
    const obj2: any = idinfo;
    obj2.id = props.partedtinfo.id;
    if (deptid) {
      const [deid]: any = deptid;
      obj2.parentId = deid;
    } else {
      obj2.parentId = props.partedtinfo.parentId;
    }
    if (formlist.deptName) {
      obj2.deptName = formlist.deptName?.trim();
    } else {
      obj2.deptName = props.partedtinfo.label;
    }
    if (formlist.remark || formlist.remark === '') {
      obj2.remark = formlist.remark?.trim();
    } else {
      obj2.remark = props.partedtinfo.remark;
    }
    // formref.current.submit();
    // if (!obj2.deptName || !obj2.parentId||(Object.keys(formlist).length!==0&&!formlist?.deptName)) {
    //   message.error('请填好必要的信息!');
    //   return false;
    // }
    formref.current
      .validateFields()
      .then(async () => {
        try {
          const res = await edtparts(obj2);
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onCancel();
            props.onupd();
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

  const outcli = (e: any) => {
    if (treeshow && !e.target.contains(ref.current)) {
      setTreeshow(false);
    }
  };

  return (
    <Modal
      title="编辑"
      open={props.edtpartshow}
      onCancel={() => props.onCancel()}
      okText="更新"
      onOk={() => crtnewpart()}
      className={`crtdeipts ${styles.crtde}`}
      // maskClosable={false}
    >
      <div onClick={(e) => outcli(e)} className={styles.box}>
        <Form
          labelAlign="right"
          labelCol={{ flex: '67px' }}
          labelWrap
          wrapperCol={{ flex: 1 }}
          ref={formref}
          colon={false}
          onValuesChange={(changedValues, allValues) => changedValue(changedValues, allValues)}
        >
          <Form.Item label="名称" name="deptName" rules={rules.deptName}>
            <Input
              autoComplete="off"
              name="deptName"
              style={{ height: 40 }}
              placeholder="请输入名称"
            />
          </Form.Item>
          <Form.Item name="parentId" label="上级机构">
            <Input
              disabled={props.partedtinfo.parentId === -1}
              autoComplete="off"
              style={{ height: 40 }}
              placeholder="请选择"
              name="parentId"
              readOnly
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
              defaultExpandedKeys={[props.partedtinfo.parentId]}
              draggable={false}
              blockNode
              onSelect={seltree}
              treeData={newtreeData}
            />
          </Card>
        </div>
      ) : null}
    </Modal>
  );
};

export default EdtPart;
