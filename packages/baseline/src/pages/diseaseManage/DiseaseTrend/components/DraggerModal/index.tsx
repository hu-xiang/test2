import React, { useState, useEffect, useImperativeHandle, useRef } from 'react';
import { Image } from 'antd';
import DistressCanvas from '../../../../../components/DistressCanvas';
import EmptyStatus from '../../../../../components/TableEmpty';
import PlayImage from '../../../../InspectionBoard/components/map/PlayImage';
import { getDiseaseDetailInfo, getTrackList, getQueryDate } from '../../service';
import styles from './styles.less';
import BasicLineChart from '../../../../../components/BasicLineChart';
// import { useModel } from 'umi';
// import { imgDiseaseList,dateList,dList1,dList2,dList3 } from '../../testData';
import uploadNullImg from '../../../../../assets/img/uploadIcon/white-empty.jpg';
import Draggable from 'react-draggable';

// const { Option } = Select;
interface Iprops {
  isModalVisible?: boolean;
  imgId: string;
  address: string;
  onRef: any;
  hideModal: () => void;
  platform?: string;
  modalTitle?: string;
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

const ls: lsType[] = [];
const tabInfo = [
  { name: '病害图片', type: 1 },
  { name: '病害尺寸', type: 2 },
];
const arr = [
  { value: 1, text: '轻度' },
  { value: 2, text: '中度' },
  { value: 3, text: '重度' },
];

const DraggerModal: React.FC<Iprops> = (props: Iprops) => {
  const { modalTitle = '病害信息', platform = 'disease' } = props;
  const [isClickDisease, setIsClickDisease] = useState<boolean>(false);
  const [disableSize, setDisableSize] = useState<boolean>(false);
  const [diseaseSizeData, setDiseaseSizeData] = useState<any[]>([]);
  // const [timeVal, setTimeVal] = useState<string>('');
  const [imgUrl, setImgUrl] = useState('');
  // const [imgDiseaId, setImgDiseaId] = useState<string>('');
  const [trackImgUrl, setTrackImgUrl] = useState<string[]>([]);
  // const { initialState }: any = useModel('@@initialState');
  const [data, setData] = useState<any>({ ls, url: '' });
  const [nullFlag, setNullFlag] = useState<boolean>(false);
  const [distressIndex, setDistressIndex] = useState(0);
  // const [timeList, setTimeList] = useState<any[]>([]);
  const [imgList, setImgList] = useState<any[]>([]);
  const childRef: any = useRef();
  const diseaseIndexRef: any = useRef();
  const [disabled, setDisabled] = useState<any>(true);
  const [visibleFlag, setVisibleFlag] = useState<any>(false);
  const { address, imgId } = props;
  const [timerPlayer, setTimerPlayer] = useState<any>();
  const [tabValue, setTabValue] = useState<number>(1);

  const getCheckTime = (val: any) => {
    const newdate = val.split(' ');
    let rec: any = '';
    if (newdate && newdate?.length > 0) {
      rec = `${newdate[0]} ${newdate[1] ? newdate[1].slice(0, 8) : ''}`;
    }
    return rec;
  };
  const getTrackData = async (id: string, dateTime: string) => {
    const rec = await getTrackList({ id, collectTime: dateTime });
    if (rec?.status === 0) {
      if (!rec?.data?.length) {
        setImgList([]);
        setTrackImgUrl([]);
        return;
      }
      const newArr: any[] = rec?.data?.map((itr: any) => {
        return {
          url: itr?.imgUrl,
          id: itr?.id,
          ls: [{ ...itr }],
        };
      });
      if (!newArr || !newArr?.length) {
        setNullFlag(true);
      } else {
        setNullFlag(false);
      }
      // 切换时间时，线图要再次请求
      if (tabValue === 2) {
        const newdata: any[] = [];
        if (newArr?.length) {
          newArr.forEach((it: any) => {
            const ndata = getCheckTime(it?.ls[0]?.collectTime);
            if (ndata) {
              newdata.push({
                label: ndata,
                value: (it?.ls[0]?.area && Number(it?.ls[0]?.area.toFixed(3))) || 0,
                type: '面积',
              });
              newdata.push({
                label: ndata,
                value: (it?.ls[0]?.length && Number(it?.ls[0]?.length.toFixed(3))) || 0,
                type: '长度',
              });
              // newdata.push({ label: ndata, value: it?.ls[0]?.area || 0, type: '面积' });
              // newdata.push({ label: ndata, value: it?.ls[0]?.length || 0, type: '长度' });
            }
          });
        }
        setDiseaseSizeData(newdata);
      }
      setImgList([...newArr] || []);
      const list = Array.from(rec?.data, (it: any) => {
        return it?.imgUrl;
      });
      setTrackImgUrl([...list]);
    }
  };
  const getTimes = async (id: string) => {
    const rec = await getQueryDate({ id });
    if (rec?.status === 0) {
      // let newArr: any[] = [];
      // newArr = rec?.data.map((it: any) => {
      //   return { label: it, value: it };
      // });
      const lastime = rec?.data?.length ? rec?.data.slice(-1)?.join() : '';
      // setTimeVal(lastime);
      // setTimeList(newArr);
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
  useEffect(() => {
    diseaseIndexRef.current = -1;
    setDistressIndex(0);
    let idm = '';
    const fetchData = async () => {
      let response: any = {};
      if (platform === 'disease') {
        response = await getDiseaseDetailInfo(imgId);
        const list: any = [];
        const obj: any = {
          url: response.data.url,
          ls: [],
        };
        if (response?.status === 0) {
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
        if (
          response?.data?.ls &&
          response?.data?.ls?.length &&
          (response?.data?.ls[0]?.diseaseType === 9 || response?.data?.ls[0]?.diseaseType === 12)
        ) {
          changeTabs(1);
          setDisableSize(true);
        } else {
          setDisableSize(false);
        }
        setData(obj);
      }
      if (platform === 'disease' && isClickDisease) {
        getTimes(idm);
      }
    };
    setNullFlag(false);
    if (imgId) {
      fetchData();
    }
    cyclePlay(false);
    switchDisease(0);
  }, [imgId]);
  useEffect(() => {
    if (data?.ls?.length > 1 && !isClickDisease) {
      cyclePlay(true);
    }
  }, [data?.ls]);
  const changeTabs = (val: any) => {
    setTabValue(val);
    if (val === 2) {
      const newdata: any[] = [];
      if (imgList?.length) {
        imgList.forEach((it: any) => {
          const ndata = getCheckTime(it?.ls[0]?.collectTime);
          if (ndata) {
            newdata.push({
              label: ndata,
              value: (it?.ls[0]?.area && Number(it?.ls[0]?.area.toFixed(3))) || 0,
              type: '面积',
            });
            newdata.push({
              label: ndata,
              value: (it?.ls[0]?.length && Number(it?.ls[0]?.length.toFixed(3))) || 0,
              type: '长度',
            });
          }
        });
      }
      setDiseaseSizeData(newdata);
    }
  };
  useEffect(() => {
    if (isClickDisease) {
      let newId = imgId;
      if (platform === 'disease') {
        newId = data?.ls[distressIndex]?.id;
      }
      if (diseaseIndexRef.current !== distressIndex) {
        // 之前已经查出来了，且病害id没有切换，就不用再次查询
        getTimes(newId);
      }
      diseaseIndexRef.current = distressIndex;
      if (
        data?.ls[distressIndex]?.diseaseType === 9 ||
        data?.ls[distressIndex]?.diseaseType === 12
      ) {
        changeTabs(1);
        setDisableSize(true);
      } else {
        setDisableSize(false);
      }
    } else {
      setDisableSize(false);
    }
  }, [distressIndex, isClickDisease]);

  const clickClose = () => {
    props.hideModal();
    setDistressIndex(0);
    diseaseIndexRef.current = -1;
    if (timerPlayer) {
      clearInterval(timerPlayer);
      setTimerPlayer(0);
    }
  };

  const previewTrackImg = (url: string, ind: number | undefined) => {
    setTrackImgUrl((lastArr: any) => {
      return lastArr.map((item: any, index: any) => (index == ind ? url : item));
    });
    // console.log('预览',url)
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

  const getRouteMode = (detInfo: any, key: string = 'routeMode') => {
    let name = '';
    /* eslint-disable */
    if (Object.keys(detInfo)?.length > 0) {
      name = detInfo[`${key}`] * 1 === 0 ? '上行' : detInfo[`${key}`] * 1 === 1 ? '下行' : '';
    }
    return `${detInfo.stakeNo ? detInfo.stakeNo : ''} ${detInfo.stakeNo ? name : ''}`;
  };
  const handleDiseaseButton = () => {
    if (!isClickDisease && platform === 'disease' && childRef?.current) {
      childRef?.current.handleFlag(false);
      cyclePlay(false);
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

  // const handleTime = (val: any) => {
  //   setTimeVal(val);
  //   const newID = data?.ls[distressIndex]?.id;
  //   getTrackData(newID, val);
  // };

  const revContainer = () => {
    if (tabValue === 1) {
      if (!nullFlag) {
        return (
          <Image.PreviewGroup>
            {imgList?.length &&
              imgList.map((it: any, index: number) => {
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
                        needDrawTime={true}
                      />
                    ) : (
                      ''
                    )}
                  </React.Fragment>
                );
              })}
          </Image.PreviewGroup>
        );
      }
      return (
        <div className={styles['img-container-empty']}>
          <EmptyStatus customEmptyClass={styles['table-empty']} isBlack={false} />
        </div>
      );
    } else {
      return <BasicLineChart info={diseaseSizeData} isBlack={false} />;
    }
  };

  return (
    <>
      {visibleFlag ? (
        <Draggable disabled={disabled} bounds="parent" defaultPosition={{ x: -258, y: -169 }}>
          <div
            className={`${styles['map-dis-pop-modal']} ${styles.draggerModalClass} ${
              platform === 'phpdisease'
                ? styles[
                    Platform_Flag === 'meiping' ? 'map-dis-php-modal-mpgs' : 'map-dis-php-modal'
                  ]
                : ''
            }`}
          >
            <div
              className={`${
                styles[Platform_Flag === 'meiping' ? 'map-dis-top-panel-mpgs' : 'map-dis-top-panel']
              } ${!isClickDisease ? null : `${styles['border-radus-class']}`}`}
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
                  {/* <span className={styles.modalTitleImg}></span> */}
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
                      // height={172}
                      height={Platform_Flag === 'meiping' ? 220 : 172}
                      src={
                        platform !== 'subfac'
                          ? imgUrl || data?.url || 'error'
                          : data?.ls[distressIndex]?.imgUrl || data?.url || 'error'
                      }
                      fallback={uploadNullImg}
                      // placeholder={true}
                    />
                    {platform !== 'subfac' && data ? (
                      <DistressCanvas
                        setImgUrl={previewBigImg}
                        detailIndex={platform !== 'subfac' ? distressIndex + 1 : 1}
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
                        customClass={styles['white-play-image']}
                        isBlack={false}
                        cyclePlay={cyclePlay}
                      />
                    ) : null}
                  </div>
                </div>
                <div className={`map-pop-content ${styles.diseaseRightInfo}`}>
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

                  {Platform_Flag === 'meiping' ? (
                    <div>
                      紧急程度：
                      {data.ls[distressIndex]?.diseaseImp == 0 ? '非紧急' : '紧急'}
                    </div>
                  ) : (
                    <div>
                      严重程度：
                      {arr?.filter((item) => item?.value === data.ls[distressIndex]?.severity)[0]
                        ?.text || '-'}
                    </div>
                  )}

                  {/* <div>
                    {Platform_Flag === 'meiping' ? '紧急程度：' : '严重程度：'}
                    {data.ls[distressIndex]?.diseaseImp == 0 ? '非紧急' : '紧急'}
                  </div> */}
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

                  {Platform_Flag === 'meiping' && (
                    <>
                      <div className={styles.diseaseAddressClass}>
                        <span>道路名称：</span>
                        <span title={data.ls[distressIndex]?.facilitiesName}>
                          {data.ls[distressIndex]?.facilitiesName}
                        </span>
                      </div>
                      <div className={styles.diseaseAddressClass}>
                        <span>道路编码：</span>
                        <span title={data.ls[distressIndex]?.roadSection}>
                          {data.ls[distressIndex]?.roadSection}
                        </span>
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
                  {Platform_Flag !== 'meiping' && (
                    <div className={styles.diseaseAddressClass}>
                      位置：
                      <span title={address}>{address}</span>
                    </div>
                  )}
                  {data.ls[distressIndex]?.diseaseType != 14 && Platform_Flag === 'meiping' && (
                    <div className={styles.diseaseAddressClass}>
                      <span>维修状态：</span>
                      <span
                        title={
                          [
                            { title: '待修复', value: 1 },
                            { title: '修复中', value: 2 },
                            { title: '已修复', value: 3 },
                          ].find((item: any) => item.value == data.ls[distressIndex]?.openStatus)
                            ?.title
                        }
                      >
                        {
                          [
                            { title: '待修复', value: 1 },
                            { title: '修复中', value: 2 },
                            { title: '已修复', value: 3 },
                          ].find((item: any) => item.value == data.ls[distressIndex]?.openStatus)
                            ?.title
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {platform === 'disease' && isClickDisease ? (
              <>
                <div className={`${styles['img-Box']}`}>
                  <div className={`${styles['head-container']}`}>
                    <ul className={styles['tab-ul-class']}>
                      {tabInfo.map((it: any) => (
                        <li
                          key={it?.type}
                          onClick={
                            !disableSize
                              ? () => {
                                  changeTabs(it?.type);
                                }
                              : () => {}
                          }
                          className={`${it?.type === tabValue ? styles['active-class'] : ''} ${
                            styles['li-class']
                          } ${disableSize && it?.type === 2 ? styles['disable-li-class'] : null}`}
                        >
                          {it?.name}
                        </li>
                      ))}
                    </ul>

                    {/* <div className={styles['select-box']}>
                      {timeList?.length ? (
                        <Select
                          placeholder="请选择时间"
                          value={timeVal}
                          // dropdownClassName="dropdown-select-white-class"
                          className="search-date-white-class"
                          onChange={handleTime}
                          notFoundContent={
                            <EmptyStatus
                              isInspectBorder={true}
                              customEmptyClass={styles['select-box-white-empty']}
                            />
                          }
                          // allowClear
                        >
                          {timeList.map((item: any) => (
                            <Option key={item.value} value={item.value}>
                              {item.label}
                            </Option>
                          ))}
                        </Select>
                      ) : null}
                    </div> */}
                  </div>
                  <div
                    style={{ position: 'relative' }}
                    className={`${styles['img-container']} ${
                      tabValue === 1 ? styles['pic-class'] : styles['disease-size-class']
                    }`}
                  >
                    {revContainer()}
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
