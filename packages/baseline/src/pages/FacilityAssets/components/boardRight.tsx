import { Card } from 'antd';
import React, { useState, useEffect, memo } from 'react';
import { getFacGroupByType } from '../service';
import Legend from '../../../../src/components/Legend';
import styles from '../../InspectionBoard/styles.less';
import proStyles from '../styles.less';
import facSvg from '../../../../public/images/icon-fac.svg';
import subfacSvg from '../../../../public/images/icon-subfac.svg';
import pointSvg from '../../../../public/images/map-point.svg';
import stakeImgSvg from '../../../../public/images/stakeImg.svg';

type Iprop = {
  mapType: string;
  singleProject: boolean;
  extraData?: any;
  programName?: string;
};
let isUnmountRight = false;
const BoardRight: React.FC<Iprop> = memo((props) => {
  const { singleProject, extraData } = props;
  const legendNumArr = [
    { name: '公路：优', value: '1', class: 'traffic-smooth' },
    { name: '公路：良', value: '2', class: 'traffic-amber' },
    { name: '公路：中', value: '3', class: 'traffic-middle' },
    { name: '公路：次', value: '4', class: 'traffic-congestion' },
    { name: '公路：差', value: '5', class: 'dark-congestion' },
  ];
  const legendIconArr = [
    {
      name: '道路设施',
      value: '11',
      src: facSvg,
      width: '21.98',
      height: '25.98',
    },
    {
      name: '附属设施',
      value: '12',
      src: subfacSvg,
      width: '21.98',
      height: '25.98',
    },
    { name: '病害标记', value: '13', src: pointSvg, width: '20.75', height: '24.09' },
    { name: '公里桩', value: '14', src: stakeImgSvg, width: '24', height: '24' },
  ];
  const legendRateArr = [
    { name: '城市：A', value: '21', class: 'traffic-smooth' },
    { name: '城市：B', value: '22', class: 'traffic-amber' },
    { name: '城市：C', value: '23', class: 'traffic-congestion' },
    { name: '城市：D', value: '24', class: 'dark-congestion' },
  ];
  const [disCardList, setDisCardList] = useState<any>([
    { key: 0, name: '道路总数(条)', num: 0 },
    { key: 2, name: '桥梁总数(座)', num: 0 },
    { key: 1, name: '隧道总数(座)', num: 0 },
  ]);

  const [mileTotalCount, setMileTotalCount] = useState<number | string>(0);
  const [mpLegendIconArr, setMpLegendIconArr] = useState<any[]>(legendIconArr);
  const getRightInfoData = async () => {
    const rec = await getFacGroupByType();
    let totalNum = 0;
    if (rec?.status === 0 && rec?.data?.length > 0 && !isUnmountRight) {
      const newData = disCardList.map((it: any) => {
        const item = rec?.data.find((itr: any) => itr.type === it?.key);
        if (item && item?.distance) {
          totalNum += item?.distance;
        }
        return { ...it, num: item?.num || 0 };
      });
      setDisCardList(newData);
    }
    setMileTotalCount(totalNum ? parseFloat(totalNum.toPrecision(12)).toFixed(2) : 0);
  };
  useEffect(() => {
    if (!singleProject) {
      getRightInfoData();
    }
  }, [singleProject]);

  useEffect(() => {
    // const newVal: any =
    //   Platform_Flag === 'meiping'
    //     ? legendIconArr.push({
    //       name: '公里桩',
    //       value: '14',
    //       src: stakeImgSvg,
    //       width: '24',
    //       height: '24',
    //     })
    //     : legendIconArr;
    const newVal: any = legendIconArr;
    setMpLegendIconArr(newVal);
    isUnmountRight = false;
    return () => {
      isUnmountRight = true;
    };
  }, []);
  //   const newlist = disCardList.map((it: any, index: any) => {
  //     /* eslint-disable */
  //     if (index === 0) {
  //       return { ...it, num: 22 };
  //     } else if (index === 1) {
  //       return { ...it, num: 16 };
  //     } else if (index === 2) {
  //       return { ...it, num: 7 };
  //     } else {
  //       return { ...it };
  //     }
  //   });
  //   setDisCardList(newlist);
  // }, []);

  return (
    <>
      {/* <div className={`${styles.rightPanelClass}`}> */}
      {!singleProject ? (
        <div
          className={`${styles.rightBgPanel} ${styles.panelClass} ${proStyles['right-panel-card']}`}
        >
          <div className={`${proStyles['faclity-card-first']}`}>
            <div className={proStyles['top-content']}>
              <div className={proStyles['top-content-bg']}>
                <span className={proStyles['top-content-txt']}>
                  {extraData?.isMpgs ? '线路' : '道路'}总里程(公里)
                </span>
                <span className={proStyles['top-content-num']}>{mileTotalCount}</span>
              </div>

              <div className={proStyles.dividerLine}></div>

              <div className={proStyles['top-content-bg']}>
                <span className={proStyles['top-content-txt']}>道路总数(条)</span>
                <span className={proStyles['top-content-num']}>
                  {disCardList?.filter((item: any) => item?.key === 0)[0]?.num}
                </span>
              </div>
            </div>
            {/* <div className={proStyles['foot-content']}>
              {disCardList.map((it: any) => (
                <React.Fragment key={it?.name}>
                  <div className={proStyles.rowItemClass}>
                    <div className={`${proStyles.centerItemClass} ${proStyles.itemClass}`}>
                      <span className={proStyles.centerItemNameClass}>{it?.name}</span>
                      <span className={proStyles.centerItemNumClass}>{it?.num}</span>
                    </div>
                    {it?.key !== 1 ? (
                      <div
                        className={`${proStyles.dividerClass} ${
                          it?.key === 2 ? proStyles[`divider-half-class`] : null
                        }`}
                      ></div>
                    ) : null}
                  </div>
                </React.Fragment>
              ))}
            </div> */}
          </div>
        </div>
      ) : null}
      <Card
        type="inner"
        className={`${proStyles['right-bottom-class']} ${
          singleProject && props?.mapType !== '3d' ? `${styles.fullBg}` : null
        }`}
      >
        <div className={`${proStyles['card-bottom-title']}`}>
          <span className={proStyles.titleCommonImg}></span>
          <span className={proStyles.titleTxt}>图例标识</span>
          <div className={proStyles.highlight}></div>
        </div>
        <div className={proStyles[`legend-panel-box`]}>
          <Legend
            fullScreenFlag={singleProject}
            diseaNums={legendNumArr}
            iconArr={mpLegendIconArr}
            rateArr={
              extraData?.isMpgs || ['changsha'].includes(props?.programName || '')
                ? []
                : legendRateArr
            }
            programName={props?.programName}
          />
        </div>
      </Card>
      {/* </div> */}
    </>
  );
});

export default BoardRight;
