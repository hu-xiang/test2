import MapLeft from './components/mapLeft';
import MapRightPanel from './components/MapRightPanel';
import Map from './components/map/map';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { history, useModel } from 'umi';
import CenterPanel from './components/CenterPanel';
import styles from './styles.less';
import { message } from 'antd';
import HeadTop from './components/headTop';
import HeadBottom from './components/HeadBottom';
import { getComfort } from './service';

import { mockDiseaseList, mockCarInfo, mockPageOverview } from '../../../mock/inspection';

let totalTimer: any = null;
let timer: any = null;
const waitTime = 5000;
type Iprops = {
  headLogo: any;
  bottomInfo: Record<string, unknown>;
  propStyles: any;
  programName?: string;
  logoDesc?: string;
  // mapInfo?: Record<string, unknown>;
  children: any;
};
const InspectionBoard: React.FC<Iprops> = (props: Iprops) => {
  const [mapData, setMapData] = useState([]);
  const { initialState, setInitialState }: any = useModel('@@initialState');
  const [fullScreenFlag, setFullScreenFlag] = useState(false);
  const [isToday, setIsToday] = useState(true);
  const [fkFacilitiesId, setFkFacilitiesId] = useState<string>();
  const [mapType, setMapType] = useState('3d');
  const [roadStatus, setRoadStatus] = useState('roadCondition');
  const [theme, setTheme] = useState<string>('black');
  const [closeIntervel, setCloseIntervel] = useState<boolean>(false);
  const [endTime, setEndTime] = useState();
  const [prevParams, setPrevParams] = useState<any>();
  const [todayInfo, setTodayInfo] = useState<any>({});
  const [totalMile, setTotalMile] = useState<any>();
  const [carData, setCarData] = useState<any>([]);
  const [comfortData, setComfortData] = useState([]);
  const childRef: any = useRef();
  const rightRef: any = useRef();
  const carRefType: any = useRef();
  const pageRef: any = useRef();
  const pageCarRef: any = useRef();
  const keysType: any = useRef();
  const [page, setPage] = useState<any>(1);
  const [pageCar, setPageCar] = useState<any>(1);
  const [carType, setCarType] = useState<any>('');
  const [diseaseKeys, setDiseaseKeys] = useState<any>([]);
  // const pageSize = 10;
  const [carTableInfo, setCarTableInfo] = useState<any>({ rows: [], total: 0 });
  const [disDiseaseList, setDisDiseaseList] = useState<any>([]);
  const [diseaseTotal, setDiseaseTotal] = useState<any>(0);
  const [inspectStatus, setInspectStatus] = useState<boolean>(false); // 巡检状态
  const [inspectBtnStatus, setInspectBtnStatus] = useState<number>(0); // 巡检按钮状态 0 3 : 开始巡检 1: 巡检中  2: 结束巡检
  const { headLogo, logoDesc, bottomInfo, propStyles, programName } = props;

  // 自定义mapInfo
  const mapInfo = {
    // districtSearch: '深圳市',
    zoom: 18,
    // center: [113.913814, 22.540598],
    // center: [113.914774,22.537105],
    // center:[116.397428, 39.90923], // 北京
    center: [114.056496, 22.534596],
  };

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
    carRefType.current = type || '';
  };
  const handleSwitchDisease = (keys: any) => {
    setDiseaseKeys(keys);
    setPage(1);
    pageRef.current = 1;
    keysType.current = keys || [];
    setInitialState({ ...initialState, diseaseTypes: keys });
  };

  // 获取车辆和病害信息
  const getCarDatas = async () => {
    setCarTableInfo(mockCarInfo);
  };

  const clearTimeInterval = (flag: boolean) => {
    setCloseIntervel(flag);
  };
  const getDiseaseDatas = async () => {
    const { rows, total } = mockDiseaseList;
    setDisDiseaseList(rows.slice(0, 6));
    setDiseaseTotal(total);
  };

  const fetchData = async (param: any, isNowday: any = true, isReset: any) => {
    try {
      // const response = await getRealData({
      //   startTime: param?.startTime,
      //   endTime: param?.endTime,
      //   fkFacilitiesId: param?.fkFacilitiesId,
      //   status: carRefType.current,
      //   disease: keysType.current || [],
      // });
      const response = mockPageOverview;
      if (history.location?.pathname === '/inspectionBoard') {
        const newCarData: any = [];
        if (response?.status === 0) {
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
            setTodayInfo({
              // diseaseCount: response.data[0]?.diseaseCount,
              // todayMile: response.data[0]?.todayTotal,
              // online: response.data[0]?.online,
            });
            setTotalMile(response.data[0]?.total);
            if (!isReset || isNowday) {
              setMapData(response.data[0]?.diseaseList);
            }
          }
        } else {
          message.error({
            content: response.message,
            key: response.message,
          });
        }
      }
    } catch (error) {
      message.error({
        content: '操作失败',
        key: '操作失败',
      });
    }
  };

  const getInfo = async (param: any) => {
    setEndTime(param.endTime);
    if (childRef && childRef.current) {
      childRef.current?.resetFirstButton();
    }
    setFkFacilitiesId(param.fkFacilitiesId);
    await fetchData(param, isToday, false);
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
      if (!totalTimer) {
        clearTimeout(totalTimer);
      }
      totalTimer = setTimeout(interv, wait);
    };
    if (!totalTimer) {
      clearTimeout(totalTimer);
    }
    totalTimer = setTimeout(interv, wait);
  };

  // 获取舒适度信息
  const queryComfort = useCallback(async () => {
    if (roadStatus === 'comfort' && prevParams?.startTime && prevParams?.endTime) {
      const res = await getComfort({
        startTime: prevParams?.startTime,
        endTime: prevParams?.endTime,
      });
      if (history.location?.pathname === '/inspectionBoard') {
        if (res.status === 0) {
          if (res?.data) {
            const dataArr: any = [];
            Object.keys(res.data).forEach((key) => {
              const tempObj: any = {
                lnglat: [],
                rqi: '',
              };
              res.data[key].forEach((item: any) => {
                tempObj.lnglat.push([item.longitude, item.latitude]);
              });
              tempObj.rqi = res.data[key][0].rqi;
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
    // 病害信息
    getDiseaseDatas();
    // 车辆信息
    getCarDatas();

    // const abortController = new AbortController(); // 创建
    // if (fullScreenFlag && prevParams) {
    //   clearTimeInterval(true);
    //   getCarDatas();
    //   // getDiseaseDatas();
    //   fetchData(prevParams, isToday, false);
    // }
  }, [fullScreenFlag, carType, diseaseKeys, page, pageCar, prevParams]);

  // 所有定时任务接口
  useEffect(() => {
    if (!closeIntervel && isToday && prevParams) {
      intervalFunction(() => {
        fetchData(
          { fkFacilitiesId, startTime: prevParams?.startTime, endTime: prevParams?.endTime },
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
    if (roadStatus === 'comfort') {
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
  }, [roadStatus]);
  // 监听路由的切换
  useEffect(() => {
    const unlisten = history.listen((location: any) => {
      if (location !== '/inspectionBoard') {
        setInitialState({ ...initialState, diseaseTypes: [] });
      }
    });
    return () => {
      unlisten();
    };
  }, []);

  // 切换巡检状态
  const handleInspectStatus = (status: boolean) => {
    setInspectStatus(status);
  };
  // 切换巡检按钮文字状态 0: 开始巡检 1: 巡检中  2: 结束巡检
  const handleInspectBtnStatus = (status: number) => {
    setInspectBtnStatus(status);
  };

  const handlerToggleThemeType = (type: any) => setTheme(type);

  return (
    <div className={`${styles.inspectPanelClass} ${styles.mapContain}`}>
      <HeadTop
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
          mapData={mapData}
          carData={carData}
          isToday={isToday}
          fkFacilitiesId={fkFacilitiesId}
          parTime={endTime}
          onRef={childRef}
          clearTimeInterval={clearTimeInterval}
          mapInfo={mapInfo}
          roadStatus={roadStatus}
          comfortData={comfortData}
          inspectStatus={inspectStatus}
          handleInspectBtnStatus={handleInspectBtnStatus}
        />
        {!fullScreenFlag ? <CenterPanel todayInfo={todayInfo} /> : null}
        <MapRightPanel
          handleCarSelect={handleCarSelect}
          handleDiseaseSelect={handleDiseaseSelect}
          totalMile={totalMile}
          onRef={rightRef}
          carTableInfo={carTableInfo}
          disDiseaseList={disDiseaseList}
          diseaseTotal={diseaseTotal}
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
        programName={programName || 'baseLine'}
        handleFullScreen={handleFullScreen}
        toggleTheme={handlerToggleThemeType}
        themeType={theme}
        bottomInfo={bottomInfo}
        changeRoadStatus={changeRoadStatus}
        roadStatus={roadStatus}
        inspectBtnStatus={inspectBtnStatus}
        handleInspectStatus={handleInspectStatus}
      >
        {programName !== 'baseLine' ? <>{props.children}</> : null}
      </HeadBottom>
    </div>
  );
};

export default InspectionBoard;
