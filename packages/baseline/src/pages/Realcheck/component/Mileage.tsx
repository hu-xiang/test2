import React from 'react';
import { Row, Col } from 'antd';

import styles from '../styles.less';

const Mileage: React.FC = () => {
  return (
    <Row gutter={11}>
      <Col span={12}>
        <div className={`${styles.infotop} ${styles.border}`}>
          <div className={styles.mileage}>
            <span className={styles.mileagetext}>当前路段里程数</span>
          </div>
          <div className={styles.content}>
            <span className={styles.num1}>368</span>
            <span className={styles.text1}>公里</span>
          </div>
        </div>
      </Col>
      <Col span={12}>
        <div className={`${styles.infotop} ${styles.border}`}>
          <div className={styles.mileage}>
            <span className={styles.mileagetext}>PCI路况指数</span>
          </div>
          <div className={styles.content}>
            <span className={styles.num2}>70</span>
            <span className={styles.text2}>分</span>
          </div>
        </div>
      </Col>
    </Row>
  );
};
export default Mileage;
