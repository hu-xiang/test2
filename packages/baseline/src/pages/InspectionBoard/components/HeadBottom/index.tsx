import { useState, useEffect } from 'react';
import { Button } from 'antd';
import Icon from '@ant-design/icons';
import { history, useAccess } from 'umi';
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
const accessArr = [
  'inspectBorad/index:btn_inspect',
  'inspectBorad/index:btn_facassert',
  'inspectBorad/index:btn_manage',
];

const HeadBottom: React.FC<Iprops> = (props) => {
  const { themeType, bottomInfo, propStyles } = props;
  const access: any = useAccess();
  const [currentType, setCurrentType] = useState('3d');
  const [detectionType, setDetectionType] = useState<string>('inspectionBoard');
  const { inspectType, setInspectType } = useModel<any>('inspect');
  const { bottomLogo } = bottomInfo || {};
  const [disableFull, setDisableFull] = useState<boolean>(false);
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
    if (
      history.location?.pathname !== '/inspectionBoard' &&
      history.location?.pathname !== '/inspectionScreen'
    ) {
      setImgSrc(disableFullScreen);
      setDisableFull(true);
      return;
    }
    setDisableFull(false);
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

  useEffect(() => {
    const isInspect = !!access[accessArr[0]];
    const isRoad = !!access[accessArr[1]];
    const isBsl = !!access['inspectBorad/index:btn_danger'];
    const isKm = !!access['inspectBorad/index:btn_disease'];
    const isLy = !!access['inspectBorad/index:btn_detection'];

    const toPath = history.location?.pathname.replace('/', '');

    if (isInspect) {
      return;
    }

    switch (isRoad) {
      case true:
        if (toPath === 'hiddenDangerBoard' && isBsl && Platform_Flag === 'boshilin') {
          return;
        }
        if (toPath === 'undergroundDisease' && isKm && Platform_Flag === 'kunming') {
          return;
        }
        if (toPath === 'detectionEvalution' && isLy && Platform_Flag === 'luyuan') {
          return;
        }
        setInspectType('facilityAssets');
        history.push('/facilityAssets');
        break;
      case false:
        if (isBsl && Platform_Flag === 'boshilin') {
          setInspectType('hiddenDangerBoard');
          history.push('/hiddenDangerBoard');
        }
        if (isKm && Platform_Flag === 'kunming') {
          setInspectType('undergroundDisease');
          history.push('/undergroundDisease');
        }
        if (isLy && Platform_Flag === 'luyuan') {
          setInspectType('detectionEvalution');
          history.push('/detectionEvalution');
        }
        break;

      default:
        break;
    }
  }, []);

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
          className={`${styles.buttonBgClass} ${styles.fullbuttonClass} ${
            disableFull ? `${styles.disableBtClass}` : null
          }`}
          title={'筛选模式'}
          onClick={!disableFull ? handleFullFlag : () => {}}
        >
          <img src={imgSrc} title={props.isFullScreen ? '退出全屏' : '全屏'} />
        </div>
        <div
          className={`${styles.buttonBgClass} ${styles.buttonBgtClass} ${
            currentType === '3d' ? `${styles.cuberbuttonClass}` : null
          }`}
          title={'3D地图'}
          onClick={() => {
            handleSalite('3d');
          }}
        >
          <Icon component={cuber} title="地图" />
        </div>
        <div
          className={`${styles.buttonBgtClass} ${styles.buttonBgClass} ${
            currentType === 'salite' ? `${styles.cuberbuttonClass}` : null
          }`}
          title={'卫星地图'}
          onClick={() => {
            handleSalite('salite');
          }}
        >
          <Icon component={satellite} title="卫星" />
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
        {access[accessArr[0]] ? (
          <div
            className={`${styles.detectSpanClass} ${styles.buttonBgClass} ${
              detectionType === 'inspectionBoard' ? `${styles.cuberbuttonClass}` : null
            }`}
            onClick={() => {
              handleDetetion('inspectionBoard');
            }}
          >
            <span className={styles.txtDetectClass}>日常巡检</span>
          </div>
        ) : null}
        {access[accessArr[1]] ? (
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
        ) : null}
        {/* <div
          className={`${styles.detectSpanClass} ${
            detectionType === 'inspectionScreen' ? `${styles.cuberbuttonClass}` : null
          }`}
          onClick={() => {
            handleDetetion('inspectionScreen');
          }}
        >
          <span className={styles.txtDetectClass}>新日常巡检</span>
        </div> */}
        {props.children}
        {access[accessArr[2]] ? (
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
        ) : null}
      </div>
    </>
  );
};

export default HeadBottom;
