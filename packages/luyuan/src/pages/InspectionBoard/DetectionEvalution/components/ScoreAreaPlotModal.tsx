import { Modal, Card, Select } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from 'baseline/src/pages/InspectionBoard/styles.less';
import ScoreAreaPlot from './ScoreAreaPlot';
import propStyles from '../styles.less';
import EmptyPage from 'baseline/src/components/EmptyPage';
import { getUnitScore } from '../service';

const { Option } = Select;
type Iprops = {
  name: string;
  modalShow: boolean;
  projectId: string;
  roadTypeList: any[];
  onCancel: Function;
};
type recType = {
  key: string;
  datas: any[];
};

const AreaPlotModal: React.FC<Iprops> = (props) => {
  // const [info, setInfo] = useState<any>();
  const initData: recType[] = [
    { key: 'PQI', datas: [] },
    { key: 'PCI', datas: [] },
    { key: 'RQI', datas: [] },
    { key: '单点弯沉', datas: [] },
  ];
  enum enumType {
    'PQI' = 1,
    'PCI' = 2,
    'RQI' = 3,
    '单点弯沉' = 4,
  }
  const [typeRoad, setTypeRoad] = useState<number>(0);
  const [pieDatas, setPieDatas] = useState<recType[]>(initData);
  const getData = async (id: string, direction: number) => {
    const rec = await getUnitScore({ type: '', id, direction });
    const newDataInfo: recType[] = [];
    if (rec?.status === 0) {
      // rec?.data: {1:{1车道:[{unitStart:'',value:''},{unitStart:'',value:''}]}}
      Object.keys(rec?.data).forEach((it: any) => {
        const newData: any = [];
        if (rec?.data[it]) {
          // {1车道:[{type:'',nums:''},{type:'',nums:''}]}
          Object.keys(rec?.data[it])?.forEach((ita: any) => {
            // [{type:'',nums:''},{type:'',nums:''}]
            rec?.data[it][ita].forEach((ii: any) => {
              newData.push({ label: ii?.unitStart, value: ii?.score, type: ita });
            });
          });
        }
        newDataInfo.push({ key: enumType[it], datas: newData });
      });
    }
    setPieDatas(newDataInfo?.length > 0 ? newDataInfo : initData);
  };
  useEffect(() => {
    getData(props?.projectId, typeRoad);
  }, [typeRoad, props?.projectId]);
  const selectRoadType = (type: number) => {
    setTypeRoad(type);
  };

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
        <div className={propStyles['select-card']}>
          <Select
            popupClassName="dropdownSelectClass"
            style={{ marginRight: 0 }}
            defaultValue={0}
            className="searchFacilityClass selectMg10 modal-select"
            onChange={selectRoadType}
            placeholder="请选择"
          >
            {props.roadTypeList.map((item: any) => (
              <Option key={item?.type} className="facClass" value={item?.type}>
                {item?.name}
              </Option>
            ))}
          </Select>
        </div>
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
                    <ScoreAreaPlot
                      isLegendShow={true}
                      isRotate={true}
                      isModalPlatform={true}
                      info={it?.datas}
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

export default AreaPlotModal;
