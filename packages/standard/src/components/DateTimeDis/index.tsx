import styles from './index.less';
import React, { useEffect, useState } from 'react';
import moment from 'moment';

type Iprops = {
  // timeDisClass?: string;
};
const DateTimeDis: React.FC<Iprops> = () => {
  const [timer, setTimer] = useState<any>();
  const [datetimeNow, setDatetimeNow] = useState<any>(
    moment(new Date()).format('yyyy-MM-DD HH:mm:ss'),
  );
  /**
   * 将时间戳转为年月日时分秒格式
   * @param {*} timestamp
   */
  const getTimeStr = () => {
    const itemdata = moment(new Date()).format('yyyy/MM/DD HH:mm:ss');
    setDatetimeNow(itemdata);
  };

  useEffect(() => {
    if (!timer) {
      setTimer(
        setInterval(() => {
          getTimeStr();
        }, 1000),
      );
    }

    return () => {
      clearInterval(timer);
    };
  }, [timer]);

  return (
    <div className={styles.timeDisClass}>
      <span>{datetimeNow}</span>
    </div>
  );
};

export default DateTimeDis;
