import { Card } from 'antd';
import React, { useState, useEffect, memo } from 'react';
import MileageBar from './MileageBar';
import DetailInfo from './DetailInfo';
// import doLarger from 'baseline/src/assets/img/InspectionBoard/doLarger.svg';
import PieChart from 'baseline/src/components/PieChart';
import EllipsisTooltip from 'baseline/src/components/EllipsisTooltip';
import styles from 'baseline/src/pages/InspectionBoard/styles.less';
import EmptyPage from 'baseline/src/components/EmptyPage';
import proStyles from '../styles.less';
// import { barData1, barData2 } from './testData';

type Iprop = {
  mapType: string;
  dataInfo: any;
};
const BoardLeft: React.FC<Iprop> = memo((props) => {
  const { dataInfo } = props;
  const [mileDatas, setMileDatas] = useState<any[]>([]);
  const [typeStaticsData, setTypeStaticsData] = useState<any[]>([]);
  const [facNumDatas, setFacNumDatas] = useState<any[]>([]);
  const [roadInfoDatas, setRoadInfoDatas] = useState<any>({});
  useEffect(() => {
    // console.log('dataRightInfo?.sceneStatisticsList',dataInfo);
    setTypeStaticsData(dataInfo?.sceneStatisticsList);
    setMileDatas(dataInfo?.hiddenStatisticsList);
    setFacNumDatas(dataInfo?.facNums);
    // setMileDatas(barData1);
  }, [dataInfo]);
  // 获取项目信息
  useEffect(() => {
    if (dataInfo?.roadInfo && Object.keys(dataInfo?.roadInfo)?.length > 0) {
      setRoadInfoDatas(dataInfo?.roadInfo);
    }
  }, [dataInfo?.roadInfo]);

  return (
    // <>
    <div className={`${styles.leftPanel} ${styles.panelClass}`}>
      <Card type="inner" className={`${styles.cardBcg} ${proStyles['card-road-info-class']}`}>
        <div className={`${styles.cardTitle} ${styles.cardHeight}`}>
          <div className={styles.firstChartRow}>
            <span className={styles.titleCommonImg}></span>
            <EllipsisTooltip title={'道路基本信息'}>
              <span className={styles['card-normal-color']}>道路基本信息</span>
            </EllipsisTooltip>
          </div>
          <div className={styles.highlight}></div>
        </div>
        <div className={proStyles['card-faclity-nums']}>
          <DetailInfo dataInfos={roadInfoDatas} />
        </div>
      </Card>
      <Card type="inner" className={`${styles.cardBcg} ${proStyles['card-scene-statics']}`}>
        <div className={`${styles.cardTitle} ${styles.cardRightTitle}`}>
          <div className={styles.firstChartRow}>
            <span className={styles.titleCommonImg}></span>
            <EllipsisTooltip title={'道路场景类型统计'}>
              <span className={styles['card-normal-color']}>道路场景类型统计</span>
            </EllipsisTooltip>
          </div>
          <div className={styles.highlight}></div>
        </div>
        <div className={styles.chartFacilityClass}>
          <MileageBar
            dataInfo={typeStaticsData}
            xfield="type"
            yfield="num"
            unit={'个数'}
            isModal={false}
            isSider={true}
          />
        </div>
      </Card>
      <Card type="inner" className={`${styles.cardBcg} ${proStyles['card-mile-statics']}`}>
        <div className={`${styles.cardTitle}  ${styles.cardRightTitle}`}>
          <div className={styles.firstChartRow}>
            <span className={styles.titleCommonImg}></span>
            <EllipsisTooltip title={'道路隐患类型统计'}>
              <span className={styles['card-normal-color']}>道路隐患类型统计</span>
            </EllipsisTooltip>
          </div>
          <div className={styles.highlight}></div>
        </div>
        <div className={styles.chartFacilityClass}>
          <MileageBar
            dataInfo={mileDatas}
            xfield="type"
            yfield="num"
            unit={'个数'}
            isSider={true}
            isModal={false}
          />
        </div>
      </Card>
      <Card type="inner" className={`${styles.cardBcg} ${proStyles['card-fac-num-statics']}`}>
        <div className={`${styles.cardTitle}  ${styles.cardRightTitle}`}>
          <div className={styles.firstChartRow}>
            <span className={styles.titleCommonImg}></span>
            <EllipsisTooltip title={'附属设施数量统计'}>
              <span className={styles['card-normal-color']}>附属设施数量统计</span>
            </EllipsisTooltip>
          </div>
          <div className={styles.highlight}></div>
        </div>
        <div className={styles.chartFacilityClass}>
          {facNumDatas?.length > 0 ? (
            <PieChart
              isNeedPercent={false}
              contentClassName={`pie-fac-num-content`}
              titleClassName={`pie-fac-num-title`}
              pieInfo={facNumDatas}
            />
          ) : (
            <EmptyPage content={'暂无数据'} customEmptyChartClass={proStyles['pie-item-empty']} />
          )}
        </div>
      </Card>
    </div>
  );
});

export default BoardLeft;
