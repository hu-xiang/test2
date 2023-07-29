import { Input, Modal, Form, TreeSelect, message } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import styles from '../styles.less';
import { fetchTree, deviceTenEdt } from '../service';

type Iprops = {
  edtShow: boolean;
  onCancel: Function;
  onsetkey: Function;
  edtInfo: any;
};

const EdtMod: React.FC<Iprops> = (props) => {
  const ref = useRef<any>();
  const { edtInfo } = props;
  const [treelist, setTreelist] = useState<any>([]);
  const [treeshow, setTreeshow] = useState(false);
  const [treeold, setTreeold] = useState([]);
  const isTenant = localStorage.getItem('isTenant');
  const formref = useRef<any>();
  const outcli = (e: any) => {
    if (treeshow && !e.target.contains(ref.current)) {
      setTreeshow(false);
    }
  };
  const convertData = (data: any) => {
    const datalen = data.length;
    const info = data;
    info.forEach((item: any, index: any) => {
      info[index] = {
        ...item,
        label: item.label.toString(),
        key: item.id.toString(),
        value: item.id.toString(),
      };
      if (item.children) {
        convertData(item.children);
      }
    });
    if (data.length && datalen === data.length && treeold.length === data.length) {
      setTreelist(info);
    }
  };
  const getTree = async () => {
    const res = await fetchTree();
    setTimeout(() => {
      setTreeold(res);
    }, 0);
    return res;
  };
  // const treemap = (treeres: any) => {
  //   treeres.map((item: any) => {
  //     // if (item.id === edtInfo.deptIds) {
  //     //   formref.current.setFieldsValue({ deptIds: [item.id] });
  //     //   return false;
  //     // }
  //     if (item.children) {
  //       treemap(item.children);
  //     }
  //     return treeres;
  //   });
  // };

  useEffect(() => {
    convertData(treeold);
  }, [treeold]);
  useEffect(() => {
    // const fn = async () => {
    //   const treeres = await getTree();
    //   treemap(treeres);
    // };
    getTree();
    formref.current.setFieldsValue({
      ...edtInfo,
    });

    if (!edtInfo?.deptIds) {
      formref.current.setFieldsValue({ deptIds: undefined });
    }
  }, []);
  const crtusers = async () => {
    formref.current
      .validateFields()
      .then(async () => {
        const formList = formref.current.getFieldsValue();

        try {
          formList.id = edtInfo.id;
          const newData = {
            ...formList,
            id: edtInfo?.id,
            deviceNo: edtInfo?.deviceId,
          };
          const res = await deviceTenEdt(newData);
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onsetkey();
            props.onCancel();
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
      title={'编辑设备'}
      open={props.edtShow}
      onCancel={() => props.onCancel()}
      onOk={() => crtusers()}
      className={`crtedtDev ${styles.crtedtDev}`}
      // maskClosable={false}
      width={600}
      destroyOnClose
      okText={'提交'}
    >
      <div className="box" onClick={(e) => outcli(e)}>
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 21 }} ref={formref}>
          <Form.Item
            label="设备名称"
            name="deviceName"
            rules={[
              {
                required: true,
                max: 15,
                message: '由中文、英文字母、数字、下划线和中划线组成(15位以内)',
                pattern: /^[\u4E00-\u9FA5A-Za-z0-9_-]+$/,
              },
            ]}
          >
            <Input autoComplete="off" maxLength={15} placeholder="请输入设备名称" />
          </Form.Item>
          <Form.Item
            label="巡检员姓名 "
            name="inspectorName"
            rules={[
              {
                // required: true,
                message: '请输入巡检员中文姓名',
                pattern: /^[\u4E00-\u9FA5]+$/,
              },
            ]}
          >
            <Input autoComplete="off" placeholder="请输入巡检员姓名" />
          </Form.Item>
          <Form.Item
            label="联系方式"
            name="inspectorTel"
            rules={[
              {
                // required: true,
                pattern:
                  /^((0\d{2,3}-\d{7,8})|((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-8])|(18[0-9])|166|198|199|147)\d{8})$/,
                message: '联系电话格式有误',
              },
            ]}
          >
            <Input autoComplete="off" placeholder="请输入联系方式" />
          </Form.Item>
          <Form.Item
            label="组织架构"
            name="deptIds"
            rules={[{ required: true, message: '请选择组织架构' }]}
          >
            <TreeSelect
              disabled={isTenant !== '1'}
              treeData={treelist}
              // treeCheckable="true"
              allowClear={true}
              // treeCheckStrictly={true}
              // showCheckedStrategy="SHOW_ALL"
              maxTagCount={'responsive'}
              placeholder={'请选择组织架构'}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default EdtMod;
