/*
 * @Author: wf
 * @Date: 2022-11-28 17:59:48
 * @Last Modified by: wf
 * @Last Modified time: 2022-12-28 15:13:31
 * @Description: 接收的数据格式[{x: 2, y: 37.67}],unit={'里程'}
 */

import React, { useState, useEffect, memo, useRef } from 'react';
import { Column } from '@ant-design/plots';
import EmptyStatus from '../TableEmpty';
import styles from './styles.less';

export type Iprop = {
  dataInfo: any;
  unit: string;
  isModal: boolean;
  gradiantColor: string;
  isBlack?: boolean;
  customName?: string;
};
const BarChart: React.FC<Iprop> = memo((props) => {
  const [con, setCon] = useState<any>({});
  const {
    gradiantColor = 'l(90) 0:#3757FF 1: rgba(55, 87, 255, 0)',
    isBlack = true,
    customName,
  } = props;
  const [data, setData] = useState<any>([]);
  const barRef: any = useRef();

  useEffect(() => {
    if (!props.dataInfo || !props.dataInfo?.length) {
      setData([]);
      return;
    }
    // let flagSlider = false;
    if (props.dataInfo?.length < 5) {
      // flagSlider = false;
      setCon({ slider: false });
    } else {
      // flagSlider = true;
      setCon({
        slider: {
          start: 0,
          end: 0.5,
          height: 26,
          trendCfg: {
            backgroundStyle: {
              stroke: 'rgba(255,255,255,1)',
              shadowColor: 'rgba(255,255,255,1)',
            },
            lineStyle: {
              fill: 'rgba(255,255,255,1)',
              stroke: 'rgba(255,255,255,1)',
            },
          },
        },
      });
    }
    setData(props.dataInfo);
  }, [props.dataInfo]);
  const config: any = {
    data,
    isGroup: true,
    xField: 'x',
    yField: 'y',
    seriesField: 'type',
    maxColumnWidth: 10,
    dodgePadding: 2,
    columnStyle: {
      style: {
        fill: gradiantColor,
      },
    },
    label: null,
    legend: {
      layout: 'horizontal',
      position: 'bottom',
      itemName: {
        formatter: (text: string, item: any, index: number) => {
          console.log('text', text, item, index);
          const textUnit = {
            长度: 'm',
            面积: '㎡',
          };
          return `${text} (${textUnit[text]})`;
        },
      },
    },

    colorField: 'type', // 部分图表使用 seriesField
    color: ({ type }: any) => {
      if (type === '面积') {
        return 'l(90) 0:#24AE4A 1: rgba(36, 174, 74, 0.1)';
      }
      return 'l(90) 0:#3757FF 1: rgba(55, 87, 255, 0)';
    },

    yAxis: {
      grid: {
        line: {
          style: {
            stroke: isBlack ? 'rgba(255, 255, 255, 0.3)' : 'rgba(204, 204, 204, 0.6)',
            lineDash: [6, 3],
          },
        },
      },
      label: {
        formatter: (text: string) => {
          return `${text}`;
        },
      },
    },
  };

  return (
    <div className={customName || styles['pie-chart-box']}>
      {data?.length > 0 ? (
        <Column {...config} ref={barRef} onReady={() => {}} {...con} />
      ) : (
        <EmptyStatus customEmptyClass={styles.pieEmpty} isBlack={isBlack} />
      )}
    </div>
  );
});

export default BarChart;
