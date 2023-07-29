import { Form, Modal, Input, message } from 'antd';
import React, { useRef, useEffect } from 'react';
import styles from '../styles.less';
import { addInnerParam } from '../service';

type Iprops = {
  showModal: boolean;
  onCancel: Function;
  onOk: Function;
  editInfo: any;
};

const { TextArea } = Input;

const EdtMod: React.FC<Iprops> = (props) => {
  const formref = useRef<any>();

  useEffect(() => {
    formref.current.setFieldsValue({
      cameraId: props.editInfo.cameraId,
      innerParam: props.editInfo.innerParam,
    });
  }, []);

  const submit = async () => {
    const formList = formref.current.getFieldsValue();
    const params = {
      cameraId: formList.cameraId,
      id: props.editInfo.id,
      innerParam: formList.innerParam,
    };
    const res = await addInnerParam(params);
    if (res.status === 0) {
      message.success({
        content: '提交成功',
        key: '提交成功',
      });
      props.onOk();
      props.onCancel();
    }
  };

  return (
    <Modal
      title={'标定配置'}
      open={props.showModal}
      onCancel={() => props.onCancel()}
      onOk={() => submit()}
      className={`markInnerModal ${styles.crtedtDev} ${styles.markInnerModal}`}
      destroyOnClose
      okText={'提交'}
      width={740}
    >
      <div className="box">
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 21 }} ref={formref} colon={false}>
          <Form.Item label="设备编号" name="cameraId">
            <Input autoComplete="off" placeholder="请输入设备编号" disabled />
          </Form.Item>
          <Form.Item label="标定参数" name="innerParam">
            <TextArea style={{ height: 375 }} autoComplete="off" placeholder="请输入标定参数" />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default EdtMod;
