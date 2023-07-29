import React from 'react';
import { Row, Col } from 'antd';

import styles from '../styles.less';

const Disasterdata: React.FC = () => {
  return (
    <div className={styles.disasterdata}>
      <Row gutter={1}>
        <Col span={8} className={styles.line}>
          <div className={styles.text}>
            <div className={styles.txt}>横向裂缝</div>
            <div>
              <span className={styles.num}>344</span>
              <span className={styles.txt2}>米</span>
            </div>
          </div>
        </Col>
        <Col span={8} className={styles.line}>
          <div className={styles.text}>
            <div className={styles.txt}>纵向裂缝</div>
            <div>
              <span className={styles.num}>256</span>
              <span className={styles.txt2}>米</span>
            </div>
          </div>
        </Col>
        <Col span={8}>
          <div className={styles.text}>
            <div className={styles.txt}>条状修补</div>
            <div>
              <span className={styles.num}>243</span>
              <span className={styles.txt2}>米</span>
            </div>
          </div>
        </Col>
        <Col span={8} className={styles.line}>
          <div className={styles.text}>
            <div className={styles.txt}>块状修补</div>
            <div>
              <span className={styles.num}>279</span>
              <span className={styles.txt2}>米</span>
            </div>
          </div>
        </Col>
        <Col span={8} className={styles.line}>
          <div className={styles.text}>
            <div className={styles.txt}>龟裂</div>
            <div>
              <span className={styles.num}>345</span>
              <span className={styles.txt2}>米</span>
            </div>
          </div>
        </Col>
        <Col span={8}>
          <div className={styles.text}>
            <div className={styles.txt}>其它</div>
            <div>
              <span className={styles.num}>249</span>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};
export default Disasterdata;
