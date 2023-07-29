import { Modal, Form, Select, message } from 'antd';
import React, { useRef, useEffect, useState } from 'react';
import styles from '../styles.less';
import { selectVersion, deviceUp } from '../service';

const { Option } = Select;
type Iprops = {
  visible: boolean;
  onCancel: Function;
  rowItem: any;
  updateDevList: any;
  isUpdateBatch: boolean;
  onsetkey: Function;
};

const DemarcateSet: React.FC<Iprops> = (props) => {
  const { updateDevList, rowItem, isUpdateBatch } = props;
  const [deviceTypeKind] = useState({
    0: '轻量化车载设备V1.0',
  });

  const [versionList, setVersionList] = useState<any>([]);
  const [versionId, setVersionId] = useState<any>(null);
  // const [device, setDevice] = useState<any>(rowItem?.deviceType || 0);

  const formref = useRef<any>();

  const handleSelectVer = (val: any) => {
    setVersionId(val);
  };
  // const handleSelectDev = (val: any) => {
  //   setDevice(val);
  // };

  const handleSelectVersion = async () => {
    const params = {
      deviceType: 0,
    };
    const res = await selectVersion(params);
    const verList: any = [];
    if (res.status === 0) {
      const resData = res?.data || [];
      if (resData.length) {
        resData.forEach((item: any) => {
          verList.push({
            label: `${item?.sysVersion}/${item?.modelVersion}/${item.configVersion}`,
            value: item?.id,
          });
        });
        setVersionList(verList);
      }
    }
  };

  useEffect(() => {
    formref.current.setFieldsValue({ type: 0 });
    handleSelectVersion();
  }, []);

  const handleSubmit = async () => {
    if (!versionId) {
      message.warning({
        content: '请选择版本号',
        key: '请选择版本号',
      });
      return;
    }
    const params: any = {
      deviceList: [rowItem?.deviceId],
      versionId,
    };
    if (isUpdateBatch) {
      params.deviceList = updateDevList;
    }
    const res = await deviceUp(params);
    if (res.status === 0) {
      message.success({
        content: '升级成功',
        key: '升级成功',
      });
      props.onsetkey();
      props.onCancel();
    }
  };

  return (
    <Modal
      title={'升级维护'}
      open={props.visible}
      onCancel={() => props.onCancel()}
      onOk={() => handleSubmit()}
      className={`DemarcateSet ${styles.DemarcateSet}  ${styles.deviceListModal}`}
      okText={'提交'}
    >
      <div className="box">
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 21 }} ref={formref} colon={false}>
          <Form.Item label="设备类型" name="type">
            <Select
              style={{ height: 40 }}
              placeholder="请选择设备类型"
              allowClear
              disabled
              defaultValue={[props.rowItem?.deviceType]}
              // onSelect={(val: any) => handleSelectDev(val)}
            >
              {Object.keys(deviceTypeKind).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {deviceTypeKind[item]}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="切换版本" name="version">
            <Select
              style={{ height: 40 }}
              placeholder="请选择版本号"
              options={versionList}
              onSelect={(val: any) => handleSelectVer(val)}
            >
              {/* {versionList.length > 0 && Object.keys(versionList).map((item: any) => (
                <Option key={item.id} value={item.id}>
                  {item.label}
                </Option>
              ))} */}
            </Select>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default DemarcateSet;
