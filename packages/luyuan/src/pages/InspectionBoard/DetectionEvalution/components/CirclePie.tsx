import { Pie } from '@ant-design/plots';
import React, { useState, useEffect, memo } from 'react';
import styles from '../styles.less';

export type Iprop = {
  colorInfos: string[];
  circleData: any[];
};

const CirclePlot: React.FC<Iprop> = memo((props) => {
  const [data, setData] = useState<any>([]);
  const { circleData } = props;
  useEffect(() => {
    setData(circleData);
  }, [circleData]);

  const config: any = {
    data,
    padding: [0, 5, 0, 0],
    angleField: 'value',
    colorField: 'type',
    color: props.colorInfos,
    radius: 0.9,
    pieStyle: () => {
      return {
        stroke: 'transparent',
      };
    },
    legend: false,
    label: false,
    tooltip: false,
  };

  return (
    <div className={styles['circle-plot']}>
      <Pie {...config} />
    </div>
  );
});

export default CirclePlot;
