import { Card, Select, ConfigProvider } from 'antd';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import FacilityPie from '../../../../src/components/FacilityPie';
import EmptyStatus from '../../../../src/components/TableEmpty';
import ProTable from '@ant-design/pro-table';
import doLarger from '../../../../src/assets/img/InspectionBoard/doLarger.svg';
import SubFacilityDis from './SubFacilityDis';
import DetailFacility from './detailFacility';
import { getFacDistribution, getSubFacDistribution, getAvgSort } from '../service';
import EllipsisTooltip from '../../../../src/components/EllipsisTooltip';
import { useTop5ListScrollObj } from '../../../../src/utils/tableScrollSet';
import styles from '../../InspectionBoard/styles.less';
import FacilityPieModal from './FacModal';
import type { SorterResult } from 'antd/es/table/interface';

const { Option } = Select;

type Iprop = {
  singleProject: boolean;
  projectId: string;
  clearProject: () => void;
  extraData?: any;
  programName?: string;
};
interface DataType {
  pci: number;
  rqi: number;
  lastTime: string;
  facilityName: string;
}
let isUnmountLeft = false;
const BoardLeft: React.FC<Iprop> = (props: any) => {
  const { singleProject, extraData } = props;
  const [sortedInfo, setSortedInfo] = useState<SorterResult<any>>({});
  const [facilityTypeList, setFacilityTypeList] = useState<any[]>([]);
  const actionRef = useRef<any>();
  const [modalTitle, setModalTitle] = useState('图表放大图');
  const [tableData, setTableData] = useState<any>([]);
  const [isFacilityVisible, setIsFacilityVisible] = useState(false);
  const [facilityData, setFacilityData] = useState<any>([]);
  const [dataRoadInfo, setDataRoadInfo] = useState<any[]>([]);
  const scrollObj: any = useTop5ListScrollObj(tableData);

  const [subFacData, setSubFacData] = useState<any>({});
  const [roadType, setRoadType] = useState<number>(
    ['changsha'].includes(props?.programName) || extraData?.isMpgs ? 1 : 0,
  ); // 默认城市道路
  const [topRoadType, setTopRoadType] = useState<number>(
    ['changsha'].includes(props?.programName) || extraData?.isMpgs ? 1 : 0,
  );

  useEffect(() => {
    isUnmountLeft = false;
    setFacilityTypeList([
      { label: '城市道路', value: 0 },
      { label: '公路', value: 1 },
    ]);
    return () => {
      isUnmountLeft = true;
    };
  }, []);

  // 附属设施数量分布
  const getSubDistribution = async () => {
    const rec = await getSubFacDistribution();
    const facInfo = {
      井盖: '0',
      交通信号灯: '0',
      标志标牌: '0',
      电子情报板: '0',
      龙门架: '0',
      // 里程桩: '0',
    };

    if (rec?.status === 0 && rec?.data?.length && !isUnmountLeft) {
      rec?.data?.forEach((it: any) => {
        if (it.name) {
          facInfo[it.name] = it?.num;
        }
      });
      setSubFacData(facInfo);
    }
  };

  const selectValue = (text: any) => {
    setRoadType(text);
  };
  const selectRoadValue = (text: any) => {
    setTopRoadType(text);
  };

  const getFacilityTop5Data = async (type: number) => {
    let facdata: any = [];
    const rec = await getAvgSort({ roadType: type });
    if (!isUnmountLeft) {
      if (rec?.status === 0) {
        if (!rec?.data || rec?.data?.length === 0) {
          facdata = [];
        } else {
          facdata = rec?.data
            .map((it: any, index: number) => {
              return {
                ...it,
                id: index,
                pci: it?.pci?.toFixed(2),
                rqi: it?.rqi?.toFixed(2),
              };
            })
            ?.sort((a: any, b: any) => a.pci - b.pci);
        }
      }
      setTableData(facdata);
      setFacilityData(facdata);
    }
  };
  useEffect(() => {
    // console.log('singleProject', topRoadType, singleProject);
    if (singleProject) {
      return;
    }
    getFacilityTop5Data(topRoadType);
    actionRef.current.reload();
  }, [topRoadType]);

  const customViewInfoColumns: any = [
    {
      title: '排名',
      dataIndex: 'index',
      valueType: 'index',
      ellipsis: true,
      // width: 40,
    },
    {
      title: '道路名称',
      dataIndex: 'facilityName',
      key: 'facilityName',
      // width: 60,
      ellipsis: true,
    },
    {
      title: 'PCI参考值',
      dataIndex: 'pci',
      key: 'pci',
      // sortOrder: "descend",
      sorter: (a: any, b: any) => a.pci - b.pci,
      sortOrder: sortedInfo.columnKey === 'pci' ? sortedInfo.order : null,
      // width: 60,
      ellipsis: true,
    },
    {
      title: 'RQI参考值',
      dataIndex: 'rqi',
      key: 'rqi',
      sorter: (a: any, b: any) => a.rqi - b.rqi,
      sortOrder: sortedInfo.columnKey === 'rqi' ? sortedInfo.order : null,
      // sortOrder: "descend",
      ellipsis: true,
    },
  ];
  const handleLargeChart = (name: any, id: any) => {
    setModalTitle(name);
    if (id === 'facilityPieID') {
      setIsFacilityVisible(true);
    }
  };
  const getRoadDistributeData = async (type: number) => {
    const rec = await getFacDistribution({ roadType: type });
    const roadDatas: any = [];
    let isAllZero: boolean = true;
    if (!isUnmountLeft) {
      if (rec?.status === 0 && rec?.data?.length > 0) {
        rec?.data.forEach((it: any) => {
          if (it?.num) {
            isAllZero = false;
          }
          roadDatas.push({ type: it?.type, nums: it?.num ? Number(it?.num) : 0 });
        });
      }
      setDataRoadInfo(!isAllZero ? roadDatas : []);
    }
  };
  // 0城市道路，1公路
  useEffect(() => {
    getRoadDistributeData(roadType);
  }, [roadType]);

  const disInfo = useMemo(() => {
    const newObj: any = { datas: dataRoadInfo, type: roadType };
    return { ...newObj };
  }, [dataRoadInfo]);

  const handleBack = () => {
    props?.clearProject();
  };

  useEffect(() => {
    getSubDistribution();
  }, []);

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setSortedInfo(sorter as SorterResult<DataType>);
  };

  return (
    <>
      <div className={`${styles.leftPanel} ${styles.panelClass} `}>
        {!singleProject ? (
          <>
            <Card type="inner" className={`${styles.cardBcg} ${styles['card-facility-road']}`}>
              <div className={`${styles.cardTitle} ${styles.cardFirstTitle}`}>
                <div className={styles.cardTitleleft}>
                  <span className={styles.titleCommonImg}></span>
                  <EllipsisTooltip title={'道路等级分布'}>
                    <span className={styles.cardTxtName}>{'道路等级分布'}</span>
                  </EllipsisTooltip>
                  {!(extraData?.isMpgs || ['changsha'].includes(props?.programName)) && (
                    <span
                      className={styles.cardTitleleftImg}
                      onClick={() => {
                        handleLargeChart('道路等级分布', 'facilityPieID');
                      }}
                    >
                      <img className={styles.cardTitleImg} src={doLarger} />
                    </span>
                  )}
                </div>
                {!(extraData?.isMpgs || ['changsha'].includes(props?.programName)) && (
                  <Select
                    popupClassName="dropdownSelectClass"
                    placeholder="请选择"
                    className="searchFacilityClass selectMg10"
                    defaultValue={0}
                    style={{ marginRight: 0 }}
                    onChange={selectValue}
                  >
                    {facilityTypeList.map((item: any) => (
                      <Option className="facClass" key={item.value} value={item.value}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>
                )}
                <div className={styles.highlight}></div>
              </div>
              <div className={styles['chart-first-row']}>
                <FacilityPie type={disInfo?.type} dataInfo={disInfo?.datas} platform={'defalut'} />
              </div>
            </Card>
            <Card
              type="inner"
              className={`${styles.cardBcg} ${styles['card-facility-distribution']}`}
            >
              <div className={`${styles.cardTitle} ${styles['card-second-border-title']}`}>
                <div className={styles.firstChartRow}>
                  <span className={styles.titleCommonImg}></span>
                  <EllipsisTooltip title={'附属设施数量分布'}>
                    <span className={styles['card-name-light-color']}>附属设施数量分布</span>
                  </EllipsisTooltip>
                </div>
                <div className={styles.highlight}></div>
              </div>
              <div className={styles['card-faclity-nums']}>
                <SubFacilityDis facInfo={subFacData} />
              </div>
            </Card>
            <Card type="inner" className={`${styles.cardBcg} ${styles['card-facilty-table']}`}>
              <div className={`${styles.cardTitle} ${styles['card-second-border-title']}`}>
                <div className={`${styles.cardTitleleft} ${styles['width-limit']}`}>
                  <span className={styles.titleCommonImg}></span>
                  <EllipsisTooltip title={'路面状况排名'}>
                    <span className={styles.cardTxtName}>{'路面状况排名'}</span>
                  </EllipsisTooltip>
                </div>
                {!(extraData?.isMpgs || ['changsha'].includes(props?.programName)) && (
                  <Select
                    popupClassName="dropdownSelectClass"
                    placeholder="请选择"
                    className="searchFacilityClass selectMg10"
                    defaultValue={0}
                    style={{ marginRight: 0 }}
                    onChange={selectRoadValue}
                  >
                    {facilityTypeList.map((item: any) => (
                      <Option className="facClass" key={item.value} value={item.value}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>
                )}
                <div className={styles.highlight}></div>
              </div>
              <div className={styles['fac-table']}>
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
                    tableAlertRender={false}
                    dataSource={facilityData}
                    pagination={false}
                    columns={customViewInfoColumns}
                    onChange={handleTableChange}
                    // onRequestError={reqErr}
                  />
                </ConfigProvider>
              </div>
            </Card>
          </>
        ) : (
          <DetailFacility
            projectId={props?.projectId}
            handleBack={handleBack}
            extraData={extraData}
            // isSingleProject={singleProject}
          />
        )}
      </div>
      {isFacilityVisible ? (
        <FacilityPieModal
          name={modalTitle}
          projectId={props?.projectId}
          isSingleProject={props?.singleProject}
          modalShow={isFacilityVisible}
          onCancel={() => {
            setIsFacilityVisible(false);
          }}
        />
      ) : null}
    </>
  );
};

export default BoardLeft;
