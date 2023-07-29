import nullStatus from '../../assets/img/InspectionBoard/empty.svg';
import nullSelectStatus from '../../assets/img/InspectionBoard/emptySelect.svg';
import whiteBgEmpty from '../../assets/img/InspectionBoard/whiteBgEmpty.png';
import styles from './index.less';
import React, { useCallback } from 'react';

type Iprops = {
  customEmptyClass?: string;
  isInspectBorder?: boolean;
  isBlack?: boolean;
};
const EmptyStatus: React.FC<Iprops> = (props) => {
  const { isInspectBorder = false, isBlack = true } = props;
  const getURL = useCallback(() => {
    if (isBlack) {
      return !isInspectBorder ? nullStatus : nullSelectStatus;
    }
    return whiteBgEmpty;
  }, []);
  return (
    // 这里面就是我们自己定义的空状态
    <div style={{ textAlign: 'center' }} className={`tableEmptyClass ${props.customEmptyClass}`}>
      <img
        className={isBlack ? 'tableEmptyImgClass' : styles['empty-img-white']}
        src={getURL()}
        alt=""
      />
      <div className={`${isBlack ? `${styles.emptyTxt}` : `${styles.emptyWhiteBgTxt}`}`}>
        暂无数据
      </div>
    </div>
  );
};
export default EmptyStatus;
