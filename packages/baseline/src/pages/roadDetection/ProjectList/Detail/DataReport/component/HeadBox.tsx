import { useModel } from 'umi';
import { Select, Button } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from '../styles.less';
import { directionEnum } from '../../data.d';
import MutiSelect from '../../../../../../components/MutiSelect';
import { commonRequest } from '../../../../../../utils/commonMethod';

const { Option } = Select;

type Iprops = {
  handleDirectInfo: (value: any, otherVal?: any) => void;
  handleLaneInfo?: (value: any) => void;
  handleDisease?: (vals: any[]) => void;
  exportData: (type?: string) => void;
  handleDamageVal?: (value: any) => void;
  pdfFlag?: boolean;
};

const HeadSearch: React.FC<Iprops> = (props) => {
  const { handleDisease, exportData, handleDirectInfo, handleLaneInfo, handleDamageVal, pdfFlag } =
    props;
  const { tabValue, dataInfo } = useModel<any>('dataReport');
  const [laneId, setLaneId] = useState<any>(dataInfo?.laneId);
  const [damageValue, setDamageValue] = useState<any>([]);
  const [damageDatas, setDamageDatas] = useState<any[]>([]);
  const [laneList, setLaneList] = useState<any>();
  const [direction, setDirection] = useState<number>(dataInfo?.direction);

  const getDamageDataList = async () => {
    try {
      const { status, data = [] } = await commonRequest({
        url: '/traffic/road/project/alone/disease',
        method: 'GET',
      });
      if (status === 0) {
        setDamageDatas(data);
      }
    } catch (error) {
      setDamageDatas([]);
    }
  };

  const getLaneList = async (e: any, isQuest = true) => {
    let laneVal = null;
    let directionVal = 0;
    if (e) {
      setLaneId(null);
    }
    const directionValue: number = typeof e === 'number' ? e : dataInfo?.direction;
    directionVal = directionValue;
    const res = await commonRequest({
      url: '/traffic/road/project/detial/pavement/select',
      method: 'GET',
      params: {
        projectId: sessionStorage.getItem('road_detection_id'),
        direct: directionValue,
      },
    });
    setLaneList(res?.data);
    if (!isQuest) {
      laneVal = dataInfo?.laneId;
      directionVal = dataInfo?.direction;
      setLaneId(laneVal);
      if (tabValue !== '3') {
        handleDirectInfo(directionVal);
        if (typeof handleLaneInfo === 'function') {
          handleLaneInfo(laneVal);
        }
      } else {
        handleDirectInfo(directionVal, laneVal);
      }
      return;
    }
    if (res?.data && Object.keys(res?.data)?.length) {
      Object.keys(res?.data).forEach((item: any, i: number) => {
        if (i === 0 && isQuest) {
          setLaneId(item);
          laneVal = item;
        }
      });
    } else {
      setLaneId(null);
      laneVal = undefined;
    }

    if (tabValue !== '3') {
      handleDirectInfo(directionVal);
      if (typeof handleLaneInfo === 'function') {
        handleLaneInfo(laneVal);
      }
    } else {
      handleDirectInfo(directionVal, laneVal);
    }
  };

  useEffect(() => {
    if (tabValue === '2') {
      getDamageDataList();
    }
  }, [tabValue]);

  useEffect(() => {
    setDirection(dataInfo?.direction);
    getLaneList(false, false);
  }, [dataInfo]);

  const handletreeselect = (value: any) => {
    if (typeof handleDisease === 'function') {
      handleDisease(value);
    }
  };
  const handleExportData = (val?: any) => {
    if (tabValue === '3') {
      exportData();
    } else {
      exportData(val);
    }
  };

  return (
    <div className={`${styles['head-search-box']} head-search-box`}>
      <div className={styles['inp-box']}>
        <Select
          placeholder="请选择车道方向"
          className={styles.rowSelect}
          style={{ width: '140px', marginRight: '10px' }}
          onChange={(e) => {
            setDirection(e);
            getLaneList(e);
          }}
          value={direction}
        >
          {Object.keys(directionEnum).map((item: any) => (
            <Option key={item} value={item * 1}>
              {directionEnum[item]}
            </Option>
          ))}
        </Select>
      </div>
      {tabValue === '1' || tabValue === '3' ? (
        <div className={styles['inp-box']}>
          <Select
            placeholder="请选择车道"
            className={styles.rowSelect}
            value={laneId}
            onChange={(e) => {
              setLaneId(e);
              if (tabValue !== '3') {
                if (typeof handleLaneInfo === 'function') {
                  handleLaneInfo(e);
                }
              } else {
                handleDirectInfo(direction, e);
              }
            }}
          >
            {laneList &&
              Object.keys(laneList)?.length &&
              Object.keys(laneList).map((item: any) => (
                <Option key={item} value={item}>
                  {laneList[item]}
                </Option>
              ))}
          </Select>
        </div>
      ) : null}
      {tabValue === '2' ? (
        <div className={`${styles['inp-box']} ${styles['inp-treeselect-box']}`}>
          <Select
            placeholder="请选择损坏类型"
            mode="multiple"
            allowClear
            className={`${styles.rowSelect} multi-select`}
            maxTagCount={'responsive'}
            value={damageValue}
            onChange={(e: any, option: any) => {
              let newVals: any[] = [];
              if (!e || !e?.length) {
                newVals = [];
              } else {
                option?.forEach((it: any) => {
                  newVals.push(it?.key);
                });
              }
              setDamageValue(e);
              if (typeof handleDamageVal === 'function') {
                handleDamageVal(newVals);
              }
            }}
          >
            {Object?.keys(damageDatas).map((item: any) => (
              <Option key={item} value={damageDatas[item]}>
                {damageDatas[item]}
              </Option>
            ))}
          </Select>
        </div>
      ) : null}
      {tabValue === '1' ? (
        <div className={`${styles['inp-box']} ${styles['inp-treeselect-box']}`}>
          <MutiSelect
            handletreeselect={handletreeselect}
            customclassName={'multi-select'}
            dictCodes={['cement', 'asphalt']}
            scenesType={4}
          />
        </div>
      ) : null}
      <div className={styles['inp-button-box']}>
        {tabValue === '3' ? (
          <Button
            type="primary"
            className={styles['inp-box-button']}
            onClick={() => {
              handleExportData();
            }}
          >
            全部导出
          </Button>
        ) : null}
        {tabValue !== '3' ? (
          <>
            <Button
              className={styles['inp-box-button']}
              type="primary"
              onClick={() => {
                handleExportData('excel');
              }}
            >
              导出病害列表
            </Button>
            <Button
              className={styles['inp-box-button']}
              disabled={pdfFlag}
              type="primary"
              onClick={() => {
                handleExportData('pdf');
              }}
            >
              导出病害报告
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default HeadSearch;
