import { Modal, Card } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from 'baseline/src/pages/InspectionBoard/styles.less';
import FacilityPie from './FacilityPie';
import { getRoadDistributed } from '../service';

type Iprops = {
  name: string;
  modalShow: boolean;
  onCancel: Function;
};

const FacilityPieModal: React.FC<Iprops> = (props) => {
  const [facCementData, setFacCementData] = useState<any>([]);
  const [bitumenData, setBitumenData] = useState<any>([]);
  useEffect(() => {
    const getCementData = async (type: number) => {
      const rec = await getRoadDistributed({ roadType: type });
      const roadDatas: any = [];
      if (rec?.status === 0) {
        rec?.data.forEach((it: any) => {
          roadDatas.push({ type: it?.roadLevel, nums: it?.roadLength });
        });
      }
      if (type === 1) {
        setBitumenData(roadDatas);
      } else {
        setFacCementData(roadDatas);
      }
    };
    getCementData(0);
    getCementData(1);
  }, []);
  return (
    <Modal
      title={props.name}
      open={props.modalShow}
      footer={false}
      width={846}
      mask={false}
      onCancel={() => props.onCancel()}
      className={`${styles.chartModalClass} ${styles['road-level-distribution']}`}
      maskClosable={false}
    >
      <Card type="inner" className={`${styles.cardBcg} ${styles.modalChartCommonClass}`}>
        <div className={styles.pieDisClass}>
          <div className={styles.pieDisCardClass}>
            <div className={styles['card-item-head']}>
              <span className={styles['icon-txt']} />
              <span className={`${styles.pieDisCardTxtClass}`}>城市道路</span>
            </div>
            <FacilityPie type={0} platform={'large'} dataInfo={facCementData} />
          </div>
          <div className={styles.pieDisCardClass}>
            <div className={styles['card-item-head']}>
              <span className={styles['icon-txt']} />
              <span className={`${styles.pieDisCardTxtClass}`}>公路</span>
            </div>
            <FacilityPie type={1} platform={'large'} dataInfo={bitumenData} />
          </div>
        </div>
      </Card>
    </Modal>
  );
};

export default FacilityPieModal;
