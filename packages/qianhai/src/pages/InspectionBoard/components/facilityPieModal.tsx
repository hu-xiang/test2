import { Modal, Card } from 'antd';
import React from 'react';
import styles from '../styles.less';
import FacilityPie from './FacilityPie';

type Iprops = {
  name: string;
  modalShow: boolean;
  onCancel: Function;
};

const FacilityPieModal: React.FC<Iprops> = (props) => {
  return (
    <Modal
      title={props.name}
      open={props.modalShow}
      footer={false}
      width={1200}
      mask={false}
      onCancel={() => props.onCancel()}
      className={`${styles.chartModalClass}`}
      maskClosable={false}
    >
      <Card type="inner" className={`${styles.cardBcg} ${styles.modalChartCommonClass}`}>
        <div className={styles.pieDisClass}>
          <div className={styles.pieDisCardClass}>
            <span className={`${styles.pieDisCardTxtClass} ${styles.pieDisLeftTxtClass}`}>
              城市道路
            </span>
            <FacilityPie type={0} platform={'large'} />
          </div>
          <div className={styles.pieDisCardClass}>
            <span className={`${styles.pieDisCardTxtClass} ${styles.pieDisRightTxtClass}`}>
              公路
            </span>
            <FacilityPie type={1} platform={'large'} />
          </div>
        </div>
      </Card>
    </Modal>
  );
};

export default FacilityPieModal;
