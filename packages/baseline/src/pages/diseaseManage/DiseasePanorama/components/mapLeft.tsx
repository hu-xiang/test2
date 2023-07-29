import { Card, Select } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from '../styles.less';
import LeftPie from './leftPie';
import Plots from './plots';
import { getDiseasePieInfo, getColInfo } from '../service';
import { getDictData } from '../../../../utils/commonMethod';

const { Option } = Select;

const MapLeft: React.FC = () => {
  const [btnType, setBtnType] = useState(1);
  const [taskType, setTaskType] = useState<any>(2);
  const [diseasePie, setDiseasePie] = useState([]);
  const [info, setInfo] = useState<any>();
  const [disOption, setDisOption] = useState([]);
  // const getInfo = async () => {
  //   const res = await getColInfo(btnType);
  //   setInfo(res.data);
  // };

  const getDict = async () => {
    const res: any = await getDictData({
      type: 2,
      dictCodes: -1,
      dictFilterCodes: ['subfacility'],
    });
    setDisOption(res || []);
  };

  useEffect(() => {
    getDict();
  }, []);

  const selectValue = (text: any) => {
    setTaskType(text);
  };
  // const getPieInfo = async () => {
  //   const res = await getDiseasePieInfo(taskType, btnType);
  //   setDiseasePie(res.data);
  // };
  // 为防止切换页面后请求还在继续
  useEffect(() => {
    let isUnmounted = false;
    // const abortController = new AbortController(); // 创建
    (async () => {
      const res = await getDiseasePieInfo(taskType, btnType);
      if (!isUnmounted) {
        setDiseasePie(res.data);
      }
    })();

    return () => {
      isUnmounted = true;
      // abortController.abort(); // 在组件卸载时中断
    };
    // getPieInfo();
  }, [taskType, btnType]);
  useEffect(() => {
    // getInfo();
    let isUnmounted = false;
    // const abortController = new AbortController(); // 创建
    (async () => {
      const res = await getColInfo(btnType);
      if (!isUnmounted) {
        setInfo(res.data);
      }
    })();

    return () => {
      isUnmounted = true;
      // abortController.abort(); // 在组件卸载时中断
    };
  }, [btnType]);

  return (
    <div className={styles.lefts}>
      <div className={styles.topTitle}>道路设施病害统计</div>
      <div className={styles.selDatebox}>
        <div
          onClick={() => setBtnType(1)}
          className={`${styles.dateSel} ${btnType === 1 && styles.btnLight}`}
        >
          周
        </div>
        <div
          onClick={() => setBtnType(2)}
          className={`${styles.dateSel} ${btnType === 2 && styles.btnLight}`}
        >
          月
        </div>
        <div
          onClick={() => setBtnType(3)}
          className={`${styles.dateSel} ${btnType === 3 && styles.btnLight}`}
        >
          年
        </div>
      </div>
      <div className={styles.cardPlotsBox}>
        <div>
          病害数量
          <Plots btnType={btnType} info={info} />
        </div>
      </div>

      <Card type="inner" className={styles['spec-card']}>
        <div className={styles['card-top-head']}>
          <span className={styles['card-top-head-txt']}>病害分析</span>
          <Select
            allowClear
            placeholder="请选择"
            defaultValue={taskType}
            style={{ marginRight: 0 }}
            onChange={selectValue}
          >
            {disOption?.map((item: any) => (
              <Option value={item?.dictKey} key={item?.dictKey}>
                {item?.dictName}
              </Option>
            ))}
            {/* <Option value={1}>水泥路面病害</Option>
            <Option value={2}>沥青路面病害</Option>
            <Option value={3}>综合安全事件</Option> */}
          </Select>
        </div>
        <div className={styles['card-body-pie']}>
          <LeftPie pieInfo={diseasePie} taskType={taskType} />
        </div>
      </Card>
    </div>
  );
};

export default MapLeft;
