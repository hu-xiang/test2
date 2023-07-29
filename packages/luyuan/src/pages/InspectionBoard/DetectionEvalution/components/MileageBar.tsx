import React, { useState, useEffect, memo, useRef } from 'react';
import { Column } from '@ant-design/plots';
import EmptyStatus from 'baseline/src/components/TableEmpty';
import styles from 'baseline/src/pages/InspectionBoard/styles.less';

export type Iprop = {
  dataInfo: number;
  unit: string;
  isModal: boolean;
};
const MileageBar: React.FC<Iprop> = memo((props) => {
  const [data, setData] = useState<any>([]);
  const barRef: any = useRef();

  useEffect(() => {
    setData(props.dataInfo);
  }, [props.dataInfo]);
  const config: any = {
    data,
    xField: 'x',
    yField: 'y',
    padding: props?.isModal ? [40, 8, 30, 38] : [20, 8, 30, 38],
    color: 'l(90) 0:#3757FF 1: rgba(55, 87, 255, 0)',
    maxColumnWidth: 14,
    columnWidthRatio: 0.3,
    label: {
      position: 'top',
      offsetY: 10,
      style: {
        fontSize: 16,
        fill: '#ABC9E7',
        fontFamily: `'Bebas-Neue', Arial, sans-serif`,
      },
      formatter: (text: any) => {
        return text && text?.y ? `${text.y}` : '';
      },
    },
    yAxis: {
      grid: { line: { style: { stroke: 'rgba(255, 255, 255, 0.3)', lineDash: [2, 2] } } },
      label: {
        formatter: (text: string) => {
          return `${text}`;
        },
      },
    },
    tooltip: {
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
    },
  };

  return (
    <div style={{ height: '100%' }}>
      {data?.length > 0 ? (
        <Column {...config} ref={barRef} onReady={() => {}} />
      ) : (
        <EmptyStatus customEmptyClass={styles.pieEmpty} />
      )}
    </div>
  );
});

export default MileageBar;
