import { Card, Select, message } from 'antd';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import styles from '../styles.less';
// import EllipsisTooltip from '../../../../components/EllipsisTooltip';
import AreaPlot from '../../../../components/AreaPlot';
import BarChart from '../../../../components/BarChart';
import GroupBar from '../../../../components/BarChart/groupBar';
import PieChart from '../../../../components/PieChart';
import { exportCom } from '../../../../utils/exportCom';
// import selectArrow from '../../../../assets/img/inspectionBoard/selectArrow.svg'
// import LeftPie from './leftPie';
import { typeVals } from '../data.d';
import CardTitle from './CardTitle';
import EmptyPage from '../../../../components/EmptyPage';
import { useModel } from 'umi';
import {
  getDiseaseSevenNums,
  getDiseaseSevenDist,
  getFacSevenDisease,
  exportInfo,
  sizeTotal,
} from '../service';

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
const { Option } = Select;
const customColor = {
  总数: 'l(90) 0:rgba(70, 132, 247, 1) 0.75: rgba(70, 132, 247, 0.2) 1 rgba(70, 132, 247, 0)',
  紧急: 'l(90) 0.27:rgba(36, 174, 74, 1) 0.75: rgba(36, 174, 74, 0.26) 1 rgba(36, 174, 74, 0.1)',
  非紧急:
    'l(90) 0.04:rgba(130, 106, 249, 1) 0.75: rgba(130, 106, 249, 0.2)  1: rgba(130, 106, 249, 0.1)',
};
const lineColors = ['rgba(70, 132, 247, 1)', 'rgba(36, 174, 74, 1)', 'rgba(130, 106, 249, 1)'];
const typeMap = {
  1: 'taskCementData',
  2: 'taskLiQingData',
  3: 'taskSafeEvent',
};
const MapLeft: React.FC = () => {
  const { fkId } = useModel<any>('trend');
  const headDiseaRef: any = useRef<typeof CardTitle>();
  const headSinglePlotRef: any = useRef<typeof CardTitle>();
  const headFacRef: any = useRef<typeof CardTitle>();
  const headSizeRef: any = useRef<typeof CardTitle>();
  const [btnDiseaseType, setBtnDiseaseType] = useState(1); // 近7天新增病害分布对应的类型
  const [btnfacType, setBtnfacType] = useState(1); // 近7天设施新增病害数量对应的类型
  const [btnDistributionType, setBtnDistributionType] = useState(1); // 近7天新增病害分布对应的类型,周月年
  const [diseaseType, setDiseaseType] = useState<any>(2); // 1水泥2、沥青
  const [diseaseDistrNums, setDiseaseDistrNums] = useState<any[]>([]); // 近7天新增病害分布
  const [sevenDiseaNums, setSevenDiseaNums] = useState<any[]>([]); // 近7天新增病害数量
  const [sevenFacDisNums, setSevenFacDisNums] = useState<any[]>([]); // 近7天设施新增病害数量
  /* eslint-disable */
  const [sizeList, setSizeList] = useState<any[]>([]); // 近7天设施新增病害尺寸
  const [btnSizeType, setBtnSizeType] = useState(1); // 近7天设施新增病害尺寸
  /* eslint-enable */
  // const getInfo = async () => {
  //   const res = await getColInfo(btnType);
  //   setInfo(res.data);
  // };
  const selectValue = (text: any) => {
    setDiseaseType(text);
  };
  // const getSevenDisNums=  async (facilitiesId: string,type: string) => {
  //   const res = await getDiseaseSevenNums({facilitiesId: fkId, type:btnType});
  //   if (res?.status===0) {
  //     setDiseasePie(res.data);
  //   }
  // }
  // const getSevenDisNums=async ()=>{

  // }
  // const getPieInfo = async () => {
  //   const res = await getDiseasePieInfo(taskType, btnType);
  //   setDiseasePie(res.data);
  // };
  useEffect(() => {
    setBtnDistributionType(1);
    setDiseaseType(2);
    setBtnDiseaseType(1);
    setBtnfacType(1);
    if (headDiseaRef?.current) {
      headDiseaRef?.current?.setDefalutVal();
    }
    if (headSinglePlotRef?.current) {
      headSinglePlotRef?.current?.setDefalutVal();
    }
    // if (headFacRef?.current) {
    //   headFacRef?.current?.setDefalutVal();
    // }
    if (headSizeRef?.current) {
      headSizeRef?.current?.setDefalutVal();
    }
  }, [fkId]);
  // 为防止切换页面后请求还在继续
  useEffect(() => {
    let isUnmounted = false;
    (async () => {
      const res = await getDiseaseSevenNums({ facilitiesId: fkId, type: btnDiseaseType });
      if (!isUnmounted) {
        setSevenDiseaNums(res.data);
      }
    })();

    return () => {
      isUnmounted = true;
    };
  }, [btnDiseaseType, fkId]);

  useEffect(() => {
    // getInfo();
    let isUnmounted = false;
    // const abortController = new AbortController(); // 创建
    if (!fkId) {
      if (['changsha', 'meiping'].includes(Platform_Flag)) {
        (async () => {
          if (!isUnmounted) {
            const res = await getFacSevenDisease({ facilitiesId: fkId, type: btnfacType });

            const recval: any[] = [];
            if (res?.data && res?.data?.length) {
              res?.data.forEach((it: any) => {
                recval.push({ x: it?.facilitiesName, y: it?.total ? Number(it?.total) : 0 });
              });
            }
            setSevenFacDisNums(recval);
          }
        })();
      } else {
        (async () => {
          if (!isUnmounted) {
            const res = await sizeTotal({ facilitiesId: fkId, type: btnSizeType });

            if (res?.data) {
              const ret: any = [];
              res.data.forEach((item: any) => {
                ret.push({
                  x: item.collectTime,
                  y: item.length,
                  type: '长度',
                });
                ret.push({
                  x: item.collectTime,
                  y: item.area,
                  type: '面积',
                });
              });
              setSizeList(ret);
            }
          }
        })();
      }
    }
    return () => {
      isUnmounted = true;
    };
  }, [btnfacType, fkId, btnSizeType]);

  useEffect(() => {
    let isUnmounted = false;
    const getDatas = async () => {
      const res = await getDiseaseSevenDist({
        facilitiesId: fkId,
        type: btnDistributionType,
        taskType: diseaseType,
      });
      if (!isUnmounted) {
        const recval: any[] = [];
        let isHasData = false;
        if (res?.data) {
          const newData = res?.data[typeMap[diseaseType]];
          if (newData && newData?.length) {
            newData.forEach((it: any) => {
              if (it?.total && !isHasData) {
                isHasData = true;
              }
              recval.push({ type: it?.diseaseTypeName, nums: it?.total ? Number(it?.total) : 0 });
            });
          }
        }
        setDiseaseDistrNums(isHasData ? recval : []);
      }
    };
    if (fkId) {
      getDatas();
    }
    return () => {
      isUnmounted = true;
    };
  }, [btnDistributionType, fkId, diseaseType]);
  const handleChangeDiseaType = (type: number) => {
    setBtnDiseaseType(type);
  };
  const handleChangeDistrType = (type: number) => {
    setBtnDistributionType(type);
  };
  const handleChangeFacType = (type: number) => {
    setBtnfacType(type);
  };
  const handleExport = async (typename: string) => {
    let url: string = '';
    let params: any;
    switch (typename) {
      case 'diseaseNum':
        url = 'trend/lineChartExport';
        params = { facilitiesId: fkId, type: btnDiseaseType };
        break;
      case 'pieSingleNum':
        url = 'trend/pieChartExport';
        params = { facilitiesId: fkId, type: btnDistributionType, taskType: diseaseType };
        break;
      case 'facNum':
        url = 'trend/barChartExport';
        params = { facilitiesId: fkId, type: btnfacType };
        break;
      case 'sizeType':
        url = 'trend/size/export';
        params = { facilitiesId: fkId, type: btnSizeType };
        break;
      default:
        url = 'trend/lineChartExport';
        params = { facilitiesId: fkId, type: btnDiseaseType };
        break;
    }
    const res = await exportInfo(url, params);
    exportCom(res);
    message.success({
      content: '导出成功',
      key: '导出成功',
    });
  };

  return (
    <div className={styles['left-board']}>
      <Card type="inner" className={`${styles['card-left-item']} card-left-item`}>
        <CardTitle
          title={`近${typeVals[btnDiseaseType]}${
            ['changsha'].includes(Platform_Flag) && !fkId ? '所有路段' : ''
          }新增病害数量(个)`}
          handleExport={(name: string) => {
            handleExport(name);
          }}
          onRef={headDiseaRef}
          flagId={'diseaseNum'}
          handleButton={(val: number) => {
            handleChangeDiseaType(val);
          }}
        />
        <div className={styles['card-box-content']}>
          {useMemo(
            () => (
              <AreaPlot
                lineColorData={lineColors}
                customColors={customColor}
                isBlack={false}
                isModal={true}
                customeName={styles['card-box-plot']}
                info={sevenDiseaNums}
                btnType={btnDiseaseType}
              />
            ),
            [fkId, btnDiseaseType, sevenDiseaNums],
          )}
        </div>
      </Card>
      {!fkId ? (
        <div>
          {['changsha', 'meiping'].includes(Platform_Flag) && (
            <Card type="inner" className={`${styles['card-left-item']} card-left-item`}>
              <CardTitle
                title={`近${typeVals[btnfacType]}道路新增病害数量(个)`}
                onRef={headFacRef}
                flagId={'facNum'}
                handleExport={(name: string) => {
                  handleExport(name);
                }}
                handleButton={(val: number) => {
                  handleChangeFacType(val);
                }}
              />
              <div className={styles['card-box-content']}>
                <BarChart
                  dataInfo={sevenFacDisNums}
                  unit={'里程'}
                  customName={styles['plot-empty']}
                  isModal={false}
                  gradiantColor="l(90) 0:#4684F7 1: rgba(55, 87, 255, 0)"
                  isBlack={false}
                />
              </div>
            </Card>
          )}
          {!['changsha', 'meiping'].includes(Platform_Flag) && (
            <Card type="inner" className={`${styles['card-left-item']} card-left-item`}>
              <CardTitle
                title={`近${typeVals[btnSizeType]}道路新增病害尺寸统计`}
                onRef={headSizeRef}
                flagId={'sizeType'}
                handleExport={(name: string) => {
                  handleExport(name);
                }}
                handleButton={(val: number) => {
                  setBtnSizeType(val);
                }}
              />
              <div className={styles['card-box-content']}>
                <GroupBar
                  dataInfo={sizeList}
                  unit={'里程'}
                  customName={styles['plot-empty']}
                  isModal={false}
                  gradiantColor="l(90) 0:#4684F7 1: rgba(55, 87, 255, 0)"
                  isBlack={false}
                />
              </div>
            </Card>
          )}
        </div>
      ) : (
        <Card type="inner" className={`${styles['card-left-item']} card-left-item`}>
          <div className={styles['first-row']}>
            <CardTitle
              title={`近${typeVals[btnDistributionType]}新增病害分布${
                ['meiping', 'changsha'].includes(Platform_Flag) ? '(个)' : ''
              }`}
              onRef={headSinglePlotRef}
              handleExport={(name: string) => {
                handleExport(name);
              }}
              flagId={'pieSingleNum'}
              handleButton={(val: number) => {
                handleChangeDistrType(val);
              }}
            />
          </div>
          <div className={styles['second-row']}>
            <Select
              placeholder="请选择"
              value={diseaseType}
              defaultValue={2}
              style={{ marginRight: 0 }}
              onChange={selectValue}
            >
              <Option value={1}>水泥路面病害</Option>
              <Option value={2}>沥青路面病害</Option>
              <Option value={3}>综合安全事件</Option>
            </Select>
          </div>
          <div className={styles['card-body-pie']}>
            {diseaseDistrNums?.length > 0 ? (
              <PieChart
                pieInfo={diseaseDistrNums}
                isModalPlatform={true}
                isShowAvg={false}
                colorFillDatas={colorFillDatas}
                colorStokeDatas={colorStokeDatas}
                legendPosition={'right'}
                contentClassName={`pie-Content`}
                titleClassName={`pie-Title`}
                intervalTime={3000}
                isBlack={false}
              />
            ) : (
              <EmptyPage
                content={'暂无数据'}
                isBlack={false}
                customEmptyChartClass={styles['pie-item-empty']}
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MapLeft;
