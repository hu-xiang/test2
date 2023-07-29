import { Card, Select, Image } from 'antd';
import React, { useState, useRef, Fragment, useEffect, memo } from 'react';
import uploadNullImg from 'baseline/src/assets/img/uploadIcon/uploadImg.png';
import ScoreAreaPlot from './ScoreAreaPlot';
import doLarger from 'baseline/src/assets/img/InspectionBoard/doLarger.svg';
import toBack from '@/assets/img/InspectionBoard/toBack.svg';
import ScoreAreaPlotModal from './ScoreAreaPlotModal';
import EllipsisTooltip from 'baseline/src/components/EllipsisTooltip';
import EmptyStatus from 'baseline/src/components/TableEmpty';
import styles from 'baseline/src/pages/InspectionBoard/styles.less';
import proStyles from '../styles.less';
import { getUnitScore, getProjectInformation } from '../service';

type Iprop = {
  projectId: any;
  handleBack: () => void;
  isSingleProject: boolean;
};
const { Option } = Select;
const RightProject: React.FC<Iprop> = memo((props: any) => {
  const [modalTitle, setModalTitle] = useState<string>('图表放大图');
  const [projectInfo, setProjectInfo] = useState<any>({});
  const projectInfoName = {
    projectNo: '编号',
    roadType: '路面类型',
    projectName: '名称',
    roadLevel: '路面等级',
    liablePerson: '责任人',
    roadLength: '路面长度',
    detectTime: '完成时间',
    laneIntactRate: '车道完好率',
  };
  const projectInfoNameLeft = {
    projectNo: '编号',
    projectName: '名称',
    liablePerson: '责任人',
    detectTime: '完成时间',
  };
  const projectInfoNameRight = {
    roadType: '路面类型',
    roadLevel: '路面等级',
    roadLength: '路面长度',
    laneIntactRate: '车道完好率',
  };
  const [roadType, setRoadType] = useState<any>(0);
  const [scoreType, setScoreType] = useState<any>(1);
  const [lineData, setLineData] = useState<any>([]);
  const [isScoreVisible, setIsScoreVisible] = useState<boolean>(false);
  const newIntervalId: any = useRef(0);
  const [imgIndex, setImgIndex] = useState<number>(0);

  const roadTypeList = [
    { name: '上行', type: 0 },
    { name: '下行', type: 1 },
  ];
  enum enumType {
    'PQI' = 1,
    'PCI' = 2,
    'RQI' = 3,
    '单点弯沉' = 4,
  }
  const scoreTypeList = [
    { name: 'PQI', type: 1 },
    { name: 'PCI', type: 2 },
    { name: 'RQI', type: 3 },
    { name: '单点弯沉', type: 4 },
  ];
  const clearTimer = () => {
    if (newIntervalId.current) {
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

  // 获取项目信息
  const getProjInfo = async (id: string) => {
    const rec = await getProjectInformation({ id });
    if (rec?.status === 0) {
      if (rec?.data && Object.keys(rec?.data)?.length > 0) {
        const newFormData: any = {};
        Object.keys(rec?.data).forEach((it: any) => {
          if (it === 'laneIntactRate') {
            newFormData[it] = rec?.data[it] ? `${rec?.data[it]}%` : '-';
          } else if (it === 'roadLength') {
            newFormData[it] = rec?.data[it] ? `${rec?.data[it]}km` : '-';
          } else {
            newFormData[it] = rec?.data[it] ? rec?.data[it] : '-';
          }
        });
        clearTimer();
        if (newFormData?.imgList?.length > 1) {
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
  // 单元评分情况
  const getUnitDevData = async (direction: number, id: string, type: number) => {
    const rec = await getUnitScore({
      type: type !== 4 ? enumType[type] : 'DEFLECTION',
      id,
      direction,
    });
    const newArr: any[] = [];
    if (rec?.status === 0) {
      // {1车道:[{unitStart:'',value:''},{unitStart:'',value:''}]}
      Object.keys(rec?.data[type])?.forEach((it: string) => {
        rec?.data[type][it].forEach((ii: any) => {
          newArr.push({ label: ii?.unitStart, value: ii?.score, type: it });
        });
      });
    }
    setLineData(newArr);
  };
  useEffect(() => {
    if (!props?.projectId) {
      return;
    }
    getUnitDevData(roadType, props?.projectId, scoreType);
  }, [roadType, scoreType, props?.projectId]);

  const selectRoadType = (text: any) => {
    setRoadType(text);
  };
  const selectScoreType = (text: any) => {
    setScoreType(text);
  };
  const handleLargeChart = (name: any) => {
    setModalTitle(name);
    setIsScoreVisible(true);
  };
  const handleBack = () => {
    clearTimer();
    props?.handleBack();
  };

  return (
    <div className={`${styles.fullBg} ${proStyles['right-card-height']}`}>
      <Card type="inner" className={`${styles.cardBcg} ${proStyles['card-project-class']}`}>
        <div className={`${styles.cardTitle} ${styles.cardHeight}`}>
          <div className={styles.firstChartRow}>
            <EllipsisTooltip title={'项目信息'} customEclipseClass="tableTitleRow">
              <span className={styles.leftImg} />
              <span className={`${styles.cardTxtName} ${styles.colorLight}`}>项目信息</span>
            </EllipsisTooltip>
          </div>
          <div
            onClick={handleBack}
            className={`${styles.cardTitleRight} ${proStyles['mag-top10']}`}
          >
            <span className={proStyles['txt-right-first-card']}>返回</span>
            <img className={proStyles['img-right-first-card']} src={toBack} />
          </div>
          <div className={styles.highlight}></div>
        </div>
        <div className={proStyles['card-project-body']}>
          <div className={proStyles['card-project-img']}>
            <Image
              className="image-project"
              src={
                projectInfo?.imgList?.length > 0 ? projectInfo?.imgList[imgIndex] : uploadNullImg
              }
            />
          </div>
          <div className={proStyles['card-project-info']}>
            <span className={proStyles['project-info-head']}>项目基本信息</span>
            <div className={proStyles['project-info-content']}>
              <div className={proStyles['pro-column-card-left']}>
                {Object.keys(projectInfoNameLeft).map((it: any) => {
                  return (
                    <Fragment key={it}>
                      <div className={`${proStyles['pro-item-key']}`} title={projectInfo[it]}>
                        <span>{projectInfoName[it]}：</span>
                        <span>{projectInfo[it]}</span>
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
                        <span>{projectInfo[it]}</span>
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            </div>
          </div>
          <div className={proStyles['card-project-rate']}>
            <span className={proStyles['rate-txt']}>{projectInfo?.curingLv}</span>
            <span className={proStyles['rate-description']}>养护等级</span>
          </div>
        </div>
      </Card>
      <Card type="inner" className={`${styles.cardBcg} ${proStyles['card-unit-score']}`}>
        <div className={`${styles.cardTitle}  ${proStyles['card-right-txt']}`}>
          <div className={`${styles.rightFirstTitle} ${styles.rightPadTitle}`}>
            <span className={styles.firstTitleImg}></span>
            <span className={styles.titleTxt}>单元评分情况</span>
            <span
              className={styles.cardTitleleftImg}
              onClick={() => {
                handleLargeChart('单元评分情况');
              }}
            >
              <img className={styles.cardTitleImg} src={doLarger} />
            </span>
          </div>
          <div className={proStyles['right-head']}>
            <Select
              popupClassName="dropdownSelectClass"
              style={{ marginRight: 0 }}
              defaultValue={0}
              className="searchFacilityClass selectMg10 right-head-select"
              onChange={selectRoadType}
              placeholder="请选择"
            >
              {roadTypeList.map((item: any) => (
                <Option key={item?.type} className="facClass" value={item?.type}>
                  {item?.name}
                </Option>
              ))}
            </Select>
            <Select
              popupClassName="dropdownSelectClass"
              style={{ marginRight: 0 }}
              defaultValue={1}
              className="searchFacilityClass selectMg10 right-head-select"
              onChange={selectScoreType}
              placeholder="请选择"
            >
              {scoreTypeList.map((item: any) => (
                <Option key={item?.type} className="facClass" value={item?.type}>
                  {item?.name}
                </Option>
              ))}
            </Select>
          </div>
        </div>
        <div className={proStyles['card-score-height']}>
          {lineData?.length > 0 ? (
            <ScoreAreaPlot
              info={lineData}
              isModalPlatform={false}
              isRotate={true}
              isLegendShow={true}
            />
          ) : (
            <EmptyStatus customEmptyClass={styles.diseaseEmpty} />
          )}
        </div>
      </Card>
      {isScoreVisible ? (
        <ScoreAreaPlotModal
          name={modalTitle}
          projectId={props?.projectId}
          roadTypeList={roadTypeList}
          modalShow={isScoreVisible}
          onCancel={() => setIsScoreVisible(false)}
        />
      ) : null}
    </div>
  );
});
export default RightProject;
