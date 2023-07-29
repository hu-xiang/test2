import { useState, useEffect } from 'react';
import { Button } from 'antd';
import Icon from '@ant-design/icons';
import { history } from 'umi';
import { ReactComponent as satellite } from '../../../../assets/img/InspectionBoard/bottom/satellite.svg';
import { ReactComponent as cuber } from '../../../../assets/img/InspectionBoard/bottom/cuber.svg';
// import { ReactComponent as roadCondition } from '../../../../assets/img/InspectionBoard/bottom/roadCondition.svg';
// import { ReactComponent as comfort } from '../../../../assets/img/InspectionBoard/bottom/comfort.svg';
import disableFullScreen from '../../../../assets/img/InspectionBoard/bottom/disableFullScreen.png';
import { useModel } from 'umi';
import logo from '../../../../assets/img/InspectionBoard/bottom/bottomlogo.svg';
import fullscreen from '../../../../assets/img/InspectionBoard/bottom/fullscreen.svg';
import collapse from '../../../../assets/img/InspectionBoard/bottom/collapse.svg';
import React from 'react';
import styles from './styles.less';

type Iprops = {
  themeType: string;
  toggleTheme: (type: string) => void;
  handleFullScreen: (visib: boolean) => void;
  handleMapStyle: (type: string) => void;
  changeRoadStatus: (status: string) => void;
  isFullScreen: boolean;
  bottomInfo: any;
  programName?: string;
  roadStatus?: string;
  propStyles?: any;
};

const HeadBottom: React.FC<Iprops> = (props) => {
  const { themeType, bottomInfo, propStyles } = props;
  const [currentType, setCurrentType] = useState('3d');
  const [detectionType, setDetectionType] = useState<string>('inspectionScreen');
  const { inspectType, setInspectType } = useModel<any>('inspect');
  const { bottomLogo } = bottomInfo || {};
  const [imgSrc, setImgSrc] = useState<any>(fullscreen);
  // 获取设施列表
  const handleFullFlag = () => {
    const flag = !props.isFullScreen;
    props.handleFullScreen(flag);
  };
  const handleSalite = (type: string) => {
    setCurrentType(type);
    props.handleMapStyle(type);
  };

  const getImg = () => {
    if (history.location?.pathname !== '/inspectionScreen') {
      setImgSrc(disableFullScreen);
      return;
    }
    if (props.isFullScreen) {
      setImgSrc(collapse);
    } else {
      setImgSrc(fullscreen);
    }
  };

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
  useEffect(() => {
    getImg();
  }, [props.isFullScreen]);

  return (
    <>
      <div
        className={`${styles.headBottomClass} ${
          themeType === 'black' ? styles.blackTheme : styles.whiteTheme
        }`}
      >
        {bottomLogo !== '无' ? (
          <div className={`${styles['head-common-class']} ${styles.headBottomLeftClass}`}>
            <div className={`${styles.leftBottomClass} ${propStyles?.leftBottomClass}`}>
              <img
                src={bottomLogo || logo}
                className={`${styles.imglogo} ${propStyles?.imglogo} `}
              ></img>
              {/* <div className={styles.TxtGroupClass}>
              <span className={styles.firstRow}>
                {copyright || `版权所有 © Copyright 2019-2022 深圳思谋信息科技有限公司`}
              </span>
              <span className={styles.firstRow}>
                {poweredBy ||
                  `© Copyright 2019-2022 Shenzhen SmartMore Technology Co., Ltd. All rights reserved.`}
              </span>
            </div> */}
            </div>
            {/* <div className={styles.vesionTxtClass}>
            <span className={styles.vesionTxtLeftClass}>版本信息</span>
            <span className={styles.vesionTxtRightClass}>1.0.0</span>
          </div> */}
          </div>
        ) : (
          ''
        )}
        <div
          className={`${styles.buttonBgClass} ${styles.fullbuttonClass}`}
          onClick={history.location?.pathname === '/inspectionScreen' ? handleFullFlag : () => {}}
        >
          <img src={imgSrc} />
        </div>
        <div
          className={`${styles.buttonBgClass} ${styles.buttonBgtClass} ${
            currentType === '3d' ? `${styles.cuberbuttonClass}` : null
          }`}
          onClick={() => {
            handleSalite('3d');
          }}
        >
          <Icon component={cuber} />
        </div>
        <div
          className={`${styles.buttonBgtClass} ${
            currentType === 'salite' ? `${styles.cuberbuttonClass}` : null
          }`}
          onClick={() => {
            handleSalite('salite');
          }}
        >
          <Icon component={satellite} />
        </div>

        {/* 切换路况与舒适度 */}
        {/* {history.location?.pathname !== '/facilityAssets' ? (
          <>
            <div
              className={`${styles.buttonBgClass} ${styles.buttonBgtClass} ${
                roadStatus === 'roadCondition' ? `${styles.cuberbuttonClass}` : null
              }`}
              onClick={() => {
                changeRoadStatus('roadCondition');
              }}
            >
              <Icon component={roadCondition} />
            </div>
            <div
              className={`${styles.buttonBgtClass} ${
                roadStatus === 'comfort' ? `${styles.cuberbuttonClass}` : null
              }`}
              onClick={() => {
                changeRoadStatus('comfort');
              }}
            >
              <Icon component={comfort} />
            </div>
          </>
        ) : null} */}
        <div
          className={`${styles.detectSpanClass} ${styles.buttonBgClass} ${
            detectionType === 'inspectionScreen' ? `${styles.cuberbuttonClass}` : null
          }`}
          onClick={() => {
            handleDetetion('inspectionScreen');
          }}
        >
          <span className={styles.txtDetectClass}>日常巡检</span>
        </div>
        <div
          className={`${styles.detectSpanClass} ${
            detectionType === 'facilityAssets' ? `${styles.cuberbuttonClass}` : null
          }`}
          onClick={() => {
            handleDetetion('facilityAssets');
          }}
        >
          <span className={styles.txtDetectClass}>道路设施</span>
        </div>
        {props.children}
        <div className={`${styles.buttonBgClass} ${styles.buttonClickClass}`}>
          <Button
            type="primary"
            shape="round"
            className={styles.bottomButton}
            onClick={() => history.push('/workbench')}
          >
            进入管理平台
          </Button>
        </div>
      </div>
    </>
  );
};

export default HeadBottom;
