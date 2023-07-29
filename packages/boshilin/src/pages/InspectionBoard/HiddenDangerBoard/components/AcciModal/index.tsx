import React, { useState, useEffect, useImperativeHandle } from 'react';
import styles from '../DraggerModal/styles.less';
import acciStyles from './styles.less';
import Draggable from 'react-draggable';
// import DrawCanvas from '../PreviewModal';
interface Iprops {
  isModalVisible?: boolean;
  markerInfo: any;
  onRef: any;
  hideModal: () => void;
  style: { x: number; y: number };
}

const AcciModal: React.FC<Iprops> = (props: Iprops) => {
  const { markerInfo, isModalVisible } = props;
  const [disabled, setDisabled] = useState<any>(true);
  const [visibleFlag, setVisibleFlag] = useState<any>(false);

  useEffect(() => {
    setVisibleFlag(isModalVisible);
  }, [isModalVisible]);

  const clickClose = () => {
    props.hideModal();
  };

  const resetMaskClosableFlag = (prop: any) => {
    setVisibleFlag(prop);
  };
  useImperativeHandle(props.onRef, () => ({
    // 暴露给父组件的方法
    resetMaskClosableFlag,
  }));

  const style = {
    bgd: {
      background: 'rgba(147, 151, 174, 0.3)',
      boxShadow: ' 0px 6px 8px rgba(0, 0, 0, 0.6)',
      backgroundSize: '100%,100%',
      borderRadius: '18px',
      backdropFilter: 'blur(15px)',
    },
  };

  return (
    <>
      {visibleFlag ? (
        <Draggable disabled={disabled} bounds="parent" defaultPosition={{ x: 50, y: -160 }}>
          <div
            className={`${styles['map-dis-pop-modal']} ${acciStyles.draggerModalClass}`}
            style={style.bgd}
          >
            <div
              className={`${styles.modalRowTitle} ${acciStyles.dragHeadTitle}`}
              onMouseOver={() => {
                if (disabled) {
                  setDisabled(false);
                }
              }}
              onMouseOut={() => {
                setDisabled(true);
              }}
            >
              <div className={styles.leftContent}>
                <span className={styles.modalTitleImg}></span>
                <div>事故信息</div>
              </div>
              <div className={`${styles.rightContent} ${styles.rightButton}`}>
                <span onClick={clickClose} className={styles.closeModalInfoClass}></span>
              </div>
            </div>
            <div className={`${styles.diseaseRowCommon} ${styles.dragRowInfo}`}>
              <div className={`map-pop-content ${acciStyles.diseaseRightInfo}`}>
                <div className={acciStyles.rowItem}>
                  <span>事故标题：</span>
                  <div title={markerInfo?.title}>{markerInfo?.title}</div>
                </div>
                <div className={acciStyles.rowItem}>
                  <span>事故时间：</span>
                  <div title={markerInfo?.happenTime}>{markerInfo?.happenTime}</div>
                </div>
                <div className={acciStyles.rowItem}>
                  <span>事故等级：</span>
                  <div title={markerInfo?.levelName}>{markerInfo?.levelName}</div>
                </div>
                <div className={acciStyles.rowItem}>
                  <span>事故地点：</span>
                  <div title={markerInfo?.address}>{markerInfo?.address}</div>
                </div>
                <div className={acciStyles.rowItem}>
                  <span>桩号位置：</span>
                  <div title={markerInfo?.stakeNo}>{markerInfo?.stakeNo}</div>
                </div>
                <div className={acciStyles.rowItem}>
                  <span>死亡人数：</span>
                  <div title={markerInfo?.deadCount}>{markerInfo?.deadCount}</div>
                </div>
                <div className={acciStyles.rowItem}>
                  <span>受伤人数：</span>
                  <div title={markerInfo?.hurtCount}>{markerInfo?.hurtCount}</div>
                </div>
                <div className={acciStyles.rowItem}>
                  <span>损失财产：</span>
                  <div title={markerInfo?.moneyLoss}>{markerInfo?.moneyLoss || 0}万元</div>
                </div>
                <div className={acciStyles.rowItem}>
                  <span>事故描述：</span>
                  <div title={markerInfo?.description}>{markerInfo?.description}</div>
                </div>
              </div>
            </div>
          </div>
        </Draggable>
      ) : null}
    </>
  );
};

export default AcciModal;
