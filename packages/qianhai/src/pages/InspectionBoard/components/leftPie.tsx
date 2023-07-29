import { Pie, measureTextWidth } from '@ant-design/plots';
import React, { useEffect, useRef, useState, memo } from 'react';
import styles from '../styles.less';
import { disease1, disease2, disease3 } from '@/utils/dataDic';

type Iprop = {
  type: any;
  pieInfo: any;
};
const NumberPie: React.FC<Iprop> = memo((props) => {
  const [data, setData] = useState<any>([]);
  const [limitWidth, setLimitWidth] = useState<any>();
  const chartRef: any = useRef();
  const cref: any = useRef();
  const cdata: any = useRef();
  const flagRef: any = useRef();
  const newIntervalId: any = useRef(0);
  // const [isHover, setIsHover] = useState<any>(false);
  const [maxhg, setMaxhg] = useState<any>();
  const renderStatistic = (container: any, text: any, style: any, customName: any) => {
    const { width } = container.getBoundingClientRect();
    const textWidth = measureTextWidth(text, style);
    const R = width / 2; // r^2 = (w / 2)^2 + (h - offsetY)^2
    const scale = Math.min(Math.sqrt(Math.abs(R ** 2 / (textWidth / 2) ** 2)), 1);
    const textStyleStr = `width:${width}px;`;
    return `<div class="${customName}" style="${textStyleStr};font-size:${scale}em;line-height:${
      scale < 1 ? 1 : 'inherit'
    };">${text}</div>`;
  };
  useEffect(() => {
    cref.current = 0;
  }, []);
  // 循环执行的内容
  const setIntervalData = () => {
    const pie = chartRef.current && chartRef.current.getChart();
    const setUpdateInfo = () => {
      if (cdata.current?.length > 1 && pie && !flagRef.current) {
        const total = cdata.current.reduce((r: any, d: any) => r + d?.nums, 0);
        const percent = total > 0 ? cdata.current[cref.current].nums / total : 0;
        const newpercent = (percent * 100).toFixed(2);
        const textContent = `${newpercent}%`;
        if (document.querySelector('.customContent')) {
          document.querySelector('.customContent')!.innerHTML = textContent;
        }
        const textTitle = cdata.current[cref.current].type || '总计';
        if (document.querySelector('.customTitle')) {
          /* eslint-disable */
          document.querySelector('.customTitle')!.innerHTML = textTitle;
        }
        const lengend = pie.chart.getController('legend');
        const allLengs =
          lengend && lengend.components[0] ? lengend.components[0].component.getItems() : [];
        allLengs.forEach((it: any) => {
          if (it.name === cdata.current[cref.current].type) {
            lengend.components[0].component.setItemState(it, 'active', true);
          } else {
            lengend.components[0].component.setItemState(it, 'active', false);
          }
        });
        pie.setState('selected', (dat: any) => {
          return dat.type === cdata.current[cref.current].type;
        });
        pie.setState(
          'selected',
          (dat: any) => {
            return dat.type !== cdata.current[cref.current].type;
          },
          false,
        );
        // setTimeout(() => {
        //   pie.setState('selected', (dat: any) => {
        //     return dat.type === cdata.current[cref.current].type;
        //   });
        // }, 400);

        // pie.setState(
        //   'selected',
        //   (dat: any) => {
        //     return dat.type;
        //   },
        //   false,
        // );
        cref.current += 1;
        if (cref.current === cdata.current.length) {
          cref.current = 0;
        }
      }
    };
    if (cdata.current?.length > 1 && !flagRef.current) {
      setUpdateInfo();
      newIntervalId.current = setInterval(() => {
        setUpdateInfo();
      }, 3000);
    }
  };
  useEffect(() => {
    if (data?.length > 1) {
      cdata.current = data.slice();
      setIntervalData();
    }
    return () => {
      clearInterval(newIntervalId.current);
      cref.current = 0;
    };
  }, [data]);
  useEffect(() => {
    const list: any = [];
    if (!props.pieInfo?.length) {
      setData([]);
      return;
    }
    props.pieInfo.forEach((i: any) => {
      if (props.type === 2) {
        if (disease1[i.diseaseType]) list.push({ type: disease1[i.diseaseType], nums: i.nums * 1 });
      } else if (props.type === 1) {
        if (disease2[i.diseaseType]) list.push({ type: disease2[i.diseaseType], nums: i.nums * 1 });
      } else if (props.type === 3) {
        if (disease3[i.diseaseType]) list.push({ type: disease3[i.diseaseType], nums: i.nums * 1 });
      }
      setData(list);
    });
  }, [props.type, props.pieInfo]);

  const colors = {
    坑槽: 'rgba(55, 87, 255, 1)',
    纵向裂缝: 'rgba(59, 134, 246, 1)',
    横向裂缝: 'rgba(55, 204, 255, 1)',
    修补: 'rgba(55, 255, 235, 1)',
    龟裂: 'rgba(36, 174, 74, 1)',
    块状裂缝: 'rgba(55, 225, 135, 1)',
    啃边: 'rgba(151, 134, 255, 1)',
    沉陷: 'rgba(220, 134, 235, 1)',
    泛油: 'rgba(255, 194, 120, 1)',
    松散: 'rgba(199, 255, 40, 1)',
    坑洞: 'rgba(55, 87, 255, 1)',
    面板破碎: 'rgba(59, 134, 246, 1)',
    板角断裂: 'rgba(55, 204, 255, 1)',
    裂缝: 'rgba(55, 255, 235, 1)',
    边角剥落: 'rgba(151, 134, 255, 1)',
    护栏损坏: 'rgba(55, 87, 255, 1)',
    路框差: 'rgba(59, 134, 246, 1)',
    井盖破损: 'rgba(55, 204, 255, 1)',
    抛洒物: 'rgba(55, 255, 235, 1)',
    积水: 'rgba(36, 174, 74, 1)',
    交通标志损坏: 'rgba(55, 225, 135, 1)',
  };
  const colorType = {
    坑槽: 'rgba(55, 87, 255, 0.4)',
    纵向裂缝: 'rgba(59, 134, 246, 0.4)',
    横向裂缝: 'rgba(55, 204, 255, 0.4)',
    修补: 'rgba(55, 255, 235, 0.4)',
    龟裂: 'rgba(36, 174, 74, 0.4)',
    块状裂缝: 'rgba(55, 225, 135, 0.4)',
    啃边: 'rgba(151, 134, 255, 0.4)',
    沉陷: 'rgba(220, 134, 235, 0.4)',
    泛油: 'rgba(255, 194, 120, 0.4)',
    松散: 'rgba(199, 255, 40, 0.4)',
    坑洞: 'rgba(55, 87, 255, 0.4)',
    面板破碎: 'rgba(59, 134, 246, 0.4)',
    板角断裂: 'rgba(55, 204, 255, 0.4)',
    裂缝: 'rgba(55, 255, 235, 0.4)',
    边角剥落: 'rgba(151, 134, 255, 0.4)',
    护栏损坏: 'rgba(55, 87, 255, 0.4)',
    路框差: 'rgba(59, 134, 246, 0.4)',
    井盖破损: 'rgba(55, 204, 255, 0.4)',
    抛洒物: 'rgba(55, 255, 235, 0.4)',
    积水: 'rgba(36, 174, 74, 0.4)',
    交通标志损坏: 'rgba(55, 225, 135, 0.4)',
  };

  const config: any = {
    appendPadding: [12, 10, 10, 10],
    data,
    color: (typeVal: any) => {
      if (typeVal?.type) {
        return colorType[typeVal?.type];
      }
      return 'rgba(55, 87, 255, 0.4)';
    },
    angleField: 'nums',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.7,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 14,
        fill: 'transparent',
      },
    },
    tooltip: { showTitle: false },
    statistic: {
      title: {
        offsetY: 25,
        style: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '12px',
          fontWeight: '400',
        },
        customHtml: (container: any, view: any, datum: any) => {
          const text = datum ? datum?.type : '总计';
          return renderStatistic(
            container,
            text,
            {
              fontSize: 12,
            },
            'customTitle',
          );
        },
      },
      content: {
        offsetY: -20,
        offsetX: 2,
        style: {
          color: '#ABC9E7',
          fontFamily: `'Bebas-Neue', Arial, sans-serif`,
          fontWeight: '400',
          fontSize: '24px',
        },
        customHtml: (container: any, view: any, datum: any) => {
          const total = data.reduce((r: any, d: any) => r + d?.nums, 0);
          const percent = total > 0 ? datum?.nums / total : 0;
          const newpercent = (percent * 100).toFixed(2);
          const text = datum ? ` ${newpercent}%` : `${total}`;
          return renderStatistic(
            container,
            text,
            {
              fontSize: 24,
            },
            'customContent',
          );
        },
      },
    },
    state: {
      active: {
        animate: { duration: 100, easing: 'easeLinear' },
        style: {
          lineWidth: 2,
          shadowBlur: 10,
          shadowOffsetX: 2,
          shadowOffsetY: 2,
          stroke: 'rgba(255, 255, 255, 0.4)',
        },
      },
    },
    pieStyle: (args: any) => {
      return {
        stroke: args?.type ? colors[args?.type] : 'rgba(255, 255, 255, 0.8)',
      };
    },
    legend: {
      position: 'right',
      offsetX: -10,
      flipPage: true,
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
      maxItemWidth: limitWidth,
      itemHeight: 20,
      maxHeight: maxhg,
      marker: {
        style: (oldStyle: any) => {
          return {
            ...oldStyle,
            r: 4,
            lineWidth: 2,
            fillOpacity: 1,
            // square marker 只有填充色，赋给 line 的 stroke
            stroke: oldStyle.stroke || oldStyle.fill,
          };
        },
      },
      itemName: {
        style: {
          fill: 'rgba(255, 255, 255, 0.5)',
        },
        formatter: (text: any, item: any) => {
          const items = data.filter((d: any) => d.type === item.name);
          const dataTotal = data.reduce((a: any, b: any) => a + b?.nums, 0);
          const percent = dataTotal > 0 ? items[0]?.nums / dataTotal : 0;
          const newpercent = (percent * 100).toFixed(2);
          return dataTotal > 0 ? `${text} ${newpercent}%` : '-';
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
                  fill: 'rgba(255, 255, 255, 1)',
                },
              },
              inactive: {
                nameStyle: {
                  fill: 'rgba(255, 255, 255, 0.6)',
                  fillOpacity: 0.3,
                },
              },
              unchecked: {
                nameStyle: {
                  fill: '#535353',
                  fillOpacity: 0.3,
                },
              },
            },
          },
        },
      },
    },
    interactions: [
      {
        type: 'pie-legend-active',
      },
      {
        type: 'element-active',
      },
      {
        type: 'legend-filter',
        enable: flagRef.current,
      },
      {
        type: 'pie-statistic-active',
        cfg: {
          start: [
            { trigger: 'element:mouseenter', action: 'pie-statistic:change' },
            { trigger: 'legend-item:mouseenter', action: 'pie-statistic:change' },
          ],
          end: [
            { trigger: 'element:mouseleave', action: 'pie-statistic:reset' },
            { trigger: 'legend-item:mouseleave', action: 'pie-statistic:reset' },
          ],
        },
      },
      {
        type: 'legend-highlight',
        cfg: {
          start: [{ trigger: 'legend-item:mouseenter', action: 'list-highlight:highlight' }],
          end: [{ trigger: 'legend-item:mouseleave', action: 'list-highlight:reset' }],
        },
      },
    ],
  };
  return (
    <div className={styles.plotsBox}>
      <Pie
        {...config}
        ref={chartRef}
        className={styles.pieDiseaseDisBox}
        onReady={(pie: any) => {
          const viewWidth: any = pie?.chart?.viewBBox;
          let dwidth = 0;
          if (viewWidth && viewWidth?.width <= 200) {
            dwidth = Math.min(60, viewWidth?.width * 0.4);
          } else if (viewWidth && viewWidth?.width > 200 && viewWidth?.width < 300) {
            dwidth = Math.min(75, viewWidth?.width * 0.4);
          } else {
            dwidth = viewWidth?.width * 0.25;
          }
          setLimitWidth(dwidth);
          setMaxhg(viewWidth.height - 20);
          pie.on('legend-item:mouseenter', (evt: any) => {
            flagRef.current = true;
            const delegateObject: any = evt.target.get('delegateObject');
            if (cref.current !== 0 && delegateObject?.index !== cref.current - 1) {
              pie.setState(
                'selected',
                (dat: any) => {
                  return dat.type !== cdata.current[cref.current].type;
                },
                false,
              );
            } else {
              /* eslint-disable */
              if (cdata.current) {
                pie.setState(
                  'selected',
                  (dat: any) => {
                    return dat.type === cdata.current[cref.current > 0 ? cref.current - 1 : 0].type;
                  },
                  true,
                );
              }
            }
            if (newIntervalId.current) {
              clearInterval(newIntervalId.current);
              newIntervalId.current = 0;
            }
          });
          pie.on('legend-item:mouseleave', () => {
            flagRef.current = false;
            setIntervalData();
          });
        }}
      />
    </div>
  );
});

export default NumberPie;
