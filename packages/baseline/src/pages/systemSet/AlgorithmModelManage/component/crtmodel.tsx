import { Input, Modal, Form, message, Upload, Spin, Popconfirm } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import styles from '../../RoleManage/styles.less';
import { addmodel, getmodpk, uploadfile, delfile } from '../service';
import { InboxOutlined } from '@ant-design/icons';
import { DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;

type Iprops = {
  crtusershow: boolean;
  onCancel: Function;
  onsetkey: Function;
};
const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

const CrtModel: React.FC<Iprops> = (props) => {
  const [formlist, setFormlist] = useState<any>({});
  const [modpkid, setModpkid] = useState<any>(0);
  const [filenum, setFilenum] = useState(0);
  const [fileUrl, setFileUrl] = useState([]);
  const [flag, setFlag] = useState(false);
  const [fileflag, setFileflag] = useState(true);
  const [updalist, setUpdalist] = useState<any>({});

  const formref = useRef<any>();

  const changedValue = (changedValues: any, allValues: any) => {
    setFormlist(allValues);
  };

  const beforeUploads = (fileinfos: any) => {
    if (filenum === 1) {
      message.error({
        content: '只能上传一个文件!',
        key: '只能上传一个文件!',
      });
      return false;
    }
    // setFilenum(1)
    setFlag(true);
    const reader = new FileReader();
    reader.readAsDataURL(fileinfos);
    reader.onload = async () => {
      const formData = new FormData();
      formData.append('file', fileinfos);
      formData.append('modelFileId', modpkid);
      try {
        const res = await uploadfile(formData);
        setUpdalist(res.data);
        if (res.status === 0) {
          // message.success('添加成功');
          const { uid } = fileinfos;
          const { name } = fileinfos;
          const { filePath } = res.data;
          const imginfo = {
            uid,
            filePath,
            name,
          };
          let imgurlList: any = [];
          imgurlList = fileUrl;
          imgurlList.push(imginfo);
          setFileUrl(imgurlList);
          setFilenum(1);
          setFlag(false);
          setFileflag(false);
          formref.current.setFieldsValue(formlist);
        } else {
          // message.error({
          //   content: res.message,
          //   key: res.message,
          // });
          setFlag(false);
        }
        return true;
      } catch (error) {
        setFlag(false);
        return false;
      }
    };
    return true;
  };

  const getpk = async () => {
    const res = await getmodpk();
    setModpkid(res.data);
  };

  useEffect(() => {
    getpk();
  }, []);

  const crtmod = async () => {
    formlist.modelVersion = formlist.modelVersion?.trim();
    formlist.remark = formlist.remark?.trim();
    formlist.id = modpkid;
    formlist.fileName = updalist.fileName;
    formlist.filePath = updalist.filePath;
    formlist.md5 = updalist.md5;

    formref.current.submit();
    if (!formlist.modelVersion || fileUrl.length === 0) {
      return false;
    }
    try {
      const res = await addmodel(formlist);
      if (res.status === 0) {
        props.onsetkey();
        message.success({
          content: '提交成功',
          key: '提交成功',
        });
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
  };

  const removeFile = async (file: any) => {
    const { filePath } = file;
    const formData = new FormData();
    formData.append('id', file.id);
    formData.append('path', filePath);
    const hide = message.loading({
      content: '正在删除',
      key: '正在删除',
    });
    try {
      const res = await delfile(formData);
      hide();
      if (res.status === 0) {
        message.success({
          content: '删除成功',
          key: '删除成功',
        });
        setFilenum(0);
        setFileUrl([]);
        setFileflag(true);
        formref.current.setFieldsValue(formlist);
      }
      // else {
      //   message.error({
      //     content: res.message,
      //     key: res.message,
      //   });
      // }
      return true;
    } catch (error) {
      hide();
      message.error({
        content: '删除失败!',
        key: '删除失败!',
      });
      return false;
    }
  };

  return (
    <Modal
      title="文件模型创建"
      open={props.crtusershow}
      onCancel={() => props.onCancel()}
      onOk={() => crtmod()}
      // maskClosable={false}
      className={`crturoleipt crtmod ${styles.crtmod}`}
      modalRender={(node) =>
        filenum ? (
          <Spin className="loadingbox" spinning={flag}>
            {node}
          </Spin>
        ) : (
          node
        )
      }
    >
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        ref={formref}
        onValuesChange={(changedValues, allValues) => changedValue(changedValues, allValues)}
      >
        <Form.Item
          label="模型版本"
          name="modelVersion"
          rules={[{ required: true, message: '请输入模型版本' }]}
        >
          <Input autoComplete="off" placeholder="请输入模型版本" />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <TextArea placeholder="请输入内容" style={{ height: 75 }} />
        </Form.Item>
        <Form.Item
          label="上传文件"
          name="dragger"
          rules={[{ required: true, message: '请选择文件!' }]}
        >
          <Form.Item
            name="dragger"
            valuePropName="files"
            // rules={[{ required: true, message: '请选择文件!' }]}
            getValueFromEvent={normFile}
            noStyle
          >
            <Upload.Dragger
              beforeUpload={beforeUploads}
              maxCount={1}
              fileList={fileUrl}
              onRemove={removeFile}
              openFileDialogOnClick={fileflag}
              accept=".smartmore"
              className={filenum ? styles.fileupbox : ''}
              name="files"
              itemRender={(originNode: any, file: any) => {
                return (
                  <div className={styles.updelwaper}>
                    <div className={styles.uplodelbox}>
                      <span>{file.name}</span>
                      <Popconfirm
                        title="你确定要删除这张图片吗？"
                        onConfirm={() => removeFile(file)}
                        // onCancel={cancel}
                        overlayStyle={{ minWidth: 200 }}
                        okText="确定"
                        cancelText="取消"
                      >
                        <span className={styles.uplodel}>
                          <DeleteOutlined />
                        </span>
                      </Popconfirm>
                    </div>
                  </div>
                );
              }}
            >
              {filenum === 0 ? (
                <div>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">点击或拖拽文件到此处上传文件</p>
                </div>
              ) : null}
            </Upload.Dragger>
          </Form.Item>
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default CrtModel;
