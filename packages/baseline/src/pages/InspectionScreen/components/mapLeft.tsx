import { Card, Select } from 'antd';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import styles from '../styles.less';
import LeftPie from './leftPie';
import AreaPlot from './AreaPlot';
import MileageBars from './MileageBars';
import EmptyStatus from '../../../components/TableEmpty';
import { getDiseasePieInfo, getSeverityTotal } from '../service';

import EllipsisTooltip from '../../../components/EllipsisTooltip';
import { getDictData } from '../../../utils/commonMethod';

const { Option } = Select;
const typeTitle: any = {
  1: '近七天',
  2: '近30天',
  3: '近12个月',
};

const typeTimeList = [
  { name: '周', type: 1 },
  { name: '月', type: 2 },
  { name: '年', type: 3 },
];

const MapLeft: React.FC = () => {
  const unmountedRef = useRef<any>(false);
  const [typeTime, setTypeTime] = useState<number>(1);
  const [taskType, setTaskType] = useState<number>(2);
  const [diseasePie, setDiseasePie] = useState<any>([]);
  const [weekInfo, setWeekInfo] = useState<any>();
  const [dictOption, setDictOption] = useState<any>([]);

  // 获取新增病害统计
  useEffect(() => {
    const getRencentWeekInfo = async () => {
      const res = await getSeverityTotal(typeTime);
      if (res?.status === 0 && !unmountedRef.current) {
        setWeekInfo(res.data);
      }
    };
    getRencentWeekInfo();
  }, [typeTime]);

  // 获取病害数量分布
  useEffect(() => {
    const getDiseaseInfos = async () => {
      const res = await getDiseasePieInfo({ taskType, type: typeTime }); // type周
      if (res?.status === 0 && !unmountedRef.current) {
        setDiseasePie(res.data);
      }
    };
    getDiseaseInfos();
  }, [taskType, typeTime]);

  const handleTypeTime = (type: any) => {
    if (!unmountedRef?.current) {
      setTypeTime(type);
    }
  };

  useEffect(() => {
    unmountedRef.current = false;

    // 获取字典
    const getDict = async () => {
      const res: any = await getDictData({
        type: 2,
        dictCodes: -1,
        dictFilterCodes: ['subfacility'],
      });
      if (!unmountedRef?.current) {
        setDictOption(res || []);
      }
    };
    getDict();
    return () => {
      unmountedRef.current = true;
      // abortController.abort(); // 在组件卸载时中断
    };
  }, []);

  const selectValue = (text: any) => {
    setTaskType(text);
  };

  const mpieLeftInfo = useMemo(() => {
    return { diseasePie, taskType }; // type:1水泥
  }, [diseasePie, taskType]);

  return (
    <>
      <div className={`${styles.leftPanel} ${styles.panelClass} `}>
        <Card type="inner" className={`${styles.cardBcg} ${styles.cardDiseaseStatics}`}>
          <div className={`${styles.cardTitle} ${styles.cardFirstTitle}`}>
            <div className={`${styles.cardTitleleft} ${styles.timeSelectSearch}`}>
              <span className={styles.titleLeftImg} />
              <span
                className={`${styles.cardTxtName} ${styles.titleTxtHide}`}
                title={`${typeTitle[typeTime]}病害概况`}
              >
                {`${typeTitle[typeTime]}病害概况`}
              </span>

              <span className={styles.timeSelect}>
                {typeTimeList.map((it: any) => (
                  <span
                    key={it?.type}
                    onClick={() => {
                      handleTypeTime(it?.type || 1);
                    }}
                    className={`${it?.type === typeTime ? styles.activeClass : ''} ${
                      styles.liClass
                    }`}
                  >
                    <span>{it?.name}</span>
                  </span>
                ))}
              </span>
            </div>
            <div className={styles.highlight}></div>
          </div>
          <div className={styles.firstChartRow}>
            <span className={styles['name-second-title']}>新增病害统计(个)</span>
          </div>
          <div className={styles.chartFirstCommonClass}>
            {useMemo(
              () => (
                <AreaPlot info={weekInfo} btnType={typeTime} />
              ),
              [weekInfo],
            )}
          </div>
        </Card>

        <Card type="inner" className={`${styles.cardBcg} ${styles.cardDiseaseDis}`}>
          <div className={`${styles.cardTitle} ${styles.cardSecondTitle}`}>
            <div className={styles.firstChartRow}>
              <EllipsisTooltip title={'新增病害分布(个)'}>
                <span className={styles['name-second-title']}>新增病害分布(个)</span>
              </EllipsisTooltip>
            </div>
            <Select
              popupClassName="dropdownSelectClass"
              placeholder="请选择"
              className="searchFacilityClass selectMg10"
              defaultValue={taskType}
              style={{ marginRight: 0 }}
              onChange={selectValue}
            >
              {dictOption?.map((item: any) => (
                <Option className="facClass" value={item?.dictKey} key={item?.dictKey}>
                  {item?.dictName}
                </Option>
              ))}
            </Select>
          </div>
          <div className={styles.chartCommonClass}>
            {diseasePie?.length > 0 ? (
              <LeftPie type={mpieLeftInfo?.taskType} pieInfo={mpieLeftInfo?.diseasePie} />
            ) : (
              <EmptyStatus customEmptyClass={styles.pieEmpty} />
            )}
          </div>
        </Card>
        <Card type="inner" className={`${styles.cardBcg} ${styles.cardDiseaseCount}`}>
          <div className={`${styles.cardTitle} ${styles.cardSecondTitle}`}>
            <div className={styles.firstChartRow}>
              <EllipsisTooltip title={'新增病害尺寸统计'}>
                <span className={styles['name-second-title']}>新增病害尺寸统计</span>
              </EllipsisTooltip>
            </div>
          </div>
          <div className={styles.chartCommonClass}>
            <MileageBars dataType={typeTime} />
          </div>
        </Card>
      </div>
    </>
  );
};

export default MapLeft;
