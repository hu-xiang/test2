import React, { useState, useEffect } from 'react';
import styles from '../styles.less';
import PieChart from '../../../../components/PieChart';
// import { getDiseaseDis, getDeduDistribution } from '../service';
import propStyles from '../styles.less';
import EmptyPage from '../../../../components/EmptyPage';

interface Itype {
  liqingData: any[];
  cementData: any[];
  safeEvents: any[];
}
type Iprops = {
  dataInfo: Itype;
};
// const typeInfo: any = {
//   splitDeductCount: '裂缝类',
//   deformedDeductCount: '变形类',
//   looseDeductCount: '松散类',
//   otherDeductCount: '其他',
// };
const colorStokeDatas = [
  'rgba(70, 132, 247, 1)',
  'rgba(137, 203, 155, 1)',
  'rgba(249, 222, 125, 1)',
  'rgba(235, 125, 87, 1)',
  'rgba(130, 106, 249, 1)',
  'rgba(36, 174, 74, 1)',
  'rgba(55, 225, 135, 1)',
];
const colorFillDatas = [
  'rgba(70, 132, 247, 1)',
  'rgba(137, 203, 155, 1)',
  'rgba(249, 222, 125, 1)',
  'rgba(235, 125, 87, 1)',
  'rgba(130, 106, 249, 1)',
  'rgba(36, 174, 74, 1)',
  'rgba(55, 225, 135, 1)',
];
const PieGroup: React.FC<Iprops> = (props) => {
  const { dataInfo } = props;
  const [pieDatas, setPieDatas] = useState<any>([
    { key: '沥青路面病害', datas: [] },
    { key: '水泥路面病害', datas: [] },
    { key: '综合安全事件', datas: [] },
  ]);

  // const getDatas = async (id: string, isYear: boolean) => {
  //   const cementData: any[] = [];
  //   const liqingData: any[] = [];
  //   let rec1: any = {};
  //   let rec2: any = {};
  //   if (isYear) {
  //     rec1 = await getDiseaseDis({ roadType: 1 });
  //     rec2 = await getDiseaseDis({ roadType: 2 });
  //   } else {
  //     rec1 = await getDeduDistribution({ roadType: 1, id });
  //     rec2 = await getDeduDistribution({ roadType: 2, id });
  //   }
  //   let isAllZero1: boolean = true;
  //   let isAllZero2: boolean = true;
  //   if (rec1?.status === 0 && rec1?.data && JSON.stringify(rec1?.data) !== '{}') {
  //     Object.keys(rec1?.data).forEach((it: any) => {
  //       if (rec1?.data[it]) {
  //         isAllZero1 = false;
  //       }
  //       cementData.push({ type: typeInfo[it], nums: rec1?.data[it] });
  //     });
  //   }
  //   if (rec2?.status === 0 && rec2?.data && JSON.stringify(rec2?.data) !== '{}') {
  //     Object.keys(rec2?.data).forEach((it: any) => {
  //       if (rec2?.data[it]) {
  //         isAllZero2 = false;
  //       }
  //       liqingData.push({ type: typeInfo[it], nums: rec2?.data[it] });
  //     });
  //   }
  //   setPieDatas([
  //     { key: '水泥道路', datas: !isAllZero1 ? cementData || [] : [] },
  //     { key: '沥青道路', datas: !isAllZero2 ? liqingData || [] : [] },
  //   ]);
  // };
  useEffect(() => {
    if (dataInfo) {
      setPieDatas([
        { key: '沥青路面病害', datas: dataInfo?.liqingData },
        { key: '水泥路面病害', datas: dataInfo?.cementData },
        { key: '综合安全事件', datas: dataInfo?.safeEvents },
      ]);
    }
  }, [dataInfo]);

  return (
    <div className={`${styles['pie-group-box']}`}>
      {pieDatas.map((it: any) => (
        <React.Fragment key={it?.key}>
          <div className={`${styles['pie-box-item']}`}>
            <div className={styles['pie-item-head']}>
              {/* <span className={styles['icon-txt']} /> */}
              <span>{it?.key}</span>
            </div>
            <div className={styles['pie-item-chart']}>
              {it?.datas?.length > 0 ? (
                <PieChart
                  isModalPlatform={true}
                  isShowAvg={false}
                  colorFillDatas={colorFillDatas}
                  colorStokeDatas={colorStokeDatas}
                  legendPosition={'bottom'}
                  contentClassName={`pie-Content${it?.key}`}
                  titleClassName={`pie-Title${it?.key}`}
                  intervalTime={3000}
                  maxRowVal={1}
                  isBlack={false}
                  pieInfo={it?.datas}
                />
              ) : (
                <EmptyPage
                  content={'暂无数据'}
                  isBlack={false}
                  customEmptyChartClass={propStyles['pie-item-empty']}
                />
              )}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default PieGroup;
