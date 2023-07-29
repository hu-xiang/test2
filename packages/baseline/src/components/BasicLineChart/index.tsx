import React, { useState, useEffect, memo } from 'react';
import { Line } from '@ant-design/plots';
import EmptyStatus from '../TableEmpty';
// import { Empty } from 'antd';
import styles from './styles.less';

export type Iprop = {
  info: any[];
  customeName?: string;
  isBlack?: boolean;
  lineColorData?: any[] | string | undefined;
};
const BasicLineChart: React.FC<Iprop> = memo((props) => {
  const { customeName, info, lineColorData = undefined, isBlack = true } = props;
  const [con, setCon] = useState<any>({});
  const [paddingVal, setPaddingVal] = useState<any>([20, 8, 40, 38]);
  const [data, setData] = useState<any>([]);
  const lineColors = lineColorData || ['rgba(70, 132, 247, 1)', 'rgba(36, 174, 74, 1)'];
  const config: any = {
    xField: 'label',
    yField: 'value',
    seriesField: 'type',
    label: {
      position: 'top',
      autoHide: true,
      formatter: () => {
        return '';
      },
    },
    padding: paddingVal,
    color: lineColors,
    yAxis: {
      grid: { line: { style: { stroke: 'rgba(204, 204, 204, 0.6)', lineDash: [6, 3] } } },
    },
    point: {
      size: 3,
      shape: 'circle',
      style: (obj: any) => {
        return {
          stroke: obj?.type === '长度' ? 'rgba(36, 174, 74, 1)' : 'rgba(70, 132, 247, 1)',
          fill: '#fff',
          lineWidth: 2,
        };
      },
    },
    legend: {
      position: 'bottom',
      offsetY: 20,
    },
    state: {
      active: {
        style: {
          // shadowBlur: 4,
          stroke: '#fff',
        },
      },
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
      // console.log('jinlai');
      setCon({
        slider: {
          start: 0,
          end: 0.5,
          height: 26,
          // fill: '#BDCCED',
          // fillOpacity: 0.3,
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
    setPaddingVal(flagSlider ? [20, 8, 78, 38] : [20, 8, 40, 38]);
    setData(info);
  }, [info]);
  return (
    <div className={customeName || styles.plotsBox}>
      {data?.length > 0 ? (
        <Line {...config} data={data} {...con} />
      ) : (
        <EmptyStatus customEmptyClass={styles.lineEmpty} isBlack={isBlack} />
      )}
    </div>
  );
});

export default BasicLineChart;
