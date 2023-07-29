import { useState, useEffect } from 'react';
// import { Select, DatePicker } from 'antd';
// import { useModel } from 'umi';
// import LeftBg from '../../../assets/img/InspectionBoard/Head/leftBg.svg';
// import logo from '../../../assets/img/InspectionBoard/Head/logo.png';
import React from 'react';
import styles from '../styles.less';
import DateTimeDis from '../../../components/DateTimeDis';
// import moment from 'moment';
// import Avatar from '../../../components/RightContent/AvatarDropdown';
import Pwdchange from '../../../components/RightContent/component/pwdchange';
// import { useLocalStorageState } from 'ahooks';
// import { getFacilitityList } from '../../../services/commonApi';
// import { isEqual } from 'lodash';
// import EmptyPage from '../../../components/EmptyPage';
import { history } from 'umi';

// components
import LSIcon from './Icons/LSIcon';
import LineIcon from './Icons/LineIcon';
import VSIcon from './Icons/VSIcon';

// const { RangePicker } = DatePicker;
// const { Option } = Select;
type mapObj = {
  fkFacilitiesId?: string | undefined;
  startTime: string;
  endTime: string;
};
type Iprops = {
  themeType: string;
  onSelMap: (strObj: mapObj) => void;
  toggleToday: (visible: boolean) => void;
  headLogo: any;
  logoDesc?: string;
  propStyles: any;
  timeType?: string;
};
const HeadTop: React.FC<Iprops> = (props) => {
  const { themeType, propStyles } = props;
  // const [dates, setDates] = useState<any>([]);
  // const [hackValue, setHackValue] = useState<any>();
  // const [value, setValue] = useState<any>();
  // const [fkFacilitiesId, setFkFacilitiesId] = useState<string>();
  // const { initialState } = useModel<any>('@@initialState');
  // const [facilitiesList, setFacilitiesList] = useState<any>([]);
  const [pwdshow, setPwdshow] = useState(false);
  // const [stor, setStor] = useLocalStorageState<any>('user&facId', undefined);
  // const [openTimeFlag, setOpenTimeFlag] = useState(false);
  // const [firstFlag, setFirstFlag] = useState(false);
  // const [placeholdTip, setPlaceholdTip] = useState<any>(['开始日期', '结束日期']);
  // const dateRef: any = useRef();
  // const [pickTime, setPickTime] = useState<any>({
  //   startTime: moment().endOf('day').format('yyyy-MM-DD'),
  //   endTime: moment().endOf('day').format('yyyy-MM-DD'),
  // });
  // const [preTime, setPreTime] = useState<any>({
  //   startTime: moment().endOf('day').format('yyyy-MM-DD'),
  //   endTime: moment().endOf('day').format('yyyy-MM-DD'),
  // });
  // const onSelChange2 = (sel: any, option: any) => {
  //   // console.log('onSelChange2',sel)
  //   setFkFacilitiesId(option?.key.toString());
  //   setStor(`${initialState?.currentUser.username}&${option?.key}`);
  // };

  // const onOpenChange = (open: any) => {
  //   setOpenTimeFlag(open);
  //   if (open) {
  //     setHackValue([]);
  //     setDates([]);
  //     setPlaceholdTip([pickTime.startTime, pickTime.endTime]);
  //   } else {
  //     setHackValue(undefined);
  //     if (!dateRef.current || !dateRef.current?.length) {
  //       setValue([moment().endOf('day'), moment().endOf('day')]);
  //     }
  //   }
  // };

  // const timeChange = (val: any, dateStrings: any) => {
  //   dateRef.current = val;
  //   if (!val || !val.length) {
  //     setValue([moment().endOf('day'), moment().endOf('day')]);
  //     props.toggleToday(true);
  //     setPickTime({
  //       startTime: moment().endOf('day').format('yyyy-MM-DD'),
  //       endTime: moment().endOf('day').format('yyyy-MM-DD'),
  //     });
  //   } else {
  //     setValue(val);
  //     setPickTime({ startTime: dateStrings[0], endTime: dateStrings[1] });
  //     props.toggleToday(dateStrings[1] === '' || moment().format('yyyy-MM-DD') === dateStrings[1]);
  //   }
  // };
  // const timeRangeSelect = (datess: any) => {
  //   setDates(datess);
  // };

  // const disabledDate = (current: any) => {
  //   if ((!dateRef.current || dateRef.current.length === 0) && (!dates || dates?.length === 0)) {
  //     return current && current > moment().endOf('day');
  //   }
  //   let tooLate: boolean = false;
  //   let tooEarly: boolean = false;
  //   const isMonthType = props?.timeType && props?.timeType === 'month';
  //   const intervalDays: number = isMonthType ? 30 : 7;
  //   if (dates[0]) {
  //     tooLate = dates[0] && current.diff(dates[0], 'days') > intervalDays;
  //   }
  //   if (dates[1]) {
  //     tooEarly = dates[1] && dates[1].diff(current, 'days') > intervalDays;
  //   }
  //   return tooEarly || tooLate || (current && current > moment().endOf('day'));
  // };

  // useEffect(() => {
  //   // console.log('Fac',stor);
  //   if (stor && initialState?.currentUser?.username === stor?.slice(0, stor?.indexOf('&'))) {
  //     setFkFacilitiesId(
  //       stor?.slice(stor?.indexOf('&') + 1) === 'undefined'
  //         ? undefined
  //         : stor?.slice(stor?.indexOf('&') + 1).toString(),
  //     );
  //   }
  //   setFirstFlag(true);
  // }, []);

  useEffect(() => {
    // const getFacilitiesList = async () => {
    //   let rec: any = [];
    //   try {
    //     const { status, data = [] } = await getFacilitityList({ name: '' });
    //     if (status === 0) {
    //       data.forEach((it: any) => {
    //         rec.push({ label: it.facilitiesName, value: it.id });
    //       });
    //     }
    //     // setFacilitiesList(rec);
    //   } catch (error) {
    //     rec = [];
    //   }
    // };
    if (history.location?.pathname === '/inspectionBoard') {
      // getFacilitiesList();
    }
  }, []);

  // useEffect(() => {
  //   if (firstFlag) {
  //     let objSt: mapObj = {
  //       fkFacilitiesId,
  //       startTime: pickTime.startTime,
  //       endTime: pickTime.endTime,
  //     };
  //     if (history.location?.pathname !== '/inspectionBoard') {
  //       objSt = {
  //         startTime: pickTime.startTime,
  //         endTime: pickTime.endTime,
  //       };
  //     }
  //     props.onSelMap(objSt);
  //   }
  // }, [fkFacilitiesId, firstFlag]);

  // useEffect(() => {
  //   if (openTimeFlag) return;
  //   if (!isEqual(preTime, pickTime)) {
  //     let newObj: mapObj = {
  //       fkFacilitiesId,
  //       startTime: pickTime.startTime,
  //       endTime: pickTime.endTime,
  //     };
  //     if (history.location?.pathname !== '/inspectionBoard') {
  //       newObj = {
  //         startTime: pickTime.startTime,
  //         endTime: pickTime.endTime,
  //       };
  //     }
  //     props.onSelMap(newObj);
  //   }
  //   setPreTime({ ...pickTime });
  // }, [pickTime, openTimeFlag]);

  return (
    <>
      <div
        className={`${styles.headClass} ${
          themeType === 'black' ? styles.blackTheme : styles.whiteTheme
        }`}
      >
        <div className={propStyles?.headLeftClass || styles.headLeftClass}>
          <div className={styles.headerInner}>
            <div className={styles.iconLs}>
              <LSIcon />
            </div>
            <div className={styles.iconVs}>
              <VSIcon />
            </div>
            <div className={styles.logoDesc}>
              <LineIcon className={styles.logoDescSvg} />
              <div className={styles.logoDescTxt}>{props.logoDesc || '道路巡检智能管理平台'}</div>
            </div>
          </div>
        </div>
        <div className={styles.headRightClass}>
          {/* {history.location?.pathname === '/inspectionBoard' ? (
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
                  defaultValue={
                    stor?.slice(stor?.indexOf('&') + 1) === 'undefined' || stor === undefined
                      ? undefined
                      : stor?.slice(stor?.indexOf('&') + 1).toString()
                  }
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
          {/* <span className={styles.topSpanTime}>
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
          </span> */}
          <span className={styles.topSpanDisTime} style={{ marginRight: 0 }}>
            <DateTimeDis />
          </span>
          {/* <span className={styles.topSpanUserClass}> */}
          {/* <Avatar menu onshows={() => setPwdshow(true)} /> */}
          {/* </span> */}
        </div>
      </div>
      {pwdshow ? <Pwdchange pwdshow={pwdshow} onCancel={() => setPwdshow(false)} /> : null}
    </>
  );
};

export default HeadTop;
