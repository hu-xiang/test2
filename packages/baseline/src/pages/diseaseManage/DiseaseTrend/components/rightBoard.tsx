import { Card, message, ConfigProvider } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import styles from '../styles.less';
import PieGroup from './pieGroup';
import { exportCom } from '../../../../utils/exportCom';
import EmptyStatus from '../../../../components/TableEmpty';
import CardTitle from './CardTitle';
import { getDiseaseSevenDist, exportInfo, getRoadDamageSort, getRoadRqi } from '../service';
import { useBoardScrollObj } from '../../../../utils/tableScrollSet';
import { typeVals } from '../data.d';
import { useModel } from 'umi';
import MapRightBottom from './mapRightBottom';

// const tableMap = [
//   { key: '公路', id: 1 },
//   { key: '城市道路', id: 0 },
// ];
const RightBoard: React.FC = () => {
  const { fkId } = useModel<any>('trend');
  const actionLeft = useRef<any>();
  const actionRight = useRef<any>();
  const headRef: any = useRef<typeof CardTitle>();
  const [leftTableData, setLeftTableData] = useState<any[]>([]);
  const [rightTableData, setRightTableData] = useState<any[]>([]);
  const scrollLeftObj: any = useBoardScrollObj(48, 48, '.fac-rate-table2', leftTableData);
  const scrollRightObj: any = useBoardScrollObj(48, 48, '.fac-rate-table1', rightTableData);
  const [btnDistributionType, setBtnDistributionType] = useState(1); // 近7天新增病害分布对应的类型,周月年
  const [diseaseDistrNums, setDiseaseDistrNums] = useState<any>({
    liqingData: [],
    cementData: [],
    safeEvents: [],
  });
  useEffect(() => {
    if (!fkId) {
      if (headRef?.current) {
        headRef?.current?.setDefalutVal();
      }
    }
  }, [fkId]);
  // 表格请求
  useEffect(() => {
    let isUnmounted = false;
    const getDatas = async (type: number) => {
      const cementData: any[] = [];
      const liqingData: any[] = [];
      const safeDatas: any[] = [];
      let rec: any = {};
      let isAllZero1: boolean = false;
      let isAllZero2: boolean = false;
      let isAllZero3: boolean = false;
      rec = await getDiseaseSevenDist({ facilitiesId: '', type, taskType: '' });
      if (rec?.status === 0 && rec?.data && JSON.stringify(rec?.data) !== '{}') {
        Object.keys(rec?.data).forEach((it: any) => {
          if (it === 'taskCementData') {
            const recval: any[] = rec?.data[it] && rec?.data[it]?.length > 0 ? rec?.data[it] : [];
            if (recval?.length > 0) {
              isAllZero1 = recval.some((itr: any) => itr.total > 0);
              if (isAllZero1) {
                recval.forEach((itm: any) => {
                  cementData.push({ type: itm?.diseaseTypeName, nums: itm?.total });
                });
              }
            }
          } else if (it === 'taskLiQingData') {
            const recval2: any[] = rec?.data[it] && rec?.data[it]?.length > 0 ? rec?.data[it] : [];
            if (recval2?.length > 0) {
              isAllZero2 = recval2.some((itr: any) => itr.total > 0);
              if (isAllZero2) {
                recval2.forEach((itm: any) => {
                  liqingData.push({ type: itm?.diseaseTypeName, nums: itm?.total });
                });
              }
            }
          } else if (it === 'taskSafeEvent') {
            const recval3: any[] = rec?.data[it] && rec?.data[it]?.length > 0 ? rec?.data[it] : [];
            if (recval3?.length > 0) {
              isAllZero3 = recval3.some((itr: any) => itr.total > 0);
              if (isAllZero3) {
                recval3.forEach((itm: any) => {
                  safeDatas.push({ type: itm?.diseaseTypeName, nums: itm?.total });
                });
              }
            }
          }
        });
      }
      if (!isUnmounted) {
        setDiseaseDistrNums({
          liqingData,
          cementData,
          safeEvents: safeDatas,
        });
      }
    };
    getDatas(btnDistributionType);
    return () => {
      isUnmounted = true;
    };
  }, [btnDistributionType]);

  useEffect(() => {
    let isUnmounted = false;
    const getTableDatas = async () => {
      const leftDatas: any[] = [];
      const rightDatas: any[] = [];
      let rec: any = {};
      let rqi: any = {};
      rec = await getRoadDamageSort({ facilitiesId: '', roadType: '' });
      if (['meiping', 'changsha'].includes(Platform_Flag)) {
        rqi = await getRoadRqi({ roadType: 1 });
        if (rqi?.status === 0 && rqi?.data?.length) {
          rqi?.data.forEach((it: any) => {
            if (it?.roadType && Number(it?.roadType) === 1) {
              rightDatas.push(it);
            }
          });
        }
      }
      if (rec?.status === 0 && rec?.data?.length) {
        rec?.data.forEach((it: any) => {
          if (it?.roadType && Number(it?.roadType) === 1) {
            leftDatas.push(it);
          } else {
            /* eslint-disable */
            if (Platform_Flag !== 'meiping') {
              rightDatas.push(it);
            }
            /* eslint-enable */
          }
        });
      }
      if (!isUnmounted) {
        setLeftTableData(leftDatas);
        setRightTableData(rightDatas);
      }
    };
    getTableDatas();
    return () => {
      isUnmounted = true;
    };
  }, []);
  const handleChangeType = (type: number) => {
    setBtnDistributionType(type);
  };
  const emptyStatus = () => {
    return <EmptyStatus isBlack={false} />;
  };

  const handleExport = async (typename: string) => {
    let url: string = '';
    let params: any;
    switch (typename) {
      case 'pieGroupNum':
        url = 'trend/pieChartExport';
        params = { facilitiesId: '', type: btnDistributionType, taskType: '' };
        break;
      case 'avgRate':
        url = 'trend/avgSortExport';
        params = { roadType: Platform_Flag !== 'meiping' ? null : 1 };
        break;
      case 'rqiRate':
        url = 'trend/rqiAvgSortExport';
        params = { roadType: 1 };
        break;
      default:
        url = 'trend/pieChartExport';
        params = { facilitiesId: '', type: '' };
        break;
    }
    const res = await exportInfo(url, params);
    exportCom(res);
    message.success({
      content: '导出成功',
      key: '导出成功',
    });
  };
  const getEmptyName = (val: number) => {
    let rec: string = '';
    if (val === 1 && leftTableData?.length === 0) {
      rec = 'empty-fac-table';
    } else if (val === 0 && rightTableData?.length === 0) {
      rec = 'empty-fac-table';
    }
    return rec;
  };
  const customViewInfoColumns: any = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'index',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '道路名称',
      dataIndex: 'facilityName',
      key: 'facilityName',
      align: 'center',
      ellipsis: true,
    },
    {
      title: 'PCI参考值',
      dataIndex: 'pci',
      key: 'pci',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '等级',
      dataIndex: 'pciLevel',
      key: 'pciLevel',
      align: 'center',
      width: 80,
    },
  ];
  // const onLeftLoad = (dataSource: any) => {
  //   setLeftTableData(dataSource);
  // };
  // const onRightLoad = (dataSource: any) => {
  //   setRightTableData(dataSource);
  // };

  return (
    <div className={styles['right-board']}>
      <Card type="inner" className={`${styles['card-left-item']} card-left-item`}>
        <CardTitle
          title={`近${typeVals[btnDistributionType]}新增病害数量分布(个)`}
          flagId={'pieGroupNum'}
          onRef={headRef}
          handleExport={(name: string) => {
            handleExport(name);
          }}
          handleButton={(val: number) => {
            handleChangeType(val);
          }}
        />
        <div className={styles['card-pie-container']}>
          <PieGroup dataInfo={diseaseDistrNums} />
        </div>
      </Card>
      {Platform_Flag !== 'meiping' ? (
        <MapRightBottom />
      ) : (
        // <Card type="inner" className={`${styles['card-left-item']} card-left-item`}>
        //   <CardTitle
        //     title={'道路PCI排名'}
        //     flagId={'avgRate'}
        //     isShow={false}
        //     handleExport={(name: string) => {
        //       handleExport(name);
        //     }}
        //   />
        //   <div className={styles['card-table-container']}>
        //     {tableMap.map((it: any) => (
        //       <React.Fragment key={it?.id}>
        //         <div className={styles['table-item']}>
        //           <div className={styles['table-head']}>{it?.key}</div>
        //           <ConfigProvider renderEmpty={emptyStatus}>
        //             <ProTable<any>
        //               rowKey="facilityId"
        //               toolBarRender={false}
        //               search={false}
        //               actionRef={it?.id === 1 ? actionRight : actionLeft}
        //               className={`fac-rate-table fac-rate-table${it?.id + 1}  ${getEmptyName(
        //                 it?.id,
        //               )}`}
        //               scroll={{ y: it?.id === 1 ? scrollLeftObj?.y : scrollRightObj?.y }}
        //               dataSource={it?.id === 1 ? leftTableData : rightTableData}
        //               // onLoad={it?.id===1?onLeftLoad:onRightLoad}
        //               tableAlertRender={false}
        //               pagination={false}
        //               columns={customViewInfoColumns}
        //               // onRequestError={reqErr}
        //             />
        //           </ConfigProvider>
        //         </div>
        //       </React.Fragment>
        //     ))}
        //   </div>
        // </Card>
        <Card type="inner" className={`${styles['card-left-item']} card-left-item`}>
          <CardTitle
            isExport={false}
            title={'路面状况排名'}
            flagId={'avgRate'}
            isShow={false}
            handleExport={(name: string) => {
              handleExport(name);
            }}
          />
          <div className={styles['card-table-container']}>
            <React.Fragment key={1}>
              <div className={styles['table-item']}>
                <div className={styles['table-head']}>
                  <div>道路PCI排名</div>
                  <div
                    className={styles['table-head-export']}
                    onClick={() => handleExport('avgRate')}
                  >
                    导出
                  </div>
                </div>
                <ConfigProvider renderEmpty={emptyStatus}>
                  <ProTable<any>
                    rowKey="facilityId"
                    toolBarRender={false}
                    search={false}
                    actionRef={actionRight}
                    className={`fac-rate-table fac-rate-table${1 + 1}  ${getEmptyName(1)}`}
                    scroll={{ y: scrollLeftObj?.y }}
                    dataSource={leftTableData}
                    // onLoad={it?.id===1?onLeftLoad:onRightLoad}
                    tableAlertRender={false}
                    pagination={false}
                    columns={customViewInfoColumns}
                    // onRequestError={reqErr}
                  />
                </ConfigProvider>
              </div>
            </React.Fragment>
            <React.Fragment key={0}>
              <div className={styles['table-item']}>
                <div className={styles['table-head']}>
                  <div>道路RQI排名</div>
                  <div
                    className={styles['table-head-export']}
                    onClick={() => handleExport('rqiRate')}
                  >
                    导出
                  </div>
                </div>
                <ConfigProvider renderEmpty={emptyStatus}>
                  <ProTable<any>
                    rowKey="facilityId"
                    toolBarRender={false}
                    search={false}
                    actionRef={actionLeft}
                    className={`fac-rate-table fac-rate-table${0 + 1}  ${getEmptyName(0)}`}
                    scroll={{ y: scrollRightObj?.y }}
                    dataSource={rightTableData}
                    // onLoad={it?.id===1?onLeftLoad:onRightLoad}
                    tableAlertRender={false}
                    pagination={false}
                    columns={[
                      {
                        title: '序号',
                        dataIndex: 'index',
                        valueType: 'index',
                        align: 'center',
                        ellipsis: true,
                      },
                      {
                        title: '道路名称',
                        dataIndex: 'facilityName',
                        key: 'facilityName',
                        align: 'center',
                        ellipsis: true,
                      },
                      {
                        title: 'RQI参考值',
                        dataIndex: 'rqi',
                        key: 'rqi',
                        align: 'center',
                        ellipsis: true,
                      },
                      {
                        title: '等级',
                        dataIndex: 'rqiLevel',
                        key: 'rqiLevel',
                        align: 'center',
                        width: 80,
                      },
                    ]}
                    // onRequestError={reqErr}
                  />
                </ConfigProvider>
              </div>
            </React.Fragment>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RightBoard;
