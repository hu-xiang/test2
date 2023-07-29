import { Button, Switch, Empty } from 'antd';
import React, { useState, useEffect } from 'react';
import { Line } from '@ant-design/plots';
import styles from './styles.less';
import { commonRequest, commonDel } from 'baseline/src/utils/commonMethod';
import { useHistory } from 'umi';

const requestList = [
  { url: '/traffic-bsl/project/typeTotal', method: 'get' },
  { url: '/traffic-bsl/project/doneCheck', method: 'POST', isParams: true },
];

type Iprops = {
  id: string;
  projectId?: any;
};
const TroubleCheck: React.FC<Iprops> = (props) => {
  const history = useHistory();
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [data, setData] = useState<any>([]);

  const onChange = async (checked: boolean) => {
    const res = await commonDel(
      '是否完成排查？',
      {
        ...requestList[1],
        params: {
          proFacId: props?.id,
          projectId: props?.projectId,
        },
      },
      '排查',
    );
    if (!isChecked && res) {
      setIsChecked(checked);
    }
  };

  const getTroublesInfo = async (id: any) => {
    const res = await commonRequest({ ...requestList[0], params: { proFacId: id } });
    setData(res?.data?.HiddenTypeList || []);
    setIsChecked(!!res?.data?.checkStatus);
  };

  useEffect(() => {
    if (props?.id) getTroublesInfo(props?.id);
  }, [props?.id]);

  const meta = {
    type: {
      alias: '类型',
    },
    num: {
      alias: '数量',
    },
  };
  const seriesKey = 'series';
  const valueKey = '数量';
  const processData = (data1: any, yFields: any, meta1: any) => {
    const result: any = [];
    data1.forEach((d: any) => {
      yFields.forEach((yField: any) => {
        const name = meta1?.[yField]?.alias || yField;
        result.push({ ...d, [seriesKey]: name, [valueKey]: d[yField] });
      });
    });
    return result;
  };
  const config = {
    data: processData(data, ['num'], meta),
    xField: 'type',
    // yField: 'num',
    yField: valueKey,
    label: {},
    point: {
      size: 5,
      shape: 'diamond',
      style: {
        fill: 'white',
        stroke: '#5B8FF9',
        lineWidth: 2,
      },
    },
    yAxis: { tickInterval: 1 },
    tooltip: {
      showMarkers: false,
    },
    state: {
      active: {
        style: {
          shadowBlur: 4,
          stroke: '#000',
          fill: 'red',
        },
      },
    },
    interactions: [
      {
        type: 'marker-active',
      },
    ],
    area: {
      color: 'l(90) 0:rgba(55, 87, 255, 1) 0.75: rgba(55, 87, 255, 0.26) 1 rgba(55, 87, 255, 0.1)',
    },
  };
  return (
    <div className={styles.TroubleCheck}>
      <div className={styles.TroubleCheckOperate}>
        <Button
          type="primary"
          onClick={() => {
            sessionStorage.setItem('checkList_roadId', props.id);
            history.push('/hiddenDangerCheck/CheckList/sceneCheck');
          }}
        >
          进入排查
        </Button>
        <Switch
          defaultChecked
          onChange={onChange}
          checked={isChecked}
          checkedChildren="已完成"
          unCheckedChildren="未完成"
          className={styles.switch}
          disabled={isChecked}
        />
      </div>
      <div className={styles.TroubleCheckLine}>
        <div className={styles.lineTitle}>隐患类型统计</div>
        {data && data?.length > 0 ? (
          <Line {...config} className={styles.line} />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} className={styles.customEmptyImg} />
        )}
      </div>
    </div>
  );
};
export default TroubleCheck;
