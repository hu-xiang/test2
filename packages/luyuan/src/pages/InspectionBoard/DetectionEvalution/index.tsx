import BoardLeft from './components/boardLeft';
import BoardRight from './components/boardRight';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import headLogo from '@/assets/img/InspectionBoard/head/logo.png';
import bottomLogo from '@/assets/img/InspectionBoard/bottom/bottomlogo.svg';
import styles from 'baseline/src/pages/InspectionBoard/styles.less';
import { message } from 'antd';
import baseStyles from 'baseline/src/pages/InspectionBoard/components/HeadBottom/styles.less';
import HeadTop from './components/HeadTop';
import HeadBottom from 'baseline/src/pages/InspectionBoard/components/HeadBottom';
import EvaMap from './components/map';
import { useModel } from 'umi';
import { getYearOverview, getProjLocation, getScoreAvg } from './service';
import propStyles from '../styles.less';
import { history } from 'umi';

const copyright = '版权所有 © 武汉路源工程质量检测有限公司';
const poweredBy = '© Powered by smartmore';
type Iprops = {};
const DetEvalutionBoard: React.FC<Iprops> = () => {
  const [mapProjData, setMapProjData] = useState<any>([]);
  const { inspectType, setInspectType } = useModel<any>('inspect');
  const [mapType, setMapType] = useState('3d');
  const [theme, setTheme] = useState<string>('black');
  const [selectProject, setSelectProject] = useState<any>();
  const [searchParams, setSearchParams] = useState<any>();
  const initialStateYear = () => {
    const date = new Date();
    const newyear = date.getFullYear();
    return newyear;
  };
  const [yearValue, setYearValue] = useState<any>(initialStateYear);
  const [isClickProject, setIsClickProject] = useState<boolean>(false);
  const [quliatyInactRate, setQuliatyInactRate] = useState<Record<string, any>>({
    intactRate: 0,
    qualifyRate: 0,
  });
  const [dataRightInfo, setDataRightInfo] = useState<Record<string, any>>({
    mileage: 0,
    mileageGrowthRate: 0,
    projectNum: 0,
    projectNumGrowthRate: 0,
  });
  const childRef: any = useRef();
  const searchRef: any = useRef();
  const isFirstRef: any = useRef(false);
  const [detectionType, setDetectionType] = useState<string>('');
  const handleDetetion = (str: string) => {
    setInspectType(str);
    // setDetectionType(str);
    if (str) {
      const toUrl = `/${str}`;
      history.push(toUrl);
    }
  };

  useEffect(() => {
    if (!inspectType) {
      setDetectionType(history.location?.pathname.replace('/', ''));
    } else {
      setDetectionType(inspectType);
    }
  }, [inspectType]);

  const setProject = (id: any) => {
    setSelectProject(id);
  };
  const fetchProjData = async (params: Record<string, any>) => {
    try {
      // console.log('dfffffffffff',params)
      const rec = await getProjLocation(params);
      if (rec?.status === 0) {
        setMapProjData(rec?.data);
      } else {
        setMapProjData([]);
      }
    } catch (error) {
      message.error({
        content: '获取项目信息失败',
        key: '获取项目信息失败',
      });
    }
  };
  // 获取本年度项目评分统计，合格率和完好率
  const getYearOverviews = async () => {
    if (!searchRef.current) {
      return;
    }
    // console.log('getYearOverviews', searchRef.current)
    const rec: any = await getYearOverview({ year: searchRef.current });
    setQuliatyInactRate({
      intactRate: rec.data?.intactRate || 0,
      qualifyRate: rec.data?.qualifyRate || 0,
    });
    setDataRightInfo({
      mileage: rec.data?.mileage || 0,
      mileageGrowthRate: rec.data?.mileageGrowthRate || 0,
      projectNum: rec.data?.projectNum || 0,
      projectNumGrowthRate: rec.data?.projectNumGrowthRate || 0,
    });
  };
  // useEffect(() => {
  //   if (!isClickProject) {
  //     if (!isFirstRef?.current) {
  //       isFirstRef.current = true;
  //     }
  //     // console.log('isClickProject', isClickProject,isFirstRef?.current)
  //     getYearOverviews();
  //   }
  // }, [isClickProject]);

  // 获取某个项目的信息
  const getSingleProjOverview = async (id: string) => {
    const rec = await getScoreAvg({ id });
    if (rec?.status === 0) {
      setQuliatyInactRate({
        intactRate: rec?.data?.intactRate || 0,
        qualifyRate: rec?.data?.qualifyRate || 0,
      });
    }
  };
  useEffect(() => {
    if (selectProject) {
      setIsClickProject(true);
      getSingleProjOverview(selectProject);
    }
  }, [selectProject]);

  const getInfo = async (param: any) => {
    fetchProjData(param);
    setSearchParams(param);
  };
  useEffect(() => {
    console.log(
      'searchParams?.detectTime变动',
      searchParams?.detectTime,
      isClickProject,
      isFirstRef?.current,
    );
    let newyear: number;
    if (searchParams?.detectTime) {
      newyear = Number(searchParams?.detectTime.slice(0, 4));
    } else {
      const date = new Date();
      newyear = date.getFullYear(); // 获取完整的年份(4位)
    }
    searchRef.current = newyear;
    setYearValue(newyear);
  }, [searchParams?.detectTime]);
  useEffect(() => {
    if (!isClickProject) {
      // if(searchRef.current!==yearValue||!isFirstRef?.current)
      // {
      getYearOverviews();
      // }
      // if (!isFirstRef?.current) {
      //   isFirstRef.current = true;
      // }
    }
  }, [yearValue, isClickProject]);
  const handleFullScreen = () => {};

  const handleMapStyle = (type: string) => {
    setMapType(type);
  };
  const handleClearProject = () => {
    setIsClickProject(false);
    setSelectProject('');
    if (childRef && childRef.current) {
      childRef.current?.resetProjectId();
    }
  };

  const leftInfo = useMemo(() => {
    const newObj: any = { quliatyInactRate, isClickProject, selectProject };
    return { ...newObj };
  }, [quliatyInactRate, isClickProject, selectProject]);

  const onSelMapChange = (params: any) => {
    getInfo(params);
  };
  useEffect(() => {
    const excludeArr: any[] = ['/inspectionBoard', '/facilityAssets', '/detectionEvalution'];
    if (history?.location?.pathname === '/detectionEvalution') {
      setInspectType('detectionEvalution');
    }
    const unlisten = history.listen((location: any) => {
      if (location.pathname !== '/detectionEvalution') {
        if (!excludeArr.includes(location.pathname)) {
          setInspectType('inspectionBoard');
        }
      }
    });
    return () => {
      unlisten();
    };
  }, []);

  return (
    <div className={`${styles.inspectPanelClass} ${styles.mapContain}`}>
      <HeadTop
        onSelMap={onSelMapChange}
        projectId={selectProject}
        themeType={theme}
        headLogo={headLogo}
      />
      <div className={styles.middleContainer}>
        <BoardLeft
          quliatyInactRate={leftInfo?.quliatyInactRate}
          singleProject={leftInfo?.isClickProject}
          projectId={leftInfo?.selectProject}
          year={searchRef?.current}
        />
        <EvaMap
          mapType={mapType}
          isClickProject={isClickProject}
          setProject={setProject}
          mapInfo={{
            zoom: 9,
            center: [114.3, 30.59],
          }}
          mapProjData={mapProjData}
          onRef={childRef}
        />
        <BoardRight
          clearProject={handleClearProject}
          singleProject={isClickProject}
          mapType={mapType}
          dataRightInfo={dataRightInfo}
          projectId={selectProject}
          year={searchRef?.current}
        />
      </div>
      <HeadBottom
        handleMapStyle={handleMapStyle}
        isFullScreen={true}
        changeRoadStatus={() => {}}
        roadStatus=""
        programName={'luyuan'}
        handleFullScreen={handleFullScreen}
        toggleTheme={(type: any) => setTheme(type)}
        themeType={theme}
        propStyles={propStyles}
        bottomInfo={{ bottomLogo, copyright, poweredBy }}
      >
        {/* <div
          className={`${baseStyles.detectSpanClass} ${baseStyles.buttonBgClass} ${
            detectionType === 'Inspection' ? `${baseStyles.cuberbuttonClass}` : null
          }`}
          onClick={() => {
            handleDetetion('Inspection');
          }}
        >
          <span className={baseStyles.txtDetectClass}>日常巡检</span>
        </div> */}
        <div
          className={`${baseStyles.detectSpanClass} ${
            detectionType === 'detectionEvalution' ? `${baseStyles.cuberbuttonClass}` : null
          }`}
          onClick={() => {
            handleDetetion('detectionEvalution');
          }}
        >
          <span className={baseStyles.txtDetectClass}>检测评价</span>
        </div>
      </HeadBottom>
    </div>
  );
};

export default DetEvalutionBoard;
