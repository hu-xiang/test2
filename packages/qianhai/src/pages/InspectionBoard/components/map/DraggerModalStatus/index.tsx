import React, { useEffect, useState, useImperativeHandle } from 'react';
import { Image, Switch } from 'antd';
import styles from './styles.less';
import MileageLine from '../../MileageLine';
import Draggable from 'react-draggable';

interface Iprops {
  vehicleModalVisible?: boolean;
  data: any;
  hideVehicleModal: () => void;
  toggleLocus: (locusVisible: any) => void;
  dataDeviceId: any;
  dataDeviceName: string;
  carInfo: any;
  onRef: any;
}

const CarCurrentStatus: React.FC<Iprops> = (props: Iprops) => {
  const { data, dataDeviceId, carInfo, dataDeviceName }: any = props;
  const [local, setLocal] = useState<any>([]);
  const [initFlag, setInitFlag] = useState<any>(false);
  const [planenessInfo, setPlanenessInfo] = useState<any>([]);
  const [locusVisible, setLocusVisible] = useState<any>();
  const [dataIndex, setDataIndex] = useState<any>();
  const [defalutCheck, setDefalutCheck] = useState<any>(false);
  const [disabled, setDisabled] = useState<any>(true);

  const initLocus = (arr: any) => {
    if (arr?.length > 0) {
      setInitFlag(true);
      setLocusVisible([...arr]);
    }
  };
  useImperativeHandle(props.onRef, () => ({
    // 暴露给父组件的方法
    initLocus,
  }));
  useEffect(() => {
    if (!data?.length) return;
    const devList: any = [];
    data.forEach((i: any) => {
      devList.push(i.deviceId);
    });
    const unique = (arr: any) => {
      return arr.filter((item: any, index: any) => {
        return arr.indexOf(item, 0) === index;
      });
    };
    const list = unique(devList);
    let firstIndex = -1;
    if (dataDeviceId) {
      firstIndex = list.findIndex((i: any) => i === dataDeviceId);
      setDataIndex(firstIndex);
    }
    if (initFlag) {
      setInitFlag(false);
    } else if (!locusVisible) {
      setLocusVisible(Array.from({ length: list?.length }, () => false));
    }
    if (firstIndex >= 0 && locusVisible && locusVisible[firstIndex]) {
      setDefalutCheck(true);
    } else {
      setDefalutCheck(false);
    }
  }, [data, locusVisible, dataDeviceId]);
  useEffect(() => {
    if (carInfo?.longitude || carInfo?.latitude) {
      setLocal([carInfo.longitude, carInfo.latitude]);
    }
    if (carInfo && carInfo?.planenessList) {
      setPlanenessInfo(carInfo?.planenessList);
    }
  }, [carInfo]);
  const onTrailChange = () => {
    const list = [...locusVisible];
    list[dataIndex] = !list[dataIndex];
    setLocusVisible([...list]);
    props.toggleLocus(list);
  };

  const clickClose = () => {
    setInitFlag(false);
    props.hideVehicleModal();
  };
  const getColorType = (type: any) => {
    if (type !== '0') {
      return type === '1' ? '#DC4239' : 'rgba(255, 255, 255, 0.3)';
    }
    return '#24AE4A';
  };

  return (
    <>
      {props.vehicleModalVisible ? (
        <Draggable disabled={disabled} bounds="parent" defaultPosition={{ x: -258, y: -169 }}>
          <div
            className={`${styles['map-dis-pop-modal']} ${styles.draggerModalClass} ${styles.carModalClass}`}
          >
            <div className={`${styles.carBgPanel}`}>
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
                  <div>巡检车辆当前状态</div>
                </div>
                <div className={`${styles.rightContent} ${styles.rightButton}`}>
                  <span onClick={clickClose} className={styles.closeModalInfoClass}></span>
                </div>
              </div>
              <div className={`${styles.carColumnInfo} ${styles.dragRowInfo}`}>
                <div className={styles.carNewRowInfo}>
                  <Image
                    src={carInfo?.imgUrl || undefined}
                    alt=""
                    width={230}
                    height={172}
                    placeholder={true}
                    className={styles.imgInfo}
                  />
                  <div className={styles.rowTrailInfo}>
                    <div className={styles.imgCarInfo}>
                      <div className={styles.firstRowInfo}>
                        <div
                          style={{ background: getColorType(carInfo?.deviceStatus) }}
                          className={styles.speedBoxDot}
                        ></div>
                        <span className={styles.txtDevice}>{dataDeviceName}</span>
                      </div>
                      <div className={styles.humanInfo}>
                        <span className={styles.humanInfoTxt}>
                          {carInfo?.ipqcName || '巡检人员：-'}
                        </span>
                        <div className={styles.rowHuman}>
                          <span className={`${styles.phoneClass} ${styles.humanInfoTxt}`}>
                            {carInfo?.ipqcTel || '电话号码：-'}
                          </span>
                          <div className={styles.trailClass}>
                            <span className={styles.trailTxtClass}>巡检轨迹</span>
                            <Switch
                              checked={defalutCheck}
                              className={styles.trailSwitchClass}
                              defaultChecked={false}
                              onChange={onTrailChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className={styles.inspectInfo}>
                        <span>
                          已巡查：{(carInfo?.miles && carInfo?.miles.toFixed(2)) || '0'} km
                        </span>
                        <span>当前经度：{local[0]}</span>
                        <span>当前纬度：{local[1]}</span>
                        <span>当前车速：{carInfo?.speed || '0'} km/h</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`${styles.roadMonitoringBox} ${styles.carBgPanel} ${styles.planenessPanel}`}
            >
              <MileageLine dataType={4} planenessInfo={planenessInfo} />
            </div>
          </div>
        </Draggable>
      ) : null}
    </>
  );
};

export default CarCurrentStatus;
