import { Card, Select, ConfigProvider } from 'antd';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import styles from '../styles.less';
import LeftPie from './leftPie';
import AreaPlot from './AreaPlot';
import EmptyStatus from '../../../components/TableEmpty';
import { getDiseasePieInfo, getTop5Datas, getColInfo } from '../service';
import ProTable from '@ant-design/pro-table';
import toDownArrow from '../../../assets/img/InspectionBoard/toDownArrow.svg';
import toUpArrow from '../../../assets/img/InspectionBoard/toUpArrow.svg';
import doLarger from '../../../assets/img/InspectionBoard/doLarger.svg';
import AreaPlotModal from './areaPlotModal';
import LeftPieModal from './leftPieModal';
import EllipsisTooltip from '../../../components/EllipsisTooltip';
import { useTop5ListScrollObj } from '../../../utils/tableScrollSet';
import { getDictData } from '../../../utils/commonMethod';

const { Option } = Select;

const MapLeft: React.FC = () => {
  const actionRef = useRef<any>();
  const [modalTitle, setModalTitle] = useState('图表放大图');
  const [typeTime, setTypeTime] = useState<number>(1);
  const [tableData, setTableData] = useState<any>([]);
  const [isAreaVisible, setIsAreaVisible] = useState(false);
  const [isLeftPieVisible, setIsLeftPieVisible] = useState(false);
  const [taskType, setTaskType] = useState<any>(2);
  const scrollObj: any = useTop5ListScrollObj(tableData);
  const [diseasePie, setDiseasePie] = useState<any>([]);
  const [weekInfo, setWeekInfo] = useState<any>([]);
  const [dictOption, setDictOption] = useState<any>([]);
  const typeTimeList = [
    { name: '周', type: 1 },
    { name: '月', type: 2 },
    { name: '年', type: 3 },
  ];

  // 获取近7天病害数量分布
  useEffect(() => {
    let isUnmounted = false;
    const getDiseaseInfos = async () => {
      const res = await getDiseasePieInfo({ taskType, type: 1 }); // type周
      if (!isUnmounted) {
        setDiseasePie(res.data);
      }
    };
    getDiseaseInfos();
    return () => {
      isUnmounted = true;
    };
  }, [taskType]);
  const getTimeTitle = (type: any) => {
    let recName = '周环比';
    if (type !== 1) {
      recName = type === 2 ? '月环比' : '年环比';
    }
    return recName;
  };

  useEffect(() => {
    let isUnmounted = false;
    // 获取近7天新增病害统计
    const getRencentWeekInfo = async () => {
      const res = await getColInfo(1);
      if (!isUnmounted) {
        setWeekInfo(res.data);
      }
    };
    // 获取字典
    const getDict = async () => {
      const res = await getDictData({ type: 2, dictCodes: -1, dictFilterCodes: ['subfacility'] });
      if (!isUnmounted) {
        setDictOption(res || []);
      }
    };
    getDict();
    getRencentWeekInfo();
    return () => {
      isUnmounted = true;
      // abortController.abort(); // 在组件卸载时中断
    };
  }, []);
  const selectValue = (text: any) => {
    setTaskType(text);
  };
  // const reqErr = () => {
  //   message.error({
  //     content: '查询失败!',
  //     key: '查询失败!',
  //   });
  // };
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
        return (
          <div className="rowTdClass">
            <span className="weekRadioClass">{text !== '-' ? `${text}` : text}</span>
            <span className="weekRadioImgClass">
              {record?.ratioStatus ? <img src={getImg(record?.ratioStatus)} /> : null}
            </span>
          </div>
        );
      },
    },
  ];
  const handleLargeChart = (name: any, id: any) => {
    setModalTitle(name);
    if (id === 'areaPlotID') {
      setIsAreaVisible(true);
    } else if (id === 'leftPieID') {
      setIsLeftPieVisible(true);
    }
  };

  const onLoad = (dataSource: any) => {
    setTableData(dataSource);
  };
  const mpieLeftInfo = useMemo(() => {
    return { diseasePie, taskType }; // type:1水泥
  }, [diseasePie, taskType]);

  return (
    <>
      <div className={`${styles.leftPanel} ${styles.panelClass} `}>
        <Card type="inner" className={`${styles.cardBcg} ${styles.cardDiseaseStatics}`}>
          <div className={`${styles.cardTitle} ${styles.cardFirstTitle}`}>
            <div className={styles.cardTitleleft}>
              <span className={styles.titleLeftImg} />
              <EllipsisTooltip title={'近七天病害概况'}>
                <div className={styles.cardTxtName}>近七天病害概况</div>
              </EllipsisTooltip>
            </div>
            <div className={styles.highlight}></div>
          </div>
          <div className={styles.firstChartRow}>
            <span className={styles['name-second-title']}>新增病害统计</span>
            <span
              className={styles.cardTitleleftImg}
              onClick={() => {
                handleLargeChart('新增病害统计', 'areaPlotID');
              }}
            >
              <img className={styles.cardTitleImg} src={doLarger} />
            </span>
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

        <Card type="inner" className={`${styles.cardBcg} ${styles.cardDiseaseDis}`}>
          <div className={`${styles.cardTitle} ${styles.cardSecondTitle}`}>
            <div className={styles.firstChartRow}>
              <EllipsisTooltip title={'新增病害分布'}>
                <span className={styles['name-second-title']}>新增病害分布</span>
              </EllipsisTooltip>
              <span
                className={styles.cardTitleleftImg}
                onClick={() => {
                  handleLargeChart('新增病害分布', 'leftPieID');
                }}
              >
                <img className={styles.cardTitleImg} src={doLarger} />
              </span>
            </div>
            <Select
              popupClassName="dropdownSelectClass"
              placeholder="请选择"
              className="searchFacilityClass selectMg10"
              defaultValue={taskType}
              style={{ marginRight: 0 }}
              onChange={selectValue}
            >
              {dictOption?.map((item: any) => (
                <Option className="facClass" value={item?.dictKey} key={item?.dictKey}>
                  {item?.dictName}
                </Option>
              ))}
              {/* <Option className="facClass" value={1}>
                水泥路面
              </Option>
              <Option className="facClass" value={2}>
                沥青路面
              </Option>
              <Option className="facClass" value={3}>
                综合安全事件
              </Option> */}
            </Select>
          </div>
          <div className={styles.chartCommonClass}>
            {/* {useMemo(
              () =>
                diseasePie?.length > 0 ? (
                  <LeftPie type={taskType} pieInfo={diseasePie} />
                ) : (
                  <EmptyStatus customEmptyClass={styles.pieEmpty} />
                ),
              [taskType],
            )} */}
            {diseasePie?.length > 0 ? (
              <LeftPie type={mpieLeftInfo?.taskType} pieInfo={mpieLeftInfo?.diseasePie} />
            ) : (
              <EmptyStatus customEmptyClass={styles.pieEmpty} />
            )}
          </div>
        </Card>
        <Card type="inner" className={`${styles.cardBcg} ${styles.cardDiseaseCount}`}>
          <div className={`${styles.cardTitle} ${styles.cardSecondTitle}`}>
            <div className={styles.firstChartRow}>
              <EllipsisTooltip title={'道路病害数量TOP5'}>
                <span className={styles['name-second-title']}>道路病害数量TOP5</span>
              </EllipsisTooltip>
            </div>
            <ul className={styles.cardTitleRight}>
              {typeTimeList.map((it: any) => (
                <li
                  key={it?.type}
                  onClick={() => {
                    handleTime(it?.type || 1);
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
                request={getTop5Datas}
                params={{
                  type: typeTime,
                }}
                pagination={false}
                columns={customViewInfoColumns}
                // onRequestError={reqErr}
              />
            </ConfigProvider>
          </div>
        </Card>
      </div>
      {isAreaVisible ? (
        <AreaPlotModal
          name={modalTitle}
          modalShow={isAreaVisible}
          onCancel={() => setIsAreaVisible(false)}
        />
      ) : null}
      {isLeftPieVisible ? (
        <LeftPieModal
          name={modalTitle}
          modalShow={isLeftPieVisible}
          onCancel={() => setIsLeftPieVisible(false)}
        />
      ) : null}
    </>
  );
};

export default MapLeft;
