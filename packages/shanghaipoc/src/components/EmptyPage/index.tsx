import styles from './index.less';
import React from 'react';
import nullStatus from '../../assets/img/InspectionBoard/empty.svg';
// import { Empty } from 'antd';

type Iprops = {
  children?: any;
  content: any;
  customEmptyChartClass?: string;
};
const EmptyPage: React.FC<Iprops> = (props) => {
  return (
    <div className={`${styles.emptyChartClass} ${props.customEmptyChartClass}`}>
      {props.content ? (
        <div style={{ textAlign: 'center' }}>
          <img className={'emptyImg'} src={nullStatus} alt="" />
          <div className={`${styles.emptyTxt}`}>暂无数据</div>
        </div>
      ) : (
        props.children
      )}
    </div>
  );
};

export default EmptyPage;
