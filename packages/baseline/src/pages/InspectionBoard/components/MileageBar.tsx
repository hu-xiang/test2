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
import moment from 'moment';
import { getMileage7Data } from '../service';

export type Iprop = {
  dataType: number;
};
const MileageBar: React.FC<Iprop> = memo((props) => {
  const [data, setData] = useState<any>([]);
  const barRef: any = useRef();
  const getLate12Month = (dataInfo: any) => {
    const dataArr: any = [];
    const date: any = new Date();
    let isEmpty: boolean = true;
    date.setMonth(date.getMonth() + 1, 1); // 获取到当前月份,设置月份,第二个参数代表从 1 到 31 之间的整数，表示月份中的第几天。0 为上个月最后一天
    for (let i = 0; i < 12; i++) {
      date.setMonth(date.getMonth() - 1); // 每次循环一次 月份值减1
      const newMonth: number = date.getMonth() + 1;
      const item = dataInfo.find((itr: any) => itr.x === `${newMonth}月`);
      let yVal: number = 0;
      if (item) {
        dataArr.unshift({ x: item?.x, y: item?.y });
        yVal = item.y;
      } else {
        dataArr.unshift({ x: `${newMonth}月`, y: 0 });
        yVal = 0;
      }
      if (yVal) {
        isEmpty = false;
      }
    }
    return isEmpty ? [] : dataArr;
  };

  const getServeralDays = (dayNum: any, datas: any) => {
    let i = dayNum;
    const newArray = [];
    let isEmpty: boolean = true;
    while (i > -1) {
      const date = moment().subtract(i, 'days').format('MM-DD');
      const item = datas.find((itr: any) => {
        if (itr.x) {
          const newdate = itr.x.slice(-5);
          if (newdate && date) {
            return newdate === date;
          }
          return false;
        }
        return false;
      });
      let yVal: number = 0;
      if (item) {
        newArray.push({ x: date && date.replace('-', '/'), y: item.y });
        yVal = item.y;
      } else {
        newArray.push({ x: date && date.replace('-', '/'), y: 0 });
        yVal = 0;
      }
      i -= 1;
      if (yVal) {
        isEmpty = false;
      }
    }
    return isEmpty ? [] : newArray;
  };
  const getMileage7Datas = async () => {
    let res: any = {};
    try {
      res = await getMileage7Data({ type: props.dataType });
      // res = {
      //   status: 0,
      //   message: '',
      //   data: [
      //     {
      //       x: '2022-10-21',
      //       y: 17.21,
      //     },
      //     {
      //       x: '2022-10-22',
      //       y: 9.11,
      //     },
      //   ],
      // };
      if (res.status === 0) {
        let newdata = [];
        if (res.data?.length > 0) {
          if (props.dataType === 3) {
            const months = getLate12Month(res.data);
            if (months?.length > 0) {
              setData(months);
            } else {
              setData([]);
            }
          } else {
            const indNum = props.dataType === 2 ? 29 : 6;
            newdata = getServeralDays(indNum, res.data);
            setData(newdata);
          }
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
  const config: any = {
    data,
    xField: 'x',
    yField: 'y',
    padding: [20, 8, 30, 38],
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
        return { name: '里程', value: `${datum.y} km` };
      },
    },
  };

  return (
    <div style={props.dataType === 4 ? { height: 220 } : { height: '100%' }}>
      {data?.length > 0 ? (
        <Column {...config} ref={barRef} onReady={() => {}} />
      ) : (
        <EmptyStatus customEmptyClass={styles.pieEmpty} />
      )}
    </div>
  );
});

export default MileageBar;
