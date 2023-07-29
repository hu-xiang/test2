import { Form, Modal, Upload, message, Button } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { commonRequest, commonExport } from 'baseline/src/utils/commonMethod';
import { UploadOutlined, PaperClipOutlined, DeleteOutlined } from '@ant-design/icons';
import { exportCom } from 'baseline/src/utils/exportCom';
import styles from './styles.less';

type Iprops = {
  isImportModal: boolean;
  onCancel: Function;
  onOk: Function;
};

const requestList = [
  { url: '/traffic-bsl/accident/downLoad', method: 'get', blob: true },
  { url: '/traffic-bsl/accident/importExcel', method: 'post', blob: true },
];

const ImportModal: React.FC<Iprops> = (props) => {
  const formref = useRef<any>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [file, setFile] = useState<any>();

  useEffect(() => {}, []);

  const beforeUpload = (fileinfos: any) => {
    setFile(fileinfos);
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
    commonExport({ ...requestList[0] }, '', `模板.xlsx`);
  };

  const removeFile = () => {
    setFile('');
    setFirstName('');
    setLastName('');
    formref.current.setFieldsValue({
      file: undefined,
    });
  };

  const handleSubmit = async () => {
    formref.current
      .validateFields()
      .then(async () => {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await commonRequest({ ...requestList[1], params: formData });
          if (res?.response?.status === 200 && !res?.data?.size) {
            message.success({
              content: '上传成功',
              key: '上传成功',
            });
            props.onOk();
            return;
          }
          if (res && res?.data?.size) {
            message.error({
              content: '请打开文件查看错误信息，更正后重新上传！',
              key: '请打开文件查看错误信息，更正后重新上传！',
            });
            removeFile();
            exportCom(res);
          }
        } catch {
          message.error({
            content: '提交失败!',
            key: '提交失败!',
          });
        }
      })
      .catch(() => {});
  };

  return (
    <div>
      <Modal
        title="导入数据"
        open={props.isImportModal}
        maskClosable={false}
        onCancel={() => {
          props.onCancel();
        }}
        onOk={() => handleSubmit()}
        okText="提交"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '520px',
            height: '40px',
            lineHeight: '40px',
            background: 'rgba(237, 123, 47, 0.05)',
            margin: '-20px 0 20px -20px',
            padding: '0 20px 0 25px',
          }}
        >
          <div style={{ color: '#ED7B2F' }}>注：请使用标准模板上传</div>
          <Button style={{ height: '32px', marginTop: '4px' }} onClick={downloadflie}>
            下载模板
          </Button>
        </div>
        <div className={styles.accidentImportFile}>
          <Form
            labelAlign="right"
            labelCol={{ flex: '78px' }}
            labelWrap
            wrapperCol={{ flex: 1 }}
            ref={formref}
            colon={false}
          >
            <Form.Item
              label="上传文件"
              name="file"
              rules={[{ required: true, message: '请上传文件' }]}
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
                      style={{ width: `${168 + 40}px` }}
                    >
                      <div className={styles.firstName} style={{ maxWidth: '168px' }}>
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
          </Form>
        </div>
      </Modal>
    </div>
  );
};
export default ImportModal;
