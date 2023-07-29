import React from 'react';
import Pie from './Pie';
import styles from '../styles.less';

const Kind: React.FC = () => {
  return (
    <div className={styles.kind}>
      <div className={styles.textbox}>
        <span className={styles.text}>病害种类统计</span>
      </div>
      <div>
        <Pie />
      </div>
    </div>
  );
};
export default Kind;
