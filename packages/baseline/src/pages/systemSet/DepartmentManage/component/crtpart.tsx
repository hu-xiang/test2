import { Input, Modal, Form, message, Tree, Card } from 'antd';
import React, { useState, useRef } from 'react';
import styles from '../styles.less';
import { postnewpart } from '../service';
import validRule from '../../../../utils/validate';

const { TextArea } = Input;

interface Iprops {
  treedata: any;
  crtupartshow: boolean;
  onCancel: Function;
  onupd: Function;
}

const CrtPart: React.FC<Iprops> = (props) => {
  const [treeshow, setTreeshow] = useState(false);
  const [deptid, setDeptid] = useState<any>(0);
  const [formlist, setFormlist] = useState<any>({});

  const ref = useRef<any>();
  const formref = useRef<any>();
  const rules: any = {
    deptName: [validRule.limitNumber20()],
  };
  const seltree = (selectedKeys: any, { node }: any) => {
    setDeptid(selectedKeys);
    formref.current.setFieldsValue({ parentId: node.label });
    setTreeshow(false);
  };
  const changedValue = (changeVal: any, allValues: any) => {
    setFormlist(allValues);
  };

  const crtnewpart = async () => {
    let parentIds: any = -1;
    if (deptid) {
      [parentIds] = deptid;
    }
    const obj = {
      deptName: formlist.deptName?.trim(),
      parentId: parentIds,
      remark: formlist.remark?.trim(),
    };
    // formref.current.submit();
    // if (!obj.deptName) {
    //   message.error('请填好必要的信息!');
    //   return false;
    // }
    formref.current
      .validateFields()
      .then(async () => {
        try {
          const res = await postnewpart(obj);
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
      title="部门创建"
      open={props.crtupartshow}
      onCancel={() => props.onCancel()}
      onOk={() => crtnewpart()}
      className={`crtdeipts ${styles.crtde}`}
      // maskClosable={false}
    >
      <div onClick={(e) => outcli(e)} className={styles.box}>
        <Form
          labelAlign="right"
          labelCol={{ flex: '78px' }}
          labelWrap
          wrapperCol={{ flex: 1 }}
          ref={formref}
          colon={false}
          onValuesChange={(changedValues, allValues) => changedValue(changedValues, allValues)}
        >
          <Form.Item label="名称" name="deptName" rules={rules.deptName}>
            <Input
              style={{ height: 40 }}
              autoComplete="off"
              name="deptName"
              placeholder="请输入名称"
            />
          </Form.Item>
          <Form.Item
            name="parentId"
            label="上级机构"
            rules={[{ required: true, message: '请选择上级机构' }]}
          >
            <Input
              autoComplete="off"
              readOnly
              style={{ height: 40 }}
              placeholder="请选择"
              name="parentId"
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
              defaultExpandedKeys={[props.treedata[0].key]}
              draggable={false}
              blockNode
              onSelect={seltree}
              treeData={props.treedata}
            />
          </Card>
        </div>
      ) : null}
    </Modal>
  );
};

export default CrtPart;
