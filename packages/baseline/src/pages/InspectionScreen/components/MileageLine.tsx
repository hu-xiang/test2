import React, { useState, useEffect, memo } from 'react';
import { Line } from '@ant-design/plots';
import { Empty } from 'antd';
import styles from '../styles.less';
import { getMileage7Data } from '../service';

export type Iprop = {
  dataType: number;
  planenessInfo?: any;
};
let unmountFlag: boolean = false;
const MileageLine: React.FC<Iprop> = memo((props) => {
  const [data, setData] = useState<any>([]);
  const [config, setConfig] = useState<any>([]);
  const config1: any = {
    xField: 'x',
    yField: 'y',
    label: {},
    padding: [20, 8, 30, 38],
    color: '#826af9',
    yAxis: {
      grid: { line: { style: { stroke: '#ccc', lineDash: [3, 3] } } },
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: '里程', value: `${datum.y} km` };
      },
    },
    point: {
      size: 5,
      shape: 'circle',
      style: {
        stroke: '#826af9',
        fill: '#fff',
        lineWidth: 2,
      },
    },
    state: {
      active: {
        style: {
          shadowBlur: 4,
          stroke: '#826af9',
        },
      },
    },
    interactions: [
      {
        type: 'marker-active',
      },
    ],
  };
  const config2: any = {
    xField: 'x',
    yField: 'y',
    padding: [20, 8, 30, 20],
    color: '#826af9',
    yAxis: {
      grid: { line: { style: { stroke: '#ccc', lineDash: [3, 3] } } },
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: '平整度', value: datum.y };
      },
    },
    point: {
      size: 1,
      shape: 'circle',
      style: {
        stroke: '#826af9',
        fill: '#fff',
        lineWidth: 2,
      },
    },
    state: {
      active: {
        style: {
          shadowBlur: 4,
          stroke: '#826af9',
        },
      },
    },
    interactions: [
      {
        type: 'marker-active',
      },
    ],
  };
  const getMileage7Datas = async () => {
    let res: any = {};
    try {
      res = await getMileage7Data({ type: props.dataType });
      if (res?.status === 0 && !unmountFlag) {
        const list: any = [];
        res.data.forEach((i: any) => {
          list.push({ x: i.x, y: i.y.toFixed(2) * 1 });
        });
        setData(list);
      }
    } catch (error) {
      console.log('获取近7天巡检里程统计数据失败');
    }
  };
  useEffect(() => {
    if (props.dataType !== 4) {
      getMileage7Datas();
      setConfig({ ...config1 });
    } else {
      // let i = 0;
      // const list: any = [];
      // while (i < 100) {
      //   list.push({ x: i, y: 0 });
      //   i += 1;
      // }
      const planenessList: any = [];

      if (props?.planenessInfo?.length > 0) {
        props?.planenessInfo.forEach((val: any, index: any) => {
          // const obj = { x: list.length - props?.planenessInfo?.length + index, y: 0 };
          // obj.y = val;
          planenessList.push({ x: index, y: val });
        });
        // list.splice(
        //   list.length - props?.planenessInfo?.length,
        //   props?.planenessInfo?.length,
        //   ...planenessList,
        // );
      }

      setData(planenessList);
      setConfig({ ...config2 });
    }
  }, [props.dataType, props?.planenessInfo]);
  useEffect(() => {
    unmountFlag = false;
    return () => {
      unmountFlag = true;
    };
  }, []);

  return (
    <div style={props.dataType === 4 ? { height: 119 } : { height: '100%' }}>
      {data?.length > 0 ? (
        <Line {...config} data={data} />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} className={styles.pieEmpty} />
      )}
    </div>
  );
});

export default MileageLine;
