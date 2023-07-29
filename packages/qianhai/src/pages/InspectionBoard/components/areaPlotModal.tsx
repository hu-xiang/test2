import { Modal, Card } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from '../styles.less';
import { getColInfo } from '../service';
import AreaPlot from './AreaPlot';

type Iprops = {
  name: string;
  modalShow: boolean;
  onCancel: Function;
};

const AreaPlotModal: React.FC<Iprops> = (props) => {
  const [info, setInfo] = useState<any>();
  const [typeTime, setTypeTime] = useState<number>(1);
  const typeTimeList = [
    { name: '周', type: 1 },
    { name: '月', type: 2 },
    { name: '年', type: 3 },
  ];
  const getRencentWeekInfo = async (type: any) => {
    const res = await getColInfo(type);
    setInfo(res.data);
  };
  const handleTypeTime = (type: any) => {
    getRencentWeekInfo(type);
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
      width={1086}
      onCancel={() => props.onCancel()}
      className={`${styles.chartModalClass}`}
      mask={false}
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
        <div>
          <AreaPlot info={info} btnType={typeTime} />
        </div>
      </Card>
    </Modal>
  );
};

export default AreaPlotModal;
