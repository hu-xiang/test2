import React from 'react';
import CommonDetection from '../CommonDetection';
import { Progress } from 'antd';

export default (): React.ReactElement => {
  const columns: any = [
    {
      title: '名称',
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
      title: '任务进度',
      key: 'imageNums',
      width: 250,
      render: (text: any) => (
        <div>
          <span>
            <Progress
              percent={((text.taskSchedule * 1) / text.imageNums) * 1 * 100}
              strokeWidth={5}
              showInfo={false}
              strokeColor="#54A325"
              style={{ marginRight: 10, width: '57%' }}
            />
          </span>
          <span style={{ color: '#1890ff' }}>{text.taskSchedule}</span> /{' '}
          <span>{text.imageNums}</span>
        </div>
      ),
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
    {
      title: ' 检测速率（张/秒）',
      key: 'speed',
      width: 150,
      render: (text: any) => {
        if (text.timeSecond !== '0' && text.timeSecond !== null) {
          if (text.imageNums / text.timeSecond === 0) {
            return 0;
          }
          return (text.imageNums / text.timeSecond).toFixed(1);
        }
        return '-';
      },
    },
    {
      title: '创建人',
      dataIndex: 'crtName',
      key: 'crtName',
      width: 140,
    },
  ];
  return <CommonDetection type="pic" columns={columns}></CommonDetection>;
};
