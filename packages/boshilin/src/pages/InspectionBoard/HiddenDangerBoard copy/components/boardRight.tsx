import { Card, Row, Col } from 'antd';
import React, { useState, useEffect, memo, Fragment } from 'react';
import EmptyPage from 'baseline/src/components/EmptyPage';
// import ProTable from '@ant-design/pro-table';
// import EmptyStatus from 'baseline/src/components/TableEmpty';
// import MileageBar from './MileageBar';
// import doLarger from 'baseline/src/assets/img/InspectionBoard/doLarger.svg';
// import { getDetectMileage } from '../service';
// import MileageBarModal from './MileageModal';
import { Tree } from 'antd';
import Legend from './Legend';
import { useModel } from 'umi';
// import EllipsisTooltip from 'baseline/src/components/EllipsisTooltip';
import styles from 'baseline/src/pages/InspectionBoard/styles.less';
import proStyles from '../styles.less';
// import { barData1, barData2 } from './testData';

type Iprop = {
  mapType: string;
  dataRightInfo: any;
  treeData: any;
  handleFac: (fac: string, road: string) => void;
  handleSceneType: (fac: string, road: string, name: string) => void;
  // handleNodeLevel: (type: string) => void;
  handleScene: any;
  expandDatas: any[];
  selectKeys: any[];
};
const colType = {
  状态: [
    { type: '状态', num: '状态' },
    { type: '轻微', num: 0 },
    { type: '一般', num: 0 },
    { type: '重大', num: 0 },
    { type: '特大', num: 0 },
  ],
};
const BoardRight: React.FC<Iprop> = memo((props) => {
  const {
    dataRightInfo,
    treeData,
    handleFac,
    handleScene,
    handleSceneType,
    selectKeys,
    expandDatas,
  } = props;
  const { setNodeType } = useModel<any>('hiddenboard');
  const [expandKeys, setExpandKeys] = useState<any>([]);
  const [selectDatas, setSelectDatas] = useState<any>([]);
  // const actionRef = useRef<any>();
  const [accidentData, setAccidentData] = useState<any>([]);
  const [treeDataSource, setTreeDataSource] = useState<any[]>([]);
  const legendNumArr = [
    { name: '隐患数量≤10', value: '1', class: 'numcolor1' },
    { name: '隐患数量(10-49)', value: '2', class: 'numcolor2' },
    { name: '隐患数量(50-199)', value: '3', class: 'numcolor3' },
    { name: '隐患数量≥200', value: '4', class: 'numcolor4' },
  ];
  const legendIconArr = [
    {
      name: '隐患标记',
      value: '1',
      src: 'images/icon-danger.svg',
      width: '20.75',
      height: '24.09',
    },
  ];
  const legendRateArr = [
    { name: '路况：畅通', value: '1', class: 'traffic-smooth' },
    { name: '路况：缓行', value: '2', class: 'traffic-amber' },
    { name: '路况：拥堵', value: '3', class: 'traffic-congestion' },
    { name: '路况：严重拥堵', value: '4', class: 'dark-congestion' },
  ];
  useEffect(() => {
    setSelectDatas(selectKeys);
  }, [selectKeys]);
  useEffect(() => {
    setExpandKeys(expandDatas);
  }, [expandDatas]);
  useEffect(() => {
    let newData: any = [];
    if (dataRightInfo && dataRightInfo?.length) {
      newData = dataRightInfo.map((it: any) => {
        // console.log('nishisha',dataRightInfo,it)
        if (it && Object.keys(it)?.length) {
          Object.keys(it).forEach((itm: any) => {
            it[itm]?.unshift({ type: itm, num: itm });
          });
        }
        return { ...it };
      });
      newData.unshift(colType);
    }
    setAccidentData(newData);
  }, [dataRightInfo]);
  useEffect(() => {
    setTreeDataSource(treeData);
  }, [treeData]);
  const getColor = (type: string) => {
    let rcVal: any = ``;
    switch (type) {
      case '轻微':
        rcVal = `${proStyles['color-bg-green']}`;
        break;
      case '一般':
        rcVal = `${proStyles['color-bg-blue']}`;
        break;
      case '重大':
        rcVal = `${proStyles['color-bg-orange']}`;
        break;
      case '特大':
        rcVal = `${proStyles['color-bg-red']}`;
        break;
      default:
        rcVal = `${proStyles['color-bg-normal']}`;
        break;
    }
    return rcVal;
  };
  const handleTreeBlur = () => {
    setExpandKeys([]);
  };
  // 点击了场景类型
  const handleSelectFac = (val: any, name: string, roadid: string) => {
    if (!val) {
      return;
    }
    // console.log('val', val);
    const dataArr = val.split('_');
    const facNum = dataArr[0] || '';
    // const roadNum=dataArr[2]||'';
    // console.log('val场景类型', facNum);
    if (facNum) {
      handleSceneType(facNum, roadid, name);
      // handleFac(facNum || '',roadNum);
    }
  };
  const handleExpand = (expandedKeys: any) => {
    if (expandedKeys.slice(-1)[0]?.indexOf('road') > -1) {
      setExpandKeys(expandedKeys.slice(-1));
    } else {
      setExpandKeys(expandedKeys);
    }
  };
  const handleTreeNode = (newVal: any, e: any) => {
    // console.log('handleTreeNode', newVal, e);
    setSelectDatas(newVal);
    if (!newVal || !newVal?.length) {
      return;
    }
    if (newVal[0]?.indexOf('road') > -1) {
      // 点到了道路节点，就收缩
      setExpandKeys([]);
      setNodeType('road');
    } else if (newVal[0]?.indexOf('fac') > -1) {
      // 点到设施
      // console.log('点到设施');
      setNodeType('fac');
      const dArr = newVal[0].split('_');
      const newfac = dArr[1] || '';
      const newRoadid = dArr[2] || '';
      // console.log('点到设施',newfac, newRoadid)
      handleFac(newfac, newRoadid);
    } else if (newVal[0]?.indexOf('sceneType') > -1) {
      //  点到场景类型
      // console.log('点到场景类型',newVal[0],e?.node?.extraInfo )
      setNodeType('sceneType');
      handleSelectFac(newVal[0], e?.node?.title, e?.node?.extraInfo);
    } else {
      // 点到场景
      setNodeType('scene');
      const vals: any = newVal[0].indexOf('_') > -1 ? newVal[0].split('_') : newVal[0];
      // console.log('点到场景',vals,newVal);
      if (Array.isArray(vals)) {
        handleScene(vals[1], vals[0], e?.node?.extraInfo?.roadid);
      }
    }
  };

  return (
    <>
      <div className={`${styles.rightPanelClass}`}>
        <div
          className={`${styles.rightBgPanel} ${styles.panelClass} ${proStyles['right-top-panel']}`}
        >
          <div className={`${proStyles.rightFirstCard}`}>
            <div className={styles.rightFirstTitle}>
              <span className={styles.firstTitleImg}></span>
              <span className={styles.titleTxt}>道路场景</span>
              <div className={styles.highlight}></div>
            </div>
            <div className={proStyles['right-first-board']}>
              {treeDataSource && treeDataSource?.length ? (
                <Tree
                  className="inspect-tree-list"
                  blockNode={true}
                  treeData={treeDataSource}
                  expandedKeys={expandKeys}
                  selectedKeys={selectDatas}
                  onExpand={handleExpand}
                  style={{ height: '100%' }}
                  defaultExpandAll
                  onSelect={handleTreeNode}
                  onBlur={handleTreeBlur}
                />
              ) : (
                <EmptyPage content={'暂无数据'} customEmptyChartClass={proStyles['table-empty']} />
              )}
            </div>
          </div>
          <Card type="inner" className={`${styles.cardBcg} ${proStyles['card-table-accident']}`}>
            <div className={`${styles.cardTitle} ${styles.cardRightTitle}`}>
              <div className={`${styles.rightFirstTitle} ${styles.rightPadTitle}`}>
                <span className={styles.firstTitleImg}></span>
                <span className={styles.titleTxt}>事故数量统计</span>
              </div>
              <div className={styles.highlight}></div>
            </div>
            <div className={proStyles['accident-table']}>
              <Row gutter={[10, 20]} className={proStyles.rowLengend}>
                {accidentData && accidentData?.length ? (
                  accidentData.map((it: any, index: number) => {
                    return (
                      <Fragment key={`${index + 1}`}>
                        <div className={proStyles['col-class']}>
                          {it &&
                            Object.keys(it)?.length &&
                            Object.keys(it)?.map((itr: any) => {
                              if (it[itr]?.length) {
                                return (
                                  <Fragment key={`${itr}`}>
                                    <div className={proStyles['col-item-class']}>
                                      {it[itr].map((itm: any) => {
                                        return (
                                          <Col
                                            span={24}
                                            className={proStyles.colLengend}
                                            key={`${itm?.type}${itr}`}
                                          >
                                            <div
                                              className={`${
                                                itr !== '状态'
                                                  ? proStyles['col-name']
                                                  : getColor(itm?.type)
                                              }`}
                                            >
                                              <span>{itr !== '状态' ? itm?.num : itm?.type}</span>
                                            </div>
                                          </Col>
                                        );
                                      })}
                                    </div>
                                  </Fragment>
                                );
                              }
                              return null;
                            })}
                        </div>
                      </Fragment>
                    );
                  })
                ) : (
                  <EmptyPage
                    content={'暂无数据'}
                    customEmptyChartClass={proStyles['table-empty']}
                  />
                )}
              </Row>
            </div>
          </Card>
        </div>
        <Card
          type="inner"
          className={`${styles.cardBcg} ${styles.rightBgPanel} ${
            styles['right-new-bottom-class']
          } ${props?.mapType !== '3d' ? `${styles.fullBg}` : null}`}
        >
          <div className={`${styles.cardTitle}  ${styles.cardRightTitle}`}>
            <div className={`${styles.rightFirstTitle} ${styles.rightBottomTitle}`}>
              <span className={styles.firstTitleImg}></span>
              <span className={styles.titleTxt}>图例标识</span>
              <div className={styles.highlight}></div>
            </div>
          </div>
          <div className={styles.legendPanelClass}>
            <Legend diseaNums={legendNumArr} iconArr={legendIconArr} rateArr={legendRateArr} />
          </div>
        </Card>
      </div>
    </>
  );
});

export default BoardRight;
