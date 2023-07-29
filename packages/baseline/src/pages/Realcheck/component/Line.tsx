import React from 'react';
import { Line } from '@ant-design/charts';
// import linejson from './line.json';
import styles from '../styles.less';

const Lines: React.FC = () => {
  const data = [
    {
      year: '2015',
      value: 100,
    },
    {
      year: '2016',
      value: 96,
    },
    {
      year: '2017',
      value: 93,
    },
    {
      year: '2018',
      value: 90,
    },
    {
      year: '2019',
      value: 85,
    },
    {
      year: '2020',
      value: 80,
    },
  ];
  const config = {
    data,
    height: 217,
    xField: 'year',
    yField: 'value',
    label: {},
    smooth: true,
    color: '#2CD9C5',

    point: {
      size: 4,
      style: {
        fill: 'white',
        stroke: '#2CD9C5',
        lineWidth: 1,
      },
    },
    tooltip: { showMarkers: false },
    meta: {
      value: {
        // type: 'quantile',
        min: 50,
        max: 100,
        // tickCount: 9,
        // ticks: [0, 60, 70, 80, 92, 100]
      },
      year: {
        range: [0, 1],
      },
    },
    annotations: [
      {
        type: 'line',
        start: ['2015', '92'],
        end: ['2020', '92'],
        style: {
          stroke: 'rgba(54, 198, 38, 0.6)',
          lineDash: [2, 2],
        },
      },
      {
        type: 'text',
        position: ['2015', '92'],
        content: '92',
        offsetX: -22,
        style: { textBaseline: 'bottom' },
      },
      {
        type: 'line',
        start: ['2015', '80'],
        end: ['2020', '80'],
        style: {
          stroke: '#826AF9',
          lineDash: [2, 2],
        },
      },
      {
        type: 'line',
        start: ['2015', '70'],
        end: ['2020', '70'],
        style: {
          stroke: '#FF8A00',
          lineDash: [2, 2],
        },
      },
      {
        type: 'line',
        start: ['2015', '60'],
        end: ['2020', '60'],
        style: {
          stroke: 'rgba(255, 231, 0, 0.6)',
          lineDash: [2, 2],
        },
      },
    ],
    yAxis: {
      grid: { line: { style: { stroke: '#f2f2f2', lineDash: [3, 3] } } },
      line: { style: { stroke: '#E9EBF1' } },
    },
    xAxis: {
      grid: { line: { style: { stroke: '#eee' } } },
      line: { style: { stroke: '#E9EBF1' } },
    },
    state: {
      active: {
        style: {
          shadowBlur: 4,
          stroke: '#2CD9C5',
          fill: 'white',
        },
      },
    },
    interactions: [{ type: 'marker-active' }],
  };
  return <Line {...config} className={styles.linepic} />;
};
export default Lines;
