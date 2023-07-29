import { Modal, Card } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from 'baseline/src/pages/InspectionBoard/styles.less';
import MileageBar from './MileageBar';

type Iprops = {
  name: string;
  modalShow: boolean;
  onCancel: Function;
  datas: any[];
};

const MileageBarModal: React.FC<Iprops> = (props) => {
  const [mileDatas, setMileDatas] = useState<any>([]);
  useEffect(() => {
    setMileDatas(props.datas);
  }, [props.datas]);
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
        <div className={styles['mile-bar']}>
          <MileageBar
            isModal={true}
            isSider={false}
            dataInfo={mileDatas}
            xfield="type"
            yfield="num"
            unit={'个数'}
          />
        </div>
      </Card>
    </Modal>
  );
};

export default MileageBarModal;
