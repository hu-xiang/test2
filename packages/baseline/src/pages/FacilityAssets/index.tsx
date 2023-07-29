import BoardLeft from './components/boardLeft';
import BoardRight from './components/boardRight';
import React, { useState, useEffect, useRef } from 'react';
import styles from '../InspectionBoard/styles.less';
import { message } from 'antd';
import HeadTop from '../InspectionBoard/components/headTop';
import HeadBottom from '../InspectionBoard/components/HeadBottom';
import EvaMap from './components/map';
import TabButton from './components/UIButton';
import { getTabChangeInfo } from './service';
import { history, useModel } from 'umi';
import Request from 'umi-request';

type typeInf = { name: string; type: number };
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
let isUnmount: boolean = false;
const FacilityAssets: React.FC<Iprops> = (props: Iprops) => {
  const { excludeRoutes, mapInfo, hasHeadUser = true, extraData } = props;
  const { CancelToken } = Request;
  const { setInspectType } = useModel<any>('inspect');
  const { setCurrentType } = useModel<any>('inspect');
  const headRef: any = useRef();
  const typeTimeList: typeInf[] = [
    { name: 'PCI参考值', type: 1 },
    { name: 'RQI参考值', type: 2 },
  ];
  const { headLogo, logoDesc, bottomInfo, programName, propStyles } = props;
  const [mapProjData, setMapProjData] = useState<any>([]);
  const [fullScreenFlag, setFullScreenFlag] = useState(false);
  const [mapType, setMapType] = useState('3d');
  const controlRef = useRef<any>();
  const flagRef = useRef<any>();
  const [buttonVal, setButtonVal] = useState<number>(1);
  const [theme, setTheme] = useState<string>('black');
  const [selectProject, setSelectProject] = useState<any>(); // 设施id
  const [isClickProject, setIsClickProject] = useState<boolean>(false);
  const childRef: any = useRef();
  const handleFullScreen = (visib: boolean) => {
    setFullScreenFlag(visib);
  };
  const setProject = (id: any) => {
    setSelectProject(id);
  };
  const handleAbort = () => {
    if (controlRef && controlRef?.current) {
      controlRef?.current();
      controlRef.current = null;
    }
  };
  const fetchProjData = async (params: any) => {
    try {
      flagRef.current = false;
      const rec = await getTabChangeInfo(params, {
        cancelToken: new CancelToken(function executor(c) {
          controlRef.current = c;
        }),
      });
      if (!isUnmount) {
        if (rec?.status === 0) {
          if (!flagRef.current) {
            setMapProjData(rec?.data || []);
          }
        } else {
          setMapProjData([]);
        }
      }
    } catch (error) {
      flagRef.current = true;
      message.error({
        content: '获取道路信息失败',
        key: '获取道路失败',
      });
    }
  };

  useEffect(() => {
    let isUnmountFlag = false;
    if (selectProject && !isUnmountFlag) {
      setIsClickProject(true);
    }
    return () => {
      isUnmountFlag = true;
    };
  }, [selectProject]);
  // 左侧点击返回清掉数据
  const handleClearProject = () => {
    setIsClickProject(false);
    setSelectProject('');
    // 重置地图组件里的数据
    if (childRef && childRef.current) {
      childRef.current?.resetProjectId();
    }
    if (headRef && headRef?.current) {
      headRef.current?.clearFac();
    }
  };

  const getInfo = async (param: { fkFacilitiesId: string } = { fkFacilitiesId: '' }) => {
    let facid: string = '';
    handleAbort();
    flagRef.current = true;
    if (param?.fkFacilitiesId) {
      setSelectProject(param?.fkFacilitiesId);
      facid = param?.fkFacilitiesId;
      // setSelectFac(param?.fkFacilitiesId);
    } else {
      handleClearProject();
      facid = '';
    }
    // console.log('facid', facid);
    if (childRef && childRef.current) {
      childRef.current?.setProjID(facid);
    }
    fetchProjData(param);
  };

  const handleMapStyle = (type: string) => {
    setMapType(type);
  };

  const handleComButton = (val: number) => {
    setButtonVal(val);
    if (childRef && childRef.current) {
      childRef.current?.setPolylineOpt(val);
    }
  };
  useEffect(() => {
    isUnmount = false;
    let excludeArr: any[] = ['/inspectionBoard', '/facilityAssets'];
    if (excludeRoutes && excludeRoutes?.length > 0) {
      excludeArr = excludeRoutes || ['/inspectionBoard', '/facilityAssets'];
    }
    if (history?.location?.pathname === '/facilityAssets') {
      setCurrentType('phpDis');
      setInspectType('facilityAssets');
    }
    const unlisten = history.listen((location: any) => {
      if (location.pathname !== '/facilityAssets') {
        if (!excludeArr.includes(location.pathname)) {
          setInspectType('inspectionBoard');
        }
      }
    });
    return () => {
      isUnmount = true;
      unlisten();
    };
  }, []);

  return (
    <div className={`${styles.inspectPanelClass} ${styles.mapContain}`}>
      <HeadTop
        hasHeadUser={hasHeadUser}
        onSelMap={(param: any) => getInfo(param)}
        themeType={theme}
        onRef={headRef}
        headLogo={headLogo}
        logoDesc={logoDesc}
        controlsNum={2}
        propStyles={propStyles}
      />
      <div className={styles.middleContainer}>
        <BoardLeft
          singleProject={isClickProject} // 显示项目信息还是设施道路信息，点击地图上的道路设施或者选择头部设施后设为true
          projectId={selectProject} // 选择的设施id
          clearProject={handleClearProject} // 点击左侧的返回,isClickProject设为false,显示设施道路信息
          extraData={extraData}
          programName={programName}
        />
        <EvaMap
          mapType={mapType}
          isClickProject={isClickProject}
          setProject={setProject}
          buttonVal={buttonVal}
          mapInfo={mapInfo}
          mapProjData={mapProjData}
          onRef={childRef}
          extraData={extraData}
        />
        {!fullScreenFlag ? (
          <TabButton tabInfo={typeTimeList} handleButton={handleComButton} />
        ) : null}
        {/* isClickProject控制右侧显示内容 */}
        <BoardRight
          singleProject={isClickProject}
          mapType={mapType}
          extraData={extraData}
          programName={programName}
        />
      </div>
      <HeadBottom
        handleMapStyle={handleMapStyle} // 切换地图类型
        isFullScreen={fullScreenFlag}
        programName={'baseLine'}
        handleFullScreen={handleFullScreen}
        toggleTheme={(type: any) => setTheme(type)}
        propStyles={propStyles}
        themeType={theme}
        bottomInfo={bottomInfo}
        changeRoadStatus={() => {}}
        roadStatus={'1'}
      >
        {programName !== 'baseLine' ? <>{props?.children}</> : null}
      </HeadBottom>
    </div>
  );
};

export default FacilityAssets;
