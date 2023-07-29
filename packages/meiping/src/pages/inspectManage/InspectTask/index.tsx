import React from 'react';
import InspectTask from 'baseline/src/pages/inspectManage/InspectTask';
import { Badge } from 'antd';

export default (): React.ReactNode => {
  const colorStatusEnum: any = {
    0: '#999999',
    1: '#FACC2A',
    2: '#9949FF',
    3: '#54A325',
    4: '#FF0000',
    5: '#999999',
  };

  const colums = [
    {
      title: '道路名称',
      dataIndex: 'facilitiesName',
      key: 'facilitiesName',
      width: 160,
      ellipsis: true,
    },
    {
      title: '道路编码',
      dataIndex: 'roadSection',
      key: 'roadSection',
      width: 160,
      ellipsis: true,
    },
    // {
    //   title: '道路类型',
    //   dataIndex: 'facilitiesTypeName',
    //   key: 'facilitiesTypeName',
    //   width: 80,
    //   ellipsis: true,
    // },
    {
      title: '线路里程（km）',
      dataIndex: 'roadNum',
      key: 'roadNum',
      width: 120,
      ellipsis: true,
      render: (_text: any, record: any) => {
        return (
          <span>
            {record?.roadNum || record?.roadNum === 0 || record?.roadNum === '0'
              ? (record?.roadNum / 1000)?.toFixed(3)
              : '-'}
          </span>
        );
      },
    },
    {
      title: '管养单位',
      dataIndex: 'managementUnit',
      key: 'managementUnit',
      ellipsis: true,
      width: 150,
    },
    {
      title: '巡检设备',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 100,
      ellipsis: true,
    },
    {
      title: '巡检员',
      dataIndex: 'inspectorName',
      key: 'inspectorName',
      width: 100,
      ellipsis: true,
    },
    {
      title: '任务状态',
      dataIndex: 'taskStatusName',
      key: 'taskStatusName',
      width: 100,
      ellipsis: true,
      render: (text: any, item: any) => {
        return <Badge color={colorStatusEnum[item.taskStatus]} text={item.taskStatusName} />;
      },
    },
    {
      title: '完成度',
      dataIndex: 'completionDegree',
      key: 'completionDegree',
      width: 80,
      ellipsis: true,
    },
    {
      title: '任务开始日期',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 160,
    },
    {
      title: '任务期限',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 160,
    },
    {
      title: '巡检完成时间',
      dataIndex: 'completeTime',
      key: 'completeTime',
      width: 160,
    },
  ];
  return <InspectTask importColumns={colums}></InspectTask>;
};
