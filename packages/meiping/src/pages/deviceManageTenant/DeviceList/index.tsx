import React from 'react';
import DeviceList from 'baseline/src/pages/DeviceManageTenant/DeviceList';

export default (): React.ReactNode => {
  const deviceEnumType = {
    0: '正常',
    1: '异常',
  };
  const columns = [
    {
      title: '设备编号',
      dataIndex: 'deviceId',
      key: 'deviceId',
      width: 160,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
      width: 160,
      ellipsis: true,
      valueEnum: {
        0: { text: '轻量化车载设备V1.0' },
      },
    },
    {
      title: '系统版本',
      dataIndex: 'systemVersion',
      key: 'systemVersion',
      width: 80,
      ellipsis: true,
      valueEnum: {
        0: { text: '1.0' },
      },
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 120,
      ellipsis: true,
    },
    {
      title: '设备所属单位',
      dataIndex: 'deptName',
      key: 'deptName',
      width: 160,
      ellipsis: true,
    },
    {
      title: '巡检员姓名',
      dataIndex: 'inspectorName',
      key: 'inspectorName',
      width: 160,
      ellipsis: true,
    },
    {
      title: '联系方式',
      dataIndex: 'inspectorTel',
      key: 'inspectorTel',
      width: 160,
      ellipsis: true,
    },
    {
      title: '在线状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      valueEnum: {
        0: { text: '在线', status: 'Success' },
        1: { text: '离线', status: 'Default' },
        2: { text: '离线', status: 'Default' },
      },
    },
    {
      title: '设备状态',
      dataIndex: 'deviceStatus',
      key: 'deviceStatus',
      width: 100,
      render: (deviceStatus: any, record: any) => {
        if (record.status !== 0) {
          return '-';
        }
        const statusname = deviceStatus !== undefined ? deviceEnumType[record?.deviceStatus] : '-';
        let color = '';
        if (deviceStatus !== '-') {
          color = deviceStatus === '0' ? 'rgba(68, 142, 73, 1)' : 'rgba(220, 45, 45, 1)';
        } else {
          color = 'rgba(0, 0, 0, 0.85)';
        }

        return <span style={{ color }}>{statusname || '-'}</span>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'crtTime',
      width: 160,
      key: 'crtTime',
      textWrap: 'noWrap',
      ellipsis: true,
    },
  ];
  return <DeviceList importColumns={columns}></DeviceList>;
};
