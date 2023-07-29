import React, { useState, useEffect, useImperativeHandle, useRef } from 'react';
import { Image } from 'antd';
import DistressCanvas from '../../../../../components/DistressCanvas';
import PlayImage from '../PlayImage';
// import { getDiseaseInfo } from '../../../service';
import styles from './styles.less';
// import { useModel } from 'umi';
// import XJBg from '@/assets/img/InspectionBoard/diseaseInfo.png';
import Draggable from 'react-draggable';
import { mockDiseaseList } from '../../../../../../mock/inspection';

interface Iprops {
  isModalVisible?: boolean;
  imgId: string;
  address: string;
  onRef: any;
  hideModal: () => void;
  style: { x: number; y: number };
  diseasePicNo?: string;
}

interface lsType {
  diseaseNameZh: string;
  area: any;
  length: any;
  collectTime: string;
  diseaseType: string | number;
  diseaseNo: string;
  imgNo: string;
  id: any;
  routeMode: any;
  displacement: string | number;
  diseaseImp: number;
}

const ls: lsType[] = [
  {
    diseaseNameZh: '沥青路面-纵向裂缝',
    area: '8.160725',
    length: '4.287515',
    collectTime: '2022-08-19 16:35:27.605',
    diseaseType: 1,
    diseaseNo: 'BH000072022081923071',
    imgNo: '',
    id: '1555744202625327106',
    routeMode: null,
    displacement: '',
    diseaseImp: 0,
  },
];

const DraggerModal: React.FC<Iprops> = (props: Iprops) => {
  const [imgUrl, setImgUrl] = useState('');
  // const { initialState }: any = useModel('@@initialState');
  const [data, setData] = useState({
    ls,
    url: 'http://visharp.traffic.smartmore.com/group1/M00/1A/A6/ClHMTmL_TMeAQ2ZuAA_cka75dKg923.jpg',
  });
  const [distressIndex, setDistressIndex] = useState(0);
  const childRef: any = useRef();
  const [disabled, setDisabled] = useState<any>(true);
  const [visibleFlag, setVisibleFlag] = useState<any>(false);
  const { address, imgId, diseasePicNo } = props;
  const [timerPlayer, setTimerPlayer] = useState<any>();
  useEffect(() => {
    setVisibleFlag(props.isModalVisible);
  }, [props.isModalVisible]);

  useEffect(() => {
    setDistressIndex(0);
    // async function fetchData() {
    //   const diseaTypes = initialState.diseaseTypes;
    //   const response = await getDiseaseInfo(imgId, diseaTypes);
    //   // console.log('res',response);

    //   const list: any = [];
    //   const obj: any = {
    //     url: response.data.url,
    //     ls: [],
    //   };
    //   response.data.ls.map((i: any) => {
    //     if (i.diseaseType !== 5 && i.diseaseType !== 6) {
    //       list.push(i);
    //       return false;
    //     }
    //     return false;
    //   });
    //   obj.ls = list;
    //   setData(obj);
    // }
    // if (false) {
    //   fetchData();
    // }

    // mock diseaseInfo
    const curItem: any = mockDiseaseList.rows.find((item: any) => item.diseaseNo === diseasePicNo);
    const obj = {
      ls: [curItem],
      url: curItem?.imgUrl,
    };
    setData(obj);

    if (childRef && childRef.current) {
      childRef.current?.resetPlayButton();
    }
  }, [imgId]);

  const clickClose = () => {
    props.hideModal();
    setDistressIndex(0);
    if (timerPlayer) {
      clearInterval(timerPlayer);
      setTimerPlayer(0);
    }
  };
  const cyclePlay = (playFlag: boolean) => {
    if (playFlag) {
      // 播放
      if (timerPlayer) {
        clearInterval(timerPlayer);
        setTimerPlayer(0);
        return;
      }
      const newIntervalId = setInterval(() => {
        setDistressIndex((prevCount) => {
          if (prevCount + 1 === data.ls?.length) {
            return 0;
          }
          return prevCount + 1;
        });
      }, 2000);
      setTimerPlayer(newIntervalId);
    } else {
      /* eslint-disable */
      if (timerPlayer) {
        clearInterval(timerPlayer);
        setTimerPlayer(0);
      }
    }
  };

  const previewBigImg = (url: string) => {
    setImgUrl(url);
  };
  const switchDisease = (page: number) => {
    setDistressIndex(page);
  };

  const resetMaskClosableFlag = (prop: any) => {
    setVisibleFlag(prop);
  };
  useImperativeHandle(props.onRef, () => ({
    // 暴露给父组件的方法
    resetMaskClosableFlag,
  }));

  const getRouteMode = (detInfo: any) => {
    let name = '';
    /* eslint-disable */
    if (Object.keys(detInfo)?.length > 0) {
      name = detInfo?.routeMode * 1 === 0 ? '上行' : detInfo?.routeMode * 1 === 1 ? '下行' : '';
    }
    return `${detInfo.imgNo ? detInfo.imgNo : ''} ${detInfo.imgNo ? name : ''}`;
  };

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
                    height={172}
                    src={data?.url}
                    placeholder={true}
                  />
                  {data ? (
                    <DistressCanvas
                      setImgUrl={previewBigImg || imgUrl}
                      detailIndex={distressIndex + 1}
                      data={data}
                    />
                  ) : (
                    ''
                  )}
                </div>
                <div className={styles.diseasePlayInfo}>
                  <PlayImage
                    onRef={childRef}
                    imageTotal={data.ls?.length || 0}
                    currentImage={distressIndex}
                    switchDisease={switchDisease}
                    cyclePlay={cyclePlay}
                  />
                </div>
              </div>
              <div className={`map-pop-content ${styles.diseaseRightInfo}`}>
                <div className={styles.diseaseNoInfoClass}>
                  <span className={styles.diseaseNoClass}>
                    {data.ls[distressIndex]?.diseaseNo || 'BH000112022080654670'}
                  </span>
                  <span>{data.ls[distressIndex]?.collectTime}</span>
                </div>
                <div className={styles.diseaseTypeClass}>
                  {data.ls[distressIndex]?.diseaseNameZh}
                </div>
                {/* <div>严重程度：{data.ls[distressIndex]?.diseaseImp == 0 ? '非紧急' : '紧急'}</div> */}
                <div>严重程度：非紧急</div>
                {data.ls[distressIndex]?.diseaseType == 14 ? (
                  <div>跳车高度：{data.ls[distressIndex]?.displacement} cm</div>
                ) : (
                  <>
                    <div>
                      面积：
                      {data.ls[distressIndex]?.area
                        ? (data.ls[distressIndex]?.area * 1).toFixed(3)
                        : 0}
                      m²
                    </div>
                    <div>
                      长度：
                      {data.ls[distressIndex]?.length
                        ? (data.ls[distressIndex]?.length * 1).toFixed(3)
                        : 0}
                      m
                    </div>
                  </>
                )}

                {/* <div>
                  桩号：
                  {data.ls[distressIndex] && getRouteMode(data.ls[distressIndex])}
                </div> */}
                {/* {data.ls[distressIndex]?.diseaseType !== 14 ? <div>预估养护费用：10000元</div> : ''} */}
                <div className={styles.diseaseAddressClass}>
                  位置：
                  <span title={address}>{address}</span>
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
