import { Card, message, ConfigProvider } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles.less';
import BarChart from '../../../../components/BarChart';
import { exportCom } from '../../../../utils/exportCom';

import { typeVals } from '../data.d';
import CardTitle from './CardTitle';
import { useModel } from 'umi';

import ProTable from '@ant-design/pro-table';
import EmptyStatus from '../../../../components/TableEmpty';
// import { useBoardScrollObj } from '../../../../utils/tableScrollSet';
import { getFacSevenDisease, exportInfo, getRoadDamageSort } from '../service';

let columns: any = [];
const MapLeft: React.FC = () => {
  const { fkId } = useModel<any>('trend');
  // const headDiseaRef: any = useRef<typeof CardTitle>();
  const headFacRef: any = useRef<typeof CardTitle>();
  const pciTitleRef: any = useRef<typeof CardTitle>();
  // const [btnDiseaseType, setBtnDiseaseType] = useState(1); // 近7天新增病害分布对应的类型
  const [btnfacType, setBtnfacType] = useState(1); // 近7天设施新增病害数量对应的类型
  const [pciRoadType, setPciRoadType] = useState(1); // 近7天设施新增病害数量对应的类型
  const [sevenFacDisNums, setSevenFacDisNums] = useState<any[]>([]); // 近7天设施新增病害数量

  const [tableData, setTableData] = useState<any[]>([]); // 近7天设施新增病害尺寸
  const actionRight = useRef<any>();
  // const scrollObj: any = useBoardScrollObj(48, 48, '.fac-rate-tableX', tableData);
  useEffect(() => {
    // setBtnDistributionType(1);
    // setDiseaseType(2);
    // setBtnDiseaseType(1);
    setBtnfacType(1);
    if (headFacRef?.current) {
      headFacRef?.current?.setDefalutVal();
    }

    if (pciTitleRef?.current) {
      pciTitleRef?.current?.setDefalutVal();
    }
  }, [fkId]);
  // 为防止切换页面后请求还在继续
  // useEffect(() => {
  //   let isUnmounted = false;
  //   (async () => {
  //     const res = await getDiseaseSevenNums({ facilitiesId: fkId, type: btnDiseaseType });
  //     if (!isUnmounted) {
  //       setSevenDiseaNums(res.data);
  //     }
  //   })();

  //   return () => {
  //     isUnmounted = true;
  //   };
  // }, [btnDiseaseType, fkId]);
  // 1:公路 0 城市道路
  const handleGetTableData = async (roadType: number) => {
    const res = await getRoadDamageSort({ facilitiesId: '', roadType });
    if (res.status === 0) {
      setTableData(res?.data || []);
    }
  };

  useEffect(() => {
    columns = [
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
        width: 60,
      },
    ];

    handleGetTableData(1);
  }, []);

  useEffect(() => {
    let isUnmounted = false;
    if (!fkId) {
      (async () => {
        const res = await getFacSevenDisease({ facilitiesId: fkId, type: btnfacType });
        if (!isUnmounted) {
          if (res?.data) {
            const recval: any[] = [];
            if (res?.data && res?.data?.length) {
              res?.data.forEach((it: any) => {
                recval.push({ x: it?.facilitiesName, y: it?.total ? Number(it?.total) : 0 });
              });
            }
            setSevenFacDisNums(recval);
          }
        }
      })();
    }
    return () => {
      isUnmounted = true;
    };
  }, [btnfacType, fkId]);

  const handleChangeFacType = (type: number) => {
    setBtnfacType(type);
  };
  const handleExport = async (typename: string) => {
    let url: string = '';
    let params: any;
    switch (typename) {
      case 'facNum':
        url = 'trend/barChartExport';
        params = { facilitiesId: fkId, type: btnfacType };
        break;
      case 'pci':
        url = '/trend/avgSortExport';
        params = { roadType: pciRoadType };
        break;
      default:
        break;
    }
    const res = await exportInfo(url, params);
    exportCom(res);
    message.success({
      content: '导出成功',
      key: '导出成功',
    });
  };

  const emptyStatus = () => {
    return <EmptyStatus isBlack={false} />;
  };

  const handleRoadTypeChange = (type: any) => {
    setPciRoadType(type);
    handleGetTableData(type);
  };
  return (
    <div className={styles.mapRightBottom}>
      <div className={styles.barArea}>
        <Card type="inner" className={`${styles['card-left-item']} card-left-item`}>
          <CardTitle
            title={`近${typeVals[btnfacType]}道路新增病害数量(个)`}
            onRef={headFacRef}
            flagId={'facNum'}
            handleExport={(name: string) => {
              handleExport(name);
            }}
            handleButton={(val: number) => {
              handleChangeFacType(val);
            }}
          />
          <div className={`${styles['card-box-content']}, card-box-content`}>
            <BarChart
              dataInfo={sevenFacDisNums}
              unit={'里程'}
              customName={styles['plot-empty']}
              isModal={false}
              gradiantColor="l(90) 0:#4684F7 1: rgba(55, 87, 255, 0)"
              isBlack={false}
            />
          </div>
        </Card>
      </div>
      <div className={styles.tableArea}>
        <Card type="inner" className={`${styles['card-left-item']} card-left-item`}>
          <CardTitle
            title={`道路PCI排名`}
            onRef={pciTitleRef}
            flagId={'pci'}
            isShow={false}
            isPCICard={true}
            handleExport={(name: string) => {
              handleExport(name);
            }}
            handleButton={(val: number) => {
              handleChangeFacType(val);
            }}
            handleRoadTypeChange={(type: any) => {
              handleRoadTypeChange(type);
            }}
          />
          <div className={styles['card-box-content']}>
            <ConfigProvider renderEmpty={emptyStatus}>
              <ProTable<any>
                rowKey="facilityId"
                toolBarRender={false}
                search={false}
                actionRef={actionRight}
                className={`fac-rate-table fac-rate-tableX ${
                  !tableData?.length ? 'empty-fac-table' : ''
                }`}
                scroll={{ y: 160 }}
                dataSource={tableData}
                tableAlertRender={false}
                pagination={false}
                columns={columns}
                // onRequestError={reqErr}
              />
            </ConfigProvider>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MapLeft;
