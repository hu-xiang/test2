import React, { useState, useEffect, memo, useRef } from 'react';
import { Column } from '@ant-design/plots';
import EmptyStatus from 'baseline/src/components/TableEmpty';
import styles from 'baseline/src/pages/InspectionBoard/styles.less';

export type Iprop = {
  dataInfo: any[];
  unit: string;
  xfield?: string;
  yfield?: string;
  isModal: boolean;
  isSider: boolean;
};
const MileageBar: React.FC<Iprop> = memo((props) => {
  const { xfield = 'x', yfield = 'y', isModal, isSider = false } = props;
  const [con, setCon] = useState<any>({});
  const [data, setData] = useState<any>([]);
  const [paddingVal, setPaddingVal] = useState<any>([20, 8, 30, 38]);
  // const [labelval,setLabelval]= useState<any>({});
  const barRef: any = useRef();

  useEffect(() => {
    setData(props.dataInfo);
    if (isModal) {
      setPaddingVal([40, 8, 30, 38]);
    } else {
      /* eslint-disable */
      if (props.dataInfo?.length >= 5 && isSider) {
        setPaddingVal([20, 8, 60, 38]);
      } else if (props.dataInfo?.length < 5 && isSider) {
        setPaddingVal([20, 8, 30, 38]);
      }
    }
  }, [props.dataInfo]);

  useEffect(() => {
    if (isSider) {
      // console.log('isSider',props.dataInfo)
      if (props.dataInfo?.length < 5) {
        setCon({ slider: false });
      } else {
        // console.log('jinlai');
        setCon({
          slider: {
            // container:"silderId",
            start: 0.4,
            end: 1,
            height: 26,
            // padding:[0,0,0,0],
            fill: '#BDCCED',
            fillOpacity: 0.3,
            trendCfg: {
              backgroundStyle: {
                stroke: 'rgba(255,255,255,0)',
                shadowColor: 'rgba(255,255,255,0)',
              },
              lineStyle: {
                fill: 'rgba(255,255,255,0)',
                stroke: 'rgba(255,255,255,0)',
              },
            },
          },
        });
      }
    } else {
      // if(props.dataInfo?.length<4)
      // {
      //   setLabelval({xAxis: {
      //     label: {
      //       autoHide: false,
      //       autoEllipsis:true,
      //     }
      //   }})
      // }
      // else{
      //   setLabelval({xAxis: {
      //     label: {
      //       autoHide: false,
      //       autoEllipsis:true,
      //       formatter:(text: any,item: any)=>{
      //         console.log('ddfg',text,item)
      //         return text;
      //       }
      //     },
      //   }})
      // }
      setCon({ slider: false });
    }
  }, [isSider, props.dataInfo?.length]);
  const config: any = {
    data,
    xField: xfield,
    yField: yfield,
    padding: paddingVal,
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
        return text && text[yfield] ? `${text[yfield]}` : '';
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
        return { name: `${props?.unit}`, value: `${datum[yfield]}` };
      },
    },
  };

  return (
    <div style={{ height: '100%' }}>
      {data?.length > 0 ? (
        <Column {...config} {...con} ref={barRef} onReady={() => {}} />
      ) : (
        <EmptyStatus customEmptyClass={styles.pieEmpty} />
      )}
    </div>
  );
});

export default MileageBar;
