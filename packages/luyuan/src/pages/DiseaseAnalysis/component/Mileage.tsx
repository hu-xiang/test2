import React from 'react';
import { Row, Col } from 'antd';

import styles from '../styles.less';

const Mileage: React.FC = () => {
  return (
    <>
      <Row gutter={[10, 10]}>
        <Col span={12}>
          <div className={`${styles.infotop} ${styles.border}`}>
            <div className={styles.mileage}>
              <span className={styles.mileagetext}>图片检测总数</span>
            </div>
            <div className={styles.content}>
              <span className={styles.num1}>368</span>
              <span className={styles.text1}>张</span>
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div className={`${styles.infotop} ${styles.border}`}>
            <div className={styles.mileage}>
              <span className={styles.mileagetext}>无病害图片数量</span>
            </div>
            <div className={styles.content}>
              <span className={styles.num2}>300</span>
              <span className={styles.text2}>张</span>
            </div>
          </div>
        </Col>
      </Row>
      <Row gutter={[10, 10]} style={{ marginTop: 10 }}>
        <Col span={12}>
          <div className={`${styles.infotop} ${styles.border}`}>
            <div className={styles.mileage}>
              <span className={styles.mileagetext}>病害图片数量</span>
            </div>
            <div className={styles.content} style={{ color: '#f00' }}>
              <span className={styles.num1}>68</span>
              <span className={styles.text1}>张</span>
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div className={`${styles.infotop} ${styles.border}`}>
            <div className={styles.mileage}>
              <span className={styles.mileagetext}>病害图片占比</span>
            </div>
            <div className={styles.content}>
              <span className={styles.num2}>16%</span>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};
export default Mileage;
