import React from 'react';
import CommonDetection from '../CommonDetection';

export default (): React.ReactElement => {
  const columns: any = [
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      width: 150,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: '任务状态',
      dataIndex: 'taskState',
      key: 'taskState',
      valueEnum: {
        0: { text: '未开始', status: 'Default' },
        1: { text: '排队中', status: 'Processing' },
        2: { text: '执行中', status: 'Processing' },
        3: { text: '已完成', status: 'Success' },
        99: { text: '异常', status: 'Error' },
      },
      width: 100,
    },
    {
      title: '创建人',
      dataIndex: 'crtName',
      key: 'crtName',
      width: 140,
    },
    {
      title: '模型名称',
      dataIndex: 'modelName',
      key: 'modelName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '任务开始时间',
      dataIndex: 'taskStartTime',
      key: 'taskStartTime',
      width: 150,
      ellipsis: true,
    },
    {
      title: '任务完成时间',
      dataIndex: 'updTime',
      key: 'updTime',
      render: (text: any, record: any) => {
        return record.taskState === 3 ? record.updTime : '-';
      },
      width: 150,
      ellipsis: true,
    },
    {
      title: '任务耗时（秒）',
      dataIndex: 'timeSecond',
      key: 'speed',
      width: 120,
    },
  ];
  return <CommonDetection type="video" columns={columns}></CommonDetection>;
};
