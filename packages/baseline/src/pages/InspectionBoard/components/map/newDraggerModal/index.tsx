import React, { useState, useEffect, useImperativeHandle, useRef } from 'react';
import { Select, Image } from 'antd';
import DistressCanvas from '../../../../../components/DistressCanvas';
import EmptyStatus from '../../../../../components/TableEmpty';
import PlayImage from '../PlayImage';
// import EmptyPage from '../../../../../components/EmptyPage';
import {
  getDiseaseInfo,
  getDiseaseTrackInfo,
  getQueryDate,
  getSubDetailInfo,
  getPhpDetailInfo,
} from '../../../service';
import styles from './styles.less';
// import baseStyles from '../../..style/selectStyle';
import { useModel } from 'umi';
// import { cloneDeep } from 'lodash';
// import { imgDiseaseList,dateList,dList1,dList2,dList3 } from '../../testData';
import uploadNullImg from '../../../../../assets/img/uploadIcon/uploadImg.png';
// import XJBg from '@/assets/img/InspectionBoard/diseaseInfo.png';
import Draggable from 'react-draggable';

const { Option } = Select;
interface Iprops {
  isModalVisible?: boolean;
  imgId: string;
  address: string;
  onRef: any;
  hideModal: () => void;
  style: { x: number; y: number };
  platform?: string;
  modalTitle?: string;
}

const arr = [
  { value: 1, text: '轻度' },
  { value: 2, text: '中度' },
  { value: 3, text: '重度' },
];

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

const ls: lsType[] = [];
let timerPlayer: any = null;
const DraggerModal: React.FC<Iprops> = (props: Iprops) => {
  const { modalTitle = '病害信息', platform = 'disease' } = props;
  const [isClickDisease, setIsClickDisease] = useState<boolean>(false);
  const [timeVal, setTimeVal] = useState<string>('');
  const [imgUrl, setImgUrl] = useState('');
  const [imgDiseaId, setImgDiseaId] = useState<string>('');
  const [trackImgUrl, setTrackImgUrl] = useState<string[]>([]);
  const { initialState }: any = useModel('@@initialState');
  const [data, setData] = useState<any>({ ls, url: '' });
  const [nullFlag, setNullFlag] = useState<boolean>(false);
  const [distressIndex, setDistressIndex] = useState(0);
  const [timeList, setTimeList] = useState<any[]>([]);
  // const [selTime, setSelTime] = useState<string>('');
  const [imgList, setImgList] = useState<any[]>([]);
  const childRef: any = useRef();
  const diseaseIndexRef: any = useRef();
  const [disabled, setDisabled] = useState<any>(true);
  const [visibleFlag, setVisibleFlag] = useState<any>(false);
  const { address, imgId } = props;
  // const [timerPlayer, setTimerPlayer] = useState<any>();
  // const [timerVal, setTimerVal] = useState<string|undefined>();

  const getTrackData = async (id: string, dateTime: string) => {
    // console.log('getTrackData',id,dateTime);
    const rec = await getDiseaseTrackInfo({ diseaseId: id, time: dateTime });
    // let rec: any = {status:0,data:{ls:[],url:''},message: '',};
    // if(id==='1593538973516550145'&& dateTime==='2022-11')
    // {
    //   rec=dList1;
    //   console.log('first1')
    // }
    // else if(id==='1593538973516550146'&&dateTime==='2022-11')
    // {
    //   rec=dList2;
    //   console.log('first2')
    // }
    // else if(id==='1593538973516550145'&&dateTime==='2022-10')
    // {
    //   rec=dList3;
    //   console.log('first3')
    // }
    if (rec?.status === 0) {
      const newArr: any[] = rec?.data?.ls.map((itr: any) => {
        return {
          url: rec?.data?.url,
          id: itr?.id,
          ls: [itr],
        };
      });
      if (!newArr || !newArr?.length) {
        setNullFlag(true);
      } else {
        setNullFlag(false);
      }
      setImgList([...newArr] || []);
      const list = Array.from(rec?.data?.ls, (it: any) => {
        return it?.imgUrl;
      });
      setTrackImgUrl([...list]);
    }
  };
  const getTimes = async (id: string) => {
    const rec = await getQueryDate({ diseaseId: id });
    // const rec = dateList;
    if (rec?.status === 0) {
      let newArr: any[] = [];
      newArr = rec?.data.map((it: any) => {
        return { label: it, value: it };
      });
      const lastime = rec?.data?.length ? rec?.data.slice(-1)?.join() : '';
      setTimeVal(lastime);
      setTimeList(newArr);
      if (platform !== 'subfac') {
        getTrackData(id, lastime);
      }
    }
  };
  useEffect(() => {
    setVisibleFlag(props.isModalVisible);
  }, [props.isModalVisible]);
  const cyclePlay = (playFlag: boolean) => {
    if (playFlag) {
      // 播放
      if (timerPlayer) {
        clearInterval(timerPlayer);
        timerPlayer = 0;
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
      timerPlayer = newIntervalId;
    } else {
      /* eslint-disable */
      if (timerPlayer) {
        clearInterval(timerPlayer);
        timerPlayer = 0;
      }
    }
  };
  const getbboxData = (val: any) => {
    if (!val) {
      return null;
    }
    let boxData = JSON.parse(val);
    if (boxData?.length > 1) {
      boxData = val;
    } else {
      const newData = JSON.parse(val);
      boxData = newData[0]?.bbox;
    }
    return boxData;
  };
  useEffect(() => {
    let unmountFlag = false;
    diseaseIndexRef.current = -1;
    // console.log('diseaseIndexRef前一次的值1', diseaseIndexRef.current);
    setDistressIndex(0);
    let idm = '';
    const fetchData = async () => {
      const diseaTypes = initialState.diseaseTypes;
      let response: any = {};
      if (platform === 'disease') {
        response = await getDiseaseInfo(imgId, diseaTypes);
        // response=imgDiseaseList;
        const list: any = [];
        const obj: any = {
          url: response.data.url,
          ls: [],
        };
        if (response?.status === 0 && !unmountFlag) {
          response.data.ls.map((i: any) => {
            if (i.diseaseType !== 5 && i.diseaseType !== 6) {
              list.push(i);
              return false;
            }
            return false;
          });
        }
        obj.ls = list;
        idm = response?.data?.ls && response?.data?.ls[0]?.id;
        setData(obj);
      } else if (platform === 'phpdisease') {
        response = await getPhpDetailInfo({ id: imgId });
        const newObj: any = {
          url: '',
          ls: [],
        };
        // console.log('mmm',response?.data);
        if (response?.status === 0 && !unmountFlag) {
          newObj.url = response?.data?.imgUrl;
          newObj?.ls.push(response?.data);
        }
        setImgDiseaId(response?.data?.fkDiseaseId);
        idm = response?.data?.fkDiseaseId;
        setData(newObj);
      } else if (platform === 'subfac') {
        response = await getSubDetailInfo({ id: imgId });
        const itemVal: any = {
          facilitiesNo: '',
          typeName: '',
          imgNo: '',
          url: '',
          ls: [],
          direction: undefined,
        };
        if (response?.status === 0 && !unmountFlag) {
          itemVal.id = response?.data?.detail?.id;
          itemVal.facilitiesNo = response?.data?.detail?.facilitiesNo;
          // itemVal.typeName = typeVals[response?.data?.detail?.type];
          itemVal.typeName = response?.data?.detail?.typeName;
          itemVal.imgNo = response?.data?.detail?.stackNo;
          itemVal.direction = response?.data?.detail?.direction;
          itemVal.url = response?.data?.detail?.imgUrl;
          response?.data?.imgList.forEach((itm: any) => {
            const boxdata = getbboxData(itm?.bbox);
            itemVal.ls.push({ ...itm, bbox: boxdata });
          });
        }
        setData(itemVal);
      }
      if (platform !== 'subfac' && isClickDisease) {
        getTimes(idm);
      }
      // platform==="disease"? await getDiseaseInfo(imgId, diseaTypes):await getDiseaseInfo(imgId, diseaTypes);
      // console.log('res',response);
    };
    setNullFlag(false);
    if (imgId) {
      fetchData();
    }
    cyclePlay(false);
    switchDisease(0);
    return () => {
      unmountFlag = true;
      if (timerPlayer) {
        clearInterval(timerPlayer);
        timerPlayer = 0;
      }
    };
  }, [imgId]);
  useEffect(() => {
    if (data?.ls?.length > 1 && !isClickDisease) {
      cyclePlay(true);
    }
  }, [data?.ls]);
  useEffect(() => {
    if (isClickDisease) {
      let newId = imgId;
      if (platform === 'disease') {
        newId = data?.ls[distressIndex]?.id;
      } else {
        newId = platform === 'phpdisease' ? imgDiseaId : imgId;
      }
      if (diseaseIndexRef.current !== distressIndex) {
        // 之前已经查出来了，且病害id没有切换，就不用再次查询
        getTimes(newId);
      }
      diseaseIndexRef.current = distressIndex;
      // if (platform !== 'subfac') {
      //   getTrackData(newId, '');
      // }
    }
  }, [distressIndex, isClickDisease]);
  // useEffect(() => {
  //   if (isClickDisease) {
  //     const newId = platform === 'phpdisease' ? imgDiseaId : imgId;
  //     getTimes(newId);
  //     if (platform !== 'subfac') {
  //       getTrackData(newId, '');
  //     }
  //   }
  // }, [isClickDisease]);
  const clickClose = () => {
    props.hideModal();
    setDistressIndex(0);
    diseaseIndexRef.current = -1;
    if (timerPlayer) {
      clearInterval(timerPlayer);
      timerPlayer = 0;
    }
  };

  const previewTrackImg = (url: string, ind: number | undefined) => {
    setTrackImgUrl((lastArr: any) => {
      return lastArr.map((item: any, index: any) => (index == ind ? url : item));
    });
    // console.log('预览',url)
  };
  const previewBigImg = (url: string) => {
    // console.log('fushu',url);
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

  const getRouteMode = (detInfo: any, key: string = 'routeMode') => {
    let name = '';
    /* eslint-disable */
    if (Object.keys(detInfo)?.length > 0) {
      name = detInfo[`${key}`] * 1 === 0 ? '上行' : detInfo[`${key}`] * 1 === 1 ? '下行' : '';
    }
    if (platform === 'subfac') {
      return `${detInfo.stackNo ? detInfo.stackNo : ''} ${detInfo.stackNo ? name : ''}`;
    }
    return `${detInfo.imgNo ? detInfo.imgNo : ''} ${detInfo.imgNo ? name : ''}`;
  };
  const handleDiseaseButton = () => {
    if (!isClickDisease && platform === 'disease' && childRef?.current) {
      childRef?.current.handleFlag(false);
      cyclePlay(false);
      if (!imgList?.length) {
        setNullFlag(true);
      }
    } else if (isClickDisease) {
      setNullFlag(false);
      if (childRef?.current && platform === 'disease') {
        if (data.ls?.length > 1) {
          childRef?.current.handleFlag(true);
          cyclePlay(true);
        }
      }
    }
    setIsClickDisease(!isClickDisease);
  };

  const handleTime = (val: any) => {
    setTimeVal(val);
    const newID = platform === 'disease' ? data?.ls[distressIndex]?.id : imgDiseaId;
    getTrackData(newID, val);
  };

  return (
    <>
      {visibleFlag ? (
        <Draggable disabled={disabled} bounds="parent" defaultPosition={{ x: -258, y: -169 }}>
          <div
            className={`${styles['map-dis-pop-modal']} ${styles.draggerModalClass} ${
              platform === 'phpdisease' ? styles['map-dis-php-modal'] : ''
            }`}
          >
            <div
              className={`${styles['map-dis-top-panel']} ${
                !isClickDisease ? null : `${styles['border-radus-class']}`
              }`}
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
                  <div>{modalTitle || '病害信息'}</div>
                </div>
                <div className={`${styles.rightContent} ${styles.rightButton}`}>
                  {platform === 'disease' || platform === 'phpdisease' ? (
                    <span className={styles['track-txt']} onClick={handleDiseaseButton}>
                      {'病害跟踪'}
                    </span>
                  ) : null}
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
                      src={imgUrl || data?.url || 'error'}
                      fallback={uploadNullImg}
                      // placeholder={true}
                    />
                    {data ? (
                      <DistressCanvas
                        setImgUrl={previewBigImg}
                        canvasType={platform !== 'subfac' ? 'disease' : 'subfac'}
                        detailIndex={distressIndex + 1}
                        data={data}
                      />
                    ) : (
                      ''
                    )}
                  </div>
                  <div className={styles.diseasePlayInfo}>
                    {platform !== 'phpdisease' ? (
                      <PlayImage
                        onRef={childRef}
                        isClickDisease={isClickDisease}
                        imageTotal={data.ls?.length || 1}
                        currentImage={distressIndex}
                        switchDisease={switchDisease}
                        cyclePlay={cyclePlay}
                      />
                    ) : null}
                  </div>
                </div>
                <div className={`map-pop-content ${styles.diseaseRightInfo}`}>
                  {platform === 'disease' || platform === 'phpdisease' ? (
                    <>
                      <div className={styles.diseaseNoInfoClass}>
                        <span
                          className={styles.diseaseNoClass}
                          title={
                            platform === 'disease'
                              ? data.ls[distressIndex]?.diseaseNo
                              : data.ls[distressIndex]?.realDiseaseNo
                          }
                        >
                          {platform === 'disease'
                            ? data.ls[distressIndex]?.diseaseNo
                            : data.ls[distressIndex]?.realDiseaseNo}
                        </span>
                        <span>{data.ls[distressIndex]?.collectTime}</span>
                      </div>
                      <div className={styles.diseaseTypeClass}>
                        {data.ls[distressIndex]?.diseaseNameZh}
                      </div>
                      <div>
                        严重程度：
                        {arr?.filter((item) => item?.value === data.ls[distressIndex]?.severity)[0]
                          ?.text || '-'}
                      </div>
                      {data.ls[distressIndex]?.diseaseType == 14 ? (
                        <div>
                          跳车高度：
                          {data.ls[distressIndex]?.displacement
                            ? Number(data.ls[distressIndex]?.displacement).toFixed(3)
                            : 0}{' '}
                          cm
                        </div>
                      ) : (
                        <>
                          <div>
                            面积：
                            {data.ls[distressIndex]?.diseaseType === 9 ||
                            data.ls[distressIndex]?.diseaseType === 12
                              ? '-'
                              : `${
                                  data.ls[distressIndex]?.area
                                    ? (data.ls[distressIndex]?.area * 1).toFixed(3)
                                    : 0
                                } m²`}
                          </div>
                          <div>
                            长度：
                            {data.ls[distressIndex]?.diseaseType === 9 ||
                            data.ls[distressIndex]?.diseaseType === 12
                              ? '-'
                              : `${
                                  data.ls[distressIndex]?.length
                                    ? (data.ls[distressIndex]?.length * 1).toFixed(3)
                                    : 0
                                } m`}
                          </div>
                        </>
                      )}

                      <div>
                        桩号：
                        {data.ls[distressIndex] && getRouteMode(data.ls[distressIndex])}
                      </div>
                      {Platform_Flag === 'kunming' && data.ls[distressIndex]?.diseaseType !== 14 ? (
                        <div>预估养护费用：10000元</div>
                      ) : (
                        ''
                      )}
                      <div className={styles.diseaseAddressClass}>
                        位置：
                        <span title={address}>{address}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.diseaseNoInfoClass}>
                        <span className={styles.diseaseNoClass}>
                          {data.ls[distressIndex]?.facilitiesNo}
                        </span>
                      </div>
                      <div className={styles.diseaseTypeClass}>
                        {data.ls[distressIndex]?.typeName}
                      </div>
                      <div>
                        桩号：
                        {data &&
                          data.ls[distressIndex] &&
                          getRouteMode(data.ls[distressIndex], 'direction')}
                      </div>
                      <div className={styles['disease-address-dis']}>
                        <span>位置：</span>
                        <span className={styles['disease-address-txt']}>{address}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {(platform === 'disease' || platform === 'phpdisease') && isClickDisease ? (
              <>
                <div className={`${styles['img-Box']}`}>
                  <div className={styles['select-box']}>
                    {timeList?.length ? (
                      <Select
                        placeholder="请选择时间"
                        value={timeVal}
                        popupClassName="dropdownSelectClass dropdown-select"
                        className="searchFacilityClass search-date-class"
                        onChange={handleTime}
                        notFoundContent={
                          <EmptyStatus
                            isInspectBorder={true}
                            customEmptyClass={styles['select-box-empty']}
                          />
                        }
                        // allowClear
                      >
                        {timeList.map((item: any) => (
                          <Option key={item.value} value={item.value} className="facClass">
                            {item.label}
                          </Option>
                        ))}
                      </Select>
                    ) : null}
                  </div>
                  <div
                    className={`${styles['img-container']} ${
                      nullFlag ? styles['img-container-empty'] : null
                    }`}
                  >
                    {!nullFlag ? (
                      <Image.PreviewGroup>
                        {imgList.map((it: any, index: number) => {
                          return (
                            <React.Fragment key={it?.id}>
                              <div className={styles['item-img']}>
                                <Image
                                  width={120}
                                  height={92}
                                  src={trackImgUrl[index] || it?.url || 'error'}
                                  fallback={uploadNullImg}
                                  // placeholder={true}
                                />
                              </div>
                              {it?.url ? (
                                <DistressCanvas
                                  setImgUrl={(url, ind) => {
                                    previewTrackImg(url, ind);
                                  }}
                                  detailIndex={1}
                                  imgIndex={index}
                                  data={it}
                                />
                              ) : (
                                ''
                              )}
                            </React.Fragment>
                          );
                        })}
                      </Image.PreviewGroup>
                    ) : (
                      <EmptyStatus customEmptyClass={styles['table-empty']} />
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </Draggable>
      ) : null}
    </>
  );
};

export default DraggerModal;
