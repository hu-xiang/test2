import React from 'react';
import { Slider } from 'antd';
import styles from '../styles.less';
import moment from 'moment';

const marks = {
  0: moment().format('YYYY.MM.DD'),
  16: moment().add(1, 'days').format('YYYY.MM.DD'),
  33: moment().add(2, 'days').format('YYYY.MM.DD'),
  50: moment().add(3, 'days').format('YYYY.MM.DD'),
  67: moment().add(4, 'days').format('YYYY.MM.DD'),
  84: moment().add(5, 'days').format('YYYY.MM.DD'),
  100: {
    label: <strong>{moment().add(6, 'days').format('YYYY.MM.DD')}</strong>,
  },
};

const MapBottom: React.FC = () => {
  return (
    <div className={styles.bottom}>
      <Slider marks={marks} defaultValue={100} step={null} tooltipVisible={false} />
    </div>
  );
};

export default MapBottom;
