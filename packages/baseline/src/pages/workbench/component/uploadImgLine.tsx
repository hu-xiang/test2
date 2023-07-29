import React from 'react';
import { Area } from '@ant-design/charts';
// import linejson from './line.json';
import styles from '../styles.less';

type Iprop = {
  info: any;
};

const UploadImgLine: React.FC<Iprop> = (props) => {
  const data: any = [];
  // const [item,setItem] = useState(23)
  const fn = () => {
    let i: any = 0;
    while (i < 24) {
      const num = i;
      data.push({
        hour: `${i}`,
        number: 0,
        type: '图片',
      });
      // datas[datas.findIndex((it: any)=>it.X === num)].X
      if (!props.info) return false;
      props.info.map((it: any) => {
        if (`${it.x}` === `${num}`) {
          data[num].type = '图片';
          data[num].hour = `${it.x}`;
          data[num].number = it.y;
          return true;
        }
        return true;
      });
      i += 1;
    }
    return false;
  };
  fn();

  const config: any = {
    data,
    height: 500,
    xField: 'hour',
    yField: 'number',
    seriesField: 'type',
    // label: {},
    // smooth: true,
    color: '#4684F7',
    point: {
      size: 3,
      style: {
        fill: 'white',
        stroke: '#4684F7',
        lineWidth: 1,
      },
    },
    tooltip: {
      domStyles: {
        'g2-tooltip-title': { fontWeight: '600', fontSize: 20 },
        'g2-tooltip-name': { fontWeight: '600' },
      },
      // enterable:true,
    },
    areaStyle: () => {
      return {
        fill: 'l(270) 0:#fff 0.5:#e3ecfe 1:#4684F7',
      };
    },

    yAxis: {
      grid: { line: { style: { stroke: '#ccc', lineDash: [3, 3] } } },
      // tickInterval: 10,
    },
    xAxis: {
      // grid: { line: { style: { stroke: '#E8E8E8' } } },
      // line: { style: { stroke: '#E8E8E8' } },
    },
    legend: false,
    state: {
      active: {
        style: {
          shadowBlur: 4,
          stroke: '#2CD9C5',
          fill: 'white',
        },
      },
    },
  };
  return <Area {...config} className={styles.linepic} />;
};
export default UploadImgLine;
