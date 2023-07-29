import { useState, useEffect } from 'react';
import { Button } from 'antd';
import Icon from '@ant-design/icons';
import { history } from 'umi';
import { ReactComponent as satellite } from '../../../../assets/img/InspectionBoard/Bottom/satellite.svg';
import { ReactComponent as cuber } from '../../../../assets/img/InspectionBoard/Bottom/cuber.svg';
import { ReactComponent as roadCondition } from '../../../../assets/img/InspectionBoard/Bottom/roadCondition.svg';
import { ReactComponent as comfort } from '../../../../assets/img/InspectionBoard/Bottom/comfort.svg';
import disableFullScreen from '../../../../assets/img/InspectionBoard/Bottom/disableFullScreen.png';
import logo from '../../../../assets/img/InspectionBoard/Bottom/bottomlogo.svg';
import fullscreen from '../../../../assets/img/InspectionBoard/Bottom/fullscreen.svg';
import collapse from '../../../../assets/img/InspectionBoard/Bottom/collapse.svg';
import React from 'react';
import styles from './styles.less';

type Iprops = {
  themeType?: string;
  toggleTheme?: (type: string) => void;
  handleFullScreen: (visib: boolean) => void;
  handleMapStyle: (type: string) => void;
  changeRoadStatus: (status: string) => void;
  isFullScreen: boolean;
  bottomInfo: any;
  programName?: string;
  roadStatus: string;
  inspectBtnStatus: number;
  handleInspectStatus: (status: boolean) => void;
};

const HeadBottom: React.FC<Iprops> = (props) => {
  const {
    themeType,
    bottomInfo,
    roadStatus,
    changeRoadStatus,
    handleInspectStatus,
    inspectBtnStatus,
  } = props;
  const [currentType, setCurrentType] = useState('3d');
  const { bottomLogo, copyright, poweredBy } = bottomInfo || {};
  const [imgSrc, setImgSrc] = useState<any>(fullscreen);
  const [inspectStatus, setInspectStatus] = useState<boolean>(false); // 巡检状态
  const [inspectBtnTxt, setInspectBtnTxt] = useState<string>('开始巡检'); // 巡检按钮文字

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
    if (history.location?.pathname !== '/inspectionBoard') {
      setImgSrc(disableFullScreen);
      return;
    }
    if (props.isFullScreen) {
      setImgSrc(collapse);
    } else {
      setImgSrc(fullscreen);
    }
  };
  const resetStyle = {
    display: 'none',
  };
  // 开始巡检
  const handleInspection = () => {
    if (inspectBtnStatus === 1) return;
    const flag = !inspectStatus;
    handleInspectStatus(flag);
    setInspectStatus(flag);
  };

  useEffect(() => {
    const txtMap = {
      3: '开始巡检', // 巡检结束
      0: '开始巡检', // 地图旋转中 小车未开始巡检 按钮也要显示开始巡检
      1: '巡检中',
      2: '结束巡检',
    };

    if ([1, 3].includes(inspectBtnStatus)) {
      handleInspectStatus(inspectBtnStatus === 1);
      setInspectStatus(inspectBtnStatus === 1);
    }
    setInspectBtnTxt(txtMap[inspectBtnStatus]);
  }, [inspectBtnStatus]);

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
        <div className={styles.headBottomLeftClass}>
          <div className={styles.leftBottomClass}>
            <img src={bottomLogo || logo} className={styles.imglogo}></img>
            <div className={styles.TxtGroupClass}>
              <span className={styles.firstRow}>
                {copyright || `版权所有 © Copyright 2019-2022 深圳思谋信息科技有限公司`}
              </span>
              <span className={styles.firstRow}>
                {poweredBy ||
                  `© Copyright 2019-2022 Shenzhen SmartMore Technology Co., Ltd. All rights reserved.`}
              </span>
            </div>
          </div>
          <div className={styles.vesionTxtClass}>
            <span className={styles.vesionTxtLeftClass}>版本信息</span>
            <span className={styles.vesionTxtRightClass}>1.0.0</span>
          </div>
        </div>
        <div
          className={`${styles.buttonBgClass} ${styles.fullbuttonClass}`}
          onClick={history.location?.pathname === '/inspectionBoard' ? handleFullFlag : () => {}}
          style={{ display: 'none' }}
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
        <div
          className={`${styles.buttonBgClass} ${styles.buttonBgtClass} ${
            roadStatus === 'roadCondition' ? `${styles.cuberbuttonClass}` : null
          }`}
          style={resetStyle}
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
          style={resetStyle}
          onClick={() => {
            changeRoadStatus('comfort');
          }}
        >
          <Icon component={comfort} />
        </div>
        {props.children}
        <div className={`${styles.buttonBgClass} ${styles.buttonClickClass}`}>
          <Button
            type="primary"
            shape="round"
            className={styles.bottomButton}
            onClick={() => handleInspection()}
          >
            {inspectBtnTxt}
          </Button>
        </div>
      </div>
    </>
  );
};

export default HeadBottom;
