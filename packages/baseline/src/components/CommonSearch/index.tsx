// const data = [
//   {
//     type: 'input',
//     placeholder: '请输入附属设施图片编号、图片名称的关键字',
//     key: 'keyword1',
//     label: '综合搜索',
//     labelWidth: 56,
//     width: '30%',
//   },
//   {
//     type: 'select',
//     multiple: false,
//     placeholder: '请选择',
//     key: 'keyword2',
//     label: '附属设施类型',
//     labelWidth: 84,
//     width: '30%',
//     enumData: {
//       0: '正常',
//       1: '已拆除',
//       2: '正常1',
//       3: '已拆除1',
//       4: '正常2',
//       5: '已拆除2',
//       6: '正常3',
//       7: '已拆除3',
//     },
//   },
//   {
//     type: 'select',
//     multiple: true,
//     placeholder: '请选择',
//     key: 'keyword3',
//     label: '所属设施名称',
//     labelWidth: 84,
//     width: '30%',
//     enumData: {
//       0: '正常',
//       1: '已拆除',
//       2: '正常1',
//       3: '已拆除1',
//       4: '正常2',
//       5: '已拆除2',
//       6: '正常3',
//       7: '已拆除3',
//     },
//   },
//   {
//     type: 'timeRange',
//     key: ['startTime', 'endTime'],
//     label: '采集时间',
//     labelWidth: 56,
//     width: '50%',
//     enumBtn: {
//       0: '今日',
//       1: '本周',
//       2: '本月',
//       3: '自定义',
//     },
//     disabledBtn: [0, 1, 2],
//   },
//   {
//     type: 'tree',
//     placeholder: '请选择',
//     key: 'keyword4',
//     label: '所属设施名称',
//     labelWidth: 84,
//     width: '30%',
//     urgency: 0, // 紧急状态 0，非紧急 1，紧急
//     treeData: [],
//     params: {
//       dictCodes: ['safe_event', 'cement', 'asphalt', 'subfacility'],
//       requiredUnknownDisease: false, // 是否需要-1类型
//     }
//   },
// ];

import { Input, Select, Button, DatePicker } from 'antd';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import TreeMutiSelect from '../TreeMutiSelect';
import moment from 'moment';
import styles from './styles.less';

const { Option } = Select;
const { RangePicker } = DatePicker;

function CommonSearch({ ...props }: any) {
  const treeRef: any = useRef<any>();
  const { onRef, searchData, clearSearch, search, getValueData = () => {} } = props;
  const [valueData, setValueData] = useState<any>({});
  const [btnType, setBtnType] = useState(3);
  const [timerDate, setTimerDate] = useState<any>([undefined, undefined]);
  const [pickTime, setPickTime] = useState<any>({
    startTime: moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
    endTime: moment().endOf('month').format('YYYY-MM-DD HH:mm:ss'),
  });

  useEffect(() => {}, []);

  useEffect(() => {
    getValueData(valueData);
  }, [valueData]);

  useImperativeHandle(onRef, () => ({
    // 暴露给父组件的方法
    // getValueData,
  }));

  // 点击查询
  const onSearch = () => {
    search();
  };

  // 清除
  const onClear = () => {
    clearSearch();
    setValueData({});
    setBtnType(3);
    setTimerDate([undefined, undefined]);
    setPickTime({ startTime: undefined, endTime: undefined });
    treeRef?.current?.clearFunc(true);
  };

  useEffect(() => {
    if (btnType === 0) {
      setTimerDate([moment().startOf('day'), moment().endOf('day')]);
      setPickTime({
        startTime: moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      });
    } else if (btnType === 1) {
      setTimerDate([moment().startOf('week'), moment().endOf('week')]);
      setPickTime({
        startTime: moment().startOf('week').format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment().endOf('week').format('YYYY-MM-DD HH:mm:ss'),
      });
    } else if (btnType === 2) {
      setTimerDate([moment().startOf('month'), moment().endOf('month')]);
      setPickTime({
        startTime: moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment().endOf('month').format('YYYY-MM-DD HH:mm:ss'),
      });
    } else {
      setTimerDate([undefined, undefined]);
      setPickTime({
        startTime: undefined,
        endTime: undefined,
      });
    }
  }, [btnType]);

  useEffect(() => {
    if (['startTime', 'endTime'] instanceof Array) {
      const values = JSON.parse(JSON.stringify(valueData));
      values['startTime'] = pickTime?.startTime;
      values['endTime'] = pickTime?.endTime;
      setValueData(values);
    }
  }, [pickTime]);

  // 查询自定义日期设置
  const timeRangeSelect = (dates: any, dateStrings: any) => {
    if (dateStrings[0] === '' && dateStrings[1] !== '') {
      setTimerDate([undefined, moment(dateStrings[1], 'YYYY-MM-DD HH:mm:ss')]);
    } else if (dateStrings[1] === '' && dateStrings[0] !== '') {
      setTimerDate([moment(dateStrings[0], 'YYYY-MM-DD HH:mm:ss'), undefined]);
    } else if (dateStrings[1] === '' && dateStrings[0] === '') {
      setTimerDate([undefined, undefined]);
    } else {
      setTimerDate([
        moment(dateStrings[0], 'YYYY-MM-DD HH:mm:ss'),
        moment(dateStrings[1], 'YYYY-MM-DD HH:mm:ss'),
      ]);
    }
    setPickTime({ startTime: dateStrings[0], endTime: dateStrings[1] });
  };

  // 禁用今天后的日期
  const disabledDate = (current: any) => {
    return current && current > moment().endOf('day');
  };

  return (
    <div className={styles.CommonSearch}>
      {searchData?.map((item: any) => (
        <div className={styles.searchItem} key={item?.key} style={{ width: `${item?.width}` }}>
          <div className={styles.searchLabel} style={{ width: `${item?.labelWidth}px` }}>
            {item?.label}
          </div>
          <div
            className={styles.searchInput}
            style={{ width: `calc(100% - ${item?.labelWidth}px - 32px)` }}
          >
            {item?.type === 'input' && (
              <Input
                autoComplete="off"
                maxLength={60}
                placeholder={item?.placeholder}
                value={valueData[item?.key]}
                onChange={(e: any) => {
                  const values = JSON.parse(JSON.stringify(valueData));
                  values[item?.key] = e?.target?.value;
                  setValueData(values);
                }}
              />
            )}

            {item?.type === 'select' && (
              <Select
                placeholder={item?.placeholder}
                allowClear
                value={valueData[item?.key]}
                style={{ width: '100%' }}
                mode={item?.multiple ? 'multiple' : undefined}
                maxTagCount={'responsive'}
                onChange={(e: any) => {
                  const values = JSON.parse(JSON.stringify(valueData));
                  values[item?.key] = e;
                  setValueData(values);
                }}
              >
                {item?.enumData instanceof Array
                  ? item?.enumData?.map((m: any) => (
                      <Option key={m[item?.enumValue]} value={m[item?.enumValue]}>
                        {m[item?.enumLabel]}
                      </Option>
                    ))
                  : Object?.keys(item?.enumData || {}).map((m: any) => (
                      <Option key={m} value={m}>
                        {item?.enumData[m]}
                      </Option>
                    ))}
              </Select>
            )}

            {item?.type === 'tree' && (
              <TreeMutiSelect
                placeholder={item?.placeholder}
                params={item?.params}
                handletreeselect={(e: any) => {
                  const values = JSON.parse(JSON.stringify(valueData));
                  values[item?.key] = e;
                  setValueData(values);
                }}
                urgency={item?.urgency}
                onRef={treeRef}
                // importTreeData={item?.treeData}
              />
            )}

            {item?.enumBtn && (
              <div className={styles.btnList}>
                {Object.keys(item?.enumBtn)?.map((btn: any) => (
                  <div
                    key={btn}
                    onClick={() => setBtnType(btn * 1)}
                    className={`${styles.dateBtn} ${btnType === btn * 1 && styles.btnLight}`}
                  >
                    {item?.enumBtn[btn]}
                  </div>
                ))}
              </div>
            )}
            {item?.type === 'timeRange' && (
              <RangePicker
                disabled={item?.disabledBtn?.includes(btnType)}
                inputReadOnly
                format="YYYY-MM-DD HH:mm:ss"
                showTime
                disabledDate={disabledDate}
                onChange={(dates: any, dateStrings: any) => {
                  timeRangeSelect(dates, dateStrings);
                }}
                value={timerDate}
              />
            )}
          </div>
        </div>
      ))}
      <div className={styles.searchButton}>
        <Button
          type="primary"
          onClick={() => {
            onSearch();
          }}
        >
          查询
        </Button>
        <Button
          onClick={() => {
            onClear();
          }}
        >
          清除
        </Button>
      </div>
    </div>
  );
}
export default CommonSearch;
