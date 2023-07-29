import { Modal, Card } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from 'baseline/src/pages/InspectionBoard/styles.less';
import LeftDistributionPie from './LeftPieDistribution';
import { getDiseaseDis, getDeduDistribution } from '../service';
import propStyles from '../styles.less';
import EmptyPage from 'baseline/src/components/EmptyPage';

type Iprops = {
  name: string;
  modalShow: boolean;
  onCancel: Function;
  isSingleProject: boolean;
  projectId: string;
  year: any;
};
const typeInfo: any = {
  splitDeductCount: '裂缝类',
  deformedDeductCount: '变形类',
  looseDeductCount: '松散类',
  otherDeductCount: '其他',
};

const LeftPieDeduModal: React.FC<Iprops> = (props) => {
  const { year } = props;
  const [pieDatas, setPieDatas] = useState<any>([
    { key: '水泥道路', datas: [] },
    { key: '沥青道路', datas: [] },
  ]);

  const getDatas = async (id: string, isYear: boolean, yearVal?: any) => {
    const cementData: any[] = [];
    const liqingData: any[] = [];
    let rec1: any = {};
    let rec2: any = {};
    if (isYear) {
      rec1 = await getDiseaseDis({ roadType: 1, year: yearVal });
      rec2 = await getDiseaseDis({ roadType: 2, year: yearVal });
    } else {
      rec1 = await getDeduDistribution({ roadType: 1, id });
      rec2 = await getDeduDistribution({ roadType: 2, id });
    }
    let isAllZero1: boolean = true;
    let isAllZero2: boolean = true;
    if (rec1?.status === 0 && rec1?.data && JSON.stringify(rec1?.data) !== '{}') {
      Object.keys(rec1?.data).forEach((it: any) => {
        if (rec1?.data[it]) {
          isAllZero1 = false;
        }
        cementData.push({ type: typeInfo[it], nums: rec1?.data[it] });
      });
    }
    if (rec2?.status === 0 && rec2?.data && JSON.stringify(rec2?.data) !== '{}') {
      Object.keys(rec2?.data).forEach((it: any) => {
        if (rec2?.data[it]) {
          isAllZero2 = false;
        }
        liqingData.push({ type: typeInfo[it], nums: rec2?.data[it] });
      });
    }
    setPieDatas([
      { key: '水泥道路', datas: !isAllZero1 ? cementData || [] : [] },
      { key: '沥青道路', datas: !isAllZero2 ? liqingData || [] : [] },
    ]);
  };
  useEffect(() => {
    if (!props?.projectId) {
      if (!year) {
        return;
      }
      getDatas('', true, year);
    } else {
      getDatas(props?.projectId, false);
    }
  }, [props?.projectId, year]);

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
                    <LeftDistributionPie
                      isModalPlatform={true}
                      isShowAvg={false}
                      contentClassName={`deduContent${it?.key}`}
                      titleClassName={`deduTitle${it?.key}`}
                      intervalTime={3000}
                      pieInfo={it?.datas}
                    />
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

export default LeftPieDeduModal;
