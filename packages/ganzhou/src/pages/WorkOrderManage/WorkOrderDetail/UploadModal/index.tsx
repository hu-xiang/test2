import { Modal, Form, DatePicker, message } from 'antd';
import React, { useRef, useEffect } from 'react';
import UploadPic from 'baseline/src/components/UploadFile';

import { useModel } from 'umi';

import { confirmUpload } from '../service';

import moment from 'moment';
import type { Moment } from 'moment';
import styles from './styles.less';

type Iprops = {
  isModalshow: boolean;
  onCancel: Function;
  onsetkey: Function;
  rowInfo: any;
  crtTime: string;
};
const UploadModal: React.FC<Iprops> = (props) => {
  const { filePath, setFilePath, fileName, setFileName } = useModel<any>('file');
  const formref = useRef<any>();

  useEffect(() => {
    formref.current.setFieldsValue({
      realTime: props.rowInfo.realTime,
    });
    setFilePath(props.rowInfo?.fileUrl);
    setFileName(props.rowInfo?.fileName);
  }, []);

  useEffect(() => {
    formref.current.setFieldsValue({
      filePath,
    });
  }, [filePath]);

  const handleSubmit = () => {
    formref.current
      .validateFields()
      .then(async () => {
        const formList = formref.current.getFieldsValue();
        formList.realTime = moment(formList.realTime).format('YYYY-MM-DD');
        formList.filePath = filePath;
        formList.fileName = fileName;
        formList.id = props.rowInfo.id;
        formList.orderId = props.rowInfo.orderId;
        const res = await confirmUpload(formList);
        if (res.status === 0) {
          message.success({
            content: '提交成功',
            key: '提交成功',
          });
          props.onCancel();
          props.onsetkey();
        } else {
          // message.error({
          //   content: res.message,
          //   key: res.message,
          // });
        }
      })
      .catch(() => {});
  };

  const disabledDate = (current: Moment) => {
    return current && current <= moment(props.crtTime).startOf('day');
  };

  return (
    <Modal
      title="上传维修结果"
      open={props.isModalshow}
      maskClosable={false}
      onCancel={() => props.onCancel()}
      onOk={() => handleSubmit()}
      className={styles.uploadBox}
    >
      <div>
        <Form
          labelAlign="right"
          labelCol={{ flex: '110px' }}
          labelWrap
          wrapperCol={{ flex: 1 }}
          ref={formref}
          colon={false}
        >
          <Form.Item
            label="实际完工时间"
            name="realTime"
            rules={[{ required: true, message: '请选择实际完工日期' }]}
          >
            <DatePicker disabledDate={disabledDate} style={{ width: '100%', height: '40px' }} />
          </Form.Item>
          <Form.Item
            label="上传维修图片"
            name="filePath"
            rules={[{ required: true, message: '请上传图片' }]}
            style={{ marginBottom: '0px' }}
          >
            <UploadPic
              uploadUrl="/traffic-km/order/disease/upload"
              removeUrl="/traffic-km/order/disease/file/del"
              id={props.rowInfo.id}
              width={116}
            ></UploadPic>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
export default UploadModal;
