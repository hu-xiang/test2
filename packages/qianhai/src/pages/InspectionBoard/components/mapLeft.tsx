import { Card, message, Select, ConfigProvider } from 'antd';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import styles from '../styles.less';
import LeftPie from './leftPie';
import AreaPlot from './AreaPlot';
import EmptyStatus from '../../../components/TableEmpty';
import { getTop5Datas } from '../service';
import ProTable from '@ant-design/pro-table';
import toDownArrow from '../../../assets/img/InspectionBoard/toDownArrow.svg';
import toUpArrow from '../../../assets/img/InspectionBoard/toUpArrow.svg';
import EllipsisTooltip from '../../../components/EllipsisTooltip';
import { useTop5ListScrollObj } from '@/utils/tableScrollSet';

import MileageBar from './MileageBar';
import FacilityPie from './FacilityPie';
import RectIcon from './Icons/RectIcon';

import { mockDiseaseWeekInfo, mockDiseaseWeekDistributed } from '../../../../mock/inspection';

const { Option } = Select;

const MapLeft: React.FC = () => {
  const actionRef = useRef<any>();
  const [typeTime, setTypeTime] = useState<number>(1);
  const [tableData, setTableData] = useState<any>([]);
  const [taskType, setTaskType] = useState<any>(2);
  const [facilityType, setFacilityType] = useState<any>(1);
  const scrollObj: any = useTop5ListScrollObj(tableData);
  const [diseasePie, setDiseasePie] = useState<any>([]);
  const [weekInfo, setWeekInfo] = useState<any>([]);

  const typeTimeList = [
    { name: '周', type: 1 },
    { name: '月', type: 2 },
    { name: '年', type: 3 },
  ];

  // 获取近7天病害数量分布
  useEffect(() => {
    const getDiseaseInfos = async () => {
      const res = mockDiseaseWeekDistributed;
      setDiseasePie(res.data);
    };
    getDiseaseInfos();
  }, []);
  const getTimeTitle = (type: any) => {
    let recName = '周环比';
    if (type !== 1) {
      recName = type === 2 ? '月环比' : '年环比';
    }
    return recName;
  };
  // 获取近7天新增病害统计
  const getRencentWeekInfo = async () => {
    const res = mockDiseaseWeekInfo;

    setWeekInfo(res.data);
  };
  useEffect(() => {
    getRencentWeekInfo();
  }, []);
  const selectValue = (text: any) => {
    setTaskType(text);
  };

  const selectFacilityValue = (text: any) => {
    setFacilityType(text);
  };

  const reqErr = () => {
    message.error({
      content: '查询失败!',
      key: '查询失败!',
    });
  };
  const handleTime = (type: any) => {
    setTypeTime(type);
  };
  const getImg = (val: any) => {
    if (val !== -1) {
      const rec = val === 1 ? toUpArrow : toDownArrow;
      return rec;
    }
    return null;
  };
  useEffect(() => {
    handleTime(1);
  }, []);
  const customViewInfoColumns: any = [
    {
      title: '排名',
      dataIndex: 'index',
      valueType: 'index',
      ellipsis: true,
    },
    {
      title: '道路名称',
      dataIndex: 'facility',
      key: 'facility',
      ellipsis: true,
    },
    {
      title: '数量',
      dataIndex: 'num',
      key: 'num',
      ellipsis: true,
    },
    {
      title: getTimeTitle(typeTime),
      dataIndex: 'radio',
      key: 'radio',
      width: 80,
      render: (text: any, record: any) => {
        const textVal = parseInt(text, 10) < 0 ? `${-parseInt(text, 10)}%` : text;
        return (
          <div className="rowTdClass">
            <span className="weekRadioClass">{textVal}</span>
            <span className="weekRadioImgClass">
              {record?.ratioStatus ? <img src={getImg(record?.ratioStatus)} /> : null}
            </span>
          </div>
        );
      },
    },
  ];

  const onLoad = (dataSource: any) => {
    if (!tableData?.length) {
      setTableData(dataSource);
    }
  };

  return (
    <>
      <div className={`${styles.leftPanel} ${styles.panelClass} ${styles.panelLeftWrapper}`}>
        <div className={styles.panelLeftInnerWrapper}>
          <div className={styles.leftLayerTop}>
            <div className={styles.leftLayerTopTitle}>
              <RectIcon />
              <span style={{ marginLeft: '8px' }}>近七天病害概况</span>
            </div>
            <div className={styles.leftLayerTopContent}>
              <Card
                type="inner"
                className={`${styles.cardBcg} ${styles.cardDiseaseStatics} ${styles.diseaseOverview}`}
              >
                <div className={styles.firstChartRow}>
                  <span className={`${styles.cardTxtName}`}>新增病害统计</span>
                </div>
                <div className={styles.chartFirstCommonClass}>
                  {useMemo(
                    () => (
                      <AreaPlot info={weekInfo} btnType={1} />
                    ),
                    [weekInfo],
                  )}
                </div>
              </Card>
              <Card
                type="inner"
                className={`${styles.cardBcg} ${styles.cardDiseaseDis} ${styles.diseaseDistributed}`}
              >
                <div className={`${styles.cardTitle} ${styles.cardSecondTitle}`}>
                  <div className={styles.firstChartRow}>
                    <EllipsisTooltip title={'新增病害分布'}>
                      <span className={styles.cardTxtName}>新增病害分布</span>
                    </EllipsisTooltip>
                  </div>
                  <Select
                    popupClassName="dropdownSelectClass"
                    placeholder="请选择"
                    className="searchFacilityClass selectMg10"
                    defaultValue={taskType}
                    style={{ marginRight: 0 }}
                    onChange={selectValue}
                  >
                    <Option className="facClass" value={1}>
                      水泥路面
                    </Option>
                    <Option className="facClass" value={2}>
                      沥青路面
                    </Option>
                    <Option className="facClass" value={3}>
                      综合安全事件
                    </Option>
                  </Select>
                </div>
                <div className={styles.chartCommonClass}>
                  {useMemo(
                    () =>
                      diseasePie?.length > 0 ? (
                        <LeftPie type={taskType} pieInfo={diseasePie} />
                      ) : (
                        <EmptyStatus customEmptyClass={styles.pieEmpty} />
                      ),
                    [diseasePie],
                  )}
                </div>
              </Card>
            </div>
          </div>

          <div className={styles.leftLayerCenter}>
            <Card
              type="inner"
              className={`${styles.cardBcg} ${styles.cardRoad} ${styles.inspectionMileage}`}
            >
              <div className={`${styles.cardTitle}  ${styles.cardRightTitle}`}>
                <div className={`${styles.rightFirstTitle} ${styles.rightPadTitle}`}>
                  <span className={styles.firstTitleImg}></span>
                  <span className={`${styles.titleTxt} ${styles.comSubTitle}`}>
                    近七天巡检里程统计
                  </span>
                </div>
                <div className={styles.highlight}></div>
              </div>
              <div className={styles.chartFacilityClass}>
                <MileageBar dataType={1} />
              </div>
            </Card>
            <Card
              type="inner"
              className={`${styles.cardBcg} ${styles.cardFacility} ${styles.facilityLevel}`}
            >
              <div className={`${styles.cardTitle}  ${styles.cardRightTitle}`}>
                <div className={`${styles.rightFirstTitle} ${styles.rightPadTitle} `}>
                  <span className={styles.firstTitleImg}></span>
                  <span className={`${styles.titleTxt} ${styles.comSubTitle}`}>道路等级分布</span>
                </div>
                <Select
                  dropdownClassName="dropdownSelectClass"
                  placeholder="请选择"
                  className="searchFacilityClass selectMg10"
                  defaultValue={1}
                  style={{ marginRight: 0 }}
                  onChange={selectFacilityValue}
                >
                  <Option className="facClass" value={0}>
                    城市道路
                  </Option>
                  <Option className="facClass" value={1}>
                    公路
                  </Option>
                </Select>
                <div className={styles.highlight}></div>
              </div>
              <div className={styles.chartFacilityClass}>
                <FacilityPie type={facilityType} platform={'defalut'} />
              </div>
            </Card>
          </div>
          <Card type="inner" className={`${styles.cardBcg} ${styles.cardDiseaseCount}`}>
            <div
              className={`${styles.cardTitle} ${styles.cardSecondTitle} ${styles.diseaseTop5TabTitle}`}
            >
              <div className={`${styles.firstChartRow}`}>
                <EllipsisTooltip title={'重点道路病害数量TOP5'}>
                  <span className={`${styles.cardTxtName} ${styles.comSubTitle}`}>
                    重点道路病害数量TOP5
                  </span>
                </EllipsisTooltip>
                <div className={styles.highlight}></div>
              </div>
              <ul className={styles.cardTitleRight}>
                {typeTimeList.map((it: any) => (
                  <li
                    key={it?.type}
                    onClick={() => {
                      handleTime(it?.type || 1);
                    }}
                    className={`${it?.type === typeTime ? styles.activeClass : ''} ${
                      styles.liClass
                    }`}
                  >
                    <span>{it?.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${styles.chartCommonClass} ${styles.diseaseTop5Tab}`}>
              <ConfigProvider renderEmpty={EmptyStatus}>
                <ProTable<any>
                  rowKey="id"
                  toolBarRender={false}
                  search={false}
                  actionRef={actionRef}
                  className={`${styles.viewDetailTableClass} viewTop5TableClass ${
                    tableData?.length === 0 ? 'emptyTableData' : null
                  }`}
                  scroll={{ y: scrollObj?.y }}
                  onLoad={onLoad}
                  tableAlertRender={false}
                  request={getTop5Datas}
                  params={{
                    type: typeTime,
                  }}
                  pagination={false}
                  columns={customViewInfoColumns}
                  onRequestError={reqErr}
                />
              </ConfigProvider>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MapLeft;
