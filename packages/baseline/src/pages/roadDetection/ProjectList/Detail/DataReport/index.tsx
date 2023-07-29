import React, { useEffect } from 'react';
import { useModel } from 'umi';
import styles from './styles.less';
import { Tabs } from 'antd';
import { ReactComponent as CloseButton } from '../../../../../assets/icon/close.svg';
import { ReactComponent as LeftImg } from '../../../../../assets/img/leftAndRight/leftImg.svg';
import { ReactComponent as RightImg } from '../../../../../assets/img/leftAndRight/rightImg.svg';
import TechnicalStatus from './component/technicalStatusIndex';
import RoadDisease from './component/RoadDiseaseIndex';
import FacDamage from './component/FacDamageIndex';

type Iprops = {
  dataReport: string;
  onCancel: () => void;
};
const DataReport: React.FC<Iprops> = (props) => {
  const { dataReport, onCancel } = props;
  const {
    arrowVisible,
    arrowDisabled,
    setArrowVisible,
    setArrowDisabled,
    tabValue,
    setToLeftOrRight,
    setTabValue,
  } = useModel<any>('dataReport'); // arrowVisible, arrowDisabled,setToLeftOrRight与业务相关
  const changeTabs = (val: any) => {
    setTabValue(val);
    // tacValRef.current=val;
    setArrowVisible(false);
    setArrowDisabled('');
    setToLeftOrRight('');
  };
  useEffect(() => {
    return () => {
      setTabValue('1');
    };
  }, []);

  const tabDatas = [
    {
      key: '1',
      label: '路面病害数据',
      children:
        tabValue === '1' ? (
          <div className={styles['tab-box']}>
            <RoadDisease />
          </div>
        ) : null,
    },
    {
      key: '2',
      label: '沿线设施损坏数据',
      children:
        tabValue === '2' ? (
          <div className={styles['tab-box']}>
            <FacDamage />
          </div>
        ) : null,
    },
    {
      key: '3',
      label: '路面状况',
      children:
        tabValue === '3' ? (
          <div className={styles['tab-tech-box']}>
            <TechnicalStatus />
          </div>
        ) : null,
    },
  ];

  const clickClose = () => {
    onCancel();
  };
  const handleToDirection = (value: string) => {
    setToLeftOrRight(value);
  };

  return (
    <>
      <div>{arrowDisabled}</div>
      {/* 左右切换按钮 */}
      {arrowVisible ? (
        <>
          <LeftImg
            className={`${styles.arrLeftIcon} ${styles.toggleIcon}
          ${arrowDisabled === 'left' ? styles.arrIconDisabled : ''}
          `}
            onClick={arrowDisabled === 'left' ? undefined : () => handleToDirection('left')}
          />

          <RightImg
            onClick={arrowDisabled === 'right' ? undefined : () => handleToDirection('right')}
            className={`${styles.arrRightIcon} ${styles.toggleIcon} ${
              arrowDisabled === 'right' ? styles.arrIconDisabled : ''
            }`}
          />
        </>
      ) : (
        ''
      )}

      {dataReport !== '' ? (
        <div className={styles['report-modal']}>
          <div className={`${styles['report-mask-modal']}`}></div>
          <div className={`${styles['data-report-modal']}`}>
            <div className={`${styles.modalRowTitle}`}>
              <div className={styles.leftContent}>数据报表</div>
              <div className={`${styles.rightContent}`}>
                <CloseButton onClick={clickClose} className={styles.closeModalInfoClass} />
              </div>
            </div>
            <div className={styles['report-container']}>
              <Tabs defaultActiveKey="1" onChange={changeTabs} items={tabDatas}></Tabs>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
export default DataReport;
