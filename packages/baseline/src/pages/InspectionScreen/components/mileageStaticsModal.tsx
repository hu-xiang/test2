import { Modal, Card } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from '../styles.less';
import MileageBar from './MileageBar';

type Iprops = {
  name: string;
  modalShow: boolean;
  onCancel: Function;
};

const MileageLineModal: React.FC<Iprops> = (props) => {
  const [typeTime, setTypeTime] = useState<number>(1);
  const typeTimeList = [
    { name: '周', type: 1 },
    { name: '月', type: 2 },
    { name: '年', type: 3 },
  ];
  const handleTypeTime = (type: any) => {
    setTypeTime(type);
  };

  useEffect(() => {
    handleTypeTime(1);
  }, []);

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
        <div className={styles.secondRowClass}>
          <ul className={styles.modalCardTitleRight}>
            {typeTimeList.map((it: any) => (
              <li
                key={it?.type}
                onClick={() => {
                  handleTypeTime(it?.type || 1);
                }}
                className={`${it?.type === typeTime ? styles.activeClass : ''} ${styles.liClass}`}
              >
                <span>{it?.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.mileageLineClass}>
          <MileageBar dataType={typeTime} type={2} />
        </div>
      </Card>
    </Modal>
  );
};

export default MileageLineModal;
