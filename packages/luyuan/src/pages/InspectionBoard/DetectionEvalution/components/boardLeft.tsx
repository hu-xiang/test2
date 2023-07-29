import { Card, message, Select, ConfigProvider } from 'antd';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import LeftDistributionPie from './LeftPieDistribution';
import LeftPieDeduModal from './LeftPieDeduModal';
import CirclePlot from './CirclePie';
import EmptyStatus from 'baseline/src/components/TableEmpty';
import ProTable from '@ant-design/pro-table';
import doLarger from 'baseline/src/assets/img/InspectionBoard/doLarger.svg';
import LeftPieDistributionModal from './LeftPieDistributionModal';
import {
  getProjectDistribution,
  getUnitDistribution,
  getDiseaseDis,
  getDeduDistribution,
  getProjectTop5,
  getFacTop5,
} from '../service';
import EllipsisTooltip from 'baseline/src/components/EllipsisTooltip';
import { useTop5ListScrollObj } from 'baseline/src/utils/tableScrollSet';
import styles from 'baseline/src/pages/InspectionBoard/styles.less';
import proStyles from '../styles.less';

const { Option } = Select;

type Iprop = {
  singleProject: boolean;
  projectId: string;
  quliatyInactRate: Record<string, any>;
  year: number;
};
const BoardLeft: React.FC<Iprop> = (props: any) => {
  const { quliatyInactRate, singleProject, year } = props;
  const actionRef = useRef<any>();
  const [circleData1, setCircleData1] = useState<any>([
    { type: '合格', value: 0 },
    { type: '不合格', value: 0 },
  ]);
  const [circleData2, setCircleData2] = useState<any>([
    { type: '完好', value: 90.0 },
    { type: '不完好', value: 10.0 },
  ]);
  enum projEnumType {
    'PQI' = 1,
    'PCI' = 2,
    'RQI' = 3,
  }
  const colorInfo1s = ['rgba(55, 144, 255, 1)', 'rgba(55, 144, 255, 0.4)'];
  const colorInfo2s = ['rgba(55, 204, 255, 1)', 'rgba(55, 204, 255, 0.4)'];
  const [modalTitle, setModalTitle] = useState('图表放大图');
  const [tableData, setTableData] = useState<any>([]);
  const [isScoreVisible, setIsScoreVisible] = useState<boolean>(false);
  const [isDecDisVisible, setIsDecDisVisible] = useState<boolean>(false);
  const [scoreType, setScoreType] = useState<any>(1);
  const [facilityData, setFacilityData] = useState<any>([]);
  const scrollObj: any = useTop5ListScrollObj(tableData);

  const scoreTypeList = [
    { label: 'PQI', value: 1 },
    { label: 'PCI', value: 2 },
    { label: 'RQI', value: 3 },
  ];
  const typeInfo: any = {
    splitDeductCount: '裂缝类',
    deformedDeductCount: '变形类',
    looseDeductCount: '松散类',
    otherDeductCount: '其他',
  };
  const [scoreDisData, setScoreDisData] = useState<any>();
  const [diseaseType, setDiseaseType] = useState<any>(2);
  const [diseaseTypeList] = useState<any>([
    { label: '水泥路面', value: 1 },
    { label: '沥青路面', value: 2 },
  ]);
  const [deduDisData, setDeduDisData] = useState<any>([]);
  // const [weekInfo, setWeekInfo] = useState<any>([]);
  const scoreInfo = useMemo(() => {
    const newObj: any = {
      scoreData: scoreDisData?.data,
      avgData: scoreDisData?.avgVal,
      type: scoreType,
    };
    return { ...newObj };
  }, [scoreDisData]);
  const dudcInfo = useMemo(() => {
    const newOb: any = { deduDisData, type: diseaseType };
    return { ...newOb };
  }, [diseaseType, deduDisData, props.projectId, props?.singleProject]);

  // 项目评分分布
  // 具体项目评分分布
  const getDistData = async (type: string, id: string, isYear: boolean, yearVal?: any) => {
    const rec = isYear
      ? await getProjectDistribution({ type: projEnumType[type], year: yearVal })
      : await getUnitDistribution({ type: projEnumType[type], id });
    const newDataInfo: { data: any[]; avgVal: string } = { data: [], avgVal: '0' };
    let isAllZero: boolean = true;
    if (rec?.status === 0) {
      if (rec?.data[type]?.length === 0) {
        return;
      }
      rec?.data[type].forEach((it: any) => {
        if (it.type !== 'Average') {
          if (it?.nums) {
            isAllZero = false;
          }
          newDataInfo.data.push(it);
        } else {
          newDataInfo.avgVal = it?.nums;
        }
      });
    }
    setScoreDisData(!isAllZero ? newDataInfo : []);
  };

  useEffect(() => {
    if (!props.projectId) {
      // console.log('getDistData',year )
      if (!year) {
        return;
      }
      getDistData(scoreType, '', true, year);
    } else {
      if (!props.projectId) {
        return;
      }
      getDistData(scoreType, props.projectId, false);
    }
  }, [scoreType, props.projectId, year]);
  // 路面病害扣分分布年
  const getProjDeduDistribution = async (
    type: number,
    id: string,
    isYear: boolean,
    yearVal?: any,
  ) => {
    const rec = isYear
      ? await getDiseaseDis({ roadType: type, year: yearVal })
      : await getDeduDistribution({ roadType: type, id });
    const newDataInfo: any[] = [];
    let isAllZero: boolean = true;
    if (rec?.status === 0 && rec?.data && JSON.stringify(rec?.data) !== '{}') {
      Object.keys(rec?.data).forEach((it: any) => {
        if (rec?.data[it]) {
          isAllZero = false;
        }
        newDataInfo.push({ type: typeInfo[it], nums: rec?.data[it] });
      });
    }
    setDeduDisData(!isAllZero ? newDataInfo : []);
  };
  useEffect(() => {
    if (!props.projectId) {
      // console.log('getProjDeduDistribution', year)
      if (!year) {
        return;
      }
      getProjDeduDistribution(diseaseType, props.projectId, true, year);
    } else {
      if (!props.projectId) {
        return;
      }
      getProjDeduDistribution(diseaseType, props.projectId, false);
    }
  }, [diseaseType, props.projectId, year]);

  const selectValue = (text: any) => {
    setScoreType(text);
  };
  const selectDiseaseValue = (text: any) => {
    setDiseaseType(text);
  };
  const reqErr = () => {
    message.error({
      content: '查询失败!',
      key: '查询失败!',
    });
  };

  const getFacilityTop5Data = async (projId: string, isYear: boolean, yearVal?: any) => {
    let facdata: any = [];
    const rec = isYear ? await getFacTop5({ year: yearVal }) : await getProjectTop5({ id: projId });
    if (rec?.status === 0) {
      if (!rec?.data || rec?.data?.length === 0) {
        return;
      }
      facdata = rec?.data.map((it: any, index: number) => {
        return {
          ...it,
          id: index,
          pci: it?.pci?.toFixed(2),
          pqi: it?.pqi?.toFixed(2),
          rqi: it?.rqi?.toFixed(2),
        };
      });
    }
    setTableData(facdata);
    setFacilityData(facdata);
  };
  useEffect(() => {
    // console.log('getFacilityTop5Datayear',year,props?.projectId)
    if (!props?.projectId) {
      if (!year) {
        return;
      }
      getFacilityTop5Data('', true, year);
    } else {
      if (!props.projectId) {
        return;
      }
      getFacilityTop5Data(props?.projectId, false);
    }
    actionRef.current.reload();
  }, [props?.projectId, year]);

  const customViewInfoColumns: any = [
    {
      title: '排名',
      dataIndex: 'index',
      valueType: 'index',
      ellipsis: true,
      // width: 40,
    },
    {
      title: `${singleProject ? '车道名称' : '道路名称'}`,
      dataIndex: `${singleProject ? 'laneName' : 'facilitiesName'}`,
      key: `${singleProject ? 'laneName' : 'facilitiesName'}`,
      // width: 60,
      ellipsis: true,
    },
    {
      title: '养护等级',
      dataIndex: 'curingLv',
      key: 'curingLv',
      // width: 60,
      ellipsis: true,
    },
    {
      title: 'PQI',
      dataIndex: 'pqi',
      key: 'pqi',
      // sorter: true,
      ellipsis: true,
    },
    {
      title: 'PCI参考值',
      dataIndex: 'pci',
      key: 'pci',
      // sorter: true,
      ellipsis: true,
    },
    {
      title: 'RQI参考值',
      dataIndex: 'rqi',
      key: 'rqi',
      ellipsis: true,
    },
  ];
  const handleCircleChart = (name: any, id: any) => {
    setModalTitle(name);
    if (id === 'scoreStaics') {
      setIsScoreVisible(true);
    } else if (id === 'dudcStaics') {
      setIsDecDisVisible(true);
    }
  };

  useEffect(() => {
    setCircleData1([
      { type: '合格', value: quliatyInactRate?.qualifyRate },
      { type: '不合格', value: 100 - quliatyInactRate?.qualifyRate },
    ]);
    setCircleData2([
      { type: '完好', value: quliatyInactRate?.intactRate },
      { type: '不完好', value: 100 - quliatyInactRate?.intactRate },
    ]);
  }, [quliatyInactRate]);

  return (
    <>
      <div className={`${proStyles['left-inspect-panel']} ${styles.panelClass} `}>
        <Card type="inner" className={`${styles.cardBcg} ${proStyles['card-store-statics']}`}>
          <div className={`${styles.cardTitle} ${styles.cardFirstTitle}`}>
            <div className={styles.cardTitleleft}>
              <span className={styles.titleLeftImg} />
              <EllipsisTooltip title={singleProject ? '本项目评分统计' : '本年度项目评分统计'}>
                <div className={styles.firstChart}>
                  {singleProject ? '本项目评分统计' : '本年度项目评分统计'}
                </div>
              </EllipsisTooltip>
            </div>
            <div className={styles.highlight}></div>
          </div>
          <div className={proStyles['project-score-statics']}>
            <div className={proStyles['project-score-card']}>
              <div className={proStyles['project-score-card-left']}>
                {useMemo(
                  () => (
                    <CirclePlot circleData={circleData1} colorInfos={colorInfo1s} />
                  ),
                  [circleData1],
                )}
              </div>
              <div className={proStyles['project-score-card-right']}>
                <span className={proStyles['top-txt']}>平均合格率</span>
                <span className={proStyles['num-txt']}>{quliatyInactRate?.qualifyRate}%</span>
              </div>
            </div>
            <div className={proStyles['project-score-card']}>
              <div className={proStyles['project-score-card-left']}>
                {useMemo(
                  () => (
                    <CirclePlot circleData={circleData2} colorInfos={colorInfo2s} />
                  ),
                  [circleData2],
                )}
              </div>
              <div className={proStyles['project-score-card-right']}>
                <span className={proStyles['top-txt']}>平均完好率</span>
                <span className={proStyles['num-txt']}>{quliatyInactRate?.intactRate}%</span>
              </div>
            </div>
          </div>
        </Card>

        <Card type="inner" className={`${styles.cardBcg} ${proStyles['card-score-distribution']}`}>
          <div className={`${styles.cardTitle} ${styles.cardSecondTitle}`}>
            <div className={styles.firstChartRow}>
              <EllipsisTooltip title={singleProject ? '单元评分分布' : '项目评分分布'}>
                <span className={styles.cardTxtName}>
                  {singleProject ? '单元评分分布' : '项目评分分布'}
                </span>
              </EllipsisTooltip>
              <span
                className={styles.cardTitleleftImg}
                onClick={() => {
                  handleCircleChart('项目评分分布', 'scoreStaics');
                }}
              >
                <img className={styles.cardTitleImg} src={doLarger} />
              </span>
            </div>
            <Select
              popupClassName="dropdownSelectClass"
              placeholder="请选择"
              className="searchFacilityClass selectMg10"
              defaultValue={1}
              style={{ marginRight: 0 }}
              onChange={selectValue}
            >
              {scoreTypeList.map((item: any) => (
                <Option className="facClass" key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </div>
          <div className={styles.chartCommonClass}>
            {scoreInfo?.scoreData?.length > 0 ? (
              <>
                <LeftDistributionPie
                  intervalTime={3000}
                  // displayName="scoreChart"
                  contentClassName={'scoreContent'}
                  titleClassName={'scoreTitle'}
                  isShowAvg={true}
                  avgData={scoreInfo.avgData}
                  pieInfo={scoreInfo.scoreData}
                />
              </>
            ) : (
              <EmptyStatus customEmptyClass={styles.pieEmpty} />
            )}
          </div>
        </Card>
        <Card type="inner" className={`${styles.cardBcg} ${proStyles['card-dec-distribution']}`}>
          <div className={`${styles.cardTitle} ${styles.cardSecondTitle}`}>
            <div className={styles.firstChartRow}>
              <EllipsisTooltip title={'路面病害扣分分布'}>
                <span className={styles.cardTxtName}>路面病害扣分分布</span>
              </EllipsisTooltip>
              <span
                className={styles.cardTitleleftImg}
                onClick={() => {
                  handleCircleChart('路面病害扣分分布', 'dudcStaics');
                }}
              >
                <img className={styles.cardTitleImg} src={doLarger} />
              </span>
            </div>
            <Select
              popupClassName="dropdownSelectClass"
              placeholder="请选择"
              className="searchFacilityClass selectMg10"
              defaultValue={2}
              style={{ marginRight: 0 }}
              onChange={selectDiseaseValue}
            >
              {diseaseTypeList.map((item: any) => (
                <Option className="facClass" key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </div>
          <div className={styles['chart-card-pie']}>
            {dudcInfo?.deduDisData?.length > 0 ? (
              <>
                <LeftDistributionPie
                  intervalTime={5000}
                  displayName="deduChart"
                  contentClassName={'deduContent'}
                  titleClassName={'deduTitle'}
                  isShowAvg={false}
                  pieInfo={dudcInfo.deduDisData}
                />
              </>
            ) : (
              <EmptyStatus customEmptyClass={styles.pieEmpty} />
            )}
          </div>
        </Card>
        <Card type="inner" className={`${styles.cardBcg} ${proStyles['card-fac-table']}`}>
          <div className={`${styles.cardTitle} ${styles.cardSecondTitle}`}>
            <div className={styles.firstChartRow}>
              <EllipsisTooltip title={singleProject ? '车道评分TOP5' : '道路评分TOP5'}>
                <span className={styles.cardTxtName}>
                  {singleProject ? '车道评分TOP5' : '道路评分TOP5'}
                </span>
              </EllipsisTooltip>
            </div>
          </div>
          <div className={styles['fac-table']}>
            <ConfigProvider renderEmpty={EmptyStatus}>
              <ProTable<any>
                rowKey="id"
                toolBarRender={false}
                search={false}
                actionRef={actionRef}
                className={`${styles.viewDetailTableClass} viewTop5TableClass ${
                  tableData?.length === 0 ? 'emptyTableData last-protable' : null
                }`}
                scroll={{ y: scrollObj?.y }}
                tableAlertRender={false}
                dataSource={facilityData}
                pagination={false}
                columns={customViewInfoColumns}
                onRequestError={reqErr}
              />
            </ConfigProvider>
          </div>
        </Card>
      </div>
      {isScoreVisible ? (
        <LeftPieDistributionModal
          name={modalTitle}
          modalShow={isScoreVisible}
          projectId={props?.projectId}
          isSingleProject={props?.singleProject}
          year={year}
          onCancel={() => {
            setIsScoreVisible(false);
          }}
        />
      ) : null}
      {isDecDisVisible ? (
        <LeftPieDeduModal
          name={modalTitle}
          year={year}
          projectId={props?.projectId}
          isSingleProject={props?.singleProject}
          modalShow={isDecDisVisible}
          onCancel={() => {
            setIsDecDisVisible(false);
          }}
        />
      ) : null}
    </>
  );
};

export default BoardLeft;
