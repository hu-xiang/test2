import { Line } from '@ant-design/plots';
import React, { useState, useEffect, memo, useRef } from 'react';
import propStyles from '../styles.less';

export type Iprop = {
  info: any[];
  isModalPlatform?: boolean;
  isLegendShow?: boolean;
  isRotate?: boolean;
};
let newIntervalId: any;
let count: number = 0;
const AreaPlot: React.FC<Iprop> = memo((props) => {
  const [data, setData] = useState<any>([]);
  const [isMoreThua, setIsMoreThua] = useState<boolean>(false);
  const areaRef: any = useRef();
  const [isHover, setIsHover] = useState<any>(false);
  const [isModal, setIsModal] = useState<any>(false);
  const [defalutPadding, setDefalutPadding] = useState<any>([20, 0, 62, 38]);
  const [colors, setColors] = useState<any[] | string>(
    'l(90) 0:rgba(55, 87, 255, 1) 0.75: rgba(55, 87, 255, 0.26) 1 rgba(55, 87, 255, 0.1)',
  );

  const colorRect = ['rgba(55, 87, 255, 1)', 'rgba(36, 174, 74, 1)', 'rgba(171, 201, 231, 1)'];
  const colorFills = [
    'l(90) 0:rgba(55, 87, 255, 1) 0.75: rgba(55, 87, 255, 0.26) 1 rgba(55, 87, 255, 0.1)',
    'l(90) 0.27:rgba(36, 174, 74, 1) 0.75: rgba(36, 174, 74, 0.26) 1 rgba(36, 174, 74, 0.1)',
    'l(90) 0.04:rgba(171, 201, 231, 1) 0.75: rgba(171, 201, 231, 0.26)  1: rgba(171, 201, 231, 0.1)',
  ];
  const getColorArray = (dt: any) => {
    if (!dt || !dt?.length) {
      setColors(
        'l(90) 0:rgba(55, 87, 255, 1) 0.75: rgba(55, 87, 255, 0.26) 1 rgba(55, 87, 255, 0.1)',
      );
    } else {
      const colorInfos: any = {};
      const series: any[] = dt.filter((it: any) => {
        return it?.label === dt[0].label;
      });
      if (series?.length > 0) {
        series.forEach((itm: any, index: number) => {
          colorInfos[itm.type] = colorFills[index];
        });
      }
      setColors({ ...colorInfos });
    }
  };

  useEffect(() => {
    if (!props || !props?.info) return;
    setData(props.info);
    getColorArray(props.info);
  }, [props.info]);

  useEffect(() => {
    const area = areaRef.current.getChart();
    const newData: any = area && area.chart.getData();
    let newArr = [];
    if (newData?.length > 0) {
      newArr = newData.reduce((pre: any, cur: any) => {
        const find = pre.find((v: any) => v.label === cur.label);
        if (!find) {
          pre.push(cur);
        }
        return pre;
      }, []);
    }
    const getData = () => {
      if (data?.length > 0) {
        let newItem: any;
        if (!newData?.length) {
          area.chart.showTooltip(false);
          return;
        }

        if (count === 0) {
          newItem = newData[count];
        } else if (count >= 1) {
          const seriesCount = newArr?.length > 0 ? newData?.length / newArr?.length : 0;
          newItem = newData[seriesCount * count];
        }
        if (newItem) {
          const { x, y } = area.chart.getXY(newItem); // plot.chart.getElements()[0].getModel();
          area.chart.showTooltip({ x, y });
          count += 1;
          if (count === newArr?.length) {
            count = 0;
          }
        } else {
          area.chart.showTooltip(false);
        }
      }
    };
    if (data?.length > 0 && !isHover && !isModal) {
      getData();
      newIntervalId = setInterval(() => {
        getData();
      }, 1000);
    }
    return () => {
      clearInterval(newIntervalId);
    };
  }, [data, isHover, isModal]);

  useEffect(() => {
    setIsModal(props.isModalPlatform || false);
  }, [props.isModalPlatform]);
  useEffect(() => {
    let padVal = [20, 0, 62, 38];
    if (isMoreThua) {
      padVal = props?.isLegendShow ? [20, 0, 62, 58] : [20, 0, 20, 58];
    } else {
      padVal = props?.isLegendShow ? [20, 0, 62, 38] : [20, 0, 20, 38];
    }
    setDefalutPadding(padVal);
  }, [isMoreThua, props?.isLegendShow]);

  const config: any = {
    data,
    padding: defalutPadding,
    xField: 'label',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: colorRect,
    area: {
      color: (datanum: any) => {
        return colors[datanum.type];
      },
    },
    xAxis: {
      label: props?.isRotate
        ? {
            autoRotate: true,
            rotate: 45,
            offset: 20,
          }
        : {},
      range: [0, 1],
    },
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
    legend: props?.isLegendShow
      ? {
          position: 'bottom',
          offsetY: 13,
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
        }
      : false,
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
    <div className={propStyles['card-line-chart']}>
      <Line
        {...config}
        ref={areaRef}
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
        }}
      />
    </div>
  );
});

export default AreaPlot;
