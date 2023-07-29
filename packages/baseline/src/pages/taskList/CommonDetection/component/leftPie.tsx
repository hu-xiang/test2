import { Pie } from '@ant-design/charts';
import React from 'react';

interface Iprops {
  data: {
    name: string;
    nums: number;
  }[];
  getkeyword: Function;
}
const NumberPie: React.FC<Iprops> = (props) => {
  const { data } = props;
  data.forEach((item: any) => {
    const copyItem = item;
    copyItem.nums = Number(item.nums);
  });
  const styleTextAlign: 'center' | 'left' | 'right' | undefined = 'center';
  const config: any = {
    appendPadding: 5,
    data,
    forceFit: true,
    // padding: [5, 40, 5, -10],
    angleField: 'nums',
    colorField: 'name',
    radius: 0.6,
    innerRadius: 0.5,
    label: {
      type: 'spider',
      // offset: 30,
      content: `{name}, {percentage}`,
      // offsetX:2,
      // content: `{name}, {value}张`,
      style: {
        textAlign: styleTextAlign,
        fontSize: 14,
      },
      layout: 'overlap',
      visible: true,
    },
    legend: {
      position: 'right',
      selected: false,
      layout: 'vertical',
      offsetX: -20,
      offsetY: 0,
      maxHeight: 160,
      maxHeightRatio: 0.9,
      itemSpacing: 0,
      flipPage: false,
    },
    statistic: false,
  };
  return (
    <Pie
      {...config}
      onReady={(chart) => {
        chart.on('click', (evt: any) => {
          props.getkeyword(evt?.data?.data.code || '');
        });
      }}
    />
  );
};

export default NumberPie;
