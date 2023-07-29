import { Card, Image } from 'antd';
import React, { useState, useRef, Fragment, useEffect, memo } from 'react';
import uploadNullImg from '../../../../src/assets/img/uploadIcon/emptyImg.png';
// import ScoreAreaPlot from './ScoreAreaPlot';
// import doLarger from '../../../../src/assets/img/InspectionBoard/doLarger.svg';
import toBack from '../../../../src/assets/img/InspectionBoard/toBack.svg';
import SubFacilityDis from './SubFacilityDis';
// import ScoreAreaPlotModal from './ScoreAreaPlotModal';
import EllipsisTooltip from '../../../../src/components/EllipsisTooltip';
// import EmptyStatus from '../../../../src/components/TableEmpty';
import styles from '../../InspectionBoard/styles.less';
import proStyles from '../styles.less';
import { facilityType, roadType, roadLevelType } from '../data.d';
import { getFacDetailInfo } from '../service';
import { useModel } from 'umi';

type Iprop = {
  projectId: any;
  handleBack: () => void;
  extraData?: any;
  // isSingleProject: boolean;
};
// const { Option } = Select;
let isUnmountFac = false;
const DetailFacility: React.FC<Iprop> = memo((props: any) => {
  // const {projectId,isSingleProject}=props;
  const { setCurrentType } = useModel<any>('inspect');
  // const [modalTitle, setModalTitle] = useState<string>('图表放大图');
  const [projectInfo, setProjectInfo] = useState<any>({});
  const [facType, setFacType] = useState<string>('phpDis');
  const projectInfoName = {
    facilitiesName: '道路名称',
    roadType: '道路类别',
    roadSection: '道路编码',
    roadLevel: '道路等级',
    // facilitiesType: '设施类型',
    roadNum: props?.extraData?.isMpgs ? '线路里程' : '道路里程',
    laneNum: '车道数',
  };
  const projectInfoNameLeft = {
    facilitiesName: '道路名称',
    roadSection: '道路编码',
    // facilitiesType: '设施类型',
    laneNum: '车道数',
  };
  const projectInfoNameRight = {
    roadType: '道路类别',
    roadLevel: '道路等级',
    roadNum: props?.extraData?.isMpgs ? '线路里程' : '道路里程',
  };
  const handleFacType = (type: string) => {
    setFacType(type);
    setCurrentType(type);
  };
  // const [roadType, setRoadType] = useState<any>(0);
  // const [scoreType, setScoreType] = useState<any>(1);
  const [trackInfo, setTrackInfo] = useState<any>({
    taskNum: '0',
    diseaseNum: '0',
    addDiseaseNum: '0',
  });
  const [techRateInfo, setTechRateInfo] = useState<any>([
    { name: 'PCI参考值', num: '0.00' },
    { name: 'RQI参考值', num: '0.00' },
  ]);
  const [subFacDist, setSubFacDist] = useState<any>({});
  const newIntervalId: any = useRef(0);
  const [imgIndex, setImgIndex] = useState<number>(0);

  const clearTimer = () => {
    if (newIntervalId.current) {
      console.log('ImgIndex', imgIndex);
      clearInterval(newIntervalId.current);
      newIntervalId.current = 0;
      setImgIndex(0);
    }
  };
  const cyclePlay = (total: number) => {
    // 播放
    newIntervalId.current = setInterval(() => {
      setImgIndex((prevCount) => {
        if (prevCount + 1 === total) {
          return 0;
        }
        return prevCount + 1;
      });
    }, 2000);
  };
  useEffect(() => {
    setCurrentType('phpDis');
    isUnmountFac = false;
    return () => {
      isUnmountFac = true;
    };
  }, []);
  // 获取项目信息
  const getProjInfo = async (id: string) => {
    const rec = await getFacDetailInfo({ facilitiesId: id });
    if (rec?.status === 0) {
      if (rec?.data && Object.keys(rec?.data)?.length > 0 && !isUnmountFac) {
        let newFormData: any = {};
        Object.keys(rec?.data).forEach((it: any) => {
          if (it === 'facilities') {
            newFormData =
              rec?.data[it] && JSON.stringify(rec?.data[it]) !== '{}' ? rec?.data[it] : {};
            Object.keys(newFormData).forEach((itr: any) => {
              switch (itr) {
                case 'facilitiesType':
                  newFormData[itr] = facilityType[`${rec?.data[it][itr]}`];
                  break;
                case 'roadType':
                  newFormData[itr] = roadType[`${rec?.data[it][itr]}`];
                  break;
                case 'roadLevel':
                  newFormData[itr] = roadLevelType[`${rec?.data[it][itr]}`];
                  break;
                case 'laneNum':
                  if (rec?.data[it].streetNum && rec?.data[it].streetNum > 1) {
                    newFormData[itr] = rec?.data[it].streetNum * rec?.data[it][itr];
                  } else {
                    newFormData[itr] = rec?.data[it][itr];
                  }
                  break;
                default:
                  break;
              }
            });
          } else if (it === 'subFacilities') {
            const facInfo = {
              井盖: '0',
              交通信号灯: '0',
              交通标志: '0',
              情报板: '0',
              龙门架: '0',
              里程桩: '0',
            };
            rec?.data[it]?.forEach((ita: any) => {
              if (ita.name) {
                facInfo[ita.name] = ita?.num;
              }
            });
            setSubFacDist(facInfo);
          } else if (it === 'inspectionInfo') {
            setTrackInfo(rec?.data[it]);
          } else {
            const newdata = techRateInfo.map((ite: any, index: number) => {
              return index === 0
                ? { name: 'PCI参考值', num: rec?.data[it]?.pci || 0 }
                : { name: 'RQI参考值', num: rec?.data[it]?.rqi || 0 };
            });
            setTechRateInfo(newdata);
          }
        });
        clearTimer();
        if (Array.isArray(newFormData?.facilitiesImg)) {
          cyclePlay(newFormData?.imgList?.length);
        }
        setProjectInfo(newFormData);
      }
    }
  };
  useEffect(() => {
    if (props?.projectId) {
      getProjInfo(props?.projectId);
    }
  }, [props?.projectId]);

  const handleBack = () => {
    clearTimer();
    setFacType('phpDis');
    setCurrentType('phpDis');
    props?.handleBack();
  };

  return (
    // <div>
    <>
      <Card type="inner" className={`${styles.cardBcg} ${proStyles['card-facility-class']}`}>
        <div className={`${styles.cardTitle} ${styles.cardHeight}`}>
          <div className={styles.firstChartRow}>
            <EllipsisTooltip title={'基本信息'} customEclipseClass="tableTitleRow">
              <span className={styles.leftImg} />
              <span className={`${styles.cardTxtName}`}>基本信息</span>
            </EllipsisTooltip>
          </div>
          <div
            onClick={handleBack}
            className={`${styles.cardTitleRight} ${proStyles['rec-class']}`}
          >
            <span className={proStyles['txt-right-first-card']}>返回</span>
            <img className={proStyles['img-right-first-card']} src={toBack} />
          </div>
          <div className={styles.highlight}></div>
        </div>
        <div className={proStyles['card-facility-body']}>
          <div className={proStyles['card-facility-img']}>
            <Image
              // className={`${!projectInfo?.facilitiesImg ?'image-project':''}`}
              src={projectInfo?.facilitiesImg ? projectInfo?.facilitiesImg : uploadNullImg}
            />
          </div>
          <div className={proStyles['card-facility-info']}>
            {/* <span className={proStyles['project-info-head']}>基本信息</span> */}
            <div className={proStyles['facility-info-content']}>
              <div className={proStyles['pro-column-card-left']}>
                {Object.keys(projectInfoNameLeft).map((it: any) => {
                  return (
                    <Fragment key={it}>
                      <div className={`${proStyles['pro-item-key']}`} title={projectInfo[it]}>
                        <span>{projectInfoName[it]}：</span>
                        {(projectInfo[it] || projectInfo[it] === 0) && (
                          <span>
                            {props?.extraData?.isMpgs && it === 'roadNum'
                              ? (projectInfo[it] / 1000)?.toFixed(3)
                              : projectInfo[it] || 0}
                          </span>
                        )}
                        {it === 'roadNum' && (projectInfo[it] || projectInfo[it] === 0) && (
                          <span>{!props?.extraData?.isMpgs ? ' m' : ' km'}</span>
                        )}
                      </div>
                    </Fragment>
                  );
                })}
              </div>
              <div className={proStyles['pro-column-card-right']}>
                {Object.keys(projectInfoNameRight).map((it: any) => {
                  return (
                    <Fragment key={it}>
                      <div className={`${proStyles['pro-item-key']}`} title={projectInfo[it]}>
                        <span>{projectInfoName[it]}：</span>
                        {(projectInfo[it] || projectInfo[it] === 0) && (
                          <span>
                            {props?.extraData?.isMpgs && it === 'roadNum'
                              ? (projectInfo[it] / 1000)?.toFixed(3)
                              : projectInfo[it]}
                          </span>
                        )}
                        {it === 'roadNum' && (projectInfo[it] || projectInfo[it] === 0) && (
                          <span>{!props?.extraData?.isMpgs ? ' m' : ' km'}</span>
                        )}
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            </div>
          </div>
          {/* <div className={proStyles['card-project-rate']}>
            <span className={proStyles['rate-txt']}>{projectInfo?.curingLv}</span>
            <span className={proStyles['rate-description']}>养护等级</span>
          </div> */}
        </div>
      </Card>
      <Card type="inner" className={`${styles.cardBcg} ${proStyles['card-facility-distribution']}`}>
        <div className={`${styles.cardTitle} ${styles['card-second-border-title']}`}>
          <div className={styles.firstChartRow}>
            <span className={styles.titleCommonImg}></span>
            <EllipsisTooltip title={'附属设施数量分布'}>
              <span className={styles['card-name-light-color']}>附属设施数量分布</span>
            </EllipsisTooltip>
          </div>
          <div className={styles.highlight}></div>
        </div>
        <div className={proStyles['card-faclity-nums']}>
          <SubFacilityDis facInfo={subFacDist} />
        </div>
      </Card>
      <Card type="inner" className={`${styles.cardBcg} ${proStyles['card-inspect-rank']}`}>
        <div className={`${styles.cardTitle} ${styles['card-second-border-title']}`}>
          <div className={`${styles.cardTitleleft} ${styles['width-limit']}`}>
            <span className={styles.titleCommonImg}></span>
            <EllipsisTooltip title={'路面状况'}>
              <span className={styles.cardTxtName}>{'路面状况'}</span>
            </EllipsisTooltip>
          </div>
          {/* <div className={styles['card-title-right-txt']}>
            <span>{'数据统计至2022/09/27'}</span>
          </div> */}
          <div className={styles.highlight}></div>
        </div>
        <div className={proStyles['card-rank-nums']}>
          {techRateInfo.map((it: any) => {
            return (
              <Fragment key={it?.name}>
                <div className={proStyles['item-box']}>
                  <span className={proStyles['item-box-num']}>{it?.num}</span>
                  <span className={proStyles['item-box-txt']}>{it?.name}</span>
                </div>
              </Fragment>
            );
          })}
        </div>
      </Card>
      <Card type="inner" className={`${styles.cardBcg} ${proStyles['inspect-info-box']}`}>
        <div className={`${styles.cardTitle} ${styles['card-second-border-title']}`}>
          <div className={`${styles.cardTitleleft} ${styles['width-limit']}`}>
            <span className={styles.titleCommonImg}></span>
            <EllipsisTooltip title={'巡检信息'}>
              <span className={styles.cardTxtName}>{'巡检信息'}</span>
            </EllipsisTooltip>
          </div>
          <div className={styles.highlight}></div>
        </div>
        <div className={proStyles['inspect-info-content']}>
          <div className={proStyles['inspect-info-list']}>
            <div className={proStyles['inspect-info-item']}>
              <span>本月已完成巡检任务数量：</span>
              <span className={proStyles['info-num-txt']}>{trackInfo?.taskNum || '0'}</span>
            </div>
            <div className={proStyles['inspect-info-item']}>
              <span>{'现有病害数量：'}</span>
              <span className={proStyles['info-num-txt']}>{trackInfo?.diseaseNum || '0'}</span>
              {props?.extraData?.isMpgs && <span>个</span>}
            </div>
            <div className={proStyles['inspect-info-item']}>
              <span>{'本月新增病害数量：'}</span>
              <span className={proStyles['info-num-txt']}>{trackInfo?.addDiseaseNum || '0'}</span>
              {props?.extraData?.isMpgs && <span>个</span>}
            </div>
          </div>
          <div className={proStyles['button-footer-box']}>
            <span
              className={`${facType === 'phpDis' ? proStyles['active-button'] : null} ${
                proStyles['generic-button']
              }`}
              onClick={() => {
                handleFacType('phpDis');
              }}
            >
              病害
            </span>
            <span
              className={`${facType === 'subfac' ? proStyles['active-button'] : null} ${
                proStyles['generic-button']
              }`}
              onClick={() => {
                handleFacType('subfac');
              }}
            >
              附属设施
            </span>
          </div>
        </div>
      </Card>
    </>
  );
});
export default DetailFacility;
