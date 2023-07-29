import { Modal, Card } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from '../../../../src/pages/InspectionBoard/styles.less';
// import LeftDistributionPie from './LeftPieDistribution';
import FacilityPie from './FacilityPie';
import { getFacAllDistribution } from '../service';
import propStyles from '../styles.less';
import EmptyPage from '../../../../src/components/EmptyPage';
// import {distributionYearliqing,distributionProject1liqing} from './testData.js'

type Iprops = {
  name: string;
  modalShow: boolean;
  onCancel: Function;
  isSingleProject: boolean;
  projectId: string;
};
// const typeInfo: any = {
//   splitDeductCount: '裂缝类',
//   deformedDeductCount: '变形类',
//   looseDeductCount: '松散类',
//   otherDeductCount: '其他',
// };
let isUnmountPie = false;
const FacModal: React.FC<Iprops> = (props) => {
  const [pieDatas, setPieDatas] = useState<any>([
    { key: '城市道路', datas: [] },
    { key: '公路', datas: [] },
  ]);

  const getDatas = async () => {
    const rec = await getFacAllDistribution();
    let isAllZero1: boolean = true;
    let isAllZero2: boolean = true;
    const sdata: any = [];
    const ldata: any = [];
    if (!isUnmountPie) {
      if (rec?.status === 0 && rec?.data && JSON.stringify(rec?.data) !== '{}') {
        Object.keys(rec?.data).forEach((it: any) => {
          if (it.toString() === '0' && rec?.data[it]?.length > 0) {
            rec?.data[it]?.forEach((itr: any) => {
              if (itr?.nums) {
                isAllZero1 = false;
              }
              sdata.push({ type: itr?.type, nums: itr?.nums });
            });
          } else {
            rec?.data[it]?.forEach((itm: any) => {
              if (itm?.nums) {
                isAllZero2 = false;
              }
              ldata.push({ type: itm?.type, nums: itm?.nums });
            });
          }
        });
      }
      setPieDatas([
        { key: '城市道路', datas: !isAllZero1 ? sdata : [], value: 0 },
        { key: '公路', datas: !isAllZero2 ? ldata : [], value: 1 },
      ]);
    }
  };
  useEffect(() => {
    getDatas();
    isUnmountPie = false;
    return () => {
      isUnmountPie = true;
    };
  }, []);

  return (
    <Modal
      title={props.name}
      open={props.modalShow}
      footer={false}
      width={846}
      // style={{height:470}}
      onCancel={() => props.onCancel()}
      className={`${styles.chartModalClass} ${propStyles['modal-card-dedu']}`}
      mask={false}
      maskClosable={false}
    >
      <Card type="inner" className={`${styles.cardBcg} ${styles.modalChartCommonClass}`}>
        <div className={`${propStyles['modal-card']}`}>
          {pieDatas.map((it: any) => (
            <React.Fragment key={it?.key}>
              <div
                className={`${propStyles['modal-card-item']} ${propStyles['modal-card-item-height']}`}
              >
                <div className={propStyles['card-item-head']}>
                  <span className={propStyles['icon-txt']} />
                  <span>{it?.key}</span>
                </div>
                <div className={propStyles['card-item-line']}>
                  {it?.datas?.length > 0 ? (
                    // <LeftDistributionPie
                    //   isModalPlatform={true}
                    //   isShowAvg={false}
                    //   contentClassName={`facContent${ind}`}
                    //   titleClassName={`facTitle${ind}`}
                    //   intervalTime={3000}
                    //   pieInfo={it?.datas}
                    // />
                    <FacilityPie type={it?.value} platform={'large'} dataInfo={it?.datas} />
                  ) : (
                    <EmptyPage
                      content={'暂无数据'}
                      customEmptyChartClass={propStyles['card-item-empty']}
                    />
                  )}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </Card>
    </Modal>
  );
};

export default FacModal;
