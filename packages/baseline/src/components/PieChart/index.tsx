/*
 * @Author: wf
 * @Date: 2022-11-28 19:54:41
 * @Last Modified by: wf
 * @Last Modified time: 2022-12-27 17:45:31
 * @Description: [{ type: '横向裂缝', nums: 34 }]
 */

import { Pie, measureTextWidth } from '@ant-design/plots';
import React, { useEffect, useRef, useState, memo } from 'react';
import styles from './styles.less';

type Iprop = {
  pieInfo: any;
  isModalPlatform?: boolean;
  displayName?: string;
  intervalTime?: number;
  isShowAvg?: boolean;
  contentClassName?: string;
  titleClassName?: string;
  avgData?: string;
  colorStokeDatas?: any[]; // 环图的stoke值
  colorFillDatas?: any[]; // 环图的填充色
  legendPosition?: string;
  isBlack?: boolean;
  maxRowVal?: number;
  isNeedPercent?: boolean;
};
const LeftDistributionPie: React.FC<Iprop> = memo((props) => {
  const {
    legendPosition = 'right',
    colorStokeDatas = [],
    colorFillDatas = [],
    isBlack = true,
    isModalPlatform = false,
    maxRowVal = 1,
    isNeedPercent = true,
    intervalTime = 3000,
    isShowAvg = false,
    contentClassName,
    titleClassName,
  } = props;
  const [data, setData] = useState<any>([]);
  const [limitWidth, setLimitWidth] = useState<any>();
  // const [contentName, setContentName] = useState<string | undefined>('customContent');
  // const [titleName, setTitleName] = useState<string | undefined>('customTitle');
  const chartRef: any = useRef();
  const cref: any = useRef();
  const cdata: any = useRef();
  const flagRef: any = useRef();
  const [isModal, setIsModal] = useState<any>(false);
  const newIntervalId: any = useRef(0);
  const [colors, setColors] = useState<any[] | string>('rgba(55, 87, 255, 1)');
  const colorRect = colorStokeDatas?.length
    ? colorStokeDatas
    : [
        'rgba(55, 87, 255, 1)',
        'rgba(59, 134, 246, 1)',
        'rgba(55, 204, 255, 1)',
        'rgba(55, 255, 235, 1)',
        'rgba(36, 174, 74, 1)',
        'rgba(55, 225, 135, 1)',
        'rgba(151, 134, 255, 1)',
      ];
  const colorFills = colorFillDatas?.length
    ? colorFillDatas
    : [
        'rgba(55, 87, 255, 0.4)',
        'rgba(59, 134, 246, 0.4)',
        'rgba(55, 204, 255, 0.4)',
        'rgba(55, 255, 235, 0.4)',
        'rgba(36, 174, 74, 0.4)',
        'rgba(55, 225, 135, 0.4)',
        'rgba(151, 134, 255, 0.4)',
      ];
  const [colorTypes, setColorTypes] = useState<any[] | string>('rgba(55, 87, 255, 0.4)');
  const [maxhg, setMaxhg] = useState<any>();
  const renderStatistic = (container: any, text: any, style: any, customName: any) => {
    let { width } = container.getBoundingClientRect();
    if (width === 0) {
      width = 120;
    }
    // console.log('container', text,customName);
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
  const getColorArray = (dt: any) => {
    if (!dt || !dt?.length) {
      setColors('rgba(55, 87, 255, 1)');
      setColorTypes('rgba(55, 87, 255, 0.4)');
    } else {
      const colortys: any = {};
      const colorInfos: any = {};
      dt.forEach((it: any, index: number) => {
        colortys[it.type] = colorRect[index];
        colorInfos[it.type] = colorFills[index];
      });
      setColors({ ...colortys });
      setColorTypes({ ...colorInfos });
    }
  };
  useEffect(() => {
    if (!props.pieInfo?.length) {
      setData([]);
      return;
    }
    setData([...props.pieInfo]);
    getColorArray(props.pieInfo);
  }, [props.pieInfo]);

  // useEffect(() => {
  //   setContentName(contentClassName);
  //   setTitleName(titleClassName);
  // }, [contentClassName, titleClassName]);
  // 循环执行的内容
  const setIntervalData = () => {
    const pie = chartRef.current && chartRef.current.getChart();
    const setUpdateInfo = () => {
      if (cdata.current?.length > 1 && pie && !flagRef.current) {
        let textContent = '';
        if (isNeedPercent) {
          const total = cdata.current.reduce((r: any, d: any) => r + d?.nums, 0);
          const percent = total > 0 ? cdata.current[cref.current].nums / total : 0;
          const newpercent = (percent * 100).toFixed(2);
          textContent = `${newpercent}%`;
        } else {
          textContent = cdata.current[cref.current].nums;
        }
        if (document.querySelector(`.${contentClassName}` || '.customContent')) {
          document.querySelector(`.${contentClassName}` || '.customContent')!.innerHTML =
            textContent;
        }
        const textTitle = cdata.current[cref.current].type || '总计';

        if (document.querySelector(`.${titleClassName}` || '.customTitle')) {
          /* eslint-disable */
          document.querySelector(`.${titleClassName}` || '.customTitle')!.innerHTML = textTitle;
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
        cref.current += 1;
        if (cref.current === cdata.current.length) {
          cref.current = 0;
        }
      }
    };
    if (cdata.current?.length > 1 && !flagRef.current && !isModal) {
      setUpdateInfo();
      newIntervalId.current = setInterval(() => {
        setUpdateInfo();
      }, intervalTime);
    }
  };
  useEffect(() => {
    if (data?.length > 1 && !isModal) {
      cdata.current = data.slice();
      setIntervalData();
    } else {
      cdata.current = data;
    }
    return () => {
      clearInterval(newIntervalId.current);
      cref.current = 0;
    };
  }, [data, isModal]);

  useEffect(() => {
    setIsModal(props.isModalPlatform || false);
  }, [props.isModalPlatform]);
  const config: any = {
    appendPadding: legendPosition === 'right' ? [12, 10, 10, 5] : [12, 10, 35, 5],
    data,
    color: (typeVal: any) => {
      if (typeVal?.type && typeof colorTypes === 'object' && JSON.stringify(colorTypes) !== '{}') {
        return colorTypes[typeVal?.type];
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
          color: isBlack ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.8)',
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
            titleClassName || 'customTitle',
          );
        },
      },
      content: {
        offsetY: -20,
        offsetX: 2,
        style: {
          color: isBlack ? '#ABC9E7' : 'rgba(0, 19, 193, 1)',
          fontFamily: `'Bebas-Neue', Arial, sans-serif`,
          fontWeight: '400',
          fontSize: '24px',
        },
        customHtml: (container: any, view: any, datum: any) => {
          // console.log('dddd',container,datum,cdata.current||[],data);
          let text = '';
          if (isNeedPercent) {
            const total = data.reduce((r: any, d: any) => r + d?.nums, 0);
            const percent = total > 0 ? datum?.nums / total : 0;
            const newpercent = (percent * 100).toFixed(2);
            text = datum ? ` ${newpercent}%` : `${total.toFixed(2)}`;
          } else {
            text = datum?.nums;
          }
          let newText = 0;
          if (!text) {
            if (data && data?.length) {
              newText = data.reduce((r: any, d: any) => r + d?.nums, 0);
            } else {
              newText = 0;
            }
          }
          return renderStatistic(
            container,
            text || newText,
            {
              fontSize: 24,
            },
            contentClassName || 'customContent',
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
      if (args?.type && typeof colors === 'object' && JSON.stringify(colors) !== '{}') {
        return {
          stroke: colors[args?.type],
        };
      }
      return {
        stroke: 'rgba(255, 255, 255, 0.8)',
      };
    },
    legend: {
      position: legendPosition,
      offsetX: legendPosition === 'right' ? -10 : 2,
      flipPage: true,
      itemSpacing: 2,
      maxRow: maxRowVal,
      pageNavigator: isBlack
        ? {
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
          }
        : {
            marker: {
              style: {
                // 非激活，不可点击态时的填充色设置
                inactiveFill: '#C6C8D2',
                // inactiveOpacity: 0.45,
                // 默认填充色设置
                fill: '#B5B8C7',
                // fill:'#000'
                // opacity: 0.8,
              },
            },
          },
      maxItemWidth: limitWidth,
      itemHeight: 20,
      maxHeight: legendPosition === 'right' ? maxhg : null,
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
        style: isBlack
          ? {
              fill: isBlack ? 'rgba(255, 255, 255, 0.5)' : '',
            }
          : {},
        formatter: (text: any, item: any) => {
          const items = data.filter((d: any) => d.type === item.name);
          let newpercent = '0';
          let newtext = '-';
          if (isNeedPercent) {
            const dataTotal = data.reduce((a: any, b: any) => a + b?.nums, 0);
            const percent = dataTotal > 0 ? items[0]?.nums / dataTotal : 0;
            newpercent = (percent * 100).toFixed(2);
            newtext = dataTotal > 0 ? `${text} ${newpercent}%` : '-';
          } else {
            newtext = items[0]?.nums ? `${text} ${items[0]?.nums}` : '-';
          }
          // console.log('newtext', newtext)
          return newtext;
        },
      },
    },
    theme: isBlack
      ? {
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
        }
      : {},
    interactions: [
      {
        type: 'pie-legend-active',
      },
      {
        type: 'element-selected',
        enable: isModal,
      },
      {
        type: 'element-active',
      },
      {
        type: 'legend-filter',
        enable: !isModal ? false : true,
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
    <div className={styles['ring-box']}>
      <Pie
        {...config}
        ref={chartRef}
        className={styles['pie-chart-container']}
        onReady={(pie: any) => {
          const viewWidth: any = pie?.chart?.viewBBox;
          let dwidth = 0;
          if (legendPosition === 'right') {
            if (viewWidth && viewWidth?.width <= 200) {
              dwidth = Math.min(60, viewWidth?.width * 0.4);
            } else if (viewWidth && viewWidth?.width > 200 && viewWidth?.width < 300) {
              dwidth = Math.min(75, viewWidth?.width * 0.4);
            } else {
              dwidth = viewWidth?.width * 0.25;
            }
            setLimitWidth(dwidth);
            setMaxhg(viewWidth.height - 20);
          } else {
            dwidth = viewWidth;
            setLimitWidth(viewWidth - 10);
            // setMaxhg(viewWidth.height - 20);
          }
          if (!isModalPlatform) {
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
                      return (
                        dat.type === cdata.current[cref.current > 0 ? cref.current - 1 : 0].type
                      );
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
          }
        }}
      />
      {isShowAvg ? (
        <div className={styles['avg-class-div']}>
          <span className={styles['avg-class-txt']}>平均分</span>
          <span className={styles['avg-class-score']}>{props?.avgData || 0}</span>
        </div>
      ) : null}
    </div>
  );
});

export default LeftDistributionPie;
