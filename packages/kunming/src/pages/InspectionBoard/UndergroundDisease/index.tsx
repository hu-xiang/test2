import BoardRight from './components/BoardRight';
import React, { useState, useEffect, useRef } from 'react';
import headLogo from '@/assets/img/InspectionBoard/head/logo.svg';
import bottomLogo from '@/assets/img/InspectionBoard/bottom/bottomlogo.svg';
import styles from 'baseline/src/pages/InspectionBoard/styles.less';
import HeadTop from 'baseline/src/pages/InspectionBoard/components/headTop';
import HeadBottom from 'baseline/src/pages/InspectionBoard/components/HeadBottom';
import EvaMap from './components/map';
import { getMapDatas } from './service';
import propStyles from '../styles.less';
import { history } from 'umi';
import { useModel } from 'umi';
import baseStyles from 'baseline/src/pages/InspectionBoard/components/HeadBottom/styles.less';

const copyright = '';
const poweredBy = '';
const logoDesc = '昆明市市政道路巡管养平台';
type Iprops = {};
const DetEvalutionBoard: React.FC<Iprops> = () => {
  const [mapData, setMapData] = useState<any>([]);
  const [isToday, setIsToday] = useState(true);
  const [mapType, setMapType] = useState('3d');
  const [theme, setTheme] = useState<string>('black');
  const { inspectType, setInspectType } = useModel<any>('inspect');
  const childRef: any = useRef();
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

  const getInfo = async (param: any) => {
    const res: any = await getMapDatas({ startTime: param?.startTime, endTime: param?.endTime });
    if (history.location?.pathname === '/undergroundDisease') {
      if (res.status === 0) {
        setMapData(res.data);
      }
    }
  };

  const handleFullScreen = () => {};

  const toggleToday = (visible: boolean) => {
    setIsToday(visible);
  };

  const handleMapStyle = (type: string) => {
    setMapType(type);
  };
  useEffect(() => {
    const excludeArr: any[] = ['/inspectionBoard', '/facilityAssets', '/undergroundDisease'];
    if (history?.location?.pathname === '/undergroundDisease') {
      setInspectType('undergroundDisease');
    }
    const unlisten = history.listen((location: any) => {
      if (location.pathname !== '/undergroundDisease') {
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
        hasHeadUser={true}
        toggleToday={toggleToday}
        onSelMap={(param: any) => getInfo(param)}
        themeType={theme}
        headLogo={headLogo}
        propStyles={propStyles}
        logoDesc={logoDesc}
        timeType={'month'}
      />
      <div className={styles.middleContainer}>
        <BoardRight />
        <EvaMap
          mapType={mapType}
          mapInfo={{
            districtSearch: '昆明市',
            zoom: 10,
            center: [102.847977, 25.11826],
          }}
          mapData={mapData}
          isToday={isToday}
          onRef={childRef}
        />
      </div>
      <HeadBottom
        handleMapStyle={handleMapStyle}
        isFullScreen={true}
        changeRoadStatus={() => {}}
        roadStatus=""
        programName={'kunming'}
        handleFullScreen={handleFullScreen}
        toggleTheme={(type: any) => setTheme(type)}
        themeType={theme}
        propStyles={propStyles}
        bottomInfo={{ bottomLogo, copyright, poweredBy }}
      >
        <div
          className={`${baseStyles.detectSpanClass} ${
            detectionType === 'undergroundDisease' ? `${baseStyles.cuberbuttonClass}` : null
          }`}
          onClick={() => {
            handleDetetion('undergroundDisease');
          }}
        >
          <span className={baseStyles.txtDetectClass}>地下病害</span>
        </div>
      </HeadBottom>
    </div>
  );
};

export default DetEvalutionBoard;
