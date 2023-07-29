import { Input, Modal, Form, Select, InputNumber, message } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import styles from '../styles.less';
import { editfstack } from '../service';

const { Option } = Select;
type Iprops = {
  edtShow: boolean;
  onCancel: Function;
  onsetkey: Function;
  edtInfo: any;
  edtId: any;
};

const EdtMod: React.FC<Iprops> = (props) => {
  const [kind] = useState({
    0: '上行',
    1: '下行',
  });
  const [kind2] = useState({
    0: 'WGS84',
    2: 'GCJ02',
    3: 'BD09',
  });

  const formref = useRef<any>();

  useEffect(() => {
    if (props.edtShow) {
      formref.current.setFieldsValue({
        ...props.edtInfo,
        stakeNum1: props.edtInfo.stakeNum.slice(1, props.edtInfo.stakeNum.indexOf('+')) * 1 || 0,
        stakeNum2: props.edtInfo.stakeNum.slice(props.edtInfo.stakeNum.indexOf('+') + 1) * 1 || 0,
      });
    }
  }, []);

  const crtusers = async () => {
    formref.current
      .validateFields()
      .then(async () => {
        const formList = formref.current.getFieldsValue();
        formList.stakeNum = `K${formList.stakeNum1 || 0}+${formList.stakeNum2 || 0}`;
        formList.id = props.edtInfo.id;
        const formData = new FormData();
        Object.keys(formList).forEach((key) => {
          if (typeof formList[key] === 'undefined' || formList[key] === null) {
            formData.append(key, '');
            formList[key] = '';
            return;
          }
          if (key === 'stakeNum1' || key === 'stakeNum2') {
            return;
          }

          formData.append(key, `${formList[key]}`);
        });

        try {
          const res = await editfstack(formData);
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onsetkey();
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

  return (
    <Modal
      title={'数据编辑'}
      open={props.edtShow}
      onCancel={() => props.onCancel()}
      onOk={() => crtusers()}
      className={`crtedtSta ${styles.crtedtSta}`}
      // maskClosable={false}
    >
      <div className="box">
        <Form
          labelAlign="right"
          labelCol={{ flex: '81px' }}
          labelWrap
          wrapperCol={{ flex: 1 }}
          ref={formref}
          colon={false}
        >
          <Form.Item label="道路名称" name="facilitiesName">
            <Input autoComplete="off" placeholder="请输入道路名称" disabled={props.edtShow} />
          </Form.Item>
          <Form.Item label="道路编码" name="roadSection">
            <Input autoComplete="off" placeholder="请输入道路编码" disabled={props.edtShow} />
          </Form.Item>
          <Form.Item
            label="经度"
            name="longitude"
            rules={[{ message: '请输入数字', pattern: /^[0-9.]*$/ }]}
          >
            <Input autoComplete="off" placeholder="请输入经度" />
          </Form.Item>
          <Form.Item
            label="纬度"
            name="latitude"
            rules={[{ message: '请输入数字', pattern: /^[0-9.]*$/ }]}
          >
            <Input autoComplete="off" placeholder="请输入纬度" />
          </Form.Item>

          <Form.Item label="桩号" name="stakeNum">
            <div>
              <span className="roadNumText">K</span>
              <Form.Item name="stakeNum1" style={{ display: 'inline-block', marginBottom: 0 }}>
                <InputNumber
                  // autoComplete="off"
                  controls
                  min={0}
                  precision={0}
                  // max={10}
                  // placeholder="点击选择上级菜单"
                  // onChange={changedNum}
                />
              </Form.Item>
              <span className="roadNumText">+</span>
              <Form.Item name="stakeNum2" style={{ display: 'inline-block', marginBottom: 0 }}>
                <InputNumber
                  // autoComplete="off"
                  controls
                  min={0}
                  precision={0}
                  // max={10}
                  // placeholder="点击选择上级菜单"
                  // onChange={changedNum}
                />
              </Form.Item>
            </div>
          </Form.Item>
          <Form.Item name="routeMode" label="行车方向" className="addUserClass">
            <Select style={{ height: 40 }} placeholder="请选择行车方向" allowClear>
              {Object.keys(kind).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {kind[item]}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="坐标系类型" name="coordinateSystemType">
            <Select
              style={{ height: 40 }}
              placeholder="请选择行车方向"
              allowClear
              disabled={props.edtShow}
            >
              {Object.keys(kind2).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {kind2[item]}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default EdtMod;
