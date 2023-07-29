import styles from './index.less';
import React from 'react';
import nullStatus from '../../assets/img/InspectionBoard/empty.svg';
import whiteBgEmpty from '../../assets/img/InspectionBoard/whiteBgEmpty.png';
// import { Empty } from 'antd';

type Iprops = {
  children?: any;
  content: any;
  customEmptyChartClass?: string;
  isBlack?: boolean;
};
const EmptyPage: React.FC<Iprops> = (props) => {
  const { isBlack = true } = props;
  return (
    <div className={`${styles.emptyChartClass} ${props.customEmptyChartClass}`}>
      {props.content ? (
        <div style={{ textAlign: 'center' }}>
          <img
            className={isBlack ? 'emptyImg' : styles['empty-img-white']}
            src={isBlack ? nullStatus : whiteBgEmpty}
            alt=""
          />
          <div className={`${isBlack ? `${styles.emptyTxt}` : `${styles.emptyWhiteBgTxt}`}`}>
            暂无数据
          </div>
        </div>
      ) : (
        props.children
      )}
    </div>
  );
};

export default EmptyPage;
