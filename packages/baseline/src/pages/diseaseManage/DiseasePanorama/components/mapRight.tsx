import moment from 'moment';
import { useModel } from 'umi';
import { Select, DatePicker, message } from 'antd';
import MutiSelect from '../../../../components/MutiSelect';
import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles.less';
import { getFacilitiesList } from '../service';

type Iprop = {
  onSelMap: Function;
};

const { Option } = Select;
const { RangePicker } = DatePicker;

const MapRight: React.FC<Iprop> = (props) => {
  const [dates, setDates] = useState<any>([]);
  const [value, setValue] = useState<any>();
  const { initialState, setInitialState }: any = useModel('@@initialState');
  const dateRef: any = useRef(); // 判断为空
  const dateSaveRef: any = useRef(); // 记录超过7天的起点和终点的值
  const lastTimeRef: any = useRef(); // 记录超过7天的起点和终点的moment格式值
  const preDateRef: any = useRef(false); // 判断disabledate是否值得进入
  const preRef: any = useRef(false); // 有空值的标志
  const [placeholdTip, setPlaceholdTip] = useState<any>(['开始日期', '结束日期']);
  const [selectTreeVal, setSelectTreeVal] = useState<number[]>([]);
  const childRef: any = useRef<React.ElementRef<typeof MutiSelect>>();
  const [urgency, setUrgency] = useState<any>();
  const [pickTime, setPickTime] = useState<any>({
    startTime: moment().endOf('day').format('yyyy-MM-DD'),
    endTime: moment().endOf('day').format('yyyy-MM-DD'),
  });
  const [faciList, setFaciList] = useState({});
  const [fkFacilitiesId, setFkFacilitiesId] = useState();
  const [openTimeFlag, setOpenTimeFlag] = useState(false);

  const getFaciList = async () => {
    let rec: any = [];
    try {
      const { status, data = [] } = await getFacilitiesList({ name: '' });
      if (status === 0) {
        data.forEach((it: any) => {
          rec.push({ label: it.facilitiesName, value: it.id, id: it.id });
        });
        setFaciList(data);
      }
    } catch (error) {
      rec = [];
    }
  };

  useEffect(() => {
    if (openTimeFlag) return;
    getFaciList();

    props.onSelMap({
      startTime: pickTime.startTime,
      endTime: pickTime.endTime,
      disease: selectTreeVal,
      fkFacilitiesId,
      diseaseImp: urgency,
    });
  }, [pickTime, selectTreeVal, fkFacilitiesId, openTimeFlag, urgency]);

  const disabledDate = (current: any) => {
    if (!openTimeFlag) {
      return false;
    }
    if ((!dateRef.current || dateRef.current.length === 0) && (!dates || dates?.length === 0)) {
      return current && current > moment().endOf('day');
    }
    let tooLate: boolean = false;
    let tooEarly: boolean = false;
    if (dates && dates[0] && preDateRef.current) {
      tooLate = dates[0] && current.diff(dates[0], 'days') > 6;
    }
    if (dates && dates[1] && preDateRef.current) {
      tooEarly = dates[1] && dates[1].diff(current, 'days') > 6;
    }
    return preDateRef.current
      ? tooEarly || tooLate || (current && current > moment().endOf('day'))
      : current && current > moment().endOf('day');
  };
  // 时间
  const timeRangeSelect = (datess: any, datestr: any, info: any) => {
    preDateRef.current = true;
    preRef.current = false;
    if (!datess || !datess?.length) {
      return;
    }
    if (info?.range === 'start') {
      setDates([datess[0], null]);
      if (datess && datess[1] && datess[1].diff(datess[0], 'days') > 6) {
        preRef.current = true;
        setValue([datess[0], null]);
        dateSaveRef.current = [datess[0], null];
      }
    } else if (info?.range === 'end') {
      setDates([null, datess[1]]);
      if (datess && datess[1] && datess[1].diff(datess[0], 'days') > 6) {
        preRef.current = true;
        setValue([null, datess[1]]);
        dateSaveRef.current = [null, datess[1]];
      }
    } else {
      setDates(datess);
    }
  };

  const onSelChange1 = (sel: any) => {
    setFkFacilitiesId(sel);
  };

  const onSelChange3 = (sel: any) => {
    setUrgency(sel);
    if (childRef?.current) {
      childRef?.current.clearFunc(true);
    }
    setSelectTreeVal([]);
  };
  const onOpenChange = (open: any) => {
    setOpenTimeFlag(open);
    if (open) {
      const initTime = !value || !value?.length ? [] : dateRef.current;
      setDates(initTime);
      setPlaceholdTip([pickTime.startTime, pickTime.endTime]);
    } else {
      preDateRef.current = false;
      if (!dateRef.current || !dateRef.current?.length) {
        setValue([moment().endOf('day'), moment().endOf('day')]);
      } else if (dateSaveRef.current && (!dateSaveRef.current[0] || !dateSaveRef.current[1])) {
        setPlaceholdTip([pickTime.startTime, pickTime.endTime]);
        setValue(
          lastTimeRef.current
            ? lastTimeRef.current
            : [moment().endOf('day'), moment().endOf('day')],
        );
      }
    }
  };
  const timeChange = (val: any, dateStrings: any) => {
    dateRef.current = val;
    if (!val || !val.length) {
      dateSaveRef.current = [moment().endOf('day'), moment().endOf('day')];
      lastTimeRef.current = [moment().endOf('day'), moment().endOf('day')];
      setValue([moment().endOf('day'), moment().endOf('day')]);
      setPickTime({
        startTime: moment().endOf('day').format('yyyy-MM-DD'),
        endTime: moment().endOf('day').format('yyyy-MM-DD'),
      });
    } else {
      if (preRef.current) {
        if (dateSaveRef.current && (!dateSaveRef.current[0] || !dateSaveRef.current[1])) {
          message.error(`请选择时间起点或终点`);
        }
        return;
      }
      lastTimeRef.current = val;
      setValue(val);
      setPickTime({ startTime: dateStrings[0], endTime: dateStrings[1] });
    }
  };
  const handletreeselect = (val: any) => {
    // console.log('handleTreeSelect',val);
    setSelectTreeVal(val);
    setInitialState({ ...initialState, PDiseaseTypes: [...val] });
  };
  useEffect(() => {
    return () => {
      setInitialState({ ...initialState, PDiseaseTypes: [] });
    };
  }, []);

  return (
    <div className={styles.rights}>
      <div className={styles.inpBox}>
        <span>
          <Select
            allowClear
            placeholder="搜索道路"
            style={{ marginRight: 0 }}
            onChange={onSelChange1}
          >
            {Object.values(faciList).map((item: any) => (
              <Option key={item.facilitiesName} value={item.id}>
                {item.facilitiesName}
              </Option>
            ))}
          </Select>
        </span>

        <span>
          <Select
            allowClear
            placeholder="紧急程度"
            style={{ marginRight: 0 }}
            onChange={onSelChange3}
          >
            <Option value={1}>紧急</Option>
            <Option value={0}>非紧急</Option>
          </Select>
        </span>
        <span>
          <MutiSelect
            urgency={urgency}
            onRef={childRef}
            customclassName={styles['multi-select']}
            handletreeselect={handletreeselect}
          />
        </span>
        <span>
          <RangePicker
            // showTime
            inputReadOnly
            value={value}
            format="YYYY-MM-DD"
            disabledDate={disabledDate}
            onCalendarChange={timeRangeSelect}
            defaultValue={[moment().endOf('day'), moment().endOf('day')]}
            placeholder={placeholdTip}
            onOpenChange={onOpenChange}
            onChange={(val: any, dateStrings: any) => {
              timeChange(val, dateStrings);
            }}
          />
        </span>
      </div>
      <div className={styles.numColor}>
        <div className={styles.numTxt}>病害数量分布</div>
        <div>
          <div className={styles.numNum}>
            <div className={styles.numcolor1} /> 0-10
          </div>
          <div className={styles.numNum}>
            <div className={styles.numcolor2} /> 50-200
          </div>
          <div className={styles.numNum}>
            <div className={styles.numcolor3} /> 10-50
          </div>
          <div className={styles.numNum}>
            <div className={styles.numcolor4} /> 200以上
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapRight;
