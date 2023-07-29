import React from 'react';
import FacilityList from 'baseline/src/pages/FacilityManage/FacilityList';

export default (): React.ReactNode => {
  const columns: any = [
    { title: '序号', key: 'id', width: 100, type: 'sort' },
    { title: '道路名称', key: 'facilitiesName', width: 200 },
    { title: '道路编码', key: 'roadSection', width: 200 },
    {
      title: '道路类别',
      key: 'roadType',
      width: 120,
      valueEnum: {
        0: '城市道路',
        1: '公路',
      },
    },
    {
      title: '道路等级',
      key: 'roadLevel',
      width: 120,
      valueEnum: {
        0: '快速路',
        1: '主干道',
        2: '次干道',
        3: '支路',
        4: '高速公路',
        5: '一级公路',
        6: '二级公路',
        7: '三级公路',
        8: '四级公路',
      },
    },
    {
      title: '车道数',
      key: 'laneNum',
      width: 80,
      render: (_text: any, record: any) => {
        return record?.laneNum * record?.streetNum;
      },
    },
    {
      title: '线路里程(km)',
      key: 'roadNum',
      width: 120,
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
    { title: '起点', key: 'startPoint', width: 160 },
    { title: '终点', key: 'endPoint', width: 160 },
    {
      title: '管养单位',
      dataIndex: 'managementUnit',
      key: 'managementUnit',
      ellipsis: true,
      width: 150,
    },
    // { title: '组织架构', key: 'deptName', width: 200 },
    { title: '新增时间', key: 'crtTime', width: 160 },
  ];
  return <FacilityList importColumns={columns}></FacilityList>;
};
