import { Input, Modal, Form, message } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import styles from '../styles.less';

import { generate, addCamera, editCamera } from '../service';

type Iprops = {
  showModal: boolean;
  isEdit: boolean;
  onCancel: Function;
  onOk: Function;
  editInfo: any;
};

const EdtMod: React.FC<Iprops> = (props) => {
  const { editInfo } = props;

  const [flagList, setFlagList] = useState<any>([true, true, true, true, true, true]);

  const formref = useRef<any>();
  const getTen = async () => {
    const res: any = await generate({});
    if (res.status === 0) {
      formref.current.setFieldsValue({
        cameraId: res.data?.cameraId,
        cameraUid: res.data?.cameraUid,
      });
    }
  };
  useEffect(() => {
    if (!props.isEdit) {
      getTen();
    }
  }, []);
  useEffect(() => {
    if (props.isEdit) {
      let macAddList: any = ['', '', '', '', '', ''];
      if (editInfo?.macAddress) {
        macAddList = editInfo?.macAddress?.split(':');
      }

      formref.current.setFieldsValue({
        cameraId: editInfo.cameraId,
        cameraUid: editInfo.cameraUid,
        macAdd: macAddList,
        stakeNum1: macAddList[0],
        stakeNum2: macAddList[1],
        stakeNum3: macAddList[2],
        stakeNum4: macAddList[3],
        stakeNum5: macAddList[4],
        stakeNum6: macAddList[5],
      });
    }
  }, []);

  const submit = async () => {
    formref.current
      .validateFields()
      .then(async () => {
        const formList = formref.current.getFieldsValue();
        const params: any = {
          cameraId: formList.cameraId,
          cameraUid: formList.cameraUid,
          macAddress: `${formList.stakeNum1}:${formList.stakeNum2}:${formList.stakeNum3}:${formList.stakeNum4}:${formList.stakeNum5}:${formList.stakeNum6}`,
        };

        let res: any;

        if (props.isEdit) {
          params.id = editInfo.id;
          res = await editCamera(params);
        } else {
          res = await addCamera(params);
        }

        if (res.status === 0) {
          message.success({
            content: '提交成功',
            key: '提交成功',
          });
          props.onOk();
          props.onCancel();
        }

        return true;
      })
      .catch(() => {});
  };

  return (
    <Modal
      title={props.isEdit ? '编辑设备' : '创建设备'}
      open={props.showModal}
      onCancel={() => props.onCancel()}
      onOk={() => submit()}
      className={`crtedtDev ${styles.crtedtDev} ${styles.deviceListModal}`}
      destroyOnClose
      okText={'提交'}
    >
      <div className="box">
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 21 }} ref={formref} colon={false}>
          <Form.Item
            label="设备编号"
            name="cameraId"
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

          <Form.Item label="国标ID" name="cameraUid">
            <Input autoComplete="off" placeholder="请输入国标ID" disabled={true} />
          </Form.Item>

          <Form.Item
            label="MAC地址"
            name="macAdd"
            rules={[
              { required: true, message: '不符合标准MAC地址格式，请每项输入两位大写16进制数' },
              () => ({
                validator(_: any, value: any) {
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
                style={{ display: 'inline-block', marginBottom: 0 }}
                rules={[
                  {
                    transform: (i: any) => {
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
        </Form>
      </div>
    </Modal>
  );
};

export default EdtMod;
