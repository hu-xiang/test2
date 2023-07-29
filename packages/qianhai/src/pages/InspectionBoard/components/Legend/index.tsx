// import { useState } from 'react';
import { Row, Col } from 'antd';
// import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import React from 'react';
import styles from './styles.less';
import EllipsisTooltip from '../../../../components/EllipsisTooltip';

type Iprops = {
  fullScreenFlag: boolean;
  roadStatus: string;
};

const Legend: React.FC<Iprops> = (props) => {
  return (
    <div className={`${styles.numColor}`}>
      <Row gutter={[10, 20]} className={styles.rowLengend}>
        <Col span={8} className={styles.colLengend}>
          <div className={styles.diseaseIconItem}>
            <div className={styles.iconInner}>
              <div className={styles.numNum}>
                <EllipsisTooltip title={'病害数量≤10'}>
                  <span className={styles.numcolor1} /> 病害数量≤10
                </EllipsisTooltip>
              </div>
              <div className={styles.numNum}>
                <EllipsisTooltip title={'病害数量(10-49)'}>
                  <span className={styles.numcolor2} /> 病害数量(10-49)
                </EllipsisTooltip>
              </div>
            </div>
            <div className={styles.iconInner}>
              <div className={styles.numNum}>
                <EllipsisTooltip title={'病害数量(50-199)'}>
                  <span className={styles.numcolor3} /> 病害数量(50-199)
                </EllipsisTooltip>
              </div>
              <div className={styles.numNum}>
                <EllipsisTooltip title={'病害数量≥200'}>
                  <span className={styles.numcolor4} /> 病害数量≥200
                </EllipsisTooltip>
              </div>
            </div>
          </div>
        </Col>
        <Col span={8} className={styles.colLengend}>
          <div className={styles.diseaseIconItem}>
            <div className={styles.iconInner}>
              <div className={styles.numNum}>
                <EllipsisTooltip title={'病害标记'}>
                  <img src="images/map-point.svg" width="20.75" height="24.09" /> 病害标记
                </EllipsisTooltip>
              </div>
              <div className={styles.numNum}>
                <EllipsisTooltip title={'巡检轨迹'}>
                  <img src="images/trail.svg" width="21.6" height="8.94" /> 巡检轨迹
                </EllipsisTooltip>
              </div>
            </div>
            <div className={styles.iconInner}>
              <div className={styles.numNum}>
                <EllipsisTooltip title={'地图落点'}>
                  <img src="images/map-car.svg" width="21.75" height="24" /> 在线车辆
                </EllipsisTooltip>
              </div>
              <div className={styles.numNum}>
                <EllipsisTooltip title={'离线车辆'}>
                  <img src="images/map-car-offline.svg" width="20.79" /> 离线车辆
                </EllipsisTooltip>
              </div>
            </div>
          </div>
        </Col>
        <Col
          span={8}
          className={`${styles.colLengend} ${
            props.roadStatus !== 'roadCondition' ? styles.roadStatus : ''
          }`}
        >
          {props.roadStatus === 'roadCondition' ? (
            <>
              <div className={styles.iconInner}>
                <div className={styles.numNum}>
                  <EllipsisTooltip title={'路况：畅通'}>
                    <span className={styles.trafficSmooth} /> 路况：畅通
                  </EllipsisTooltip>
                </div>
                <div className={styles.numNum}>
                  <EllipsisTooltip title={'路况：缓行'}>
                    <span className={styles.trafficAmber} /> 路况：缓行
                  </EllipsisTooltip>
                </div>
              </div>
              <div className={styles.iconInner}>
                <div className={styles.numNum}>
                  <EllipsisTooltip title={'路况：拥堵'}>
                    <span className={styles.trafficCongestion} /> 路况：拥堵
                  </EllipsisTooltip>
                </div>
                <div className={styles.numNum}>
                  <EllipsisTooltip title={'路况：严重拥堵'}>
                    <span className={styles.darkCongestion} /> 路况：严重拥堵
                  </EllipsisTooltip>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.iconInner}>
                <div className={styles.numNum}>
                  <EllipsisTooltip title={'路面舒适度：优'}>
                    <span className={styles.trafficSmooth} /> 路面舒适度：优
                  </EllipsisTooltip>
                </div>
                <div className={styles.numNum}>
                  <EllipsisTooltip title={'路面舒适度：良'}>
                    <span className={styles.trafficAmber} style={{ background: '#6E60F6' }} />{' '}
                    路面舒适度：良
                  </EllipsisTooltip>
                </div>
                <div className={styles.numNum}>
                  <EllipsisTooltip title={'路面舒适度：中'}>
                    <span className={styles.trafficAmber} /> 路面舒适度：中
                  </EllipsisTooltip>
                </div>
              </div>
              <div className={styles.iconInner}>
                <div className={styles.numNum}>
                  <EllipsisTooltip title={'路面舒适度：次'}>
                    <span className={styles.trafficCongestion} /> 路面舒适度：次
                  </EllipsisTooltip>
                </div>
                <div className={styles.numNum}>
                  <EllipsisTooltip title={'路面舒适度：差'}>
                    <span className={styles.darkCongestion} /> 路面舒适度：差
                  </EllipsisTooltip>
                </div>
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Legend;
