import { Pie, measureTextWidth } from '@ant-design/plots';
// import { Empty } from 'antd';
import EmptyStatus from '../../../components/TableEmpty';
import React, { useEffect, useRef, useState, memo } from 'react';
import styles from '../styles.less';
// import { getDistributionData } from '../service';
import { mapKeys } from 'lodash';
// import { facilityData, facilityRoadData, facilityBridgeData } from './testData';

import { mockFacilityDistributed } from '../../../../mock/inspection';

type Iprop = {
  type: any;
  platform: any;
};

const FacilityPie: React.FC<Iprop> = memo((props) => {
  const [data, setData] = useState<any>([]);
  const [limitWidth, setLimitWidth] = useState<any>();
  const cref: any = useRef();
  const cdata: any = useRef();
  const chartRef: any = useRef();
  const flagRef: any = useRef();
  const newInterval: any = useRef(0);
  // const [isHover, setIsHover] = useState<any>(false);
  const [maxhg, setMaxhg] = useState<any>();
  const [keyArr, setKeyArr] = useState<any>([]);
  // 设施分布统计
  const facilityTypes: any = [
    { 0: '快速路', 1: '主干道', 2: '次干道', 3: '支路' },
    { 4: '高速公路', 5: '一级公路', 6: '二级公路', 7: '三级公路', 8: '四级公路' },
  ];
  const colorType = [
    'rgba(55, 87, 255, 0.4)',
    'rgba(55, 144, 255, 0.4)',
    'rgba(55, 204, 255, 0.4)',
    'rgba(55, 255, 235, 0.4)',
    'rgba(55, 225, 135, 0.4)',
  ];
  const colors = [
    'rgba(55, 87, 255, 1)',
    'rgba(59, 134, 246, 1)',
    'rgba(55, 204, 255, 1)',
    'rgba(55, 255, 235, 1)',
    'rgba(55, 225, 135, 1)',
  ];
  const renderStatistic = (container: any, text: any, style: any, customName: any) => {
    const { width } = container.getBoundingClientRect();
    const textWidth = measureTextWidth(text, style);
    const R = width / 2; // r^2 = (w / 2)^2 + (h - offsetY)^2
    const scale = Math.min(Math.sqrt(Math.abs(R ** 2 / (textWidth / 2) ** 2)), 1);
    const textStyleStr = `width:${width}px;`;
    return `<div  class="${customName}" style="${textStyleStr};font-size:${scale}em;line-height:${
      scale < 1 ? 1 : 'inherit'
    };">${text}</div>`;
  };
  useEffect(() => {
    const getDistributionDatas = async () => {
      try {
        // const res = await getDistributionData({ roadType: props.type });
        const res = mockFacilityDistributed;
        if (res && res?.status === 0) {
          if (res?.data?.length > 0) {
            const newDatas: any = [];
            res.data.forEach((it: any) => {
              const val = it?.num ? parseFloat(it?.num) : 0;
              if (val) {
                newDatas.push({
                  type: facilityTypes[props.type][it.type],
                  num: val,
                });
              }
            });
            setData(newDatas);
          } else {
            setData([]);
          }
        } else {
          setData([]);
        }
      } catch (error) {
        console.log('设施分布接口查询失败');
      }
    };
    getDistributionDatas();
    if (props.type !== null || props.type !== undefined) {
      const newArr: any = [];
      if (Object.keys(facilityTypes[props.type])?.length > 0) {
        mapKeys(facilityTypes[props.type], (value: any, key: any) => {
          newArr.push({ key, value });
        });
        setKeyArr(newArr);
      }
    }
  }, []);
  // 循环执行的内容
  const setIntervalData = () => {
    const pie = chartRef.current && chartRef.current.getChart();
    const setUpdateInfo = () => {
      if (cdata.current?.length > 1 && pie && !flagRef.current) {
        const total = cdata.current.reduce((r: any, d: any) => r + d?.num, 0);
        const percent = total > 0 ? cdata.current[cref.current].num / total : 0;
        const newpercent = (percent * 100).toFixed(2);
        const textContent = `${newpercent}%`;
        if (document.querySelector('.customFacilityContent')) {
          document.querySelector('.customFacilityContent')!.innerHTML = textContent;
        }
        const textTitle = cdata.current[cref.current].type || '总计';
        if (document.querySelector('.customFacilityTitle')) {
          document.querySelector('.customFacilityTitle')!.innerHTML = textTitle;
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
        // 这两句请慎重改动，改动后注意测试饼图选中比例
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
      newInterval.current = setInterval(() => {
        setUpdateInfo();
      }, 4000);
    }
  };

  useEffect(() => {
    if (data?.length > 1) {
      cdata.current = data.slice();
      setIntervalData();
    }
    return () => {
      clearInterval(newInterval.current);
      cref.current = 0;
    };
  }, [data]);
  // const styleTextAlign: 'center' | 'left' | 'right' | undefined = 'center';
  const config: any = {
    appendPadding: [12, 10, 10, 10],
    data,
    angleField: 'num',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.7,
    color: (typeVal: any) => {
      let ind: number = -1;
      if (typeVal?.type) {
        if (keyArr?.length > 0) {
          ind = keyArr.findIndex((it: any) => {
            return it?.value === typeVal?.type;
          });
        }
        return colorType[ind];
      }
      return colorType[0];
    },
    pieStyle: (args: any) => {
      let index = -1;
      if (keyArr?.length > 0) {
        index = keyArr.findIndex((it: any) => {
          return it?.value === args?.type;
        });
      }
      return {
        stroke: index >= 0 ? colors[index] : 'rgba(255, 255, 255, 0.8)',
      };
    },
    state: {
      // interactions: [{ type: 'pie-legend-active' }],
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
    tooltip: { showTitle: false },
    statistic: {
      title: {
        offsetY: 25,
        style: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '12px',
        },
        customHtml: (container: any, view: any, datum: any) => {
          const text = datum ? datum?.type : '总计';
          return renderStatistic(
            container,
            text,
            {
              fontSize: 12,
            },
            'customFacilityTitle',
          );
        },
      },
      content: {
        offsetY: -20,
        offsetX: 2,
        style: {
          color: '#ABC9E7',
          fontSize: '22px',
          fontFamily: `'Bebas-Neue', Arial, sans-serif`,
          fontWeight: '400',
        },
        customHtml: (container: any, view: any, datum: any) => {
          const total = data.reduce((r: any, d: any) => r + d?.num, 0);
          const percent = total > 0 ? datum?.num / total : 0;
          const newpercent = (percent * 100).toFixed(2);
          const text = datum ? ` ${newpercent}%` : `${total.toFixed(2)}`;
          return renderStatistic(
            container,
            text,
            {
              fontSize: 22,
            },
            'customFacilityContent',
          );
        },
      },
    },
    legend: {
      position: 'right',
      selected: true,
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
            stroke: oldStyle.stroke || oldStyle.fill,
          };
        },
      },
      itemName: {
        style: {
          fill: 'rgba(255, 255, 255, 0.3)',
        },
        formatter: (text: any, item: any) => {
          const items = data.filter((d: any) => d.type === item.name);
          const dataTotal = data.reduce((a: any, b: any) => a + b?.num, 0);
          const percent = dataTotal > 0 ? items[0]?.num / dataTotal : 0;
          const newpercent = (percent * 100).toFixed(2);
          return dataTotal > 0 ? `${text} ${newpercent}%` : '-';
        },
      },
    },
    // renderer: 'svg',
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
    interactions: [
      {
        type: 'pie-legend-active',
      },
      {
        type: 'element-single-selected',
      },
      {
        type: 'legend-filter',
        enable: flagRef.current,
      },
      {
        type: 'element-active',
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
      {data?.length > 0 ? (
        <Pie
          {...config}
          ref={chartRef}
          className={styles.pieFacilityBox}
          onReady={(chart: any) => {
            const viewWidth: any = chart?.chart?.viewBBox;
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
            chart.on('legend-item:mouseenter', (evt: any) => {
              flagRef.current = true;
              const delegateObject: any = evt.target.get('delegateObject');
              if (cref.current !== 0 && delegateObject?.index !== cref.current - 1) {
                chart.setState(
                  'selected',
                  (dat: any) => {
                    return dat.type !== cdata.current[cref.current].type;
                  },
                  false,
                );
              } else {
                /* eslint-disable */
                if (cdata.current) {
                  chart.setState(
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
              if (newInterval.current) {
                clearInterval(newInterval.current);
                newInterval.current = 0;
              }
            });
            chart.on('legend-item:mouseleave', () => {
              flagRef.current = false;
              setIntervalData();
            });
          }}
        />
      ) : (
        <EmptyStatus customEmptyClass={styles.pieEmpty} />
      )}
    </div>
  );
});

export default FacilityPie;
