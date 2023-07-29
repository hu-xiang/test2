import { Modal, Card } from 'antd';
import React, { useState, useEffect, useMemo } from 'react';
import styles from '../styles.less';
import { getDiseasePieInfo } from '../service';
import LeftPie from './leftPie';
import EmptyPage from '../../../components/EmptyPage';

type Iprops = {
  name: string;
  modalShow: boolean;
  onCancel: Function;
};

const LeftPieModal: React.FC<Iprops> = (props) => {
  const [typeTime, setTypeTime] = useState<number>(1);
  const [diseaseLeftPie, setDiseaseLeftPie] = useState<any>([]);
  const [diseaseRightPie, setDiseaseRightPie] = useState<any>([]);
  const [diseaseSafePie, setDiseaseSafePie] = useState<any>([]);
  const typeTimeList = [
    { name: '周', type: 1 },
    { name: '月', type: 2 },
    { name: '年', type: 3 },
  ];
  const mpieInfoLeft = useMemo(() => {
    return { diseaseLeftPie, type: 1 }; // type:1水泥
  }, [diseaseLeftPie]);
  const mpieInfoRight = useMemo(() => {
    return { diseaseRightPie, type: 2 };
  }, [diseaseRightPie]);
  const mpieInfoSafe = useMemo(() => {
    return { diseaseSafePie, type: 3 };
  }, [diseaseSafePie]);
  useEffect(() => {
    const getDiseaseLeftInfos = async () => {
      const res = await getDiseasePieInfo({ taskType: '', type: typeTime });
      // const res1 = await getDiseasePieInfo('1', typeTime); // 水泥路面
      if (res && res.data && res.data?.length > 0) {
        setDiseaseLeftPie(res.data[0]?.taskCementData);
        setDiseaseRightPie(res.data[0]?.taskLiQingData);
        setDiseaseSafePie(res.data[0]?.taskSafeEvent);
      }
    };
    getDiseaseLeftInfos();
  }, [typeTime]);
  const handleTypeTime = (type: any) => {
    setTypeTime(type);
  };
  return (
    <Modal
      title={props.name}
      open={props.modalShow}
      footer={false}
      // width={1200}
      mask={false}
      onCancel={() => props.onCancel()}
      className={`${styles.chartModalClass} ${styles.leftPieModalClass}`}
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
        <div className={`${styles.pieDisClass} ${styles.leftPieDisClass}`}>
          <div className={styles.pieDisCardClass}>
            <div className={styles.pieDisCardLeftClass}>
              <span className={styles.pieDisCardLeftClass} />
              <span className={`${styles.pieDisCardTxtClass} ${styles.pieDisLeftTxtClass}`}>
                水泥路面
              </span>
            </div>
            {diseaseLeftPie?.length > 0 ? (
              <LeftPie
                type={mpieInfoLeft.type}
                pieInfo={mpieInfoLeft.diseaseLeftPie}
                isModal={true}
              />
            ) : (
              <EmptyPage content={'暂无数据'} customEmptyChartClass={'h400Class'} />
            )}
          </div>
          <div className={styles.pieDisCardClass}>
            <div className={styles.pieDisCardLeftClass}>
              <span className={styles.pieDisCardLeftClass} />
              <span className={`${styles.pieDisCardTxtClass} ${styles.pieDisLeftTxtClass}`}>
                沥青路面
              </span>
            </div>
            {diseaseRightPie?.length > 0 ? (
              <LeftPie
                type={mpieInfoRight.type}
                isModal={true}
                pieInfo={mpieInfoRight.diseaseRightPie}
              />
            ) : (
              <EmptyPage content={'暂无数据'} customEmptyChartClass={'h400Class'} />
            )}
          </div>
          <div className={styles.pieDisCardClass}>
            <div className={styles.pieDisCardLeftClass}>
              <span className={styles.pieDisCardLeftClass} />
              <span className={`${styles.pieDisCardTxtClass} ${styles.pieDisLeftTxtClass}`}>
                综合安全事件
              </span>
            </div>
            {diseaseSafePie?.length > 0 ? (
              <LeftPie
                type={mpieInfoSafe.type}
                isModal={true}
                pieInfo={mpieInfoSafe.diseaseSafePie}
              />
            ) : (
              <EmptyPage content={'暂无数据'} customEmptyChartClass={'h400Class'} />
            )}
          </div>
        </div>
      </Card>
    </Modal>
  );
};

export default LeftPieModal;
