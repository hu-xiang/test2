import React from 'react';
import { Empty } from 'antd';
import styles from '../styles.less';
import { Line } from '@ant-design/plots';

type Iprops = {
  data?: any;
};

const EdtMod: React.FC<Iprops> = (props) => {
  const { data } = props;
  const meta = {
    type: {
      alias: '类型',
    },
    num: {
      alias: '数量',
    },
  };
  const seriesKey = 'series';
  const valueKey = '数量';
  const processData = (data1: any, yFields: any, meta1: any) => {
    const result: any = [];
    data1.forEach((d: any) => {
      yFields.forEach((yField: any) => {
        const name = meta1?.[yField]?.alias || yField;
        result.push({ ...d, [seriesKey]: name, [valueKey]: d[yField] });
      });
    });
    return result;
  };
  const config = {
    data: processData(props?.data, ['num'], meta),
    xField: 'type',
    // yField: 'num',
    yField: valueKey,
    label: {},
    point: {
      size: 5,
      shape: 'diamond',
      style: {
        fill: 'white',
        stroke: '#5B8FF9',
        lineWidth: 2,
      },
    },
    yAxis: { tickInterval: 1 },
    tooltip: {
      showMarkers: false,
    },
    state: {
      active: {
        style: {
          shadowBlur: 4,
          stroke: '#000',
          fill: 'red',
        },
      },
    },
    interactions: [
      {
        type: 'marker-active',
      },
    ],
    area: {
      color: 'l(90) 0:rgba(55, 87, 255, 1) 0.75: rgba(55, 87, 255, 0.26) 1 rgba(55, 87, 255, 0.1)',
    },
  };
  return (
    <div>
      {data && data?.length > 0 ? (
        <Line {...config} />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} className={styles.customEmptyImg} />
      )}
    </div>
  );
};

export default EdtMod;
