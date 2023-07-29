import React, { useState, useRef } from 'react';
import ProTable from '@ant-design/pro-table';
import HeadSearch from './HeadBox';
import { commonExport, commonRequest } from '../../../../../../utils/commonMethod';
import styles from '../styles.less';

const requestList = [
  { url: '/traffic/road/project/report', method: 'POST' },
  { url: '/traffic/road/project/export/report', method: 'post', blob: true },
];

const TechnicalStatusModal: React.FC = () => {
  const childRef = useRef<any>();
  const [tableData, setTableData] = useState<any>([]);
  const [laneId, setLaneId] = useState<any>(undefined);
  const [direction, setDirection] = useState<number>(0);

  // useEffect(() => {
  //   childRef?.current?.reload();
  // }, [tableData]);
  // const scroll = {
  //   x: 1400,
  //   y: isExist(['facilitymanage/TecStatus:btn_export'])
  //     ? 'calc(100vh - 302px)'
  //     : 'calc(100vh - 220px)',
  // };

  // const setkeywords = () => {
  //   ChildRef.current.onSet();
  // };
  const getTableData = async (directionVal: number, laneVal: any) => {
    const res = await commonRequest({
      ...requestList[0],
      params: {
        direct: directionVal,
        pavementId: laneVal,
        projectId: sessionStorage.getItem('road_detection_id'),
      },
    });
    childRef?.current?.reload();
    setTableData(res?.data);
  };
  const handleDirectInfo = (val: any, laneVals?: any) => {
    setDirection(val || 0);
    setLaneId(laneVals || undefined);
    getTableData(val, laneVals);
  };
  // const handleLaneInfo = (val: any,laneVals?: any) => {
  //   console.log('tab3',val,laneVals);
  //   setDirection(val || 0);
  //   setLaneId(laneVals || undefined);
  //   getTableData(val, laneVals);
  // };
  // useEffect(() => {
  //   console.log('getabledata',direction, laneId);
  //   getTableData(direction, laneId);
  // }, [laneId, direction]);
  const exportData = async () => {
    const params: any = {
      direct: direction,
      pavementId: laneId,
      projectId: sessionStorage.getItem('road_detection_id'),
    };
    commonExport({ ...requestList[1], params });
  };

  const columns: any = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'index',
      width: 50,
    },
    { title: '项目名称', key: 'projectName', dataIndex: 'projectName', ellipsis: true, width: 140 },
    {
      title: '道路名称',
      key: 'facilitiesName',
      dataIndex: 'facilitiesName',
      ellipsis: true,
      width: 150,
    },
    {
      title: '方向',
      key: 'direct',
      width: 60,
      dataIndex: 'direct',
      render: (_text: any, record: any) => {
        return <span>{record?.direct ? '下行' : '上行'}</span>;
      },
    },
    { title: '车道', key: 'pavementName', dataIndex: 'pavementName', width: 100, ellipsis: true },
    {
      title: '桩号',
      key: 'stakeNo',
      dataIndex: 'stakeNo',
      width: 160,
      ellipsis: true,
      render: (_text: any, record: any) => {
        return (
          <span>
            {record?.startPoint} - {record?.endPoint}
          </span>
        );
      },
    },
    { title: 'DR', key: 'damageRate', dataIndex: 'damageRate', ellipsis: true, width: 60 },
    { title: 'PQI', key: 'pqi', dataIndex: 'pqi', ellipsis: true, width: 60 },
    { title: 'PCI', key: 'pci', dataIndex: 'pci', ellipsis: true, width: 60 },
    { title: 'RQI', key: 'rqi', dataIndex: 'rqi', ellipsis: true, width: 60 },
    { title: 'TCI', key: 'tci', dataIndex: 'tci', ellipsis: true, width: 60 },
    { title: '检测时间', key: 'checkTime', dataIndex: 'checkTime', ellipsis: true, width: 160 },
  ];

  return (
    <div className={`${styles['tab-panel-box']}}`}>
      <div className={styles['top-head-box']}>
        <HeadSearch
          handleDirectInfo={handleDirectInfo}
          // handleLaneInfo={handleLaneInfo}
          exportData={exportData}
        />
      </div>
      <div className={`${styles['table-box-tabs']} ${styles['table-box-tech-tabs']}`}>
        <ProTable
          columns={columns}
          dataSource={tableData}
          rowKey="id"
          rowSelection={false}
          scroll={{ x: '100%', y: 'calc(80vh - 50px - 172px)' }}
          pagination={false}
          tableAlertRender={false}
          toolBarRender={false}
          search={false}
          actionRef={childRef}
        />
      </div>
    </div>
  );
};
export default TechnicalStatusModal;
