import React, { useState, useEffect } from 'react';
import { Column } from '@ant-design/charts';
import styles from '../styles.less';
import { Empty } from 'antd';
import moment from 'moment';

export type Iprop = {
  btnType: number;
  info: any[];
};
const Plots: React.FC<Iprop> = (props) => {
  const [data, setData] = useState<any>([]);
  const [con, setCon] = useState<any>({});

  useEffect(() => {
    if (!props.info) return;
    if (props.btnType === 1) {
      setData([]);
      const datas: any = [];
      let i = 6;
      while (i > -1) {
        const date = moment().subtract(i, 'days').format('M/D');
        datas.push(
          { label: date, value: 0, type: '紧急' },
          { label: date, value: 0, type: '非紧急' },
        );
        props.info.forEach((item: any) => {
          if (`${item?.collectTime.slice(5, 7) * 1}/${item?.collectTime.slice(8) * 1}` !== date) {
            return;
          }
          if (item.diseaseImp === 1) {
            datas[datas.length - 2].value = (item?.total || 0) * 1 + datas[datas.length - 2].value;
          } else if (item.diseaseImp === 0) {
            datas[datas.length - 1].value = (item?.total || 0) * 1 + datas[datas.length - 1].value;
          }
        });
        i -= 1;
      }
      setData(datas);
      setCon({ slider: false });
    } else if (props.btnType === 2) {
      setData([]);
      const datas: any = [];
      let i = 29;
      while (i > -1) {
        const date = moment().subtract(i, 'days').format('M/D');
        datas.push(
          { label: date, value: 0, type: '紧急' },
          { label: date, value: 0, type: '非紧急' },
        );
        props.info.forEach((item: any) => {
          if (`${item?.collectTime.slice(5, 7) * 1}/${item?.collectTime.slice(8) * 1}` !== date)
            return;
          if (item.diseaseImp === 1) {
            datas[datas.length - 2].value = (item?.total || 0) * 1 + datas[datas.length - 2].value;
          } else if (item.diseaseImp === 0) {
            datas[datas.length - 1].value = (item?.total || 0) * 1 + datas[datas.length - 1].value;
          }
        });
        i -= 1;
      }

      setData(datas);
      setCon({
        slider: {
          start: 0.6,
          end: 1,
        },
      });
    } else if (props.btnType === 3) {
      setData([]);
      const datas: any = [];
      let i = 11;
      while (i > -1) {
        const date = `${moment().subtract(i, 'months').format('M')}月`;
        datas.push(
          { label: date, value: 0, type: '紧急' },
          { label: date, value: 0, type: '非紧急' },
        );
        props.info.forEach((item: any) => {
          if (`${item?.collectTime.slice(5, 7) * 1}月` !== date) return;
          if (item.diseaseImp === 1) {
            datas[datas.length - 2].value = (item?.total || 0) * 1 + datas[datas.length - 2].value;
          } else if (item.diseaseImp === 0) {
            datas[datas.length - 1].value = (item?.total || 0) * 1 + datas[datas.length - 1].value;
          }
        });

        i -= 1;
      }

      setData(datas);
      setCon({ slider: false });
    }
  }, [props.btnType, props.info]);

  const config: any = {
    data,
    isStack: true,
    xField: 'label',
    yField: 'value',
    seriesField: 'type',
    columnWidthRatio: 0.4,

    label: false,
    legend: { position: 'bottom', offsetY: 8, selected: false, flipPage: false, itemSpacing: 10 },
    yAxis: {
      grid: { line: { style: { stroke: '#ccc', lineDash: [3, 3] } } },
      // tickInterval: 10,
    },

    // slider: {
    //   start: 0,
    //   end: 0.4,
    // },
  };

  return (
    <div className={`${styles.plotsBox} ${styles.chartEmpty}`}>
      {data?.length > 0 ? (
        <Column {...config} {...con} className={`${styles.plotsDiseaseBox}`} />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  );
};

export default Plots;
