import { Modal, Card } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from 'baseline/src/pages/InspectionBoard/styles.less';
import LeftDistributionPie from './LeftPieDistribution';
import propStyles from '../styles.less';
import EmptyPage from 'baseline/src/components/EmptyPage';
import { getProjectDistribution, getUnitDistribution } from '../service';

type Iprops = {
  name: string;
  modalShow: boolean;
  onCancel: Function;
  isSingleProject: boolean;
  projectId: string;
  year: any;
};
type recType = {
  key: string;
  datas: any[];
  avgData?: number;
};

const LeftPieDistributionModal: React.FC<Iprops> = (props) => {
  const { year } = props;
  enum enumType {
    'PQI' = 1,
    'PCI' = 2,
    'RQI' = 3,
    '养护等级' = 4,
  }
  const initData: recType[] = [
    { key: 'PQI', datas: [], avgData: 0 },
    { key: 'PCI', datas: [], avgData: 0 },
    { key: 'RQI', datas: [], avgData: 0 },
    { key: '养护等级', datas: [] },
  ];
  const [pieDatas, setPieDatas] = useState<recType[]>(initData);

  // 项目评分分布
  const getProjectDistData = async (id: string, isProject: boolean, yearVal?: any) => {
    const rec = isProject
      ? await getUnitDistribution({ type: '', id })
      : await getProjectDistribution({ type: '', year: yearVal });
    const newDataInfo: recType[] = [];
    if (rec?.status === 0) {
      Object.keys(rec?.data).forEach((it: any, index: any) => {
        let isAllZero: boolean = true;
        const newData: any = [];
        let avgVal: number = 0;
        if (rec?.data[it]?.length > 0) {
          rec?.data[it]?.forEach((ita: any) => {
            if (ita.type !== 'Average') {
              if (ita?.nums) {
                isAllZero = false;
              }
              newData.push(ita);
            } else {
              avgVal = ita?.nums;
            }
          });
        }
        if (it !== '4') {
          newDataInfo.push({
            key: enumType[it] || index,
            datas: !isAllZero ? newData : [],
            avgData: avgVal,
          });
        } else {
          newDataInfo.push({ key: enumType[it] || index, datas: !isAllZero ? newData : [] });
        }
      });
    }
    setPieDatas(newDataInfo?.length > 0 ? newDataInfo : initData);
  };
  useEffect(() => {
    if (!props?.projectId) {
      if (!year) {
        return;
      }
      getProjectDistData('', false, year);
    } else {
      getProjectDistData(props?.projectId, true);
    }
  }, [props?.projectId, year]);

  return (
    <Modal
      title={props.name}
      open={props.modalShow}
      footer={false}
      width={846}
      // style={{height:735}}
      onCancel={() => props.onCancel()}
      className={`${styles.chartModalClass} ${propStyles['modal-card-scores']}`}
      mask={false}
      maskClosable={false}
    >
      <Card type="inner" className={`${styles.cardBcg} ${styles.modalChartCommonClass}`}>
        <div className={`${propStyles['modal-card']}`}>
          {pieDatas.map((it: any) => (
            <React.Fragment key={it?.key}>
              <div className={propStyles['modal-card-item']}>
                <div className={propStyles['card-item-head']}>
                  <span className={propStyles['icon-txt']} />
                  <span>{it?.key}</span>
                </div>
                <div className={propStyles['card-item-line']}>
                  {it?.datas?.length > 0 ? (
                    <LeftDistributionPie
                      isModalPlatform={true}
                      contentClassName={`scoreContent${enumType[it?.key]}`}
                      titleClassName={`scoreTitle${enumType[it?.key]}`}
                      isShowAvg={it?.key !== '养护等级'}
                      intervalTime={3000}
                      pieInfo={it?.datas}
                      avgData={it?.avgData}
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

export default LeftPieDistributionModal;
