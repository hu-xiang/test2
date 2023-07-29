import { Input, Modal, Form, message } from 'antd';
import React, { useRef, useEffect } from 'react';
import { imgUpdata } from '../service';

type Iprops = {
  parameterShow: boolean;
  onCancel: Function;
  onsetkey: Function;
  imgInfo: any;
};

const DemarcateParameter: React.FC<Iprops> = (props) => {
  const formref = useRef<any>();
  const { imgInfo } = props;
  useEffect(() => {
    formref.current.setFieldsValue({
      imgId: imgInfo.imgId,
      param: imgInfo.param,
    });
  }, []);
  const crtusers = async () => {
    formref.current
      .validateFields()
      .then(async () => {
        const formList = { ...imgInfo, ...formref.current.getFieldsValue() };
        try {
          const res = await imgUpdata(formList);
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
            content: '请输入符合规格的标定参数!',
            key: '请输入符合规格的标定参数!',
          });
          return false;
        }
      })
      .catch(() => {});
  };

  return (
    <Modal
      title={'标定参数'}
      open={props.parameterShow}
      onCancel={() => props.onCancel()}
      onOk={() => {
        crtusers();
      }}
      className={`parameter parameter1`}
      // maskClosable={false}
      okText={'提交'}
    >
      <div className="box">
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} ref={formref}>
          <Form.Item
            label="标定图片ID"
            name="imgId"
            rules={[{ required: true, message: '请输入设备编号' }]}
          >
            <Input autoComplete="off" placeholder="请输入标定图片ID" disabled />
          </Form.Item>
          <Form.Item
            label="标定参数"
            name="param"
            className="texteare-class"
            rules={[{ required: true, message: '请输入标定参数' }]}
          >
            <Input.TextArea style={{ height: 200 }} autoSize={{ minRows: 10, maxRows: 10 }} />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default DemarcateParameter;
