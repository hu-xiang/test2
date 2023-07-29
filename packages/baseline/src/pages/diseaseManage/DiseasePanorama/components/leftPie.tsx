import { Pie } from '@ant-design/charts';
import React, { useEffect, useState } from 'react';
import { Empty } from 'antd';
import styles from '../styles.less';
import { disease1, disease2, disease3 } from '../../../../utils/dataDic';

type Iprop = {
  pieInfo: any;
  taskType: any;
};

const NumberPie: React.FC<Iprop> = (props) => {
  const [data, setData] = useState<any>([]);
  const { taskType } = props;
  useEffect(() => {
    if (!props.pieInfo?.length) {
      setData([]);
      return;
    }
    const list: any = [];
    props.pieInfo.map((i: any) => {
      if (taskType === 2) {
        if (disease1[i.diseaseType]) list.push({ type: disease1[i.diseaseType], nums: i.nums * 1 });
      } else if (taskType === 1) {
        if (disease2[i.diseaseType]) list.push({ type: disease2[i.diseaseType], nums: i.nums * 1 });
      } else if (taskType === 3) {
        if (disease3[i.diseaseType]) list.push({ type: disease3[i.diseaseType], nums: i.nums * 1 });
      }
      setData(list);
      return false;
    });
  }, [props.pieInfo]);
  const styleTextAlign: 'center' | 'left' | 'right' | undefined = 'center';
  const config: any = {
    appendPadding: 1,
    // padding: [-30, 0, 16, 8],
    data,
    angleField: 'nums',
    colorField: 'type',
    radius: 0.55,
    innerRadius: 0.6,
    label: {
      type: 'spider',
      // offsetX: -10,
      // content: `{value}%`,
      // labelEmit: 'true',
      // labelHeight: 10,
      content: `{percentage}`,
      style: {
        textAlign: styleTextAlign,
        fontSize: 14,
      },
      visible: true,
    },
    legend: { position: 'bottom', selected: false, offsetY: -30, flipPage: false, itemSpacing: 10 },
    // interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
    statistic: false,
    interactions: [
      {
        type: 'pie-legend-active',
      },
      {
        type: 'element-selected',
      },
      // {
      //   type: 'element-active',
      // },
    ],
  };
  return (
    <div className={`${styles.pieDiseaseBox} ${styles.chartEmpty}`}>
      {data?.length > 0 ? <Pie {...config} /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
    </div>
  );
};

export default NumberPie;
