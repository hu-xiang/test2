import { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { Select, DatePicker } from 'antd';
import { useModel } from 'umi';
import LeftBg from '../../../assets/img/InspectionBoard/Head/leftBg.svg';
import logo from '../../../assets/img/InspectionBoard/Head/logo.svg';
import React from 'react';
import styles from '../styles.less';
import DateTimeDis from '../../../components/DateTimeDis';
import moment from 'moment';
import Avatar from '../../../components/RightContent/AvatarDropdown';
import Pwdchange from '../../../components/RightContent/component/pwdchange';
// import { useLocalStorageState } from 'ahooks';
import { getFacilitityList } from '../../../services/commonApi';
import { isEqual } from 'lodash';
import EmptyPage from '../../../components/EmptyPage';
// import { history } from 'umi';

const { RangePicker } = DatePicker;
const { Option } = Select;
type mapObj = {
  fkFacilitiesId?: string | undefined;
  startTime?: string;
  endTime?: string;
};
type Iprops = {
  hasHeadUser: boolean;
  themeType: string;
  onSelMap: (strObj: mapObj) => void;
  toggleToday?: (visible: boolean) => void;
  headLogo: any;
  onRef?: any;
  logoDesc?: string;
  propStyles: any;
  timeType?: string;
  controlsNum?: number; // 默认设施和时间框都存在，采用二进制编码格式0代表都不存在，1代表存在时间框，2代表存在设施框，3代表都存在
};
const HeadTop: React.FC<Iprops> = (props) => {
  const { themeType, propStyles, toggleToday, controlsNum = 3, hasHeadUser } = props;
  const [dates, setDates] = useState<any>([]);
  const [hackValue, setHackValue] = useState<any>();
  const [value, setValue] = useState<any>();
  const [fkFacilitiesId, setFkFacilitiesId] = useState<string>();
  const { initialState } = useModel<any>('@@initialState');
  const [facValue, setFacValue] = useState<any>(undefined);
  // const {  } = useModel<any>('inspect');
  const [facilitiesList, setFacilitiesList] = useState<any>([]);
  const [pwdshow, setPwdshow] = useState(false);
  // const name: any = sessionStorage?.getItem('username');
  // const { faclityId, setFaclityId } = useModel<any>('inspect');
  // const [stor, setStor] = useLocalStorageState<any>('user&facId', undefined);
  const [openTimeFlag, setOpenTimeFlag] = useState(false);
  // const [firstFlag, setFirstFlag] = useState(false);
  const [placeholdTip, setPlaceholdTip] = useState<any>(['开始日期', '结束日期']);
  const dateRef: any = useRef();
  const [pickTime, setPickTime] = useState<any>({
    startTime: moment().endOf('day').format('yyyy-MM-DD'),
    endTime: moment().endOf('day').format('yyyy-MM-DD'),
  });
  const [preTime, setPreTime] = useState<any>({
    startTime: moment().endOf('day').format('yyyy-MM-DD'),
    endTime: moment().endOf('day').format('yyyy-MM-DD'),
  });
  const onSelChange2 = (sel: any, option: any) => {
    // console.log('onSelChange2',sel)
    setFkFacilitiesId(option?.key.toString());
    setFacValue(sel);
    // setFaclityId(option?.key);
    sessionStorage.setItem('username', initialState?.currentUser.username);
    // setUsename(initialState?.currentUser.username);
    // setStor(`${initialState?.currentUser.username}&${option?.key}`);
  };
  const clearFac = () => {
    setFkFacilitiesId('');
    setFacValue(undefined);
  };
  useImperativeHandle(props?.onRef, () => ({
    // 暴露给父组件的方法
    clearFac,
  }));
  const onOpenChange = (open: any) => {
    setOpenTimeFlag(open);
    if (open) {
      setHackValue([]);
      setDates([]);
      setPlaceholdTip([pickTime.startTime, pickTime.endTime]);
    } else {
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
      // eslint-disable-next-line
      toggleToday && toggleToday(true);
      setPickTime({
        startTime: moment().endOf('day').format('yyyy-MM-DD'),
        endTime: moment().endOf('day').format('yyyy-MM-DD'),
      });
    } else {
      setValue(val);
      setPickTime({ startTime: dateStrings[0], endTime: dateStrings[1] });
      // eslint-disable-next-line
      toggleToday &&
        toggleToday(dateStrings[1] === '' || moment().format('yyyy-MM-DD') === dateStrings[1]);
    }
  };
  const timeRangeSelect = (datess: any) => {
    setDates(datess);
  };

  const disabledDate = (current: any) => {
    if ((!dateRef.current || dateRef.current.length === 0) && (!dates || dates?.length === 0)) {
      return current && current > moment().endOf('day');
    }
    let tooLate: boolean = false;
    let tooEarly: boolean = false;
    const isMonthType = props?.timeType && props?.timeType === 'month';
    const intervalDays: number = isMonthType ? 29 : 6;
    if (dates[0]) {
      tooLate = dates[0] && current.diff(dates[0], 'days') > intervalDays;
    }
    if (dates[1]) {
      tooEarly = dates[1] && dates[1].diff(current, 'days') > intervalDays;
    }
    return tooEarly || tooLate || (current && current > moment().endOf('day'));
  };

  // useEffect(() => {
  //   if(controlsNum===3||controlsNum===2)
  //   {
  //     setFkFacilitiesId(initialState?.currentUser.username === name ? faclityId : undefined);
  //   }
  //   setFirstFlag(true);
  // }, []);

  useEffect(() => {
    const getFacilitiesList = async () => {
      let rec: any = [];
      try {
        const { status, data = [] } = await getFacilitityList({ name: '' });
        if (status === 0) {
          data.forEach((it: any) => {
            rec.push({ label: it.facilitiesName, value: it.id });
          });
        }
        setFacilitiesList(rec);
      } catch (error) {
        rec = [];
      }
    };
    if (controlsNum === 3 || controlsNum === 2) {
      getFacilitiesList();
    }
  }, []);

  useEffect(() => {
    let objSt: mapObj = {};
    switch (controlsNum) {
      case 0:
        objSt = {};
        break;
      case 1:
        objSt = {
          startTime: pickTime?.startTime,
          endTime: pickTime?.endTime,
        };
        break;
      case 2:
        objSt = { fkFacilitiesId };
        break;
      case 3:
        objSt = {
          fkFacilitiesId,
          startTime: pickTime.startTime,
          endTime: pickTime.endTime,
        };
        break;
      default:
        objSt = {};
        break;
    }
    if (Object.keys(objSt)?.length > 0) {
      props.onSelMap(objSt);
    }
  }, [fkFacilitiesId]);

  useEffect(() => {
    if (openTimeFlag) return;
    if (!isEqual(preTime, pickTime)) {
      let newObj: mapObj = {};
      if (controlsNum === 3) {
        newObj = {
          fkFacilitiesId,
          startTime: pickTime.startTime,
          endTime: pickTime.endTime,
        };
      } else {
        newObj = {
          startTime: pickTime.startTime,
          endTime: pickTime.endTime,
        };
      }
      props.onSelMap(newObj);
    }
    setPreTime({ ...pickTime });
  }, [pickTime, openTimeFlag]);

  return (
    <>
      <div
        className={`${styles.headClass} ${
          themeType === 'black' ? styles.blackTheme : styles.whiteTheme
        }`}
      >
        <div className={propStyles?.headLeftClass || styles.headLeftClass}>
          <div className={propStyles?.leftTopClass || styles.leftTopClass}>
            <img src={props.headLogo || logo} className={styles.logo}></img>
            {/* {!props.headLogo && <img src={LeftBg}></img>} */}
          </div>
          <div className={propStyles?.leftTopClass || styles.leftTopClass}>
            <img src={LeftBg}></img>
            <span>{props.logoDesc || '道路巡检智能管理平台'}</span>
          </div>
        </div>
        <div className={styles.headRightClass}>
          {/* {history.location?.pathname === '/inspectionBoard' ||
          history.location?.pathname === '/facilityAssets' ? (
            <>
              <span className={styles.topHeadSpan}>
                <Select
                  allowClear
                  dropdownClassName="dropdownSelectClass"
                  placeholder="搜索设施"
                  className="searchFacilityClass faciltySearch"
                  style={{ marginRight: 0 }}
                  notFoundContent={
                    <EmptyPage content={'暂无数据'} customEmptyChartClass={'selectEmpty'} />
                  }
                  onChange={onSelChange2}
                  defaultValue={initialState?.currentUser.username === name ? faclityId : undefined}
                >
                  {facilitiesList?.length > 0 &&
                    facilitiesList.map((item: any) => (
                      <Option className="facClass" key={item?.value} value={item?.value}>
                        {item?.label}
                      </Option>
                    ))}
                </Select>
              </span>
            </>
          ) : null} */}
          {controlsNum === 2 || controlsNum === 3 ? (
            <span className={styles.topHeadSpan}>
              <Select
                allowClear
                popupClassName="dropdownSelectClass"
                placeholder="搜索道路"
                className="searchFacilityClass faciltySearch"
                value={facValue}
                style={{ marginRight: 0 }}
                notFoundContent={
                  <EmptyPage content={'暂无数据'} customEmptyChartClass={'selectEmpty'} />
                }
                onChange={onSelChange2}
                // defaultValue={initialState?.currentUser.username === name ? faclityId : undefined}
              >
                {facilitiesList?.length > 0 &&
                  facilitiesList.map((item: any) => (
                    <Option className="facClass" key={item?.value} value={item?.value}>
                      {item?.label}
                    </Option>
                  ))}
              </Select>
            </span>
          ) : null}

          {controlsNum === 1 || controlsNum === 3 ? (
            <span className={styles.topSpanTime}>
              <RangePicker
                value={hackValue || value}
                className="rangeTimeClass"
                inputReadOnly
                popupClassName="dropDownTimeClass"
                format="YYYY-MM-DD"
                disabledDate={disabledDate}
                onCalendarChange={timeRangeSelect}
                defaultValue={[moment().endOf('day'), moment().endOf('day')]}
                onOpenChange={onOpenChange}
                placeholder={placeholdTip}
                onChange={(val: any, dateStrings: any) => {
                  timeChange(val, dateStrings);
                }}
              />
            </span>
          ) : null}
          {!props?.children ? null : props?.children}
          {/* {history.location?.pathname !== '/facilityAssets' ? (
            <span className={styles.topSpanTime}>
              <RangePicker
                value={hackValue || value}
                className="rangeTimeClass"
                inputReadOnly
                dropdownClassName="dropDownTimeClass"
                format="YYYY-MM-DD"
                disabledDate={disabledDate}
                onCalendarChange={timeRangeSelect}
                defaultValue={[moment().endOf('day'), moment().endOf('day')]}
                onOpenChange={onOpenChange}
                placeholder={placeholdTip}
                onChange={(val: any, dateStrings: any) => {
                  timeChange(val, dateStrings);
                }}
              />
            </span>
          ) : null} */}
          <span className={styles.topSpanDisTime}>
            <DateTimeDis />
          </span>
          {hasHeadUser && (
            <span className={styles.topSpanUserClass}>
              <Avatar menu onshows={() => setPwdshow(true)} />
            </span>
          )}
        </div>
      </div>
      {pwdshow ? <Pwdchange pwdshow={pwdshow} onCancel={() => setPwdshow(false)} /> : null}
    </>
  );
};

export default HeadTop;
