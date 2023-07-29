/*
 * @Author: wf
 * @Date: 2022-12-09 15:23:37
 * @Last Modified by: wf
 * @Last Modified time: 2022-12-09 16:41:41
 * @Description: 双轴折线图,接收参数如下[{
      year: '1998',
      value: 9,
      count: 1,
    }],注意xField和yField，seriesField值不同,
 */

import React, { useState, useEffect, memo } from 'react';
import { DualAxes } from '@ant-design/plots';
import EmptyStatus from '../TableEmpty';
import styles from './styles.less';

export type Iprop = {
  info: any[];
  customeName?: string;
  isBlack?: boolean;
  isDoubleYaxis?: boolean;
  lineColorData?: any[] | string | undefined;
};
const BasicLineChart: React.FC<Iprop> = memo((props) => {
  const { customeName, info, isBlack = true } = props;
  const [con, setCon] = useState<any>({});

  const [paddingVal, setPaddingVal] = useState<any>([10, 28, 18, 28]);
  const [data, setData] = useState<any>([]);
  const config: any = {
    data: [data, data],
    xField: 'label',
    yField: ['area', 'length'],
    padding: paddingVal,
    meta: {
      area: {
        alias: '面积',
      },
      length: {
        alias: '长度',
      },
      label: {
        sync: false, // 开启之后 slider 无法重绘
      },
    },
    geometryOptions: [
      {
        geometry: 'line',
        color: 'rgba(70, 132, 247, 1)',
        point: {
          size: 3,
          shape: 'circle',
          style: (obj: any) => {
            console.log('object', obj);
            return {
              stroke: 'rgba(70, 132, 247, 1)',
              fill: '#fff',
              lineWidth: 2,
            };
          },
        },
        yAxis: {
          grid: { line: { style: { stroke: 'rgba(204, 204, 204, 0.6)', lineDash: [6, 3] } } },
        },
      },
      {
        geometry: 'line',
        color: 'rgba(36, 174, 74, 1)',
        point: {
          size: 3,
          shape: 'circle',
          style: (obj: any) => {
            console.log('object', obj);
            return {
              stroke: 'rgba(36, 174, 74, 1)',
              fill: '#fff',
              lineWidth: 2,
            };
          },
        },
        yAxis: {
          grid: { line: { style: { stroke: 'rgba(204, 204, 204, 0.6)', lineDash: [6, 3] } } },
        },
      },
    ],
    limitInPlot: false,
    legend: {
      position: 'bottom',
      offsetY: 10,
    },
  };

  useEffect(() => {
    if (!info || !info?.length) return;
    let flagSlider = false;
    if (info?.length < 5) {
      flagSlider = false;
      setCon({ slider: false });
    } else {
      flagSlider = true;
      setCon({
        slider: {
          start: 0,
          end: 0.5,
          height: 25,
          padding: [0, 0, -15, 0],
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
    setPaddingVal(flagSlider ? [10, 28, 40, 28] : [10, 28, 18, 28]);
    setData(info);
  }, [info]);
  return (
    <div className={customeName || styles.plotsBox}>
      {data?.length > 0 ? (
        <DualAxes {...config} {...con} />
      ) : (
        <EmptyStatus customEmptyClass={styles.lineEmpty} isBlack={isBlack} />
      )}
    </div>
  );
});

export default BasicLineChart;
