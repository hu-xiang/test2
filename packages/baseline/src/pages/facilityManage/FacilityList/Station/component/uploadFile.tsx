import { Upload, Button, Modal, Form, Select, message } from 'antd';
import React, { useRef, useState } from 'react';
import styles from '../styles.less';
import { importexcel, educestackmod } from '../service';
// import validRule from '@/utils/validate';
import { UploadOutlined, PaperClipOutlined, DeleteOutlined } from '@ant-design/icons';
import { exportCom } from '../../../../../utils/exportCom';

const { Option } = Select;
type Iprops = {
  crtusershow: boolean;
  onCancel: Function;
  onsetkey: Function;
  edtId: any;
};

const UploadFile: React.FC<Iprops> = (props) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [kind] = useState({
    0: 'WGS84',
    2: 'GCJ02',
    3: 'BD09',
  });
  const [file1, setFile1] = useState<any>();
  // const ref = useRef<any>();
  const formref = useRef<any>();

  // const rules: any = {
  //   name: [validRule.limitNumber()],
  // };

  const beforeUpload = (fileinfos: any) => {
    setFile1(fileinfos);
    const index = fileinfos?.name?.lastIndexOf('.');
    setFirstName(fileinfos?.name?.substring(0, index));
    setLastName(fileinfos?.name?.substring(index, fileinfos?.name?.length));
    return false;
  };
  const onChange = (files: any) => {
    if (!files.fileList.length) {
      formref.current.setFieldsValue({
        file: undefined,
      });
    }
  };
  const downloadflie = async () => {
    const hide = message.loading({
      content: '正在导出',
      key: '正在导出',
    });
    try {
      const res: any = await educestackmod();
      hide();
      exportCom(res, `模板.xlsx`);
      message.success({
        content: '导出成功',
        key: '导出成功',
      });
      return true;
    } catch (error) {
      hide();
      message.error({
        content: '导出失败!',
        key: '导出失败!',
      });
      return false;
    }
  };
  const crtusers = async () => {
    formref.current
      .validateFields()
      .then(async () => {
        const formData = new FormData();
        const formList = formref.current.getFieldsValue();
        formData.append('file', file1);
        formData.append('facilitiesId', props.edtId);
        formData.append('coordinateSystemType', formList.coordinateSystemType);
        try {
          const res = await importexcel(formData);
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
        } catch (error) {
          message.error({
            content: '提交失败',
            key: '提交失败',
          });
          return false;
        }
      })
      .catch(() => {});
  };

  const removeFile = () => {
    setFile1('');
    setFirstName('');
    setLastName('');
    formref.current.setFieldsValue({
      file: undefined,
    });
  };

  return (
    <Modal
      title="导入数据"
      open={props.crtusershow}
      onCancel={() => props.onCancel()}
      onOk={() => crtusers()}
      className={`crtStat ${styles.crtStat}`}
      // maskClosable={false}
      okText={'提交'}
    >
      <div className="box">
        <div className={styles.uploadTopDown}>
          <div className={styles.textBox}>注：请使用标准模板上传</div>
          <span onClick={downloadflie}>下载模板</span>
        </div>
        <Form
          labelAlign="right"
          labelCol={{ flex: '92px' }}
          labelWrap
          wrapperCol={{ flex: 1 }}
          ref={formref}
          colon={false}
        >
          <Form.Item
            label="上传文件"
            name="file"
            valuePropName="file"
            rules={[{ required: true, message: '请上传文件' }]}
            // getValueFromEvent={({ file, fileList }) => {
            //   if (fileList.length > 0) {
            //     file.status = 'done';
            //     return [file];
            //   }
            //   return undefined;
            // }}
          >
            <div className={styles.uploadContent}>
              <Upload
                accept=".xls,.xlsx"
                maxCount={1}
                onChange={onChange}
                showUploadList={false}
                beforeUpload={beforeUpload}
              >
                <Button icon={<UploadOutlined />}>上传文件</Button>
              </Upload>
              {(firstName || lastName) && (
                <div className={styles.fileBox}>
                  <div className="fileIcon">
                    <PaperClipOutlined />
                  </div>
                  <div
                    className={styles.fileName}
                    title={firstName}
                    style={{ width: `${153 + 40}px` }}
                  >
                    <div className={styles.firstName} style={{ maxWidth: '153px' }}>
                      {firstName}
                    </div>
                    <div className={styles.lastName}>{lastName}</div>
                  </div>
                  <div className={styles.removeBnt}>
                    <DeleteOutlined onClick={removeFile} />
                  </div>
                </div>
              )}
            </div>
          </Form.Item>
          <Form.Item
            label="坐标系类型"
            name="coordinateSystemType"
            rules={[{ required: true, message: '请选择坐标系类型' }]}
          >
            <Select style={{ height: 40 }} placeholder="请选择坐标系类型型" allowClear>
              {Object.keys(kind).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {kind[item]}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default UploadFile;
