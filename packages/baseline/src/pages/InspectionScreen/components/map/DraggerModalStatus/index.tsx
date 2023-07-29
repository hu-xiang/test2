import React, { useEffect, useState, useImperativeHandle } from 'react';
// import { Image, Switch } from 'antd';
import { Switch, Modal } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import styles from './styles.less';
import MileageLine from '../../MileageLine';
import Draggable from 'react-draggable';
import moment from 'moment';
import VideoStream from '../../../../../components/VideoStream';
import { ReactComponent as NoVideo } from '../../../../../assets/img/video/noVideo.svg';
import { commonRequest } from '../../../../../utils/commonMethod';

interface Iprops {
  vehicleModalVisible?: boolean;
  // data: any;
  hideVehicleModal: () => void;
  toggleLocus: (locusVisible: any) => void;
  dataDeviceId: any;
  dataDeviceName: string;
  carInfo: any;
  onRef: any;
}

const requestList = [
  { url: '/traffic/camera/getPlayUrl', method: 'get' },
  { url: '/traffic/camera/getChannelList', method: 'get' },
];

const CarCurrentStatus: React.FC<Iprops> = (props: Iprops) => {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [wsUrl1, setWsUrl1] = useState<any>();
  const [wsUrl2, setWsUrl2] = useState<any>();
  const [uuid, setUuid] = useState<any>('');
  const [channelList, setChannelList] = useState<any>([]);
  const [channelIndex, setChannelIndex] = useState<number>(0);
  const [videoBigShow, setVideoBigShow] = useState<boolean>(false);
  // const { data, dataDeviceId, carInfo, dataDeviceName }: any = props;
  const { dataDeviceId, carInfo, dataDeviceName }: any = props;
  const [local, setLocal] = useState<any>([]);
  // const [initFlag, setInitFlag] = useState<any>(false);
  const [planenessInfo, setPlanenessInfo] = useState<any>([]);
  // const [locusVisible, setLocusVisible] = useState<any>();
  // const [dataIndex, setDataIndex] = useState<any>();
  const [defalutCheck, setDefalutCheck] = useState<any>(false);
  const [disabled, setDisabled] = useState<any>(true);

  // const initLocus = (arr: any) => {
  //   if (arr?.length > 0) {
  //     setInitFlag(true);
  //     setLocusVisible([...arr]);
  //   }
  // };
  useImperativeHandle(props.onRef, () => ({
    // 暴露给父组件的方法
    // initLocus,
    defalutCheck,
  }));
  // useEffect(() => {
  //   if (!data?.length) return;
  //   const devList: any = [];
  //   data.forEach((i: any) => {
  //     devList.push(i.deviceId);
  //   });
  //   const unique = (arr: any) => {
  //     return arr.filter((item: any, index: any) => {
  //       return arr.indexOf(item, 0) === index;
  //     });
  //   };
  //   const list = unique(devList);
  //   let firstIndex = -1;
  //   if (dataDeviceId) {
  //     firstIndex = list.findIndex((i: any) => i === dataDeviceId);
  //     setDataIndex(firstIndex);
  //   }
  //   if (initFlag) {
  //     setInitFlag(false);
  //   } else if (!locusVisible) {
  //     setLocusVisible(Array.from({ length: list?.length }, () => false));
  //   }
  //   if (firstIndex >= 0 && locusVisible && locusVisible[firstIndex]) {
  //     setDefalutCheck(true);
  //   } else {
  //     setDefalutCheck(false);
  //   }
  // }, [data, locusVisible, dataDeviceId]);
  useEffect(() => {
    if (carInfo?.longitude || carInfo?.latitude) {
      setLocal([carInfo.longitude, carInfo.latitude]);
    }
    if (carInfo && carInfo?.planenessList) {
      setPlanenessInfo(carInfo?.planenessList.reverse());
    }
    if (carInfo?.status === '0') {
      setIsOnline(true);
    } else {
      setIsOnline(false);
    }
  }, [carInfo]);
  const getChannelList = async () => {
    const res = await commonRequest({
      ...requestList[1],
      params: { deviceId: dataDeviceId },
    });
    if (res.status === 0) {
      setChannelList(res?.data || []);
      if (res?.data?.length) {
        setChannelIndex(0);
        setUuid(res?.data[0]?.channelUid);
      }
    }
  };
  const getVideoUrl = async (cameraUid: any) => {
    const video = await commonRequest({
      ...requestList[0],
      params: { cameraUid },
    });
    /* eslint-disable */
    if (video.status === 0) {
      if (videoBigShow) {
        setWsUrl2(video?.data?.mseUrl);
      } else {
        setWsUrl1(video?.data?.mseUrl);
      }
    } else {
      if (videoBigShow) {
        setWsUrl2('');
      } else {
        setWsUrl1('');
      }
    }
  };
  useEffect(() => {
    if (isOnline) {
      getChannelList();
    }
  }, [isOnline]);
  // const onTrailChange = () => {
  //   // const list = [...locusVisible];
  //   // list[dataIndex] = !list[dataIndex];
  //   // setLocusVisible([...list]);
  //   // props.toggleLocus(list);
  // };

  const onTrailChange = (checked: boolean) => {
    setDefalutCheck(checked);
    props.toggleLocus(checked);
  };

  const clickClose = () => {
    // setInitFlag(false);
    props.hideVehicleModal();
  };
  const getColorType = (type: any) => {
    if (type !== '0') {
      return type === '1' ? '#DC4239' : 'rgba(255, 255, 255, 0.3)';
    }
    return '#24AE4A';
  };

  useEffect(() => {
    if (uuid) getVideoUrl(uuid);
  }, [uuid]);

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
                  <div
                    className={styles.imgInfo}
                    style={{
                      width: '230px',
                      height: '192px',
                      border: '0.5px solid rgba(255, 255, 255, 0.5)',
                      borderRadius: '6px',
                    }}
                  >
                    {isOnline && wsUrl1 ? (
                      <div
                        onClick={() => {
                          setWsUrl2(wsUrl1);
                          setVideoBigShow(true);
                          setWsUrl1('');
                        }}
                      >
                        <VideoStream
                          width={'228px'}
                          height={'190px'}
                          wsUrl={wsUrl1}
                          videoBigShow={videoBigShow}
                          style={{ marginLeft: '31px', marginTop: '12px' }}
                        />
                        {channelList?.length ? (
                          <div className={styles.videoSwitch}>
                            <div
                              className={styles.videoLeftSwitch}
                              onClick={(e: any) => {
                                e?.stopPropagation();
                                if (channelIndex === 0) return;
                                const index = channelIndex - 1;
                                setChannelIndex(index);
                                setUuid(channelList[index]?.channelUid);
                              }}
                            >
                              <LeftOutlined />
                            </div>
                            <div className={styles.videoCenterSwitch}>
                              {channelList[channelIndex]?.channelName}
                            </div>
                            <div
                              className={styles.videoRightSwitch}
                              onClick={(e: any) => {
                                e?.stopPropagation();
                                if (channelIndex === channelList?.length - 1) return;
                                const index = channelIndex + 1;
                                setChannelIndex(index);
                                setUuid(channelList[index]?.channelUid);
                              }}
                            >
                              <RightOutlined />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div style={{ marginLeft: '31px', marginTop: '12px' }}>
                        <NoVideo />
                      </div>
                    )}
                  </div>

                  {/* <Image
                    src={carInfo?.imgUrl || undefined}
                    alt=""
                    width={230}
                    height={172}
                    placeholder={true}
                    className={styles.imgInfo}
                  /> */}
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
                          {carInfo?.ipqcName || '巡检员：-'}
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
                        <span>
                          巡检日期：
                          {carInfo?.collectTime
                            ? moment(carInfo?.collectTime)?.format('yyyy-MM-DD')
                            : '-'}
                        </span>
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
      {videoBigShow && (
        <Modal
          title="视频实时预览"
          width={'800px'}
          wrapClassName={styles.carModal}
          maskClosable={false}
          bodyStyle={{
            height: '524px',
            padding: '0 1px',
          }}
          open={videoBigShow}
          onCancel={() => {
            setWsUrl1(wsUrl2);
            setVideoBigShow(false);
            setWsUrl2('');
          }}
          onOk={() => {}}
          style={{
            top: 'calc(50% - 290px)',
          }}
          footer={false}
        >
          {videoBigShow ? (
            <div
              style={{
                border: '0.5px solid rgba(255, 255, 255, 0.5)',
                width: '600px',
                height: '500px',
                marginLeft: '24px',
                // borderRadius: '10px'
                display: 'flex',
              }}
            >
              <VideoStream
                width={'600px'}
                height={'500px'}
                wsUrl={wsUrl2}
                style={{ position: 'absolute', left: '240px', top: '200px' }}
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'absolute',
                  right: '24px',
                }}
              >
                {channelList?.map((item: any, i: number) => (
                  <div
                    key={item?.id}
                    className={`${i === channelIndex ? styles.channelSelected : ''} ${
                      styles.videoChannelSwitch
                    }`}
                    onClick={() => {
                      if (i === channelIndex) return;
                      setChannelIndex(i);
                      setUuid(channelList[i]?.channelUid);
                    }}
                  >
                    {item?.channelName}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Modal>
      )}
    </>
  );
};

export default CarCurrentStatus;
