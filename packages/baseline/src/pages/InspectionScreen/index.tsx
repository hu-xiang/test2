import MapLeft from './components/mapLeft';
import MapRightPanel from './components/MapRightPanel';
import Map from './components/map/map';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { history, useModel } from 'umi';
import Request from 'umi-request';
// import CenterPanel from './components/CenterPanel';
// import { vehicleData } from './components/testData';
import styles from './styles.less';
// import { message } from 'antd';
import HeadTop from './components/headTop';
import HeadBottom from '../InspectionBoard/components/HeadBottom';

import { getRealData, getCarData, getDiseaseData, getComfort } from './service';

const { CancelToken } = Request;
let totalTimer: any = null;
let timer: any = null;
let totalMapTimer: any = null;
const waitTime = 5000;
type Iprops = {
  hasHeadUser?: boolean;
  headLogo?: any;
  bottomInfo?: Record<string, unknown>;
  propStyles?: any;
  programName?: string;
  logoDesc?: string;
  mapInfo?: Record<string, unknown>;
  children?: any;
  excludeRoutes?: any[];
  extraData?: any;
};
const routePath = '/inspectionBoard';

const excludeArrData = ['/inspectionBoard', '/facilityAssets'];
let unmountFlag: boolean = false;
const InspectionBoard: React.FC<Iprops> = (props: Iprops) => {
  const { setInspectType } = useModel<any>('inspect');
  // const [mapData, setMapData] = useState<any[]>([]);
  const { initialState, setInitialState }: any = useModel('@@initialState');
  const [fullScreenFlag, setFullScreenFlag] = useState(false);
  const [isToday, setIsToday] = useState(true);
  // const [fkFacilitiesId, setFkFacilitiesId] = useState<string>();
  const [fkFacilitiesId, setFkFacilitiesId] = useState<any>([]);
  const [mapType, setMapType] = useState('3d');
  const [roadStatus, setRoadStatus] = useState('roadCondition');
  const [theme, setTheme] = useState<string>('black');
  const [closeIntervel, setCloseIntervel] = useState<boolean>(false);
  const [closeMapIntervel, setCloseMapIntervel] = useState<boolean>(false);
  const [endTime, setEndTime] = useState();
  const [prevParams, setPrevParams] = useState<any>();
  // const [todayInfo, setTodayInfo] = useState<any>();
  const [rightInfo, setRightInfo] = useState<any>({});
  // const [totalMile, setTotalMile] = useState<any>();
  const [carData, setCarData] = useState<any>([]);
  const [comfortData, setComfortData] = useState([]);
  const childRef: any = useRef();
  const rightRef: any = useRef();
  const carRefType: any = useRef();
  const pageRef: any = useRef();
  const pageCarRef: any = useRef();
  const keysType: any = useRef();
  const paramsData: any = useRef();
  const insRef = useRef<any>();
  const [page, setPage] = useState<any>(1);
  const [pageCar, setPageCar] = useState<any>(1);
  const [carType, setCarType] = useState<any>('');
  const [diseaseKeys, setDiseaseKeys] = useState<any>([]);
  const pageSize = 10;
  const [carTableInfo, setCarTableInfo] = useState<any>({ rows: [], total: 0 });
  const [disDiseaseList, setDisDiseaseList] = useState<any>([]);
  const [diseaseTotal, setDiseaseTotal] = useState<any>(0);
  const {
    hasHeadUser = true,
    headLogo,
    logoDesc,
    bottomInfo,
    propStyles,
    programName,
    mapInfo,
    excludeRoutes,
  } = props;

  const switchPage = (current: number) => {
    setPage(current);
    pageRef.current = current || 1;
  };
  const switchPageCar = (current: number) => {
    setPageCar(current);
    pageCarRef.current = current || 1;
  };
  const handleSwitchCar = (type: any) => {
    setCarType(type);
    setPageCar(1);
    pageCarRef.current = 1;
    if (childRef && childRef.current) {
      childRef.current?.closeCarModal();
    }
    carRefType.current = type || '';
  };
  const handleSwitchDisease = (keys: any) => {
    if (childRef && childRef.current) {
      childRef.current?.closeModal();
    }
    setDiseaseKeys(keys);
    setPage(1);
    pageRef.current = 1;
    keysType.current = keys || [];
    setInitialState({ ...initialState, diseaseTypes: keys });
  };

  // 获取车辆和病害信息
  const getCarDatas = async () => {
    // if (!isToday && !unmountFlag) {
    //   setCarTableInfo({ rows: [], total: 0 });
    //   return;
    // }
    const res = await getCarData({
      deviceStatus: carRefType.current,
      page: pageCarRef.current,
      pageSize: 5,
      startTime: paramsData?.current?.startTime || prevParams?.startTime,
      endTime: paramsData?.current?.endTime || prevParams?.endTime,
    });
    if (history.location?.pathname === routePath) {
      if (res.status === 0 && !unmountFlag) {
        if (res?.data) {
          setCarTableInfo(res.data);
        }
      }
    }
  };

  const clearTimeInterval = useCallback((flag: boolean) => {
    setCloseIntervel(flag);
  }, []);
  const clearMapTimeInterval = useCallback((flag: boolean) => {
    setCloseMapIntervel(flag);
  }, []);
  const getDiseaseDatas = async () => {
    const res = await getDiseaseData({
      diseaseType: keysType.current || [],
      startTime: prevParams?.startTime,
      endTime: prevParams?.endTime,
      fkFacilitiesIdList: prevParams?.fkFacilitiesId,
      page: pageRef.current,
      pageSize,
    });
    if (history.location?.pathname === routePath) {
      if (res.status === 0 && !unmountFlag) {
        if (res?.data) {
          if (res.data && res.data?.data?.rows?.length > 0) {
            setDisDiseaseList(res.data?.data?.rows);
            setDiseaseTotal(res.data?.data?.total);
          } else {
            setDisDiseaseList([]);
            setDiseaseTotal(0);
          }
        } else {
          setDisDiseaseList([]);
          setDiseaseTotal(0);
        }
      }
    }
    if (isToday) {
      clearTimeInterval(false);
      clearMapTimeInterval(false);
    }
  };
  const handleAbort = () => {
    if (insRef && insRef?.current) {
      insRef?.current();
      insRef.current = null;
    }
  };
  const fetchMapData = async (param: any, isNowday: any = true, isReset: any) => {
    if (!isReset || isNowday) {
      // console.log('开始查1');
      // setMapData(response.data[0]?.diseaseList);
      if (childRef?.current) {
        childRef?.current?.queryMapClusterData(
          param?.startTime,
          param?.endTime,
          param?.fkFacilitiesId,
          param?.diseaseType,
        );
      }
    }
  };

  const fetchData = async (param: any, isNowday: any = true, isReset: any) => {
    handleAbort();
    try {
      const response = await getRealData(
        {
          startTime: param?.startTime,
          endTime: param?.endTime,
          fkFacilitiesIdList: param?.fkFacilitiesId,
          status: carRefType.current,
          disease: keysType.current || [],
        },
        {
          cancelToken: new CancelToken(function executor(c) {
            insRef.current = c;
          }),
        },
      );
      // console.log('param',param)
      if (history.location?.pathname === routePath) {
        if (!isReset || isNowday) {
          // console.log('开始查1');
          // setMapData(response.data[0]?.diseaseList);
          // if (childRef?.current) {
          //   childRef?.current?.queryMapClusterData(
          //     param?.startTime,
          //     param?.endTime,
          //     param?.fkFacilitiesId,
          //   );
          // }
        }
        const newCarData: any = [];
        if (response?.status === 0 && !unmountFlag) {
          if (response.data?.length > 0) {
            response.data.forEach((i: any) => {
              if (i.deviceId) {
                newCarData.push(i);
              }
              if (i.carList && i.carList?.length > 0) {
                i.carList.reverse();
              }
            });
            setCarData(newCarData);
            setRightInfo({
              diseaseCount: response?.data[0]?.diseaseCount,
              todayMile: response?.data[0]?.todayTotal,
              online: response?.data[0]?.deviceOnlineCount?.onlineCount,
              allNum: response?.data[0]?.deviceOnlineCount?.totalCount,
            });
          }
        }
      }
    } catch (error) {
      // message.error({
      //   content: '操作失败',
      //   key: '操作失败',
      // });
    }
  };

  const getInfo = async (param: any) => {
    setEndTime(param.endTime);
    if (childRef && childRef.current) {
      childRef.current?.resetFirstButton();
    }
    setFkFacilitiesId(param.fkFacilitiesId);
    param.diseaseType = diseaseKeys;
    fetchMapData(param, isToday, false);
    paramsData.current = {
      fkFacilitiesId: param?.fkFacilitiesId,
      startTime: param?.startTime,
      endTime: param?.endTime,
    };
    setPrevParams({
      fkFacilitiesId: param?.fkFacilitiesId,
      startTime: param?.startTime,
      endTime: param?.endTime,
    });
    setPage(1);
    pageRef.current = 1;
    if (rightRef && rightRef.current) {
      rightRef.current.resetPage();
    }
    await fetchData(param, isToday, false);
  };

  const handleFullScreen = (visib: boolean) => {
    setFullScreenFlag(visib);
  };

  const toggleToday = (visible: boolean) => {
    setIsToday(visible);
  };

  const handleMapStyle = (type: string) => {
    setMapType(type);
  };

  // 切换舒适度与路况
  const changeRoadStatus = (status: string) => {
    setRoadStatus(status);
  };

  const handleCarSelect = (row: any) => {
    if (childRef && childRef.current) {
      childRef.current?.handleCarSel(row);
    }
  };
  const handleDiseaseSelect = (row: any) => {
    if (childRef && childRef.current) {
      childRef.current?.handleDiseaseSel(row);
    }
  };
  const intervalFunction = (func: () => void, wait: number = 5000) => {
    const interv = () => {
      func();
      if (totalTimer) {
        clearTimeout(totalTimer);
      }
      totalTimer = setTimeout(interv, wait);
    };
    if (totalTimer) {
      clearTimeout(totalTimer);
    }
    totalTimer = setTimeout(interv, wait);
  };
  const intervalMapDataFunction = (func: () => void, wait: number = 5000) => {
    const interv = () => {
      func();
      if (totalMapTimer) {
        clearTimeout(totalMapTimer);
      }
      totalMapTimer = setTimeout(interv, wait);
    };
    if (totalMapTimer) {
      clearTimeout(totalMapTimer);
    }
    totalMapTimer = setTimeout(interv, wait);
  };
  // 获取舒适度信息
  const queryComfort = useCallback(async () => {
    if (roadStatus === 'comfort' && prevParams?.startTime && prevParams?.endTime) {
      const res = await getComfort({
        startTime: prevParams?.startTime,
        endTime: prevParams?.endTime,
      });
      if (history.location?.pathname === routePath) {
        if (res.status === 0 && !unmountFlag) {
          if (res?.data) {
            const dataArr: any = [];
            Object.keys(res.data).forEach((key) => {
              let tempObj: any = {
                lnglat: [],
                rqi: '',
              };
              res.data[key].forEach((item: any) => {
                if (tempObj.rqi === '') {
                  tempObj.rqi = item.rqi;
                } else if (tempObj.rqi !== item.rqi) {
                  dataArr.push(tempObj);
                  tempObj = {
                    lnglat: [],
                    rqi: '',
                  };
                }

                tempObj.lnglat.push([item.longitude, item.latitude]);
              });
              dataArr.push(tempObj);
            });

            setComfortData(dataArr);
          }
        }
      }
    }
  }, [roadStatus, prevParams?.startTime, prevParams?.endTime]);

  useEffect(() => {
    queryComfort();
  }, [queryComfort]);

  useEffect(() => {
    // const abortController = new AbortController(); // 创建
    if (fullScreenFlag && prevParams) {
      clearTimeInterval(true);
      clearMapTimeInterval(true);
      getCarDatas();
      getDiseaseDatas();
      fetchData(paramsData?.current || prevParams, isToday, false);
      if (paramsData?.current) {
        Object.assign(paramsData?.current, { diseaseType: diseaseKeys });
      }
      if (prevParams) {
        Object.assign(prevParams, { diseaseType: diseaseKeys });
      }
      fetchMapData(paramsData?.current || prevParams, isToday, false);
    }
  }, [fullScreenFlag, carType, diseaseKeys, page, pageCar, prevParams]);

  // 所有定时任务接口
  useEffect(() => {
    if (!closeIntervel && isToday && prevParams) {
      intervalFunction(() => {
        fetchData(
          {
            fkFacilitiesId,
            startTime: paramsData?.current?.startTime || prevParams?.startTime,
            endTime: paramsData?.current?.endTime || prevParams?.endTime,
          },
          isToday,
          true,
        );
        if (fullScreenFlag) {
          getCarDatas();
          getDiseaseDatas();
        }
      }, waitTime);
    }
    return () => {
      if (totalTimer) {
        clearTimeout(totalTimer);
        totalTimer = null;
      }
    };
  }, [isToday, prevParams, closeIntervel, fullScreenFlag]);
  useEffect(() => {
    if (!closeMapIntervel && isToday && prevParams) {
      intervalMapDataFunction(() => {
        fetchMapData(
          {
            fkFacilitiesId,
            startTime: paramsData?.current?.startTime || prevParams?.startTime,
            endTime: paramsData?.current?.endTime || prevParams?.endTime,
            diseaseType: diseaseKeys,
          },
          isToday,
          true,
        );
      }, waitTime);
    }
    return () => {
      if (totalMapTimer) {
        clearTimeout(totalMapTimer);
        totalMapTimer = null;
      }
    };
  }, [isToday, prevParams, closeMapIntervel, fullScreenFlag]);

  useEffect(() => {
    if (roadStatus === 'comfort') {
      clearTimeout(timer);
      timer = setTimeout(function repeat() {
        queryComfort();
        timer = setTimeout(repeat, 120000);
      }, 120000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [roadStatus, queryComfort]);
  // 监听路由的切换
  useEffect(() => {
    let excludeArr: any[] = excludeArrData;
    if (excludeRoutes && excludeRoutes?.length > 0) {
      excludeArr = excludeRoutes || excludeArrData;
    }
    // console.log('excludeRoutes444',history);
    if (history?.location?.pathname === routePath) {
      setInspectType(routePath.replace('/', ''));
    }
    const unlisten = history.listen((location: any) => {
      // console.log('excludeRoute55555');
      if (location.pathname !== routePath) {
        setInitialState({ ...initialState, diseaseTypes: [] });
        if (!excludeArr.includes(location.pathname)) {
          setInspectType(routePath.replace('/', ''));
        }
      }
    });
    return () => {
      unlisten();
    };
  }, [history]);
  useEffect(() => {
    unmountFlag = false;
    return () => {
      unmountFlag = true;
    };
  }, []);

  return (
    <div className={`${styles.inspectPanelClass} ${styles.mapContain}`}>
      <HeadTop
        hasHeadUser={hasHeadUser}
        toggleToday={toggleToday}
        onSelMap={(param: any) => getInfo(param)}
        themeType={theme}
        headLogo={headLogo}
        logoDesc={logoDesc}
        propStyles={propStyles}
      />
      <div className={styles.middleContainer}>
        {!fullScreenFlag ? <MapLeft /> : null}
        <Map
          mapType={mapType}
          // mapData={mapData}
          carData={carData}
          isToday={isToday}
          fkFacilitiesId={fkFacilitiesId}
          parTime={endTime}
          onRef={childRef}
          clearTimeInterval={clearTimeInterval}
          clearMapTimeInterval={clearMapTimeInterval}
          mapInfo={mapInfo}
          roadStatus={roadStatus}
          comfortData={comfortData}
          extraData={props?.extraData}
        />
        {/* {!fullScreenFlag ? <CenterPanel todayInfo={todayInfo} /> : null} */}
        {
          // 右侧组件抛出的数据：
          // handleCarSelect点击右侧车辆信息表格行给地图组件行的数据
          // handleDiseaseSelect点击右侧病害卡片给地图组件当前病害卡片的数据
          // switchPage右侧病害卡片当前页变化后存在此页面用来调右侧病害卡片数据接口
          // switchPageCar右侧车辆信息当前页变化后存在此页面用来调右侧车辆信息数据接口
          // handleSwitchCar右侧车辆信息下拉选择变化后给到所选到的数据到此页面重新调用车辆信息接口
          // handleSwitchDisease右侧病害信息下拉选择变化后给到所选到的数据到此页面重新调用病害信息接口
        }
        <MapRightPanel
          handleCarSelect={handleCarSelect}
          handleDiseaseSelect={handleDiseaseSelect}
          // totalMile={totalMile}
          onRef={rightRef}
          carTableInfo={carTableInfo}
          disDiseaseList={disDiseaseList}
          diseaseTotal={diseaseTotal}
          rightInfo={rightInfo}
          switchPage={switchPage}
          switchPageCar={switchPageCar}
          handleSwitchCar={handleSwitchCar}
          handleSwitchDisease={handleSwitchDisease}
          isFullScreen={fullScreenFlag}
          mapType={mapType}
          roadStatus={roadStatus}
        />
      </div>
      <HeadBottom
        handleMapStyle={handleMapStyle}
        isFullScreen={fullScreenFlag}
        programName={'baseLine'}
        handleFullScreen={handleFullScreen}
        toggleTheme={(type: any) => setTheme(type)}
        propStyles={propStyles}
        themeType={theme}
        bottomInfo={bottomInfo}
        changeRoadStatus={changeRoadStatus}
        roadStatus={'1'}
      >
        {programName !== 'baseLine' ? <>{props?.children}</> : null}
      </HeadBottom>
    </div>
  );
};

export default InspectionBoard;
