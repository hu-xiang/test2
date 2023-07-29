import { useState, useEffect } from 'react';
import { DatePicker, Input } from 'antd';
import LeftBg from 'baseline/src/assets/img/InspectionBoard/Head/leftBg.svg';
import logo from 'baseline/src/assets/img/InspectionBoard/Head/logo.svg';
import React from 'react';
import styles from 'baseline/src/pages/InspectionBoard/styles.less';
import DateTimeDis from 'baseline/src/components/DateTimeDis';
import moment from 'moment';
import Avatar from 'baseline/src/components/RightContent/AvatarDropdown';
import Pwdchange from 'baseline/src/components/RightContent/component/pwdchange';
import { isEqual } from 'lodash';
import propStyles from '../styles.less';

type mapObj = {
  keyword: string | undefined;
  detectTime: string | undefined;
};
type Iprops = {
  themeType: string;
  onSelMap: (strObj: mapObj) => void;
  headLogo: any;
  logoDesc?: string;
  projectId: string | undefined;
};
const HeadTop: React.FC<Iprops> = (props) => {
  const { themeType, projectId } = props;
  const dateFormat = 'YYYY-MM-DD';
  const [keyword, setKeyword] = useState<string | undefined>(undefined);
  const [dateValue, setDateValue] = useState<string | undefined>(undefined);

  const [pwdshow, setPwdshow] = useState(false);
  const [pickTime, setPickTime] = useState<any>();
  const [preTime, setPreTime] = useState<any>();

  const handleTime = (val: any, dateString: any) => {
    setDateValue(val);
    setPickTime(dateString);
  };

  const disabledDate = (current: any) => {
    return current && current > moment().endOf('day');
  };

  useEffect(() => {
    props.onSelMap({ keyword, detectTime: pickTime || undefined });
  }, [keyword]);

  useEffect(() => {
    if (!isEqual(preTime, pickTime)) {
      const newTime = pickTime || undefined;
      const newObj: mapObj = {
        keyword,
        detectTime: newTime,
      };
      props.onSelMap(newObj);
    }
    setPreTime(pickTime);
  }, [pickTime]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  return (
    <>
      <div
        className={`${styles.headClass} ${
          themeType === 'black' ? styles.blackTheme : styles.whiteTheme
        }`}
      >
        <div className={propStyles.headLeftClass}>
          <div className={propStyles.leftTopClass}>
            <img src={props.headLogo || logo}></img>
            {!props.headLogo && <img src={LeftBg}></img>}
          </div>
          <div className={propStyles.leftTopClass}>
            {props.headLogo && <img src={LeftBg}></img>}
            <span>{props.logoDesc || '道路病害检测智能管理平台'}</span>
          </div>
        </div>
        <div className={styles.headRightClass}>
          {projectId ? null : (
            <>
              <span className={styles.topHeadSpan}>
                <Input
                  className={propStyles['search-input']}
                  placeholder="搜索道路或项目"
                  value={keyword}
                  allowClear
                  autoFocus
                  onChange={handleInputChange}
                />
              </span>

              <span className={styles.topSpanTime}>
                <DatePicker
                  disabledDate={disabledDate}
                  className="rangeTimeClass"
                  value={dateValue}
                  popupClassName="dropDownTimeClass"
                  format={dateFormat}
                  picker={'date'}
                  onChange={handleTime}
                />
              </span>
            </>
          )}
          <span className={styles.topSpanDisTime}>
            <DateTimeDis />
          </span>
          <span className={styles.topSpanUserClass}>
            <Avatar menu onshows={() => setPwdshow(true)} />
          </span>
        </div>
      </div>
      {pwdshow ? <Pwdchange pwdshow={pwdshow} onCancel={() => setPwdshow(false)} /> : null}
    </>
  );
};

export default HeadTop;
