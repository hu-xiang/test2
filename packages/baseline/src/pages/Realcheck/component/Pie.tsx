import React from 'react';
import { Pie } from '@ant-design/charts';
import piejson from './pie.json';
import styles from '../styles.less';

const Pies: React.FC = () => {
  const tatol = () => {
    let num = 0;
    const a = piejson.map((item) => {
      num += item.value;
      return num;
    });

    return a[a.length - 1];
  };
  const config = {
    appendPadding: 15,
    data: piejson,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.64,
    color: (text: any) => {
      const { type } = text;
      if (type === '横向裂缝') return '#2D99FF';
      if (type === '纵向裂缝') return '#826AF9';
      if (type === '条状修补') return '#2CD9C5';
      if (type === '块状修补') return '#FFE700';
      if (type === '龟裂') return '#FF8A00';
      return '#E5EBF4';
    },
    style: {
      display: 'flex',
      justifyContent: 'pace-between',
    },
    label: {
      type: 'spider',
      formatter: (text: any) => {
        const { value } = text;
        const count: any = (value / tatol()) * 100;
        return `${parseInt(count, 10)}%,\n${value}`;
      },
      visible: true,
      style: {
        fill: '#505D6F',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
      },
    },
    statistic: false,
  };

  return <Pie {...config} className={styles.pie} />;
};
export default Pies;
