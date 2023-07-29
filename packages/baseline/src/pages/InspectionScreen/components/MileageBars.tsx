/*
 * @Author: wf
 * @Date: 2022-11-28 16:57:25
 * @Last Modified by: wf
 * @Last Modified time: 2022-11-28 17:00:47
 * @Description: 接收的数据格式[{x: "2022-11-21", y: 37.67}]
 */

import React, { useState, useEffect, memo, useRef } from 'react';
import { Column } from '@ant-design/plots';
import EmptyStatus from '../../../components/TableEmpty';
import styles from '../styles.less';
import { getMileages } from '../service';

export type Iprop = {
  dataType: number;
};
let unmountFlag: boolean = false;
const MileageBar: React.FC<Iprop> = memo((props) => {
  const [data, setData] = useState<any>([]);
  const barRef: any = useRef();

  const getMileage7Datas = async () => {
    let res: any = {};
    try {
      res = await getMileages({ type: props.dataType });
      // res = {
      //   status: 0,
      //   message: '',
      //   data: [
      //     // {
      //     //   x: '2023-06-25',
      //     //   y: 17.21,
      //     //   name: '长度'
      //     // },
      //     // {
      //     //   x: '2023-06-25',
      //     //   y: 38.21,
      //     //   name: '面积'
      //     // },
      //     // {
      //     //   x: '2023-06-26',
      //     //   y: 9.11,
      //     //   name: '面积'
      //     // },
      //     // {
      //     //   x: '2023-06-26',
      //     //   y: 59.11,
      //     //   name: '长度'
      //     // },

      //     {
      //       x: '6月',
      //       y: 17.21,
      //       name: '长度',
      //     },
      //     {
      //       x: '6月',
      //       y: 38.21,
      //       name: '面积',
      //     },
      //     {
      //       x: '5月',
      //       y: 9.11,
      //       name: '面积',
      //     },
      //     {
      //       x: '5月',
      //       y: 59.11,
      //       name: '长度',
      //     },
      //   ],
      // };
      if (res?.status === 0 && !unmountFlag) {
        if (res?.data?.length > 0) {
          const arr: any = [];
          res?.data?.forEach((item: any) => {
            const itemArr = [
              {
                x:
                  props.dataType === 3
                    ? `${item?.collectTime?.slice(-2)}月`
                    : item?.collectTime?.slice(-5)?.replace('-', '/'),
                y: item?.area,
                name: '面积',
              },
              {
                x:
                  props.dataType === 3
                    ? `${item?.collectTime?.slice(-2)}月`
                    : item?.collectTime?.slice(-5)?.replace('-', '/'),
                y: item?.length,
                name: '长度',
              },
            ];
            arr?.push(...itemArr);
          });
          setData(arr);
        } else {
          setData([]);
        }
      }
    } catch (error) {
      console.log('获取近7天巡检里程统计数据失败');
    }
  };
  useEffect(() => {
    getMileage7Datas();
  }, [props.dataType]);

  useEffect(() => {
    unmountFlag = false;
    return () => {
      unmountFlag = true;
    };
  }, []);

  const config: any = {
    data,
    isGroup: true,
    xField: 'x',
    yField: 'y',
    //
    seriesField: 'name',
    // 分组柱状图 组内柱子间的间距 (像素级别)
    dodgePadding: 2,
    // 分组柱状图 组间的间距 (像素级别)
    intervalPadding: props.dataType === 2 ? 0 : 5,
    padding: [20, 8, 40, 38],
    color: ['l(90) 0:#3757FF 1: rgba(55, 87, 255, 0)', 'l(90) 0:#24AE4A 1: rgba(36, 174, 74, 0)'],
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
        console.log(text);
        return '';
      },
    },
    yAxis: {
      label: {
        autoEllipsis: true,
        // 数值格式化为千分位
        formatter: (v: any) => {
          // if (v > 1000) {
          //   setIsMoreThua(true);
          // }
          return `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`);
        },
      },
      verticalLimitLength: 40,
      grid: { line: { style: { stroke: '#636467', lineDash: [3, 3] } } },
    },
    // yAxis: {
    //   grid: { line: { style: { stroke: 'rgba(255, 255, 255, 0.3)', lineDash: [2, 2] } } },
    //   label: {
    //     autoEllipsis: true,
    //     // formatter: (text: string) => {
    //     //   return `${text}`;
    //     // },
    //     // 数值格式化为千分位
    //     formatter: (text: string) => {
    //       // return `${text}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`);
    //       // return `<div style='width: 60px, overflow: hidden, text-overflow: ellipsis'>${text}</div>`;
    //       return `${text}`
    //     },
    //   },
    // },
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
        return {
          name: datum?.name,
          value: datum?.name === '长度' ? `${datum.y}m` : `${datum.y}m²`,
        };
      },
    },
    legend: {
      position: 'bottom',
      offsetY: 10,
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
