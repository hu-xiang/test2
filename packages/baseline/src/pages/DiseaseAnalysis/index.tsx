import React from 'react';
import { Row, Col, Form, Input, Button } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import styles from './styles.less';
import Content from './component/Content';
import Mileage from './component/Mileage';
import Statics from './component/Statics';
import DataList from './component/DataList';

import './style.css';

export default (): React.ReactNode => {
  return (
    <div style={{ minWidth: 1280, overflow: 'auto' }}>
      <div className={styles.box}>
        <Form name="customized_form_controls" layout="inline" className={styles.search}>
          <Form.Item>
            <Input placeholder="任务名称" />
          </Form.Item>
          <Form.Item>
            <Input placeholder="路段名称" />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit">查询</Button>
          </Form.Item>
        </Form>
        <a className={styles.btn}>
          <RedoOutlined />
          重置
        </a>
      </div>
      <Row gutter={10}>
        {/* 中间部分 */}
        <Col span={16}>
          <Content />
        </Col>
        {/* 右边数据 */}
        <Col span={8}>
          <Mileage />
          <Statics />
          <DataList />
        </Col>
      </Row>
    </div>
  );
};
