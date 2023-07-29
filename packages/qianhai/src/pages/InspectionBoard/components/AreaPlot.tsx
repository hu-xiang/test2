import { Line } from '@ant-design/plots';
import React, { useState, useEffect, memo, useRef } from 'react';
import styles from '../styles.less';
// import moment from 'moment';

export type Iprop = {
  btnType: number;
  info: any[];
};
let newIntervalId: any;
let count: number = 0;
const AreaPlot: React.FC<Iprop> = memo((props) => {
  const [data, setData] = useState<any>([]);
  const [isMoreThua, setIsMoreThua] = useState<boolean>(false);
  const areaRef: any = useRef();
  const [isHover, setIsHover] = useState<any>(false);
  const colors = {
    总数: 'l(90) 0:rgba(55, 87, 255, 1) 0.75: rgba(55, 87, 255, 0.26) 1 rgba(55, 87, 255, 0.1)',
    紧急: 'l(90) 0.27:rgba(36, 174, 74, 1) 0.75: rgba(36, 174, 74, 0.26) 1 rgba(36, 174, 74, 0.1)',
    非紧急:
      'l(90) 0.04:rgba(171, 201, 231, 1) 0.75: rgba(171, 201, 231, 0.26)  1: rgba(171, 201, 231, 0.1)',
  };
  // const countType: any = new Map([
  //   [1, 6],
  //   [2, 29],
  //   [3, 11],
  // ]);
  useEffect(() => {
    if (!props || !props?.info) return;
    // let dataCount: number = 6;
    // dataCount = countType.get(props.btnType);
    setData([]);
    const datas: any = [
      { label: '2020/8/3', value: 11, type: '总数' },
      { label: '2020/8/3', value: 8, type: '紧急' },
      { label: '2020/8/3', value: 3, type: '非紧急' },
      { label: '2020/8/4', value: 20, type: '总数' },
      { label: '2020/8/4', value: 16, type: '紧急' },
      { label: '2020/8/4', value: 4, type: '非紧急' },
      { label: '2020/8/5', value: 38, type: '总数' },
      { label: '2020/8/5', value: 31, type: '紧急' },
      { label: '2020/8/5', value: 7, type: '非紧急' },
      { label: '2020/8/6', value: 22, type: '总数' },
      { label: '2020/8/6', value: 16, type: '紧急' },
      { label: '2020/8/6', value: 6, type: '非紧急' },
      { label: '2020/8/7', value: 13, type: '总数' },
      { label: '2020/8/7', value: 9, type: '紧急' },
      { label: '2020/8/7', value: 4, type: '非紧急' },
      { label: '2020/8/8', value: 26, type: '总数' },
      { label: '2020/8/8', value: 16, type: '紧急' },
      { label: '2020/8/8', value: 10, type: '非紧急' },
      { label: '2020/8/9', value: 29, type: '总数' },
      { label: '2020/8/9', value: 23, type: '紧急' },
      { label: '2020/8/9', value: 6, type: '非紧急' },
    ];
    // let i = dataCount;
    // while (i > -1) {
    //   const date: any =
    //     props.btnType === 3
    //       ? `${moment().subtract(i, 'months').format('M')}月`
    //       : moment().subtract(i, 'days').format('M/D');
    //   const arrList: any = [
    //     { label: date, value: 0, type: '总数' },
    //     { label: date, value: 0, type: '紧急' },
    //     { label: date, value: 0, type: '非紧急' },
    //   ];
    //   datas.push(...arrList);
    //   props.info.forEach((item: any) => {
    //     const newdate =
    //       props.btnType === 3
    //         ? `${item?.collectTime.slice(6, 7) * 1}月`
    //         : `${item?.collectTime.slice(6, 7) * 1}/${item?.collectTime.slice(8) * 1}`;
    //     if (newdate !== date) return;
    //     // 1为紧急，0为非紧急
    //     if (item.diseaseImp === 1) {
    //       datas[datas?.length - 2].value = (item?.total || 0) * 1 + datas[datas?.length - 2].value;
    //     } else if (item.diseaseImp === 0) {
    //       datas[datas?.length - 1].value = (item?.total || 0) * 1 + datas[datas?.length - 1].value;
    //     }
    //     datas[datas?.length - 3].value =
    //       datas[datas?.length - 2].value + datas[datas?.length - 1].value;
    //   });
    //   i -= 1;
    // }
    setData(datas);
  }, [props.info]);
  useEffect(() => {
    const area = areaRef.current.getChart();
    const getData = () => {
      if (data?.length > 0) {
        const newData: any = area.chart.getData();
        let newItem: any;
        if (!newData?.length) {
          area.chart.showTooltip(false);
          return;
        }
        if (count === 0) {
          newItem = newData[count];
        } else if (count >= 1) {
          if (newData?.length === 14) {
            newItem = newData[2 * count];
          } else if (newData?.length === 7) {
            newItem = newData[1 * count];
          } else if (newData?.length === 21) {
            newItem = newData[3 * count];
          } else {
            newItem = undefined;
          }
        }
        if (newItem) {
          const { x, y } = area.chart.getXY(newItem); // plot.chart.getElements()[0].getModel();
          area.chart.showTooltip({ x, y });
          count += 1;
          if (count === 7) {
            count = 0;
          }
        } else {
          area.chart.showTooltip(false);
        }
      }
    };
    if (data?.length > 0 && !isHover) {
      getData();
      newIntervalId = setInterval(() => {
        getData();
      }, 1000);
    }
    return () => {
      clearInterval(newIntervalId);
    };
  }, [data, isHover]);
  const config: any = {
    data,
    padding: isMoreThua ? [20, 0, 52, 38] : [20, 0, 52, 38],
    xField: 'label',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: ['rgba(55, 87, 255, 1)', 'rgba(36, 174, 74, 1)', 'rgba(171, 201, 231, 1)'],
    area: {
      color: (datanum: any) => {
        return colors[datanum.type];
      },
    },
    // areaStyle: (datanum: any) => {
    //   return { fill: colors[datanum.type] };
    // },
    meta: {
      value: {
        tickCount: 7,
        nice: true,
      },
    },
    yAxis: {
      label: {
        autoEllipsis: true,
        // 数值格式化为千分位
        formatter: (v: any) => {
          if (v > 1000) {
            setIsMoreThua(true);
          }
          return `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`);
        },
      },
      verticalLimitLength: 40,
      grid: { line: { style: { stroke: '#636467', lineDash: [3, 3] } } },
    },
    tooltip: {
      crosshairs: {
        type: 'x',
        line: {
          stroke: 'rgba(255, 255, 255, 0.3)',
        },
      },
      customContent: (title: any, items: any) => {
        let titleDom = '';
        if (items?.length > 0) {
          const newItems = items.sort((a: any, b: any) => {
            return b.value * 1 - a.value * 1;
          });
          newItems.forEach((it: any) => {
            let color = it?.color;
            if (it?.value === '0') {
              color = 'rgba(255, 255, 255, 0.6)';
            }
            titleDom += `<div class ="custom-tooltip-title"><span style="color: ${color}">${
              it?.value || 0
            }</span></div>`;
          });
        }
        return `<div class="tooltip-background">${titleDom}</div>`;
      },
      domStyles: {
        'g2-tooltip': {
          backgroundColor: '#294650',
          opacity: 1,
          fontFamily: `'Bebas-Neue', Arial, sans-serif`,
          boxShadow: 'none',
        },
      },
    },
    legend: {
      position: 'bottom',
      itemName: {
        style: {
          fill: 'rgba(255, 255, 255, 0.6)',
        },
      },
      itemSpacing: 1,
      pageNavigator: {
        marker: {
          style: {
            // 非激活，不可点击态时的填充色设置
            inactiveFill: 'rgba(255, 255, 255, 0.4)',
            inactiveOpacity: 0.45,
            // 默认填充色设置
            fill: 'rgba(255, 255, 255, 0.8)',
            opacity: 0.8,
          },
        },
      },
      marker: {
        symbol: (x: any, y: any, r: any) => {
          return [
            ['M', x - r / 2, y],
            ['L', x + r / 2, y],
          ];
        },
        style: (oldStyle: any) => {
          return {
            ...oldStyle,
            r: 4,
            lineWidth: 2,
            fillOpacity: 1,
            stroke: oldStyle.stroke || oldStyle.fill,
          };
        },
      },
    },
    theme: {
      components: {
        legend: {
          common: {
            itemStates: {
              active: {
                nameStyle: {
                  fill: 'rgba(255, 255, 255, 0.9)',
                },
              },
              inactive: {
                nameStyle: {
                  fill: 'rgba(255, 255, 255, 0.6)',
                  fillOpacity: 0.6,
                },
              },
              unchecked: {
                nameStyle: {
                  fill: '#535353',
                },
              },
            },
          },
        },
      },
    },
  };

  return (
    <div className={styles.plotsBox}>
      <Line
        {...config}
        ref={areaRef}
        className={`${styles.sevenAddClass}`}
        onReady={(area: any) => {
          area.on('plot:mousemove', () => {
            setIsHover(true);
          });
          area.on('plot:mouseleave', () => {
            setIsHover(false);
            count = 0;
          });
          area.on('legend-item:click', () => {
            count = 0;
          });
          // area.chart.area().adjust('stack').position('label*value').color('type');
        }}
      />
    </div>
  );
});

export default AreaPlot;
