import React from 'react';
import { Rose } from '@ant-design/charts';

const RightPie: React.FC = () => {
  const data = [
    {
      type: '优',
      value: 27,
      percent: 26.5,
    },
    {
      type: '良',
      value: 25,
      percent: 24.5,
    },
    {
      type: '中',
      value: 18,
      percent: 19.5,
    },
    {
      type: '次',
      value: 15,
      percent: 17,
    },
    {
      type: '差',
      value: 10,
      percent: 10,
    },
  ];
  const config: any = {
    data,
    height: 300,
    xField: 'type',
    yField: 'value',
    seriesField: 'type',
    radius: 0.9,
    innerRadius: 0.3,
    label: {
      content: (parentData: any) => `${parentData.value}, ${parentData.percent}%`,
      offset: -15,
    },
    legend: { position: 'bottom', selected: false, offsetY: -30, flipPage: false },
  };
  return <Rose {...config} />;
};

export default RightPie;
