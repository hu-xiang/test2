import { Radio, Modal } from 'antd';
import type { RadioChangeEvent } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from '../styles.less';

type Iprops = {
  showModal: boolean;
  onCancel: Function;
  onOk: Function;
  editInfo: any;
};

const EdtMod: React.FC<Iprops> = (props) => {
  const [radioVal, setRadioVal] = useState(1);

  useEffect(() => {}, []);

  const submit = async () => {
    props.onOk(radioVal);
    props.onCancel();
  };

  const handleRadioChange = (e: RadioChangeEvent) => {
    setRadioVal(e.target.value);
  };
  return (
    <Modal
      title={'标定配置'}
      open={props.showModal}
      onCancel={() => props.onCancel()}
      onOk={() => submit()}
      className={`${styles.crtedtDev} ${styles.markTypeModal}`}
      destroyOnClose
      okText={'下一步'}
      width={336}
    >
      <div className="box">
        <div className={styles.caDeviceNo}>
          <span>设备编号：</span>
          <span>{props.editInfo.cameraId}</span>
        </div>
        <div className={styles.markType}>
          <Radio.Group onChange={handleRadioChange} value={radioVal}>
            <Radio value={1}>内参</Radio>
            <Radio value={2}>外参</Radio>
          </Radio.Group>
        </div>
      </div>
    </Modal>
  );
};

export default EdtMod;
