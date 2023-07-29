import React from 'react';
// import Line from '@/pages/Databoard/components/rightLine';
import Line from './Line';
import styles from '../styles.less';

const Lineimg: React.FC = () => {
  return (
    <div className={styles.lineimg}>
      <div className={styles.textbox}>
        <span className={styles.text}>道路历年PCI指数折线图</span>
      </div>
      <div>
        <Line />
      </div>
    </div>
  );
};
export default Lineimg;
