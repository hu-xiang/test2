import { Card, Select } from 'antd';
import React, { useState, useMemo, useEffect, memo } from 'react';
import FacilityPie from './FacilityPie';
import MileageBar from './MileageBar';
import doLarger from 'baseline/src/assets/img/InspectionBoard/doLarger.svg';
import { getRoadDistributed, getDetectMileage } from '../service';
import toDownArrow from 'baseline/src/assets/img/InspectionBoard/toDownArrow.svg';
import toUpArrow from 'baseline/src/assets/img/InspectionBoard/toUpArrow.svg';
import MileageBarModal from './MileageModal';
import Legend from './Legend';
import FacilityPieModal from './facilityPieModal';
import EllipsisTooltip from 'baseline/src/components/EllipsisTooltip';
import styles from 'baseline/src/pages/InspectionBoard/styles.less';
import proStyles from '../styles.less';
import RightProject from './RightProject';

type Iprop = {
  mapType: string;
  dataRightInfo: any;
  projectId: string;
  singleProject: boolean;
  clearProject: () => void;
  year: any;
};
const { Option } = Select;
const BoardRight: React.FC<Iprop> = memo((props) => {
  const { dataRightInfo, year } = props;
  const legendNumArr = [
    { name: '病害数量≤10', value: '1', class: 'numcolor1' },
    { name: '病害数量(10-49)', value: '2', class: 'numcolor2' },
    { name: '病害数量(50-199)', value: '3', class: 'numcolor3' },
    { name: '病害数量≥200', value: '4', class: 'numcolor4' },
  ];
  const legendIconArr = [
    { name: '病害标记', value: '1', src: 'images/map-point.svg', width: '20.75', height: '24.09' },
    { name: '项目落点', value: '2', src: 'images/projectPoint.svg', width: '21.75', height: '20' },
  ];
  const legendRateArr = [
    { name: '养护等级: 优', value: '1', class: 'traffic-smooth' },
    { name: '养护等级: 良', value: '2', class: 'traffic-amber' },
    { name: '养护等级: 合格', value: '3', class: 'traffic-congestion' },
    { name: '养护等级: 不合格', value: '4', class: 'dark-congestion' },
  ];
  const [modalTitle, setModalTitle] = useState('图表放大图');
  const [mileDatas, setMileDatas] = useState<any>([]);
  const [taskType, setTaskType] = useState<any>(0);
  const [isFacilityVisible, setIsFacilityVisible] = useState(false);
  const [isMileageVisible, setIsMileageVisible] = useState(false);
  const [isSingleProject, setIsSingleProject] = useState<boolean>(false);
  const [dataInfo, setDataInfo] = useState<any>([]);
  useEffect(() => {
    setIsSingleProject(props?.singleProject);
  }, [props?.singleProject]);

  const getRoadDistributeData = async (type: number, yearVal?: any) => {
    // console.log('getRoadDistributeData', year)
    if (!year) {
      return;
    }
    const rec = await getRoadDistributed({ roadType: type, year: yearVal });
    const roadDatas: any = [];
    if (rec?.status === 0 && rec?.data?.length > 0) {
      rec?.data.forEach((it: any) => {
        roadDatas.push({ type: it?.roadLevel, nums: it?.roadLength });
      });
    }
    setDataInfo(roadDatas);
  };
  useEffect(() => {
    if (!year) {
      return;
    }
    getRoadDistributeData(taskType, year);
  }, [taskType, year]);
  const disInfo = useMemo(() => {
    const newObj: any = { datas: dataInfo, type: taskType };
    return { ...newObj };
  }, [dataInfo, taskType]);

  const selectValue = (text: any) => {
    setTaskType(text);
  };

  const handleLargeChart = (name: any, id: any) => {
    setModalTitle(name);
    if (id === 'mileageID') {
      setIsMileageVisible(true);
    } else if (id === 'facilityPieID') {
      setIsFacilityVisible(true);
    }
  };
  // 近五年检测里程统计
  const getRecent5YearData = (num: number, datas: any) => {
    let i = 0;
    const newArray = [];
    let isHasData = false;
    while (i <= num) {
      if (datas[i]) {
        if (datas[i].y) {
          isHasData = true;
        }
        newArray.push({ x: datas[i].x, y: datas[i].y });
      } else {
        newArray.push({ x: datas[i].x, y: 0 });
      }
      i += 1;
    }
    return isHasData ? newArray : [];
  };
  const getDetectMileageData = async () => {
    const rec = await getDetectMileage();
    if (rec?.status === 0) {
      let newData: any = [];
      if (rec?.data?.length > 0) {
        newData = getRecent5YearData(4, rec?.data);
      }
      setMileDatas(newData);
    } else {
      setMileDatas([]);
    }
  };
  useEffect(() => {
    getDetectMileageData();
  }, []);
  const handleBack = () => {
    props?.clearProject();
  };
  const getClass = (val: number) => {
    if (val === 0) {
      return proStyles['zero-class'];
    }
    if (val > 0) {
      return proStyles['up-arrow-class'];
    }
    return null;
  };

  return (
    <>
      <div className={`${styles.rightPanelClass}`}>
        <div
          className={`${!isSingleProject ? styles.rightBgPanel : styles.rightTransPanel} ${
            styles.panelClass
          } ${styles.rightPanel}`}
        >
          {!isSingleProject ? (
            <>
              <div className={`${styles.rightFirstCard} ${styles['right-top-card']}`}>
                <div className={styles.rightFirstTitle}>
                  <span className={styles.firstTitleImg}></span>
                  <span className={styles.titleTxt}>本年度累计总览</span>
                  <div className={styles.highlight}></div>
                </div>
                <div className={styles.staticsClass}>
                  <div className={styles.staticsCardClass}>
                    <EllipsisTooltip
                      title={'完成项目数量(个)'}
                      customEclipseClass="staticsRightLiCheng"
                    >
                      <span className={styles.staticsNameClass}>完成项目数量(个)</span>
                    </EllipsisTooltip>
                    <div className={proStyles['right-card-statics']}>
                      <span className={styles.staticsNumClass}>{dataRightInfo?.projectNum}</span>
                      <div className={`${styles.staticsBottomClass} ${proStyles['bottom-class']}`}>
                        <span className={proStyles['name-txt']}>年同比</span>
                        <div
                          className={`${styles.radioClass} ${proStyles['top-null']} ${getClass(
                            dataRightInfo?.projectNumGrowthRate,
                          )}`}
                        >
                          {dataRightInfo?.projectNumGrowthRate
                            ? parseFloat(
                                Math.abs(dataRightInfo?.projectNumGrowthRate * 100).toPrecision(12),
                              ).toFixed(2)
                            : 0}
                          {/* {Math.abs(dataRightInfo?.projectNumGrowthRate * 100)}% */}
                          {dataRightInfo?.projectNumGrowthRate !== 0 ? (
                            <img
                              className={`${styles.numPercentImgClass} `}
                              src={
                                dataRightInfo?.projectNumGrowthRate > 0 ? toUpArrow : toDownArrow
                              }
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>
                    {/* <span className={styles.staticsNumClass}>{totalMileageNum || 0}</span> */}
                  </div>
                  <div className={styles.staticsCardClass}>
                    <EllipsisTooltip
                      title={'完成项目历程(公里)'}
                      customEclipseClass="staticsRightLiCheng"
                    >
                      <span className={styles.staticsNameClass}>完成项目历程(公里)</span>
                    </EllipsisTooltip>
                    <div className={proStyles['right-card-statics']}>
                      <span className={styles.staticsNumClass}>{dataRightInfo?.mileage}</span>
                      <div className={`${styles.staticsBottomClass}  ${proStyles['bottom-class']}`}>
                        <span className={proStyles['name-txt']}>年同比</span>
                        <div
                          className={`${styles.radioClass} ${proStyles['top-null']} ${getClass(
                            dataRightInfo?.mileageGrowthRate,
                          )}`}
                        >
                          {dataRightInfo?.mileageGrowthRate
                            ? parseFloat(
                                Math.abs(dataRightInfo?.mileageGrowthRate * 100).toPrecision(12),
                              ).toFixed(2)
                            : 0}
                          {/* {dataRightInfo?.mileageGrowthRate?dataRightInfo?.mileageGrowthRate.slice }%  */}
                          {dataRightInfo?.mileageGrowthRate !== 0 ? (
                            <img
                              className={styles.numPercentImgClass}
                              src={dataRightInfo?.mileageGrowthRate > 0 ? toUpArrow : toDownArrow}
                            />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Card type="inner" className={`${styles.cardBcg} ${styles['card-road-facility']}`}>
                <div className={`${styles.cardTitle}  ${proStyles['card-right-txt']}`}>
                  <div className={`${styles.rightFirstTitle} ${styles.rightPadTitle}`}>
                    <span className={styles.firstTitleImg}></span>
                    <span className={styles.titleTxt}>项目道路等级分布</span>
                    {/* <span
                      className={styles.cardTitleleftImg}
                      onClick={() => {
                        handleLargeChart('项目道路等级分布', 'facilityPieID');
                      }}
                    >
                      <img className={styles.cardTitleImg} src={doLarger} />
                    </span> */}
                  </div>
                  <Select
                    popupClassName="dropdownSelectClass"
                    placeholder="请选择"
                    className="searchFacilityClass selectMg10"
                    defaultValue={0}
                    style={{ marginRight: 0 }}
                    onChange={selectValue}
                  >
                    <Option className="facClass" value={0}>
                      城市道路
                    </Option>
                    {/* <Option className="facClass" value={1}>
                      公路
                    </Option> */}
                  </Select>
                </div>
                <div className={styles.chartFacilityClass}>
                  <FacilityPie
                    type={disInfo?.type}
                    dataInfo={disInfo?.datas}
                    platform={'defalut'}
                  />
                </div>
              </Card>
              <Card type="inner" className={`${styles.cardBcg} ${styles['card-mile-statics']}`}>
                <div className={`${styles.cardTitle}  ${proStyles['card-right-txt']}`}>
                  <div className={`${styles.rightFirstTitle} ${styles.rightPadTitle}`}>
                    <span className={styles.firstTitleImg}></span>
                    <span className={styles.titleTxt}>近5年检测里程统计</span>
                    <span
                      className={styles.cardTitleleftImg}
                      onClick={() => {
                        handleLargeChart('近5年检测里程统计', 'mileageID');
                      }}
                    >
                      <img className={styles.cardTitleImg} src={doLarger} />
                    </span>
                  </div>
                </div>
                <div className={styles.chartFacilityClass}>
                  <MileageBar dataInfo={mileDatas} unit={'里程'} isModal={false} />
                </div>
              </Card>
            </>
          ) : (
            <RightProject
              handleBack={handleBack}
              projectId={props?.projectId}
              // scoreList={props?.scoreInfo}
              isSingleProject={isSingleProject}
            />
          )}
        </div>
        <Card
          type="inner"
          className={`${styles.cardBcg} ${styles.rightBgPanel} ${styles.rightBottomClass} ${
            isSingleProject && props?.mapType !== '3d' ? `${styles.fullBg}` : null
          }`}
        >
          <div className={`${styles.cardTitle}  ${styles.cardRightTitle}`}>
            <div className={`${styles.rightFirstTitle} ${styles.rightBottomTitle}`}>
              <span className={styles.firstTitleImg}></span>
              <span className={styles.titleTxt}>图例标识</span>
              <div className={styles.highlight}></div>
            </div>
          </div>
          <div className={styles.legendPanelClass}>
            <Legend
              fullScreenFlag={isSingleProject}
              diseaNums={legendNumArr}
              iconArr={legendIconArr}
              rateArr={legendRateArr}
            />
          </div>
        </Card>
      </div>
      {isMileageVisible ? (
        <MileageBarModal
          name={modalTitle}
          datas={mileDatas}
          modalShow={isMileageVisible}
          onCancel={() => setIsMileageVisible(false)}
        />
      ) : null}
      {isFacilityVisible ? (
        <FacilityPieModal
          name={modalTitle}
          modalShow={isFacilityVisible}
          onCancel={() => setIsFacilityVisible(false)}
        />
      ) : null}
    </>
  );
});

export default BoardRight;
