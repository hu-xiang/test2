import { Card, message, ConfigProvider } from 'antd';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import LeftPieDistribution from './LeftPieDistribution';
import EmptyStatus from 'baseline/src/components/TableEmpty';
import ProTable from '@ant-design/pro-table';
import toDownArrow from 'baseline/src/assets/img/InspectionBoard/toDownArrow.svg';
import toUpArrow from 'baseline/src/assets/img/InspectionBoard/toUpArrow.svg';
import ScoreAreaPlot from './ScoreAreaPlot';
import { getDiseaseMonthData, getDiseaseDistribution, getFacilityTop5 } from '../service';
import EllipsisTooltip from 'baseline/src/components/EllipsisTooltip';
import { useTop5ListScrollObj } from 'baseline/src/utils/tableScrollSet';
import styles from 'baseline/src/pages/InspectionBoard/styles.less';

type Iprop = {};
const BoardRight: React.FC<Iprop> = () => {
  const actionRef = useRef<any>();
  const [typeTime, setTypeTime] = useState<number>(2);
  const [tableData, setTableData] = useState<any>([]);
  const scrollObj: any = useTop5ListScrollObj(tableData);
  const [diseaInfo, setDiseaInfo] = useState<any>([]);
  const [distributionData, setDistributionData] = useState<any>([]);

  const typeTimeList = [
    { name: '月', type: 2 },
    { name: '年', type: 3 },
  ];
  const getDiseaseInfos = async () => {
    const res = await getDiseaseMonthData();
    if (res.status === 0) {
      const newData = res.data.map((it: any) => {
        const cf: RegExp = /^([1-9]\d{3})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/gi;
        const date = it?.commitDate
          ? it?.commitDate.replace(cf, (p0: string, p1: string, p2: string, p3: string) => {
              return `${p2}.${p3}`;
            })
          : '';
        return { label: date, value: it?.total || 0, type: '总数' };
      });
      setDiseaInfo(newData);
    } else {
      setDiseaInfo([]);
    }
  };
  const getDistributionDatas = async () => {
    const res = await getDiseaseDistribution();

    if (res?.status === 0 && res?.data) {
      const newData = res?.data.map((it: any) => {
        return { type: it?.diseaseTypeName, nums: it?.total };
      });
      setDistributionData(newData);
    } else {
      setDistributionData([]);
    }
  };

  // 近30天新增病害概况
  useEffect(() => {
    getDiseaseInfos();
    getDistributionDatas();
  }, []);

  const getTimeTitle = (type: any) => {
    const recName = type === 2 ? '月环比' : '年环比';
    return recName;
  };
  const getImg = (val: any) => {
    const rec = val === 1 ? toUpArrow : toDownArrow;
    return rec;
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
        return (
          <div className="rowTdClass">
            <span className="weekRadioClass">{text !== '-' ? `${text}` : text}</span>
            <span className="weekRadioImgClass">
              {record?.ratioStatus > 0 ? <img src={getImg(record?.ratioStatus)} /> : null}
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
      <div className={`${styles.rightPanelClass} ${styles.panelClass} ${styles.rightBgPanel}`}>
        <Card type="inner" className={`${styles.cardBcg} ${styles.cardDiseaseStatics}`}>
          <div className={`${styles.cardTitle} ${styles.cardFirstTitle}`}>
            <div className={styles.cardTitleleft}>
              <span className={styles.titleLeftImg} />
              <EllipsisTooltip title={'近30天新增病害概况'}>
                <div className={styles.firstChart}>近30天新增病害概况</div>
              </EllipsisTooltip>
            </div>
            <div className={styles.highlight}></div>
          </div>
          <div className={styles.firstChartRow}>
            <span className={styles.cardTxtName}>新增病害统计</span>
          </div>
          <div className={styles.chartFirstCommonClass}>
            {useMemo(
              () => (
                <ScoreAreaPlot
                  isModalPlatform={false}
                  info={diseaInfo}
                  isLegendShow={false}
                  isRotate={false}
                />
              ),
              [diseaInfo],
            )}
          </div>
        </Card>
        <Card type="inner" className={`${styles.cardBcg} ${styles.cardDiseaseDis}`}>
          <div className={`${styles.cardTitle} ${styles.cardSecondTitle}`}>
            <div className={styles.firstChartRow}>
              <EllipsisTooltip title={'新增病害数量分布'}>
                <span className={styles.cardTxtName}>新增病害数量分布</span>
              </EllipsisTooltip>
            </div>
          </div>
          <div className={styles.chartCommonClass}>
            {useMemo(
              () =>
                distributionData?.length > 0 ? (
                  <LeftPieDistribution
                    isShowAvg={false}
                    pieInfo={distributionData}
                    isModalPlatform={false}
                    intervalTime={4000}
                    contentClassName={'diseaContent'}
                    titleClassName={'diseaTitle'}
                  />
                ) : (
                  <EmptyStatus customEmptyClass={styles.pieEmpty} />
                ),
              [distributionData],
            )}
          </div>
        </Card>
        <Card type="inner" className={`${styles.cardBcg} ${styles.cardDiseaseCount}`}>
          <div className={`${styles.cardTitle} ${styles.cardSecondTitle}`}>
            <div className={styles.firstChartRow}>
              <EllipsisTooltip title={'道路病害数量TOP5'}>
                <span className={styles.cardTxtName}>道路病害数量TOP5</span>
              </EllipsisTooltip>
            </div>
            <ul className={styles.cardTitleRight}>
              {typeTimeList.map((it: any) => (
                <li
                  key={it?.type}
                  onClick={() => {
                    handleTime(it?.type || 2);
                  }}
                  className={`${it?.type === typeTime ? styles.activeClass : ''} ${styles.liClass}`}
                >
                  <span>{it?.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.chartCommonClass}>
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
                request={getFacilityTop5}
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
    </>
  );
};

export default BoardRight;
