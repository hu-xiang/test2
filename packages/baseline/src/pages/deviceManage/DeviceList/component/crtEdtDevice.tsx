import { Input, Modal, Form, Select, message, Upload, Spin, Button, Popconfirm } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import styles from '../styles.less';
import { deviceAdd, deviceEdt, uploadfile, getGenerate, delfile } from '../service';
import { isNaN } from 'lodash';
import { UploadOutlined } from '@ant-design/icons';
import { getTenName } from '../../../../services/ant-design-pro/api';
import { DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;
type Iprops = {
  edtShow: boolean;
  edtOrCrt: boolean;
  onCancel: Function;
  onsetkey: Function;
  edtInfo: any;
};

const EdtMod: React.FC<Iprops> = (props) => {
  const { edtInfo } = props;
  const [fileUrl, setFileUrl] = useState<any>([]);
  const [updalist, setUpdalist] = useState<any>({});
  // const [kind] = useState({
  //   0: '1.0',
  // });
  const [deviceTypeKind] = useState({
    0: '轻量化车载设备V1.0',
  });
  const [flagList, setFlagList] = useState<any>([true, true, true, true, true, true]);
  const [tenKind, setTenKind] = useState<any>([]);
  const [filenum, setFilenum] = useState(0);
  const [flag, setFlag] = useState(false);

  const formref = useRef<any>();
  const getTen = async () => {
    try {
      const res: any = await getTenName();

      setTenKind(res.data);
      if (!props?.edtOrCrt) {
        const reses: any = await getGenerate();
        formref.current.setFieldsValue({ deviceId: reses.data });
      }
      return true;
    } catch (error) {
      return false;
    }
  };
  useEffect(() => {
    getTen();
  }, []);
  useEffect(() => {
    if (props.edtOrCrt) {
      let macAddList: any = ['', '', '', '', '', ''];
      if (edtInfo?.macAdd) {
        macAddList = edtInfo?.macAdd?.split(':');
      }
      const imginfo = {
        uid: 1,
        filePath: edtInfo.fileUrl,
        name: edtInfo.fileName,
      };
      if (edtInfo.fileUrl) setFileUrl([imginfo]);
      formref.current.setFieldsValue(edtInfo);
      formref.current.setFieldsValue({
        ...edtInfo,
        systemVersion: isNaN(edtInfo.systemVersion * 1)
          ? edtInfo.systemVersion
          : edtInfo.systemVersion * 1,
        stakeNum1: macAddList[0],
        stakeNum2: macAddList[1],
        stakeNum3: macAddList[2],
        stakeNum4: macAddList[3],
        stakeNum5: macAddList[4],
        stakeNum6: macAddList[5],
        file: edtInfo.fileUrl ? [imginfo] : undefined,
      });
    }
  }, []);

  const crtusers = async () => {
    formref.current
      .validateFields()
      .then(async () => {
        const formList = formref.current.getFieldsValue();
        const obj = {
          fileName: updalist.fileName,
          fileUrl: updalist.filePath,
          file: undefined,
          tenantName:
            tenKind[tenKind.findIndex((i: any) => i.id === formList.tenantId)]?.tenantName,
        };

        formList.macAdd = `${formList.stakeNum1}:${formList.stakeNum2}:${formList.stakeNum3}:${formList.stakeNum4}:${formList.stakeNum5}:${formList.stakeNum6}`;
        const { deviceId, deviceType, macAdd, tenantId } = formList;
        const params: any = {
          deviceId,
          deviceType,
          macAdd,
          tenantId,
          ...obj,
        };
        try {
          let res: any;

          if (props.edtOrCrt) {
            params.id = edtInfo.id;
            res = await deviceEdt({ ...params });
          } else {
            res = await deviceAdd({ ...params });
          }

          if (res.status === 0) {
            message.success({
              content: '提交成功',
              key: '提交成功',
            });
            props.onsetkey();
            props.onCancel();
          }
          //  else {
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

  const beforeUploads = (fileinfos: any) => {
    if (filenum === 1) {
      message.error({
        content: '只能上传一个文件!',
        key: '只能上传一个文件!',
      });
      return false;
    }
    setFlag(true);
    // setFilenum(1)
    const reader = new FileReader();
    reader.readAsDataURL(fileinfos);
    reader.onload = async () => {
      const formData = new FormData();
      formData.append('file', fileinfos);
      const formlist: any = formref.current.getFieldsValue();
      formref.current.setFieldsValue('file', undefined);
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
          const imgurlList: any = [];
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
      title={props.edtOrCrt ? '编辑设备' : '创建设备'}
      open={props.edtShow}
      onCancel={() => props.onCancel()}
      onOk={() => crtusers()}
      className={`crtedtDev ${styles.crtedtDev} ${styles.deviceListModal}`}
      destroyOnClose
      modalRender={(node) =>
        filenum ? (
          <Spin className="loadingbox" spinning={flag}>
            {node}
          </Spin>
        ) : (
          node
        )
      }
      okText={'提交'}
    >
      <div className="box">
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 21 }} ref={formref} colon={false}>
          <Form.Item
            label="设备编号"
            name="deviceId"
            rules={[
              {
                required: true,
                max: 32,
                message: '由中文、英文字母、数字、下划线和中划线组成',
                pattern: /^[\u4E00-\u9FA5A-Za-z0-9_-]+$/,
              },
            ]}
          >
            <Input autoComplete="off" placeholder="请输入设备编号" disabled={true} />
          </Form.Item>
          <Form.Item
            label="设备类型"
            name="deviceType"
            rules={[{ required: true, message: '请选择设备类型' }]}
          >
            <Select style={{ height: 40 }} placeholder="请选择设备类型" allowClear>
              {Object.keys(deviceTypeKind).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {deviceTypeKind[item]}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="MAC地址"
            name="macAdd"
            rules={[
              { required: true, message: '不符合标准MAC地址格式，请每项输入两位大写16进制数' },
              () => ({
                validator(_, value) {
                  if (
                    !value ||
                    (flagList[0] &&
                      flagList[1] &&
                      flagList[2] &&
                      flagList[3] &&
                      flagList[4] &&
                      flagList[5])
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error('不符合标准MAC地址格式，请每项输入两位大写16进制数'),
                  );
                },
              }),
            ]}
          >
            <div className="crtNumBox">
              <Form.Item
                name="stakeNum1"
                className="crtNum"
                // rules={[{ required: true, pattern: /^([A-F0-9]){2}$/, message: '格式错误', transform:  }]}
                style={{ display: 'inline-block', marginBottom: 0 }}
                // normalize={(val)=>{
                //   if(val.split('').length>2){
                //     if(flagList[0]){
                //       formref.current.getFieldInstance('stakeNum2').focus()
                //     }
                //     return val.slice(0,2)
                //   }
                //   return val
                // }}
                rules={[
                  {
                    transform: (i) => {
                      const reg = /^([A-F0-9]){2}$/;
                      const valFlag = reg.test(i);
                      const list = [...flagList];
                      list[0] = valFlag;
                      if (valFlag) {
                        formref.current.getFieldInstance('stakeNum2').focus();
                      }
                      setFlagList(list);
                    },
                  },
                ]}
              >
                <Input autoComplete="off" maxLength={2} />
              </Form.Item>
              <span> : </span>
              <Form.Item
                name="stakeNum2"
                className="crtNum"
                style={{ display: 'inline-block', marginBottom: 0 }}
                rules={[
                  {
                    transform: (i) => {
                      const reg = /^([A-F0-9]){2}$/;
                      const valFlag = reg.test(i);
                      const list = [...flagList];
                      list[1] = valFlag;
                      if (valFlag) {
                        formref.current.getFieldInstance('stakeNum3').focus();
                      }
                      setFlagList(list);
                    },
                  },
                ]}
              >
                <Input autoComplete="off" maxLength={2} />
              </Form.Item>
              <span> : </span>
              <Form.Item
                name="stakeNum3"
                className="crtNum"
                style={{ display: 'inline-block', marginBottom: 0 }}
                rules={[
                  {
                    transform: (i) => {
                      const reg = /^([A-F0-9]){2}$/;
                      const valFlag = reg.test(i);
                      const list = [...flagList];
                      list[2] = valFlag;
                      if (valFlag) {
                        formref.current.getFieldInstance('stakeNum4').focus();
                      }
                      setFlagList(list);
                    },
                  },
                ]}
              >
                <Input autoComplete="off" maxLength={2} />
              </Form.Item>
              <span> : </span>
              <Form.Item
                name="stakeNum4"
                className="crtNum"
                style={{ display: 'inline-block', marginBottom: 0 }}
                rules={[
                  {
                    transform: (i) => {
                      const reg = /^([A-F0-9]){2}$/;
                      const valFlag = reg.test(i);
                      const list = [...flagList];
                      list[3] = valFlag;
                      if (valFlag) {
                        formref.current.getFieldInstance('stakeNum5').focus();
                      }
                      setFlagList(list);
                    },
                  },
                ]}
              >
                <Input autoComplete="off" maxLength={2} />
              </Form.Item>
              <span> : </span>
              <Form.Item
                name="stakeNum5"
                className="crtNum"
                style={{ display: 'inline-block', marginBottom: 0 }}
                rules={[
                  {
                    transform: (i) => {
                      const reg = /^([A-F0-9]){2}$/;
                      const valFlag = reg.test(i);
                      const list = [...flagList];
                      list[4] = valFlag;
                      if (valFlag) {
                        formref.current.getFieldInstance('stakeNum6').focus();
                      }
                      setFlagList(list);
                    },
                  },
                ]}
              >
                <Input autoComplete="off" maxLength={2} />
              </Form.Item>
              <span> : </span>
              <Form.Item
                name="stakeNum6"
                className="crtNum"
                style={{ display: 'inline-block', marginBottom: 0 }}
                rules={[
                  {
                    transform: (i) => {
                      const reg = /^([A-F0-9]){2}$/;
                      const valFlag = reg.test(i);
                      const list = [...flagList];
                      list[5] = valFlag;
                      setFlagList(list);
                    },
                  },
                ]}
              >
                <Input autoComplete="off" maxLength={2} />
              </Form.Item>
            </div>
          </Form.Item>
          {/* <Form.Item
            name="systemVersion"
            label="系统版本"
            className="addUserClass"
            rules={[{ required: true, message: '请选择系统版本' }]}
          >
            <Select style={{ height: 40 }} placeholder="请选择系统版本" allowClear>
              {Object.keys(kind).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {kind[item]}
                </Option>
              ))}
            </Select>
          </Form.Item> */}
          <Form.Item
            label="安全证书"
            name="file"
            valuePropName="file"
            rules={[{ required: true, message: '请上传安全证书' }]}
          >
            <Upload
              maxCount={1}
              fileList={fileUrl}
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
          <Form.Item label="所属租户" name="tenantId">
            <Select style={{ height: 40 }} placeholder="请选择所属租户" allowClear>
              {Object.values(tenKind).map((item: any) => (
                <Option key={item.tenantName} value={item.id}>
                  {item.tenantName}
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
