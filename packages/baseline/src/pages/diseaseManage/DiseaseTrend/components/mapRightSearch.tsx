import moment from 'moment';
import { isEqual } from 'lodash';
import { useModel } from 'umi';
import { DatePicker } from 'antd';
import MutiSelect from '../../../../components/MutiSelect';
import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles.less';
import { markTime } from '../service';

type Iprop = {
  handleSearch: (val: any) => void;
};
type mapObj = {
  selectVals?: number[];
  startTime?: string;
  endTime?: string;
};
const { RangePicker } = DatePicker;

let list: any = [];

const RightSearch: React.FC<Iprop> = (props: Iprop) => {
  const { handleSearch } = props;
  const { fkId } = useModel<any>('trend');
  const [hackValue, setHackValue] = useState<any>();
  const [dates, setDates] = useState<any>([]);
  const [value, setValue] = useState<any>();
  const dateRef: any = useRef();
  const [placeholdTip, setPlaceholdTip] = useState<any>(['开始日期', '结束日期']);
  const [selectTreeVal, setSelectTreeVal] = useState<number[]>([]);
  const childRef: any = useRef<React.ElementRef<typeof MutiSelect>>();
  const [pickTime, setPickTime] = useState<any>({
    startTime: moment().endOf('day').format('yyyy-MM-DD'),
    endTime: moment().endOf('day').format('yyyy-MM-DD'),
  });
  const [preTime, setPreTime] = useState<any>({
    startTime: moment().endOf('day').format('yyyy-MM-DD'),
    endTime: moment().endOf('day').format('yyyy-MM-DD'),
  });

  const [pointDays, setPointDays] = useState<any>([]);

  const [openTimeFlag, setOpenTimeFlag] = useState(false);
  useEffect(() => {
    if (openTimeFlag) return;
    if (!isEqual(preTime, pickTime)) {
      let newObj: mapObj = {};
      newObj = {
        selectVals: selectTreeVal,
        startTime: pickTime.startTime,
        endTime: pickTime.endTime,
      };
      handleSearch(newObj);
    }
    setPreTime({ ...pickTime });
  }, [pickTime, openTimeFlag]);

  useEffect(() => {
    setSelectTreeVal([]);
    setValue([moment().endOf('day'), moment().endOf('day')]);
    setPickTime({
      startTime: moment().endOf('day').format('yyyy-MM-DD'),
      endTime: moment().endOf('day').format('yyyy-MM-DD'),
    });
    setPlaceholdTip([
      moment().endOf('day').format('yyyy-MM-DD'),
      moment().endOf('day').format('yyyy-MM-DD'),
    ]);
    if (childRef?.current) {
      childRef?.current?.clearFunc(true);
    }
    if (handleSearch) {
      handleSearch({
        selectVals: [],
        startTime: moment().endOf('day').format('yyyy-MM-DD'),
        endTime: moment().endOf('day').format('yyyy-MM-DD'),
      });
    }
  }, [fkId]);

  const disabledDate = (current: any) => {
    if ((!dateRef.current || dateRef.current.length === 0) && (!dates || dates?.length === 0)) {
      return current && current > moment().endOf('day');
    }
    let tooLate: boolean = false;
    let tooEarly: boolean = false;
    if (dates[0]) {
      tooLate = dates[0] && current.diff(dates[0], 'days') > 9;
    }
    if (dates[1]) {
      tooEarly = dates[1] && dates[1].diff(current, 'days') > 9;
    }
    return tooEarly || tooLate || (current && current > moment().endOf('day'));
  };
  // 时间
  const timeRangeSelect = (datess: any) => {
    setDates(datess);
  };

  const getTimeMark = async (params: any) => {
    const res = await markTime(params);
    const data = res?.data || [];
    const arr = [...list, ...data];
    list = arr;
    setPointDays(arr);
  };

  const onOpenChange = (open: any) => {
    if (open) {
      const time = moment(new Date()).format('yyyy-MM');
      getTimeMark({
        facilitiesId: fkId,
        startTime: moment(time)?.startOf('month').format('YYYY-MM-DD'),
        endTime: moment(time)?.endOf('month').format('YYYY-MM-DD'),
      });
    }

    setOpenTimeFlag(open);
    if (open) {
      setHackValue([]);
      setDates([]);
      setPlaceholdTip([pickTime.startTime, pickTime.endTime]);
    } else {
      list = [];
      setHackValue(undefined);
      if (!dateRef.current || !dateRef.current?.length) {
        setValue([moment().endOf('day'), moment().endOf('day')]);
      }
    }
  };
  const timeChange = (val: any, dateStrings: any) => {
    dateRef.current = val;
    if (!val || !val.length) {
      setValue([moment().endOf('day'), moment().endOf('day')]);
      setPickTime({
        startTime: moment().endOf('day').format('yyyy-MM-DD'),
        endTime: moment().endOf('day').format('yyyy-MM-DD'),
      });
    } else {
      setValue(val);
      setPickTime({ startTime: dateStrings[0], endTime: dateStrings[1] });
    }
  };
  const handletreeselect = (val: any) => {
    setSelectTreeVal(val);
    handleSearch({
      selectVals: val,
      startTime: pickTime.startTime,
      endTime: pickTime.endTime,
    });
  };

  return (
    <div className={styles['rights-search-box']}>
      <div className={styles.inpBox}>
        <span className={styles['multi-select-box']}>
          <MutiSelect
            urgency={''}
            onRef={childRef}
            customclassName={styles['multi-select']}
            handletreeselect={handletreeselect}
          />
        </span>
        <span>
          <RangePicker
            inputReadOnly
            value={hackValue || value}
            format="YYYY-MM-DD"
            disabledDate={disabledDate}
            onCalendarChange={timeRangeSelect}
            defaultValue={[moment().endOf('day'), moment().endOf('day')]}
            placeholder={placeholdTip}
            onOpenChange={onOpenChange}
            onChange={(val: any, dateStrings: any) => {
              timeChange(val, dateStrings);
            }}
            dateRender={(current) => {
              const style: React.CSSProperties = {};
              const isPoint: boolean = pointDays?.filter((item: any) => {
                return item?.dateTime === moment(current).format('yyyy-MM-DD');
              })[0]?.flag;
              if (isPoint) {
                style.position = 'absolute';
                style.top = '0px';
                style.width = '24px';
                style.height = '24px';
                style.borderRadius = '50%';
                style.background = 'rgb(185 64 64 / 20%)';
              }
              return (
                <div className="ant-picker-cell-inner">
                  <div>{current.date()}</div>
                  <div style={style}></div>
                </div>
              );
            }}
            onPanelChange={async (value1: any, mode: any) => {
              if (mode && mode?.length && mode[0] === 'date' && mode[1] === 'date') {
                // 显示年月类型面板不触发
                /* eslint no-restricted-globals: 0 */
                const e: any = event;
                let time: any;
                let time1: any;
                let time2: any;
                let time3: any;
                let time4: any;
                if (e?.target?.className?.indexOf('prev') > 0) {
                  time = moment(value1[0]).format('yyyy-MM');
                  const rightYear =
                    time?.split('-')[1] < 12 ? time?.split('-')[0] : time?.split('-')[0] * 1 + 1;
                  const rightMonth = time?.split('-')[1] < 12 ? time?.split('-')[1] * 1 + 1 : '01';
                  time1 = moment(time)?.startOf('month').format('YYYY-MM-DD');
                  time2 = moment(time)?.endOf('month').format('YYYY-MM-DD');
                  time3 = moment(`${rightYear}-${rightMonth}`)
                    ?.startOf('month')
                    .format('YYYY-MM-DD');
                  time4 = moment(`${rightYear}-${rightMonth}`)?.endOf('month').format('YYYY-MM-DD');
                } else if (e?.target?.className?.indexOf('next') > 0) {
                  const month = value1[0]?.month() === 0 ? 12 : value1[0]?.month();
                  const year = value1[0]?.month() === 0 ? value1[0]?.year() - 1 : value1[0]?.year();

                  const rightYear = month < 12 ? year : year * 1 + 1;
                  const rightMonth = month < 12 ? month * 1 + 1 : '01';
                  time = `${year}-${month}`;
                  time1 = moment(time)?.startOf('month').format('YYYY-MM-DD');
                  time2 = moment(time)?.endOf('month').format('YYYY-MM-DD');
                  time3 = moment(`${rightYear}-${rightMonth}`)
                    ?.startOf('month')
                    .format('YYYY-MM-DD');
                  time4 = moment(`${rightYear}-${rightMonth}`)?.endOf('month').format('YYYY-MM-DD');
                }
                if (!(moment(time1) > moment().endOf('day'))) {
                  if (!list?.filter((item: any) => item?.dateTime === time1)?.length) {
                    await getTimeMark({ startTime: time1, endTime: time2, facilitiesId: fkId });
                  }

                  if (
                    !(moment(time3) > moment().endOf('day')) &&
                    !list?.filter((item: any) => item?.dateTime === time3)?.length
                  ) {
                    getTimeMark({ startTime: time3, endTime: time4, facilitiesId: fkId });
                  }
                }
              }
            }}
          />
        </span>
      </div>
    </div>
  );
};

export default RightSearch;
