import { Input, Modal, Form, Select } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import styles from '../styles.less';
import DemarcateImgLib from './demarcateImgLib';

const { Option } = Select;
type Iprops = {
  edtShow: boolean;
  onCancel: Function;
  onsetkey: Function;
  demarcateInfo: any;
};

const DemarcateSet: React.FC<Iprops> = (props) => {
  const [kind] = useState({
    0: '通道1',
    1: '通道2',
    2: '通道3',
  });
  const [imgLibShow, setimgLibShow] = useState(false);

  const formref = useRef<any>();

  useEffect(() => {
    formref.current.setFieldsValue({
      deviceId: props.demarcateInfo.deviceId,
    });
  }, []);

  return (
    <Modal
      title={'选择摄像头通道号'}
      open={props.edtShow}
      onCancel={() => props.onCancel()}
      onOk={() => {
        formref.current
          .validateFields()
          .then(async () => {
            setimgLibShow(true);
          })
          .catch(() => {});
      }}
      className={`DemarcateSet ${styles.DemarcateSet}`}
      // maskClosable={false}
      okText={'下一步'}
    >
      <div className="box">
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 21 }} ref={formref} colon={false}>
          <Form.Item
            label="设备编号"
            name="deviceId"
            rules={[{ required: true, message: '请输入设备编号' }]}
          >
            <Input autoComplete="off" placeholder="请输入设备编号" disabled />
          </Form.Item>
          <Form.Item
            label="通道号"
            name="channelNo"
            rules={[{ required: true, message: '请选择通道号' }]}
          >
            <Select style={{ height: 40 }} placeholder="请选择通道号" allowClear>
              {Object.keys(kind).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {kind[item]}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </div>
      {imgLibShow ? (
        <DemarcateImgLib
          imgLibShow={imgLibShow}
          channelNo={kind[formref.current.getFieldsValue().channelNo]}
          channelid={formref.current.getFieldsValue().channelNo}
          deviceId={props.demarcateInfo.deviceId}
          onCancel={() => {
            setimgLibShow(false);
          }}
        />
      ) : null}
    </Modal>
  );
};

export default DemarcateSet;
