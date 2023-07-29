import { Input } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from './styles.less';
import { useModel } from 'umi';
import MapPoint from './MapPoint';
import { commonRequest } from 'baseline/src/utils/commonMethod';

const requestList = [{ url: '/traffic-bsl/project/roadDetail', method: 'get' }];

type Iprops = {
  id?: string;
};
const BasicInfo: React.FC<Iprops> = (props) => {
  const { setLnglatArr } = useModel<any>('facility');
  const [roadName, setRoadName] = useState<string>('');
  const [roadType, setRoadType] = useState<string>('');
  const [roadLevel, setRoadLevel] = useState<string>('');
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [sceneMark, setSceneMark] = useState<string>('');
  const [trouble, setTrouble] = useState<string>('');
  const [accident, setAccident] = useState<string>('');

  const getBasicInfo = async (id: any) => {
    const res = await commonRequest({ ...requestList[0], params: { id } });
    setRoadName(res?.data?.fkFacName);
    setRoadType(res?.data?.roadType);
    setRoadLevel(res?.data?.roadLevel);
    setStart(res?.data?.startPoint);
    setEnd(res?.data?.endPoint);
    setSceneMark(res?.data?.calibrationStatus === 1 ? '已完成' : '未完成');
    setTrouble(res?.data?.checkStatus === 1 ? '已完成' : '未完成');
    setAccident(res?.data?.uploadStatus === 1 ? '已完成' : '未完成');
    let list = [[]];
    if (res?.data?.trackList?.length) {
      list = res?.data?.trackList.map((item: any) => {
        return item?.lnglat;
      });
    }
    setLnglatArr(list);
  };

  useEffect(() => {}, []);

  useEffect(() => {
    if (props?.id) getBasicInfo(props?.id);
  }, [props?.id]);
  return (
    <div className={styles.BasicInfo}>
      <div className={styles.formInfo}>
        <div className={styles.formRowInfo}>
          <div className={styles.formItemInfo}>
            <div className={styles.itemLabel}>道路名称</div>
            <div className={styles.itemInput}>
              <Input value={roadName} disabled />
            </div>
          </div>
          <div className={styles.formItemInfo}>
            <div className={styles.itemLabel}>道路类别</div>
            <div className={styles.itemInput}>
              <Input value={roadType} disabled />
            </div>
          </div>
          <div className={styles.formItemInfo}>
            <div className={styles.itemLabel}>道路等级</div>
            <div className={styles.itemInput}>
              <Input value={roadLevel} disabled />
            </div>
          </div>
          <div className={styles.formItemInfo}>
            <div className={styles.itemLabel}>起点</div>
            <div className={styles.itemInput}>
              <Input value={start} disabled />
            </div>
          </div>
        </div>

        <div className={styles.formRowInfo}>
          <div className={styles.formItemInfo}>
            <div className={styles.itemLabel}>终点</div>
            <div className={styles.itemInput}>
              <Input value={end} disabled />
            </div>
          </div>
          <div className={styles.formItemInfo}>
            <div className={styles.itemLabel}>场景标定</div>
            <div className={styles.itemInput}>
              <Input
                value={sceneMark}
                disabled
                className={sceneMark === '未完成' ? 'redTxt' : 'greenTxt'}
              />
            </div>
          </div>
          <div className={styles.formItemInfo}>
            <div className={styles.itemLabel}>隐患排查</div>
            <div className={styles.itemInput}>
              <Input
                value={trouble}
                disabled
                className={trouble === '未完成' ? 'redTxt' : 'greenTxt'}
              />
            </div>
          </div>
          <div className={styles.formItemInfo}>
            <div className={styles.itemLabel}>事故上传</div>
            <div className={styles.itemInput}>
              <Input
                value={accident}
                disabled
                className={accident === '未完成' ? 'redTxt' : 'greenTxt'}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.mapInfo}>
        <MapPoint height={'calc(100vh - 408px)'} />
      </div>
    </div>
  );
};
export default BasicInfo;
