import { Upload, Button, Modal, Form, message, Input, Spin, Popconfirm } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import styles from '../styles.less';
import { uploadfile, addModel, delfile, getmodpk } from '../service';
// import validRule from '@/utils/validate';
// import moment from 'moment';
import { UploadOutlined } from '@ant-design/icons';
import { DeleteOutlined } from '@ant-design/icons';

type Iprops = {
  modelshow: boolean;
  onCancel: Function;
  onsetkey: Function;
  modpkid: any;
  setSelectedRowKey: any;
};

const UploadModel: React.FC<Iprops> = (props) => {
  // const ref = useRef<any>();
  const formref = useRef<any>();
  const [filenum, setFilenum] = useState(0);
  const [fileUrl, setFileUrl] = useState([]);
  const [flag, setFlag] = useState(false);
  const [updalist, setUpdalist] = useState<any>({});
  const [modpkid2, setModpkid2] = useState<any>();
  const { modpkid, setSelectedRowKey } = props;
  // const rules: any = {
  //   name: [validRule.limitNumber()],
  // };
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
      formData.append('modelFileId', modpkid2);
      const formlist: any = formref.current.getFieldsValue();
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
          formref.current.setFieldsValue(formlist);
        } else {
          // message.error({
          //   content: res.message,
          //   key: res.message,
          // });
          setFlag(false);
        }
        return false;
      } catch (error) {
        setFlag(false);
        return false;
      }
    };
    return false;
  };

  const getpk = async () => {
    const res = await getmodpk();
    setModpkid2(res.data);
  };
  useEffect(() => {
    // if (!props.edtShow) {
    getpk();
    // }
  }, []);
  const crtusers = async () => {
    formref.current
      .validateFields()
      .then(async () => {
        // const formData = new FormData();
        const formList: any = formref.current.getFieldsValue();
        const obj: any = {};
        obj.modelVersion = formList.modelVersion?.trim();
        obj.thresholdValue = formList.thresholdValue?.trim();
        obj.id = modpkid2;
        obj.fileName = updalist.fileName;
        obj.filePath = updalist.filePath;
        obj.md5 = updalist.md5;

        obj.modelId = modpkid;
        // obj.modelId = updalist.modelId;
        try {
          const res = await addModel(obj);
          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onsetkey();
            props.onCancel();
            setSelectedRowKey([modpkid2]);
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

  const removeFile = async (file: any) => {
    const { filePath } = file;
    const formData = new FormData();
    formData.append('path', filePath);
    const hide = message.loading({
      content: '正在删除',
      key: '正在删除',
    });
    const formlist: any = formref.current.getFieldsValue();
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
        formref.current.setFieldsValue({ ...formlist, file: undefined });
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
      title="上传模型"
      open={props.modelshow}
      onCancel={() => props.onCancel()}
      onOk={() => crtusers()}
      className={`crtStat ${styles.crtStat}`}
      maskClosable={false}
      okText={'提交'}
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
      <div className="box">
        <Form
          labelAlign="right"
          labelCol={{ flex: '78px' }}
          labelWrap
          wrapperCol={{ flex: 1 }}
          ref={formref}
          colon={false}
        >
          <Form.Item
            label="模型版本"
            name="modelVersion"
            rules={[
              {
                required: true,
                pattern: /^[A-Za-z0-9_.-]+$/,
                message: '由字母、数字、小数点、下划线和中划线组成',
              },
            ]}
          >
            <Input
              placeholder="请输入模型版本"
              // maxLength={20}
              autoComplete="off"
              className={styles.picaddinp}
            />
          </Form.Item>
          <Form.Item
            label="算法阈值"
            name="thresholdValue"
            getValueFromEvent={(evt: any) => {
              if (!evt.target.value.trim()) {
                return evt.target.value;
              }
              return String(evt.target.value).replace(/\s+/g, '');
            }}
            rules={[
              {
                required: true,
                pattern: /^[A-Za-z0-9_.,-]{1,100}$/,
                message: '由字母、数字、小数点、逗号、下划线、中划线组成',
              },
            ]}
          >
            <Input
              placeholder="请输入算法阈值"
              autoComplete="off"
              maxLength={100}
              className={styles.picaddinp}
            />
          </Form.Item>
          <Form.Item
            label="模型文件"
            name="file"
            valuePropName="file"
            rules={[{ required: true, message: '请上传.smartmore文件' }]}
            // getValueFromEvent={({ file, fileList }) => {
            //   if (fileList.length > 0) {
            //     file.status = 'done';
            //     return [file];
            //   }
            //   return undefined;
            // }}
          >
            <Upload
              accept=".smartmore"
              maxCount={1}
              fileList={fileUrl}
              onRemove={removeFile}
              beforeUpload={beforeUploads}
              itemRender={(originNode: any, file: any) => {
                return (
                  <div className={styles.updelwaper}>
                    <div className={styles.uplodelbox}>
                      <span>{file.name}</span>
                      <Popconfirm
                        title="你确定要删除此文件吗？"
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
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default UploadModel;
