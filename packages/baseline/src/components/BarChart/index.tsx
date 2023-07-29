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
  const [paddingVal, setPaddingVal] = useState<any>([20, 8, 30, 38]);
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
    let flagSlider = false;
    if (props.dataInfo?.length < 5) {
      flagSlider = false;
      setCon({ slider: false });
    } else {
      flagSlider = true;
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
    let newPad = [20, 8, 30, 38];
    if (props?.isModal) {
      newPad = flagSlider ? [40, 8, 68, 38] : [40, 8, 30, 38];
    } else {
      newPad = flagSlider ? [20, 8, 68, 38] : [20, 8, 30, 38];
    }
    setPaddingVal(newPad);
    setData(props.dataInfo);
  }, [props.dataInfo]);
  const config: any = {
    data,
    xField: 'x',
    yField: 'y',
    padding: paddingVal,
    color: gradiantColor,
    maxColumnWidth: 14,
    columnWidthRatio: 0.3,
    label: {
      position: 'top',
      offsetY: 10,
      style: {
        fontSize: 16,
        fill: isBlack ? '#ABC9E7' : 'rgba(0, 0, 0,0.6)',
        fontFamily: `'Bebas-Neue', Arial, sans-serif`,
      },
      formatter: (text: any) => {
        return text && text?.y ? `${text.y}` : '';
      },
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
    tooltip: isBlack
      ? {
          domStyles: {
            'g2-tooltip': {
              backgroundColor: '#294650',
              opacity: 1,
              boxShadow: 'none',
              color: 'rgba(255, 255, 255, 0.8)',
            },
          },
          formatter: (datum: any) => {
            return { name: `${props?.unit}`, value: `${datum.y} km` };
          },
        }
      : {
          fields: ['x', 'y'],
          formatter: (datum: any) => {
            return { name: '总数', value: `${datum.y} 个` };
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
