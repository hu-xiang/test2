import React, { useState, useEffect, useImperativeHandle } from 'react';
import { Image } from 'antd';
import { getDiseaseDetailInfo } from '../../service';
import styles from './styles.less';
import Draggable from 'react-draggable';

interface Iprops {
  isModalVisible?: boolean;
  imgId: string;
  address: string;
  onRef: any;
  hideModal: () => void;
  style: { x: number; y: number };
}

interface lsType {
  fileUrl: string;
  maintenanceCost: string;
  diseaseTypeName: string;
  diseaseNo: string;
  address: string;
  projectName: string;
  commitTime: string;
  riskLvName: string;
  roadName: string;
}

const DraggerModal: React.FC<Iprops> = (props: Iprops) => {
  const [data, setData] = useState<any>();
  const [disabled, setDisabled] = useState<any>(true);
  const [visibleFlag, setVisibleFlag] = useState<any>(false);
  const { imgId } = props;
  const formData: lsType = {
    fileUrl: '图片地址',
    maintenanceCost: '预估养护费用',
    diseaseTypeName: '病害名称',
    diseaseNo: '病害编号',
    address: '所在区域',
    projectName: '项目名称',
    commitTime: '时间',
    riskLvName: '风险等级',
    roadName: '道路名称',
  };
  // const [timerPlayer, setTimerPlayer] = useState<any>();
  useEffect(() => {
    setVisibleFlag(props.isModalVisible);
  }, [props.isModalVisible]);

  useEffect(() => {
    async function fetchData() {
      const res = await getDiseaseDetailInfo(imgId.toString());
      setData(res?.data);
    }
    fetchData();
  }, [imgId]);

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
        <Draggable disabled={disabled} bounds="parent" defaultPosition={{ x: -258, y: -169 }}>
          <div
            className={`${styles['map-dis-pop-modal']} ${styles.draggerModalClass}`}
            style={style.bgd}
          >
            <div
              className={`${styles.modalRowTitle} ${styles.dragHeadTitle}`}
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
                <div>病害信息</div>
              </div>
              <div className={`${styles.rightContent} ${styles.rightButton}`}>
                <span onClick={clickClose} className={styles.closeModalInfoClass}></span>
              </div>
            </div>
            <div className={`${styles.diseaseRowCommon} ${styles.dragRowInfo}`}>
              <div className={styles.diseaseLeftInfo}>
                <div className={styles.diseaseLeftTopInfo}>
                  <Image
                    className="map-pop-img"
                    width={230}
                    height={214}
                    src={data?.fileUrl}
                    placeholder={true}
                  />
                </div>
              </div>
              <div className={`map-pop-content ${styles.diseaseRightInfo}`}>
                <div className={styles.diseaseNoInfoClass}>
                  <span className={styles.diseaseNoClass}>{data?.diseaseNo}</span>
                  <span>{data?.commitTime}</span>
                </div>
                <div className={styles.diseaseTypeClass}>{data?.diseaseTypeName}</div>
                <div title={data?.projectName} className={styles.diseaseProjectClass}>
                  {data?.projectName}
                </div>
                <div>
                  {formData?.riskLvName}：{data?.riskLvName}
                </div>
                <div className={styles.diseaseAddressClass} title={data?.address}>
                  {formData?.address}：{data?.address}
                </div>
                <div>
                  {formData?.roadName}：{data?.roadName}
                </div>
                <div className={styles.diseaseAddressClass}>
                  {formData?.maintenanceCost}：{data?.maintenanceCost}元
                </div>
              </div>
            </div>
          </div>
        </Draggable>
      ) : null}
    </>
  );
};

export default DraggerModal;
