import { Button, Select, DatePicker, Space } from 'antd';
import React from 'react';
import styles from '../styles.less';

const CenterSel: React.FC = () => {
  const { Option } = Select;

  return (
    <div>
      <div className={styles.selbox}>
        <div className={styles.selname}>ID名称</div>
        <Select defaultValue="lucy" style={{ width: 280, height: 40 }}>
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="disabled" disabled>
            Disabled
          </Option>
          <Option value="Yiminghe">yiminghe</Option>
        </Select>
      </div>
      <div className={styles.selbox}>
        <div className={styles.selname}>任务类型</div>
        <Select defaultValue="lucy" style={{ width: 280, height: 40 }}>
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="disabled" disabled>
            Disabled
          </Option>
          <Option value="Yiminghe">yiminghe</Option>
        </Select>
      </div>
      <div className={styles.selbox}>
        <div className={styles.selname}>任务状态</div>
        <Select defaultValue="lucy" style={{ width: 280, height: 40 }}>
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="disabled" disabled>
            Disabled
          </Option>
          <Option value="Yiminghe">yiminghe</Option>
        </Select>
      </div>
      <div className={styles.selbox}>
        <div className={styles.selname}>创建人</div>
        <Select defaultValue="lucy" style={{ width: 280, height: 40 }}>
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="disabled" disabled>
            Disabled
          </Option>
          <Option value="Yiminghe">yiminghe</Option>
        </Select>
      </div>
      <div className={styles.selbox}>
        <div className={styles.selname}>创建日期</div>
        <Space direction="vertical">
          <DatePicker />
        </Space>
      </div>
      <div className={styles.selbox}>
        <div className={styles.selname}>完成日期</div>
        <Space direction="vertical">
          <DatePicker />
        </Space>
      </div>
      <Button className={styles.selbtn}>查询</Button>
    </div>
  );
};
export default CenterSel;
