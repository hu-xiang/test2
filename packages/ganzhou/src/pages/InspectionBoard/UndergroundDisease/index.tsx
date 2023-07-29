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
import baseStyles from 'baseline/src/pages/InspectionBoard/components/HeadBottom/styles.less';

const copyright = '版权所有 © 江西赣州';
const poweredBy = '© Powered by smartmore';
const logoDesc = '赣州市道路巡管养平台';
type Iprops = {};
const DetEvalutionBoard: React.FC<Iprops> = () => {
  const [mapData, setMapData] = useState<any>([]);
  const [isToday, setIsToday] = useState(true);
  const [mapType, setMapType] = useState('3d');
  const [theme, setTheme] = useState<string>('black');
  const childRef: any = useRef();
  const [detectionType, setDetectionType] = useState<string>('Inspection');
  const handleDetetion = (str: string) => {
    setDetectionType(str);
    if (str) {
      const toUrl = str === 'Detection' ? '/undergroundDisease' : '/inspectionBoard';
      history.push(toUrl);
    }
  };

  useEffect(() => {
    if (history.location?.pathname === '/inspectionBoard') {
      setDetectionType('Inspection');
    } else if (history.location?.pathname === '/undergroundDisease') {
      setDetectionType('Detection');
    }
  }, []);

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

  return (
    <div className={`${styles.inspectPanelClass} ${styles.mapContain}`}>
      <HeadTop
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
            districtSearch: '赣州市',
            zoom: 9,
            center: [115.5, 25.59],
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
          className={`${baseStyles.detectSpanClass} ${baseStyles.buttonBgClass} ${
            detectionType === 'Inspection' ? `${baseStyles.cuberbuttonClass}` : null
          }`}
          onClick={() => {
            handleDetetion('Inspection');
          }}
        >
          <span className={baseStyles.txtDetectClass}>路面病害</span>
        </div>
        <div
          className={`${baseStyles.detectSpanClass} ${
            detectionType === 'Detection' ? `${baseStyles.cuberbuttonClass}` : null
          }`}
          onClick={() => {
            handleDetetion('Detection');
          }}
        >
          <span className={baseStyles.txtDetectClass}>地下病害</span>
        </div>
      </HeadBottom>
    </div>
  );
};

export default DetEvalutionBoard;
